# -*- coding: utf-8 -*-
"""
F1 News Aggregator Bot — formula-rossa.it
==========================================
Stack: Firebase Firestore + Next.js + Groq (gratuito)

Installazione:
  pip install feedparser groq firebase-admin python-dotenv schedule

Uso:
  python f1_aggregator.py                         # normale, ogni 4h
  python f1_aggregator.py --daemon                # loop automatico
  python f1_aggregator.py --mode qualifiche       # articolo qualifiche
  python f1_aggregator.py --mode post-gara        # articolo post-gara
  python f1_aggregator.py --mode recap --gp Monaco
"""

import sys, os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import feedparser
import groq
import firebase_admin
from firebase_admin import credentials, firestore
import json, hashlib, re, time, logging, argparse, schedule
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# ─── CONFIGURAZIONE ────────────────────────────────────────────────────────────

RSS_FEEDS = [
    {"name": "FormulaPassion",  "url": "https://www.formulapassion.it/feed/"},
    {"name": "Motorsport.com",  "url": "https://it.motorsport.com/rss/f1/news/"},
    {"name": "Autosprint",      "url": "https://autosprint.corrieredellosport.it/feed/"},
    {"name": "P300",            "url": "https://www.p300.it/feed/"},
    {"name": "FormulaUno.com",  "url": "https://www.formulauno.com/feed/"},
    {"name": "Autosport F1",    "url": "https://www.autosport.com/rss/f1/news/"},
    {"name": "Pitpass",         "url": "https://www.pitpass.com/rss-feed"},
    {"name": "Formel1.de",      "url": "https://www.formel1.de/f1_tools/rss/news"},
    {"name": "SportsMole F1",   "url": "https://www.sportsmole.co.uk/formula-1/rss.xml"},
    {"name": "F1 Destinations", "url": "https://f1destinations.com/feed/"},
]

MAX_ITEMS_PER_FEED   = 3
ITEMS_PER_DIGEST     = 5
RUN_EVERY_HOURS      = 4
FIRESTORE_COLLECTION = "news"
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "firebase-credentials.json")
GROQ_API_KEY         = os.getenv("GROQ_API_KEY")

# ─── MODALITÀ WEEKEND GARA ─────────────────────────────────────────────────────

RACE_WEEKEND_MODES = {
    "preview": {
        "label":    "Anteprima weekend",
        "tags":     ["F1", "Preview", "Weekend"],
        "focus":    "analisi tecnica pre-weekend, aspettative delle squadre, condizioni meteo, storia del circuito, probabili strategie",
        "title_hint": "Anteprima GP – le aspettative e le strategie del weekend",
    },
    "qualifiche": {
        "label":    "Qualifiche",
        "tags":     ["F1", "Qualifiche", "Gara"],
        "focus":    "risultati qualifiche, analisi dei tempi sul giro, errori e sorprese, griglia di partenza, prospettive per la gara",
        "title_hint": "Qualifiche GP – analisi della griglia e colpi di scena",
    },
    "pre-gara": {
        "label":    "Pre-gara",
        "tags":     ["F1", "Gara", "Strategie"],
        "focus":    "analisi strategica pre-gara, possibili soste ai box, condizioni pista, stato delle gomme, dichiarazioni piloti",
        "title_hint": "Verso il via del GP – strategie e variabili decisive",
    },
    "post-gara": {
        "label":    "Post-gara",
        "tags":     ["F1", "Gara", "Risultati"],
        "focus":    "risultati gara completi, analisi tattica, momenti chiave, vincitore, Ferrari, classifica campionato aggiornata",
        "title_hint": "GP – il bilancio della gara e la nuova classifica",
    },
    "recap": {
        "label":    "Recap lunedì",
        "tags":     ["F1", "Recap", "Analisi"],
        "focus":    "bilancio completo del weekend, approfondimento tecnico, conseguenze in campionato, cosa aspettarsi al prossimo GP",
        "title_hint": "Il lunedì dopo il GP – analisi, numeri e classifiche",
    },
}

# ─── LOGGING ───────────────────────────────────────────────────────────────────

logger = logging.getLogger("f1bot")
logger.setLevel(logging.INFO)
fh = logging.FileHandler("f1_bot.log", encoding="utf-8")
fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
logger.addHandler(fh)
sh = logging.StreamHandler(sys.stdout)
sh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
logger.addHandler(sh)
log = logger

# ─── FIREBASE ──────────────────────────────────────────────────────────────────

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    return firestore.client()

# ─── DUPLICATI ─────────────────────────────────────────────────────────────────

SEEN_FILE = "seen_articles.json"

def load_seen() -> set:
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE, encoding="utf-8") as f:
            return set(json.load(f))
    return set()

