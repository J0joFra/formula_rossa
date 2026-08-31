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
  python f1_aggregator.py --purge-only            # solo pulizia archivio (>30 giorni)
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
from datetime import datetime, timezone, timedelta
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
ITEMS_PER_DIGEST     = 8      # più fonti = articolo più ricco e meno dipendente da una sola testata
MIN_WORDS            = 650    # sotto questa soglia l'articolo non vale la pubblicazione
TARGET_WORDS         = 900
RETENTION_DAYS       = 30     # dopo quanti giorni un articolo viene cancellato da Firestore
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
    # Un articolo per fonte a giro, invece di prendere in ordine: prima si
    # esaurivano i primi feed dell'elenco e le altre testate non entravano mai
    # nel digest, che così raccontava il fatto da un punto di vista solo.
    per_feed = []
    for feed in RSS_FEEDS:
        fresche = [a for a in fetch_feed(feed, max_days_old)
                   if article_id(a["url"]) not in seen]
        if fresche:
            per_feed.append(fresche)

    all_articles = []
    while per_feed and len(all_articles) < ITEMS_PER_DIGEST:
        for lista in list(per_feed):
            if not lista:
                per_feed.remove(lista)
                continue
            all_articles.append(lista.pop(0))
            if len(all_articles) >= ITEMS_PER_DIGEST:
                break

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

