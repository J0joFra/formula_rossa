# -*- coding: utf-8 -*-
"""
F1 News Aggregator Bot — formula-rossa.it
==========================================
Stack: Firebase Firestore + Next.js + Groq (gratuito)

Installazione:
  pip install feedparser groq firebase-admin python-dotenv schedule

Uso:
  python f1_aggregator.py            # esegui una volta
  python f1_aggregator.py --daemon   # loop ogni 4 ore
"""

import sys
import os

# Fix encoding Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import feedparser
import groq
import firebase_admin
from firebase_admin import credentials, firestore
import json
import hashlib
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
    {"name": "FormulaPassion", "url": "https://www.formulapassion.it/feed/"},
    {"name": "Motorsport.com", "url": "https://it.motorsport.com/rss/f1/news/"},
    {"name": "Autosprint", "url": "https://autosprint.corrieredellosport.it/feed/"},
    {"name": "P300", "url": "https://www.p300.it/feed/"},
    {"name": "FormulaUno.com", "url": "https://www.formulauno.com/feed/"},
    
    {"name": "Autosport F1", "url": "https://www.autosport.com/rss/f1/news/"},
    {"name": "Pitpass", "url": "https://www.pitpass.com/rss-feed"},
    {"name": "Formel1.de", "url": "https://www.formel1.de/f1_tools/rss/news"},
    {"name": "SportsMole F1", "url": "https://www.sportsmole.co.uk/formula-1/rss.xml"},
    {"name": "F1 Destinations", "url": "https://f1destinations.com/feed/"},
]


MAX_ITEMS_PER_FEED   = 3
ITEMS_PER_DIGEST     = 5
RUN_EVERY_HOURS      = 4
FIRESTORE_COLLECTION = "news"
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "firebase-credentials.json")
GROQ_API_KEY         = os.getenv("GROQ_API_KEY")

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

def fetch_feed(feed: dict) -> list:
    articles = []
    try:
        parsed = feedparser.parse(feed["url"])
        for entry in parsed.entries[:MAX_ITEMS_PER_FEED]:
            summary = re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()[:600]
            summary = re.sub(r"[\x00-\x1f\x7f]", " ", summary)
            title   = re.sub(r"[\x00-\x1f\x7f]", " ", entry.get("title", ""))
            articles.append({
                "source":  feed["name"],
                "title":   title,
                "url":     entry.get("link", ""),
                "summary": summary,
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

# ─── GENERAZIONE CON GROQ ──────────────────────────────────────────────────────

def clean_json_string(text: str) -> str:
    text = re.sub(r"^```json|^```|```$", "", text, flags=re.MULTILINE).strip()
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text

def generate_digest(articles: list) -> dict:
    if not articles:
        return None

    client = groq.Groq(api_key=GROQ_API_KEY)

    # Blocco notizie per il prompt
    news_block = ""
    for i, art in enumerate(articles, 1):
        news_block += f"\nNOTIZIA {i}:\nTitolo: {art['title']}\nURL: {art['url']}\nRiassunto: {art['summary']}\n---"

    # Footer fonti (link discreti in fondo all'articolo)
    sources_html = " &nbsp;|&nbsp; ".join(
        f'<a href="{art["url"]}" target="_blank" rel="noopener">{art["source"]}</a>'
        for art in articles
    )
    footer_html = f'<hr/><p style="font-size:12px;color:#999;">Fonti: {sources_html}</p>'

    today = datetime.now().strftime("%d %B %Y")

    prompt = f"""Sei un giornalista sportivo esperto di Formula 1 che scrive per formula-rossa.it, sito italiano dedicato alla Ferrari.

Oggi e' {today}. Hai raccolto queste informazioni:
{news_block}

COMPITO: Scrivi un articolo giornalistico completo, originale e approfondito in italiano.

REGOLE FONDAMENTALI:
- NON citare mai le fonti nel testo (zero "secondo X", zero "come riporta Y", zero nomi di siti)
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
<strong> per concetti chiave
Niente <a> nel corpo dell'articolo

Rispondi SOLO con questo JSON valido (niente backtick, niente newline nei valori):
{{"title": "titolo accattivante della giornata", "slug": "titolo-kebab-case-data-{datetime.now().strftime('%d-%m-%Y')}", "html_content": "HTML completo qui", "excerpt": "2 righe di riassunto per anteprima", "tags": ["F1", "Ferrari", "news"], "footer_html": "{footer_html}"}}"""

    log.info("Generazione articolo con Groq (Llama 3)...")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=4000,
        temperature=0.7,
        messages=[
            {
                "role": "system",
                "content": "Sei un giornalista sportivo italiano esperto di Formula 1 e Ferrari. Scrivi articoli lunghi, originali e approfonditi. Rispondi SEMPRE e SOLO con JSON valido, senza testo aggiuntivo, senza backtick, senza newline nei valori stringa."
            },
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content.strip()
    raw = clean_json_string(raw)

    try:
        result = json.loads(raw)
        # Aggiungi il footer fonti in fondo al contenuto HTML
        result["html_content"] = result.get("html_content", "") + result.get("footer_html", footer_html)
    except json.JSONDecodeError as e:
        log.error(f"Errore parsing JSON: {e}")
        log.error(f"Risposta raw (primi 300 char): {raw[:300]}")
        return None

    log.info(f"Articolo generato: {result.get('title', '?')}")
    return result

# ─── PUBBLICAZIONE FIRESTORE ───────────────────────────────────────────────────

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
            "status":       "published",
            "type":         "digest",
        }
        db.collection(FIRESTORE_COLLECTION).document(article["slug"]).set(doc)
        log.info(f"Pubblicato su Firestore: {FIRESTORE_COLLECTION}/{article['slug']}")
        return True
    except Exception as e:
        log.error(f"Errore Firestore: {e}")
        return False

# ─── CICLO PRINCIPALE ──────────────────────────────────────────────────────────

def run():
    log.info("=" * 50)
    log.info("F1 Aggregator Bot — formula-rossa.it")
    log.info(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
    log.info("=" * 50)

    seen = load_seen()
    articles = fetch_all_news(seen)

    if not articles:
        log.info("Nessuna notizia nuova. A presto!")
        return

    digest = generate_digest(articles)
    if not digest:
        log.warning("Impossibile generare l'articolo.")
        return

    db = init_firebase()
    success = publish_to_firestore(digest, db)

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
    args = parser.parse_args()

    if args.daemon:
        log.info(f"Daemon attivo: ogni {RUN_EVERY_HOURS} ore")
        run()
        schedule.every(RUN_EVERY_HOURS).hours.do(run)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        run()