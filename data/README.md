# Dump F1DB

I file JSON di questa cartella sono la sorgente del caricamento iniziale su
Supabase: `node scripts/importToSupabase.mjs` li legge da qui.

Stavano in `public/data/`, dove però erano serviti pubblicamente e finivano in
ogni deploy — 44 MB per dei file che il sito non chiede mai. Il browser non ne
ha bisogno: il sito legge tutto da Supabase.

Le immagini e le domande del quiz restano in `public/`, perché quelle il
browser le scarica davvero.

## Ritratti dei piloti

`node scripts/fetchDriverPhotos.mjs` scarica i ritratti da Wikimedia Commons in
`public/data/piloti/` e scrive `lib/driverPhotos.json` con autore e licenza di
ognuno. Quel file è ciò che il sito legge per sapere chi ha una foto; l'autore
va mostrato, ed è la condizione a cui quelle immagini si possono pubblicare.

Prima di lanciarlo, metti un contatto vero nello `USER_AGENT` in cima allo
script: Wikimedia lo chiede a chi fa richieste automatiche.
