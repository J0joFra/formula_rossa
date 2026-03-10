"""
F1 News Aggregator Bot — formula-rossa.it
==========================================
Installazione:
  pip install feedparser anthropic firebase-admin python-dotenv schedule

Uso:
  python f1_aggregator.py            # esegui una volta (test)
  python f1_aggregator.py --daemon   # loop ogni 4 ore
"""

import feedparser
import groq
import firebase_admin
from firebase_admin import credentials, firestore
import json
import hashlib
import os
import re
import time
import logging
import argparse
import schedule
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# ─── CONFIGURAZIONE ────────────────────────────────────────────────────────────

RSS_FEEDS = [
    {"name": "FormulaPassion",  "url": "https://www.formulapassion.it/feed/"},
    {"name": "Motorsport.com",  "url": "https://it.motorsport.com/rss/f1/news/"},
    {"name": "Autosprint",      "url": "https://autosprint.corrieredellosport.it/feed/"},
    {"name": "Formula1.it",     "url": "https://www.formula1.it/feed/"},
    {"name": "FormulaUno.com",  "url": "https://www.formulauno.com/feed/"},
    {"name": "F1GrandPrix",     "url": "https://f1grandprix.motorionline.com/feed/"},
    {"name": "F1Race",          "url": "https://f1race.it/feed/"},
]

MAX_ITEMS_PER_FEED  = 3   # notizie da leggere per feed
ITEMS_PER_DIGEST    = 5   # notizie da combinare per articolo
RUN_EVERY_HOURS     = 4   # frequenza modalità daemon

# Nome della collection Firestore dove scrivere gli articoli
FIRESTORE_COLLECTION = "news"

# Path del file JSON delle credenziali Firebase (scaricato da Firebase Console)
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "firebase-credentials.json")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ─── LOGGING ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("f1_bot.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

# ─── FIREBASE INIT ─────────────────────────────────────────────────────────────

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    return firestore.client()

# ─── GESTIONE DUPLICATI ────────────────────────────────────────────────────────

SEEN_FILE = "seen_articles.json"

def load_seen() -> set:
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE) as f:
            return set(json.load(f))
    return set()

def save_seen(seen: set):
    with open(SEEN_FILE, "w") as f:
        json.dump(list(seen), f)

def article_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()

# ─── FETCH RSS ─────────────────────────────────────────────────────────────────

def fetch_feed(feed: dict) -> list[dict]:
    articles = []
    try:
        parsed = feedparser.parse(feed["url"])
        for entry in parsed.entries[:MAX_ITEMS_PER_FEED]:
            summary = re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()[:600]
            articles.append({
                "source":    feed["name"],
                "title":     entry.get("title", ""),
                "url":       entry.get("link", ""),
                "summary":   summary,
                "published": entry.get("published", ""),
            })
        log.info(f"✅ {feed['name']}: {len(articles)} articoli")
    except Exception as e:
        log.warning(f"⚠️  {feed['name']}: {e}")
    return articles

def fetch_all_news(seen: set) -> list[dict]:
    all_articles = []
    for feed in RSS_FEEDS:
        for art in fetch_feed(feed):
            if article_id(art["url"]) not in seen:
                all_articles.append(art)
    result = all_articles[:ITEMS_PER_DIGEST]
    log.info(f"📰 Notizie nuove da elaborare: {len(result)}")
    return result

# ─── GENERAZIONE ARTICOLO CON CLAUDE ──────────────────────────────────────────

