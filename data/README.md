# Dump F1DB

I file JSON di questa cartella sono la sorgente del caricamento iniziale su
Supabase: `node scripts/importToSupabase.mjs` li legge da qui.

Stavano in `public/data/`, dove però erano serviti pubblicamente e finivano in
ogni deploy — 44 MB per dei file che il sito non chiede mai. Il browser non ne
ha bisogno: il sito legge tutto da Supabase.

Le immagini e le domande del quiz restano in `public/`, perché quelle il
browser le scarica davvero.