def save_seen(seen: set):
    with open(SEEN_FILE, "w", encoding="utf-8") as f:
        json.dump(list(seen), f)

def article_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()

# ─── FETCH RSS ─────────────────────────────────────────────────────────────────

def fetch_full_article_text(entry) -> str:
    """Tenta di estrarre il contenuto completo dell'articolo dal feed"""
    content = entry.get("content", [])
    if content and len(content) > 0:
        text = content[0].get("value", "")
        if text:
            return re.sub(r"<[^>]+>", "", text)[:1500]
    
    summary = entry.get("summary", "")
    if summary and len(summary) > 300:
        return re.sub(r"<[^>]+>", "", summary)[:1500]
    
    return ""

def fetch_feed(feed: dict) -> list:
    articles = []
    try:
        parsed = feedparser.parse(feed["url"])
        for entry in parsed.entries[:MAX_ITEMS_PER_FEED]:
            summary = re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()[:600]
            summary = re.sub(r"[\x00-\x1f\x7f]", " ", summary)
            title   = re.sub(r"[\x00-\x1f\x7f]", " ", entry.get("title", ""))
            
            full_text = fetch_full_article_text(entry)
            
            articles.append({
                "source":  feed["name"],
                "title":   title,
                "url":     entry.get("link", ""),
                "summary": summary,
                "full_text": full_text,
            })
        log.info(f"{feed['name']}: {len(articles)} articoli trovati")
    except Exception as e:
        log.warning(f"{feed['name']}: errore — {e}")
    return articles

def fetch_all_news(seen: set) -> list:
    all_articles = []
    for feed in RSS_FEEDS:
        for art in fetch_feed(feed):
            if article_id(art["url"]) not in seen:
                all_articles.append(art)
    result = all_articles[:ITEMS_PER_DIGEST]
    log.info(f"Notizie nuove da elaborare: {len(result)}")
    return result

# ─── CONTESTO FERRARI AGGIORNATO ───────────────────────────────────────────────

def get_ferrari_current_context() -> str:
    """Restituisce un contesto forzato e verificato sulla situazione Ferrari attuale"""
    return """
    ⚠️ INFORMAZIONE VERIFICATA E ATTUALE (STAGIONE 2026):
    
    **SCUDERIA FERRARI**:
    - Piloti ufficiali: **Charles Leclerc** (numero 16) e **Lewis Hamilton** (numero 44)
    - Lewis Hamilton è entrato in Ferrari a partire dalla stagione 2025
    - Carlos Sainz NON È PIÙ un pilota Ferrari (è passato alla Williams)
    - Team Principal: Frederic Vasseur
    - Motore: Ferrari 066/12
    
    **REGOLA OBBLIGATORIA**:
    IGNORA COMPLETAMENTE QUALSIASI INFORMAZIONE INTERNA CHE MENZIONA "Sainz" COME PILOTA FERRARI.
    Se le notizie parlano di Carlos Sainz, specifica che è un ex-pilota Ferrari o pilota Williams.
    """

# ─── CLEAN JSON ────────────────────────────────────────────────────────────────

def clean_json_string(text: str) -> str:
    text = re.sub(r"^```json|^```|```$", "", text, flags=re.MULTILINE).strip()
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    def fix_newlines_in_strings(json_text):
        result = []
        in_string = False
        i = 0
        while i < len(json_text):
            ch = json_text[i]
            if ch == '\\' and in_string:
                result.append(ch); i += 1
                if i < len(json_text): result.append(json_text[i])
                i += 1; continue
            if ch == '"':
                in_string = not in_string
            if in_string and ch == '\n':   result.append('\\n')
            elif in_string and ch == '\r': result.append('\\r')
            else: result.append(ch)
            i += 1
        return ''.join(result)

    return fix_newlines_in_strings(text)

# ─── VALIDAZIONE PILOTI FERRARI ────────────────────────────────────────────────