def generate_digest(articles: list[dict]) -> dict | None:
    if not articles:
        return None

    client = groq.Groq(api_key=GROQ_API_KEY)

    news_block = ""
    for i, art in enumerate(articles, 1):
        news_block += f"""
NOTIZIA {i}:
Titolo: {art['title']}
Fonte: {art['source']}
URL: {art['url']}
Riassunto: {art['summary']}
---"""

    today = datetime.now().strftime("%d %B %Y")

    prompt = f"""Sei il redattore di formula-rossa.it, piattaforma italiana di statistiche e analisi Ferrari F1.

Oggi è {today}. Hai raccolto queste notizie F1 da varie fonti:
{news_block}

COMPITO:
Scrivi un articolo "F1 Today" in italiano che:
1. Ha un titolo accattivante tipo "F1 Today — [tema principale] | {today}"
2. Apre con 2 righe di contesto generale sulla giornata F1
3. Per ogni notizia: 2-4 frasi originali con parole tue + link alla fonte (es: "secondo <a href='URL'>FormulaPassion</a>")
4. Chiude con 2 righe di commento della redazione, dal punto di vista Ferrari
5. Tono: appassionato, tecnico, diretto — da ingegnere tifoso
6. Usa HTML: <h2> per i sottotitoli notizie, <p> per testo, <a href> per i link fonti

Rispondi SOLO con JSON valido, nient'altro:
{{
  "title": "titolo completo",
  "slug": "titolo-in-kebab-case-senza-accenti",
  "html_content": "HTML completo dell'articolo",
  "excerpt": "riassunto 1-2 righe per anteprima",
  "tags": ["tag1", "tag2", "tag3"],
  "cover_image": ""
}}"""

    log.info("🤖 Generazione articolo con Groq (Llama 3)...")
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",   # modello gratuito e potente
        max_tokens=2000,
        temperature=0.7,
        messages=[
            {
                "role": "system",
                "content": "Sei un redattore sportivo italiano esperto di Formula 1 e Ferrari. Rispondi sempre e solo con JSON valido, senza testo aggiuntivo."
            },
            {"role": "user", "content": prompt}
        ]
    )

    raw = re.sub(r"^```json|^```|```$", "", response.choices[0].message.content.strip(), flags=re.MULTILINE).strip()
    result = json.loads(raw)
    log.info(f"✅ Articolo generato: \"{result['title']}\"")
    return result

# ─── PUBBLICAZIONE SU FIRESTORE ────────────────────────────────────────────────

def publish_to_firestore(article: dict, db) -> bool:
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
            "status":       "published",   # cambia in "draft" per revisionare prima
            "type":         "digest",      # per distinguerlo dagli articoli manuali
        }

        # Usa lo slug come ID documento (evita duplicati)
        db.collection(FIRESTORE_COLLECTION).document(article["slug"]).set(doc)
        log.info(f"🚀 Pubblicato su Firestore: {FIRESTORE_COLLECTION}/{article['slug']}")
        return True

    except Exception as e:
        log.error(f"❌ Errore Firestore: {e}")
        return False

# ─── CICLO PRINCIPALE ──────────────────────────────────────────────────────────

def run():
    log.info("=" * 55)
    log.info("🏎️  F1 Aggregator Bot — formula-rossa.it")
    log.info(f"   {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    log.info("=" * 55)

    seen = load_seen()
    articles = fetch_all_news(seen)

    if not articles:
        log.info("ℹ️  Nessuna notizia nuova. A presto!")
        return

    digest = generate_digest(articles)
    if not digest:
        log.warning("⚠️  Impossibile generare articolo.")
        return

    db = init_firebase()
    success = publish_to_firestore(digest, db)

    if success:
        for art in articles:
            seen.add(article_id(art["url"]))
        save_seen(seen)
        log.info("✅ Ciclo completato.")
    else:
        log.error("❌ Pubblicazione fallita — riproverò al prossimo ciclo.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--daemon", action="store_true",
                        help=f"Loop automatico ogni {RUN_EVERY_HOURS} ore")
    args = parser.parse_args()

    if args.daemon:
        log.info(f"🔄 Daemon attivo: eseguo ogni {RUN_EVERY_HOURS} ore")
        run()
        schedule.every(RUN_EVERY_HOURS).hours.do(run)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        run()
