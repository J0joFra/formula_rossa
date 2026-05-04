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

# ─── FILTRO PER DATA ───────────────────────────────────────────────────────────

def is_recent_article(entry, max_days_old: int = 1) -> bool:
    """
    Verifica se l'articolo è recente (max_days_old giorni fa o oggi)
    Supporta multiple formati di data nei feed RSS
    """
    date_fields = ['published_parsed', 'updated_parsed', 'created_parsed', 'date_parsed']
    
    for field in date_fields:
        date_struct = entry.get(field)
        if date_struct:
            try:
                article_date = datetime(*date_struct[:6], tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                days_diff = (now - article_date).days
                
                if days_diff <= max_days_old:
                    return True
                else:
                    log.debug(f"Articolo troppo vecchio: {article_date.date()} (diff: {days_diff} giorni)")
                    return False
            except Exception as e:
                log.debug(f"Errore parsing data: {e}")
                continue
    
    # Se non troviamo data, accettiamo comunque (fallback)
    return True

def get_article_date(entry) -> str:
    """Estrae la data dell'articolo in formato leggibile"""
    date_fields = ['published_parsed', 'updated_parsed', 'created_parsed', 'date_parsed']
    for field in date_fields:
        date_struct = entry.get(field)
        if date_struct:
            try:
                article_date = datetime(*date_struct[:6], tzinfo=timezone.utc)
                return article_date.strftime("%Y-%m-%d %H:%M")
            except:
                pass
    return "data sconosciuta"

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

def fetch_feed(feed: dict, max_days_old: int = 1) -> list:
    articles = []
    try:
        parsed = feedparser.parse(feed["url"])
        recent_count = 0
        skipped_count = 0
        
        for entry in parsed.entries[:MAX_ITEMS_PER_FEED * 3]:
            if not is_recent_article(entry, max_days_old):
                skipped_count += 1
                continue
            
            recent_count += 1
            summary = re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()[:600]
            summary = re.sub(r"[\x00-\x1f\x7f]", " ", summary)
            title   = re.sub(r"[\x00-\x1f\x7f]", " ", entry.get("title", ""))
            
            full_text = fetch_full_article_text(entry)
            article_date = get_article_date(entry)
            
            articles.append({
                "source":  feed["name"],
                "title":   title,
                "url":     entry.get("link", ""),
                "summary": summary,
                "full_text": full_text,
                "date":    article_date,
            })
            
            if len(articles) >= MAX_ITEMS_PER_FEED:
                break
                
        log.info(f"{feed['name']}: {recent_count} recenti, {skipped_count} vecchi -> {len(articles)} presi")
    except Exception as e:
        log.warning(f"{feed['name']}: errore — {e}")
    return articles

def fetch_all_news(seen: set, max_days_old: int = 1) -> list:
    all_articles = []
    for feed in RSS_FEEDS:
        for art in fetch_feed(feed, max_days_old):
            if article_id(art["url"]) not in seen:
                all_articles.append(art)
    result = all_articles[:ITEMS_PER_DIGEST]
    log.info(f"Notizie nuove da elaborare: {len(result)} (ultimi {max_days_old} giorni)")
    
    for art in result:
        log.info(f"  📅 {art['date']} | {art['source']} | {art['title'][:50]}...")
    
    return result

# ─── CONTESTO FERRARI AGGIORNATO ───────────────────────────────────────────────

def get_ferrari_current_context() -> str:
    """Restituisce un contesto forzato e verificato sulla situazione Ferrari attuale (2026)"""
    return """
    ⚠️ INFORMAZIONE VERIFICATA E ATTUALE (STAGIONE 2026):
    
    **SCUDERIA FERRARI**:
    - Piloti ufficiali: **Charles Leclerc** (numero 16) e **Lewis Hamilton** (numero 44)
    - Lewis Hamilton è entrato in Ferrari a partire dalla stagione 2025 (ora al secondo anno)
    - Carlos Sainz NON È PIÙ un pilota Ferrari dal 2025
    - Team Principal: Frederic Vasseur
    
    **REGOLA OBBLIGATORIA**:
    IGNORA COMPLETAMENTE QUALSIASI INFORMAZIONE CHE MENZIONA "Sainz" COME PILOTA FERRARI.
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
        (r"(?i)\bCarlos Sainz\b(?=\s*(?:[^.]*Ferrari|alla Ferrari|della Ferrari))", "Lewis Hamilton"),
        (r"(?i)\bSainz\b(?=\s*(?:[^.]*alla Ferrari|con la Ferrari|della Ferrari))", "Hamilton"),
        (r"(?i)(Ferrari\s+(?:ha|aveva|schierava|allinea)\s+)(?:Carlos\s+Sainz|Sainz)", r"\1Lewis Hamilton"),
    ]
    
    fixed_content = html_content
    for pattern, replacement in fixes:
        fixed_content = re.sub(pattern, replacement, fixed_content)
        title = re.sub(pattern, replacement, title)
    
    if "Sainz" in title and "Ferrari" in title:
        title = title.replace("Sainz", "Hamilton").replace("Carlos", "Lewis")
    
    if "Sainz" in fixed_content and "Ferrari" in fixed_content:
        fixed_content = fixed_content.replace("Carlos Sainz", "Lewis Hamilton").replace("Sainz", "Hamilton")
    
    return fixed_content, title

# ─── GENERAZIONE CON GROQ ──────────────────────────────────────────────────────

def generate_digest(articles: list, mode: str = "normale", gp_name: str = "") -> dict:
    if not articles:
        return None

    client = groq.Groq(api_key=GROQ_API_KEY)

    mode_cfg  = RACE_WEEKEND_MODES.get(mode, {})
    mode_tags  = mode_cfg.get("tags", ["F1", "Ferrari", "news"])

    news_block = ""
    for i, art in enumerate(articles, 1):
        news_block += f"\nNOTIZIA {i} ({art['date']}):\nTitolo: {art['title']}\nURL: {art['url']}\nRiassunto: {art['summary']}\n---"

    sources_html = " &nbsp;|&nbsp; ".join(
        f'<a href="{art["url"]}" target="_blank" rel="noopener">{art["source"]}</a>'
        for art in articles
    )
    footer_html = f'<hr/><p style="font-size:12px;color:#999;">Fonti: {sources_html}</p>'

    today = datetime.now().strftime("%d %B %Y")
    ferrari_context = get_ferrari_current_context()

    prompt = f"""Sei un giornalista sportivo esperto di Formula 1 che scrive per formula-rossa.it.

Oggi è {today}.

{ferrari_context}

NOTIZIE DEL GIORNO (SOLO DATI AGGIORNATI):
{news_block}

⚠️ REGOLE:
- I piloti Ferrari sono SOLO Charles Leclerc e Lewis Hamilton
- NON menzionare Sainz come pilota Ferrari
- Usa "oggi" per contestualizzare

Rispondi SOLO con JSON valido:
{{"title": "titolo", "slug": "titolo-kebab-case-{datetime.now().strftime('%d-%m-%Y')}", "html_content": "HTML", "excerpt": "riassunto", "tags": {json.dumps(mode_tags)}}}"""

    log.info(f"Generazione articolo — modalità: {mode}")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=4000,
        temperature=0.7,
        messages=[
            {"role": "system", "content": "Sei un giornalista F1. Stagione 2026: Ferrari ha Leclerc e Hamilton. Sainz non è più in Ferrari. Rispondi SOLO con JSON valido."},
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content.strip()
    raw = clean_json_string(raw)

    try:
        result = json.loads(raw)
        fixed_content, fixed_title = validate_and_fix_ferrari_drivers(
            result.get("html_content", ""), 
            result.get("title", "")
        )
        result["html_content"] = fixed_content + footer_html
        result["title"] = fixed_title
        
        if mode in RACE_WEEKEND_MODES:
            result["tags"] = list(set(result.get("tags", []) + mode_cfg.get("tags", [])))
    except json.JSONDecodeError as e:
        log.error(f"Errore JSON: {e}")
        return None

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
            "cover_image":  "",
            "author":       "Redazione Formula Rossa",
            "category":     "news",
            "published_at": now,
            "created_at":   now,
            "status":       "published",
            "type":         mode if mode in RACE_WEEKEND_MODES else "digest",
        }
        db.collection(FIRESTORE_COLLECTION).document(article["slug"]).set(doc)
        log.info(f"Pubblicato: {article['slug']}")
        return True
    except Exception as e:
        log.error(f"Errore Firestore: {e}")
        return False

# ─── CICLO PRINCIPALE ──────────────────────────────────────────────────────────

def run(mode: str = "normale", gp_name: str = ""):
    log.info("=" * 55)
    log.info(f"F1 Aggregator Bot — formula-rossa.it (SOLO NOTIZIE RECENTI) [{mode.upper()}]")
    log.info(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
    log.info("=" * 55)

    seen = load_seen()
    articles = fetch_all_news(seen, max_days_old=1)  # ← solo oggi e ieri

    if not articles:
        log.info("Nessuna notizia nuova degli ultimi 2 giorni.")
        return

    digest = generate_digest(articles, mode=mode, gp_name=gp_name)
    if not digest:
        log.warning("Generazione fallita.")
        return

    db = init_firebase()
    success = publish_to_firestore(digest, db, mode=mode)

    if success:
        for art in articles:
            seen.add(article_id(art["url"]))
        save_seen(seen)
        log.info("✅ Ciclo completato!")
    else:
        log.error("❌ Pubblicazione fallita.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--daemon", action="store_true")
    parser.add_argument("--mode", default=os.getenv("F1_MODE", "normale"))
    parser.add_argument("--gp", default=os.getenv("GP_NAME", ""))
    args = parser.parse_args()

    if args.daemon:
        log.info(f"Daemon attivo ogni {RUN_EVERY_HOURS}h | modalità: {args.mode}")
        run(mode=args.mode, gp_name=args.gp)
        schedule.every(RUN_EVERY_HOURS).hours.do(run, mode=args.mode, gp_name=args.gp)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        run(mode=args.mode, gp_name=args.gp)
