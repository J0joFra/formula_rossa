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

# Fix encoding Windows PRIMA di tutto il resto
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
    {"name": "FormulaPassion",  "url": "https://www.formulapassion.it/feed/"},
    {"name": "Motorsport.com",  "url": "https://it.motorsport.com/rss/f1/news/"},
    {"name": "Autosprint",      "url": "https://autosprint.corrieredellosport.it/feed/"},
    {"name": "P300",            "url": "https://www.p300.it/feed/"},
    {"name": "FormulaUno.com",  "url": "https://www.formulauno.com/feed/"},
]

MAX_ITEMS_PER_FEED  = 3
ITEMS_PER_DIGEST    = 5
RUN_EVERY_HOURS     = 4
FIRESTORE_COLLECTION = "news"
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "firebase-credentials.json")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ─── LOGGING ───────────────────────────────────────────────────────────────────
logger = logging.getLogger("f1bot")
logger.setLevel(logging.INFO)

# Handler file (UTF-8)
fh = logging.FileHandler("f1_bot.log", encoding="utf-8")
fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
logger.addHandler(fh)

# Handler terminale (UTF-8, senza emoji se non supportate)
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
            summary = re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()[:500]
            # Rimuovi caratteri di controllo dal testo
            summary = re.sub(r"[\x00-\x1f\x7f]", " ", summary)
            title = re.sub(r"[\x00-\x1f\x7f]", " ", entry.get("title", ""))
            articles.append({
                "source":   feed["name"],
                "title":    title,
                "url":      entry.get("link", ""),
                "summary":  summary,
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
    """Rimuove caratteri problematici dalla risposta prima del parsing JSON."""
    # Rimuovi backtick markdown
    text = re.sub(r"^```json|^```|```$", "", text, flags=re.MULTILINE).strip()
    # Rimuovi caratteri di controllo TRANNE newline e tab (validi in JSON)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text

def generate_digest(articles: list) -> dict:
    if not articles:
        return None

    client = groq.Groq(api_key=GROQ_API_KEY)

    news_block = ""
    for i, art in enumerate(articles, 1):
        news_block += f"\nNOTIZIA {i}:\nTitolo: {art['title']}\nFonte: {art['source']}\nURL: {art['url']}\nRiassunto: {art['summary']}\n---"

    today = datetime.now().strftime("%d %B %Y")

    prompt = f"""Sei il redattore di formula-rossa.it, piattaforma italiana Ferrari F1.

Oggi e' {today}. Notizie F1 raccolte:
{news_block}

Scrivi un articolo digest in italiano che:
1. Titolo: "F1 Today - [tema principale] | {today}"
2. Intro di 2 righe sulla giornata F1
3. Per ogni notizia: 2-3 frasi originali + link fonte (es: secondo <a href='URL'>FormulaPassion</a>)
4. Conclusione di 2 righe dal punto di vista Ferrari
5. Usa HTML semplice: h2, p, a href

IMPORTANTE: Rispondi SOLO con JSON valido senza caratteri speciali nei valori stringa. Formato:
{{"title": "titolo", "slug": "titolo-kebab-case", "html_content": "html qui", "excerpt": "riassunto breve", "tags": ["f1", "ferrari", "news"], "cover_image": ""}}"""

    log.info("Generazione articolo con Groq (Llama 3)...")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        temperature=0.5,
        messages=[
            {
                "role": "system",
                "content": "Sei un redattore sportivo italiano esperto di Formula 1. Rispondi SEMPRE e SOLO con JSON valido, senza testo aggiuntivo, senza backtick, senza newline nei valori stringa."
            },
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content.strip()
    raw = clean_json_string(raw)

    try:
        result = json.loads(raw)
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