def count_words(html: str) -> int:
    """Parole del testo, tolti i tag: è la misura su cui si giudica se l'articolo regge."""
    testo = re.sub(r"<[^>]+>", " ", html or "")
    return len([w for w in testo.split() if w.strip()])

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

    # Il testo esteso veniva scaricato da fetch_full_article_text() e poi buttato
    # via: nel prompt finiva solo il riassunto da 600 caratteri. Il modello aveva
    # quindi pochissimo materiale, ed è la ragione principale degli articoli corti.
    news_block = ""
    for i, art in enumerate(articles, 1):
        corpo = art.get("full_text") or art.get("summary") or ""
        news_block += (
            f"\n### FONTE {i} — {art['source']} ({art['date']})\n"
            f"Titolo: {art['title']}\n"
            f"URL: {art['url']}\n"
            f"Testo: {corpo}\n"
        )

    sources_html = " &nbsp;|&nbsp; ".join(
        f'<a href="{art["url"]}" target="_blank" rel="noopener">{art["source"]}</a>'
        for art in articles
    )
    footer_html = f'<hr/><p style="font-size:12px;color:#999;">Fonti: {sources_html}</p>'

    today = datetime.now().strftime("%d %B %Y")
    ferrari_context = get_ferrari_current_context()

    # Il taglio editoriale della modalità era configurato in RACE_WEEKEND_MODES ma
    # non arrivava mai al modello: generate_digest leggeva da lì solo i tag. Anche
    # gp_name veniva accettato come parametro e mai usato.
    focus      = mode_cfg.get("focus", "le notizie Ferrari e Formula 1 di giornata")
    title_hint = mode_cfg.get("title_hint", "")
    gp_riga    = f"\nGran Premio di riferimento: {gp_name}." if gp_name else ""
    titolo_riga = f"\nTaglio del titolo, da adattare: {title_hint}" if title_hint else ""

    prompt = f"""Sei un giornalista sportivo esperto di Formula 1 che scrive per formula-rossa.it,
un sito italiano indipendente dedicato alla Scuderia Ferrari.

Oggi è {today}.{gp_riga}

{ferrari_context}

FONTI DI OGGI — è l'unico materiale su cui puoi basarti:
{news_block}

## COSA SCRIVERE
Un articolo in italiano di **{TARGET_WORDS} parole circa, mai meno di {MIN_WORDS}**, che tiene
insieme le fonti qui sopra in un unico pezzo ragionato. Taglio: {focus}.{titolo_riga}

Struttura obbligatoria del campo html_content:
1. Un paragrafo di apertura che dice subito il fatto principale e perché conta.
2. Da tre a cinque sezioni, ognuna aperta da un `<h2>` con un titolo che sia
   informativo e non generico (no "Introduzione", no "Conclusione").
3. Ogni sezione ha almeno due paragrafi `<p>` distesi. Niente elenchi puntati al
   posto della prosa: usa `<ul>` solo se stai davvero elencando dati.
4. Una chiusura che guarda avanti: cosa succede adesso, cosa aspettarsi.

Usa solo questi tag: `<h2>`, `<p>`, `<strong>`, `<em>`, `<ul>`, `<li>`, `<blockquote>`.
Niente `<html>`, `<body>`, `<h1>` o attributi di stile.

## ACCURATEZZA — la parte che conta di più
- Scrivi **solo** fatti che compaiono nelle fonti qui sopra. Se un dato non c'è,
  non lo inventi e non lo stimi: lo ometti.
- **Mai inventare** tempi sul giro, distacchi, posizioni, punti in classifica,
  numeri di giri o dichiarazioni. Una virgolettatura si usa solo se il virgolettato
  è testualmente nelle fonti.
- Se le fonti si contraddicono o una notizia è data come indiscrezione, dillo e
  attribuiscila ("secondo quanto riporta X"), invece di presentarla come certa.
- Non fingere di aver visto la sessione: stai sintetizzando ciò che riportano
  le testate, non facendo cronaca in diretta.
- Distingui sempre ciò che è già accaduto da ciò che è previsto.
- I piloti Ferrari sono soltanto Charles Leclerc e Lewis Hamilton. Carlos Sainz
  non corre per la Ferrari: se una fonte lo dà in Ferrari, è un errore della fonte.

## CAMPI DA RESTITUIRE
- `title`: 8-14 parole, specifico, senza clickbait e senza punto finale.
- `slug`: minuscolo, parole separate da trattini, che finisce con {datetime.now().strftime('%d-%m-%Y')}.
- `html_content`: l'articolo completo secondo la struttura sopra.
- `excerpt`: due frasi, 30-45 parole, che dicono il contenuto dell'articolo senza ripetere il titolo.
- `tags`: {json.dumps(mode_tags)}

Rispondi **solo** con l'oggetto JSON, senza testo prima o dopo:
{{"title": "...", "slug": "...", "html_content": "...", "excerpt": "...", "tags": {json.dumps(mode_tags)}}}"""

    log.info(f"Generazione articolo — modalità: {mode}, {len(articles)} fonti")

    system_msg = (
        "Sei un giornalista di Formula 1 che scrive in italiano per un sito ferrarista. "
        "Scrivi pezzi distesi e argomentati, non riassunti. "
        "Non inventi mai dati, tempi, risultati o dichiarazioni: usi solo ciò che è nelle fonti. "
        "Stagione 2026: i piloti Ferrari sono Leclerc e Hamilton. "
        "Rispondi esclusivamente con un oggetto JSON valido."
    )

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user",   "content": prompt},
    ]

    # Due tentativi: se il primo articolo esce sotto la soglia, si richiede
    # l'allungamento invece di pubblicare un pezzo di quattro paragrafi.
    result = None
    for tentativo in (1, 2):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                max_tokens=6000,
                temperature=0.7,
                messages=messages,
            )
        except Exception as e:
            log.error(f"Groq non ha risposto: {e}")
            return None

        raw = clean_json_string(response.choices[0].message.content.strip())

        try:
            candidato = json.loads(raw)
        except json.JSONDecodeError as e:
            log.error(f"Errore JSON (tentativo {tentativo}): {e}")
            if tentativo == 2:
                return None
            messages = messages[:2]
            continue

        parole = count_words(candidato.get("html_content", ""))
        log.info(f"Tentativo {tentativo}: {parole} parole")

        if parole >= MIN_WORDS or tentativo == 2:
            result = candidato
            if parole < MIN_WORDS:
                log.warning(f"Articolo comunque corto ({parole} parole, minimo {MIN_WORDS}): non pubblicato.")
                return None
            break

        messages = messages[:2] + [
            {"role": "assistant", "content": raw},
            {"role": "user", "content": (
                f"L'articolo è di {parole} parole: troppo corto. Riscrivilo per intero portandolo "
                f"a circa {TARGET_WORDS} parole, sviluppando ogni sezione con più contesto tratto "
                f"dalle fonti — senza aggiungere fatti che nelle fonti non ci sono e senza "
                f"allungare ripetendo quello che hai già scritto. Rispondi solo con il JSON."
            )},
        ]

    if result is None:
        return None

    fixed_content, fixed_title = validate_and_fix_ferrari_drivers(
        result.get("html_content", ""),
        result.get("title", ""),
    )
    result["html_content"] = fixed_content + footer_html
    result["title"] = fixed_title
    result["word_count"] = count_words(fixed_content)

    if mode in RACE_WEEKEND_MODES:
        result["tags"] = list(set(result.get("tags", []) + mode_cfg.get("tags", [])))

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
            "expires_at":   now + timedelta(days=RETENTION_DAYS),
            "status":       "published",
            "type":         mode if mode in RACE_WEEKEND_MODES else "digest",
            "word_count":   article.get("word_count", 0),
        }
        db.collection(FIRESTORE_COLLECTION).document(article["slug"]).set(doc)
        log.info(f"Pubblicato: {article['slug']}")
        return True
    except Exception as e:
        log.error(f"Errore Firestore: {e}")
        return False