def validate_and_fix_ferrari_drivers(html_content: str, title: str) -> tuple:
    """Corregge eventuali menzioni errate dei piloti Ferrari"""
    
    fixes = [
        (r"(?i)\bCarlos Sainz\b(?=\s*(?:[^.]*Ferrari|alla Ferrari|della Ferrari|nel weekend Ferrari|con la Ferrari))", 
         "Lewis Hamilton"),
        (r"(?i)\bSainz\b(?=\s*(?:[^.]*alla Ferrari|con la Ferrari|della Ferrari|nel weekend Ferrari|alla Rossa|della Rossa))",
         "Hamilton"),
        (r"(?i)(Ferrari\s+(?:ha|aveva|schierava|può contare su|presenta|allinea)\s+)(?:Carlos\s+Sainz|Sainz)",
         r"\1Lewis Hamilton"),
        (r"(?i)(il\s+)[Ss]pagnolo\s+(?:Sainz|Carlos Sainz)(?=\s*(?:[^.]*Ferrari|della Ferrari))",
         r"\1inglese Hamilton"),
    ]
    
    fixed_content = html_content
    for pattern, replacement in fixes:
        fixed_content = re.sub(pattern, replacement, fixed_content)
        title = re.sub(pattern, replacement, title)
    
    if "Sainz" in title and "Ferrari" in title:
        title = title.replace("Sainz", "Hamilton")
        title = title.replace("Carlos", "Lewis")
        title = title.replace("spagnolo", "inglese")
    
    if "Sainz" in fixed_content and "Ferrari" in fixed_content:
        fixed_content = fixed_content.replace("Carlos Sainz", "Lewis Hamilton")
        fixed_content = fixed_content.replace("Sainz", "Hamilton")
    
    return fixed_content, title

# ─── GENERAZIONE CON GROQ ──────────────────────────────────────────────────────