# ─── PULIZIA ARCHIVIO ──────────────────────────────────────────────────────────

def purge_old_articles(db, days: int = RETENTION_DAYS) -> int:
    """
    Cancella da Firestore gli articoli più vecchi di `days` giorni.

    Sono digest di attualità: dopo un mese non li legge più nessuno, restano
    indicizzati e continuano a occupare letture. Si cancellano a monte invece di
    nasconderli lato sito, così il database non cresce all'infinito.
    """
    limite = datetime.now(timezone.utc) - timedelta(days=days)
    coll = db.collection(FIRESTORE_COLLECTION)
    try:
        # Le versioni recenti della libreria vogliono FieldFilter; la forma
        # posizionale funziona ancora ma è deprecata e prima o poi sparirà.
        try:
            from google.cloud.firestore_v1.base_query import FieldFilter
            domanda = coll.where(filter=FieldFilter("published_at", "<", limite))
        except ImportError:
            domanda = coll.where("published_at", "<", limite)
        vecchi = domanda.stream()
    except Exception as e:
        log.error(f"Pulizia archivio non riuscita: {e}")
        return 0

    # Firestore accetta al massimo 500 operazioni per batch.
    eliminati, batch, nel_batch = 0, db.batch(), 0
    for doc in vecchi:
        batch.delete(doc.reference)
        eliminati += 1
        nel_batch += 1
        if nel_batch == 500:
            batch.commit()
            batch, nel_batch = db.batch(), 0
    if nel_batch:
        batch.commit()

    if eliminati:
        log.info(f"Archivio: {eliminati} articoli più vecchi di {days} giorni eliminati.")
    else:
        log.info(f"Archivio: nessun articolo più vecchio di {days} giorni.")
    return eliminati

# ─── CICLO PRINCIPALE ──────────────────────────────────────────────────────────

def run(mode: str = "normale", gp_name: str = ""):
    log.info("=" * 55)
    log.info(f"F1 Aggregator Bot — formula-rossa.it (SOLO NOTIZIE RECENTI) [{mode.upper()}]")
    log.info(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
    log.info("=" * 55)

    db = init_firebase()
    purge_old_articles(db)

    seen = load_seen()
    articles = fetch_all_news(seen, max_days_old=1)  # ← solo oggi e ieri

    if not articles:
        log.info("Nessuna notizia nuova degli ultimi 2 giorni.")
        return

    digest = generate_digest(articles, mode=mode, gp_name=gp_name)
    if not digest:
        log.warning("Generazione fallita.")
        return

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
    parser.add_argument("--purge-only", action="store_true",
                        help="Cancella soltanto gli articoli scaduti, senza pubblicare nulla.")
    parser.add_argument("--mode", default=os.getenv("F1_MODE", "normale"))
    parser.add_argument("--gp", default=os.getenv("GP_NAME", ""))
    args = parser.parse_args()

    if args.purge_only:
        purge_old_articles(init_firebase())
    elif args.daemon:
        log.info(f"Daemon attivo ogni {RUN_EVERY_HOURS}h | modalità: {args.mode}")
        run(mode=args.mode, gp_name=args.gp)
        schedule.every(RUN_EVERY_HOURS).hours.do(run, mode=args.mode, gp_name=args.gp)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        run(mode=args.mode, gp_name=args.gp)