def generate_digest(articles: list, mode: str = "normale", gp_name: str = "") -> dict:
    if not articles:
        return None

    client = groq.Groq(api_key=GROQ_API_KEY)

    mode_cfg  = RACE_WEEKEND_MODES.get(mode, {})
    mode_focus = mode_cfg.get("focus", "le ultime notizie di Formula 1")
    mode_tags  = mode_cfg.get("tags", ["F1", "Ferrari", "news"])
    title_hint = mode_cfg.get("title_hint", "")
    gp_context = f"Gran Premio di {gp_name}" if gp_name else "Gran Premio in corso"

    news_block = ""
    for i, art in enumerate(articles, 1):
        news_block += f"\nNOTIZIA {i}:\nTitolo: {art['title']}\nURL: {art['url']}\nRiassunto: {art['summary']}\n---"
        if art.get('full_text'):
            news_block += f"\nTESTO COMPLETO (estratto): {art['full_text'][:800]}\n---"

    sources_html = " &nbsp;|&nbsp; ".join(
        f'<a href="{art["url"]}" target="_blank" rel="noopener">{art["source"]}</a>'
        for art in articles
    )
    footer_html = f'<hr/><p style="font-size:12px;color:#999;">Fonti: {sources_html}</p>'

    today = datetime.now().strftime("%d %B %Y")
    ferrari_context = get_ferrari_current_context()

    if mode in RACE_WEEKEND_MODES:
        race_instruction = f"""
CONTESTO WEEKEND GARA:
Modalità articolo: {mode_cfg.get('label', mode)} — {gp_context}
Focus principale: {mode_focus}
Titolo suggerito (puoi adattarlo): "{title_hint.replace('{GP}', gp_name or 'GP')}"
Assicurati che l'articolo sia fortemente orientato alla Ferrari e alle sue performance.
Includi contesto storico del circuito se rilevante.
"""
    else:
        race_instruction = ""

    prompt = f"""Sei un giornalista sportivo esperto di Formula 1 che scrive per formula-rossa.it, sito italiano dedicato alla Ferrari.

Oggi è {today}.

{ferrari_context}

NOTIZIE RACCOLTE DALLE FONTI (QUESTO È IL SOLO DATO AGGIORNATO CHE DEVI USARE):
{news_block}

{race_instruction}

⚠️ REGOLE OBBLIGATORIE SUI PILOTI FERRARI:
- I piloti Ferrari sono SOLAMENTE **Charles Leclerc** e **Lewis Hamilton**
- NON menzionare MAI Carlos Sainz come pilota Ferrari
- Se le notizie parlano di Sainz, specifica che è un ex-pilota Ferrari o pilota Williams
- Hamilton ha sostituito Sainz a partire dal 2025

COMPITO: Scrivi un articolo giornalistico completo, originale e approfondito in italiano.

REGOLE FONDAMENTALI:
- NON citare mai le fonti nel testo (zero "secondo X", zero "come riporta Y")
- Scrivi tutto come se fossi tu ad aver seguito le notizie direttamente
- Usa "oggi", "nelle ultime ore", "in questa giornata" per contestualizzare
- Ogni sezione deve avere almeno 5-7 righe di testo ricco e originale
- Aggiungi contesto tecnico, storico o sportivo per arricchire ogni argomento
- Tono: professionale, appassionato, tecnico ma leggibile
- Lunghezza minima: 700 parole

STRUTTURA HTML da usare:
<h1> per il titolo principale
<p> per l'introduzione (4-5 righe)
<h2> per ogni sottotitolo di sezione
<p> per i paragrafi (minimo 2 paragrafi per sezione)
<strong> per i concetti chiave
Niente <a> nel corpo dell'articolo

Rispondi SOLO con questo JSON valido (niente backtick, niente newline nei valori):
{{"title": "titolo accattivante della giornata", "slug": "titolo-kebab-case-data-{datetime.now().strftime('%d-%m-%Y')}", "html_content": "HTML completo qui", "excerpt": "2 righe di riassunto per anteprima", "tags": {json.dumps(mode_tags)}}}"""

    log.info(f"Generazione articolo con Groq — modalità: {mode}")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=4000,
        temperature=0.7,
        messages=[
            {
                "role": "system",
                "content": "Sei un giornalista sportivo italiano esperto di Formula 1 e Ferrari. Scrivi articoli lunghi, originali e approfonditi. Ricorda: i piloti Ferrari per la stagione 2026 sono Charles Leclerc e Lewis Hamilton (NON Sainz). Rispondi SEMPRE e SOLO con JSON valido, senza testo aggiuntivo, senza backtick, senza newline nei valori stringa."
            },
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content.strip()
    raw = clean_json_string(raw)

    try:
        result = json.loads(raw)
        
        # Validazione e correzione dei nomi dei piloti Ferrari
        fixed_content, fixed_title = validate_and_fix_ferrari_drivers(
            result.get("html_content", ""), 
            result.get("title", "")
        )
        result["html_content"] = fixed_content
        result["title"] = fixed_title
        
        result["html_content"] = result.get("html_content", "") + footer_html
        
        if mode in RACE_WEEKEND_MODES:
            result["tags"] = list(set(result.get("tags", []) + mode_tags))
            
    except json.JSONDecodeError as e:
        log.error(f"Errore parsing JSON: {e}")
        log.error(f"Risposta raw (primi 300 char): {raw[:300]}")
        return None

    log.info(f"Articolo generato: {result.get('title', '?')}")
    return result

# ─── PUBBLICAZIONE FIRESTORE ───────────────────────────────────────────────────

def publish_to_firestore(article: dict, db, mode: str = "normale") -> bool:
    try:
        now = datetime.now(timezone.utc)
        doc = {
            "title":        article["title"],
            "slug":         article["slug"],
            "html_content": article["html_content"],
            "excerpt":      article["excerpt"],
            "tags":         article["tags"],
            "cover_image":  article.get("cover_image", ""),
            "author":       "Redazione Formula Rossa",
            "category":     "news",
            "published_at": now,
            "created_at":   now,
            "status":       "published",
            "type":         mode if mode in RACE_WEEKEND_MODES else "digest",
        }
        db.collection(FIRESTORE_COLLECTION).document(article["slug"]).set(doc)
        log.info(f"Pubblicato su Firestore: {FIRESTORE_COLLECTION}/{article['slug']}")
        return True
    except Exception as e:
        log.error(f"Errore Firestore: {e}")
        return False

# ─── CICLO PRINCIPALE ──────────────────────────────────────────────────────────

def run(mode: str = "normale", gp_name: str = ""):
    log.info("=" * 55)
    log.info(f"F1 Aggregator Bot — formula-rossa.it  [{mode.upper()}]")
    log.info(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
    log.info("=" * 55)

    seen     = load_seen()
    articles = fetch_all_news(seen)

    if not articles:
        log.info("Nessuna notizia nuova. A presto!")
        return

    digest = generate_digest(articles, mode=mode, gp_name=gp_name)
    if not digest:
        log.warning("Impossibile generare l'articolo.")
        return

    db      = init_firebase()
    success = publish_to_firestore(digest, db, mode=mode)

    if success:
        for art in articles:
            seen.add(article_id(art["url"]))
        save_seen(seen)
        log.info("Ciclo completato con successo!")
    else:
        log.error("Pubblicazione fallita.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--daemon", action="store_true",
                        help=f"Loop automatico ogni {RUN_EVERY_HOURS} ore")
    parser.add_argument("--mode", default=os.getenv("F1_MODE", "normale"),
                        help="Modalità: normale | preview | qualifiche | pre-gara | post-gara | recap")
    parser.add_argument("--gp", default=os.getenv("GP_NAME", ""),
                        help="Nome del GP (es. Monaco, Monza, Silverstone)")
    args = parser.parse_args()

    if args.daemon:
        log.info(f"Daemon attivo: ogni {RUN_EVERY_HOURS} ore | modalità: {args.mode}")
        run(mode=args.mode, gp_name=args.gp)
        schedule.every(RUN_EVERY_HOURS).hours.do(run, mode=args.mode, gp_name=args.gp)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        run(mode=args.mode, gp_name=args.gp)
