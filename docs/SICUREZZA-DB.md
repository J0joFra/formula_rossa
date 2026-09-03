# Sicurezza del database

Il sito parla con Supabase dal browser, con la chiave anon. Quella chiave è
**pubblica**: sta nel bundle JavaScript, chiunque apra gli strumenti per
sviluppatori se la copia in due secondi. Non è un problema di per sé — è fatta
per stare lì — a patto che dietro ci sia una regola su cosa può fare.

Fino al 3 settembre 2026 quella regola non c'era. Questo documento dice qual è
adesso e perché.

## La regola

**L'archivio F1 è pubblico in lettura e chiuso in scrittura. Tutto il resto
passa dal server.**

| Cosa | Chiave anon (browser) | Service role (server) |
| --- | --- | --- |
| 31 tabelle d'archivio (`driver`, `race`, `race_data`, …) | sola lettura | tutto |
| 17 viste d'archivio (`race_grid_results`, `ferrari_driver_wins`, …) | sola lettura | tutto |
| `news`, `flash_news` | sola lettura | tutto |
| 4 tabelle `fanta_*` | **niente** | tutto |
| `sync_meta` | **niente** | tutto |

Applicata in due strati, perché uno solo si buca:

1. **RLS attiva ovunque.** Sull'archivio c'è una policy `Public read <tabella>`
   di solo `SELECT` per `anon` e `authenticated`. Sulle tabelle `fanta_*` e su
   `sync_meta` la RLS è attiva e le policy sono **zero**: con la chiave
   pubblica non si legge e non si scrive niente.
2. **Grant revocati.** `INSERT`, `UPDATE`, `DELETE` e `TRUNCATE` sono tolti ad
   `anon` e `authenticated` sull'archivio. Serve perché con la sola RLS le
   scritture erano innocue in due modi diversi: l'`INSERT` veniva respinto con
   un errore, ma `UPDATE` e `DELETE` "riuscivano" toccando zero righe. Un
   no-op silenzioso funziona finché qualcuno non scrive una policy sbagliata;
   un permesso revocato dà un errore, e un errore si vede.

Le viste dell'archivio sono passate a `security_invoker = on`: prima giravano
con i permessi del proprietario e scavalcavano la RLS delle tabelle sotto,
quindi c'erano due regole diverse per gli stessi dati a seconda della strada
presa. Adesso ce n'è una.

## Il buco vero

Il problema più grave non erano le tabelle aperte. Erano due funzioni:

```sql
create function public.exec_sql(query text) returns void
  language plpgsql security definer
as $$ begin execute query; end $$;
```

`exec_sql` ed `exec_stmt` eseguivano **SQL arbitrario con i permessi del
proprietario del database**, ed erano chiamabili da `anon` via
`/rest/v1/rpc/exec_sql`. Con la chiave pubblica del sito si poteva cancellare
qualsiasi tabella, leggere qualsiasi riga, creare un utente.

Finché erano lì, ogni policy era decorativa: bastava passarci dentro una riga
di SQL per scavalcarla. L'`EXECUTE` è stato revocato a `public`, `anon` e
`authenticated`; restano chiamabili solo dalla service role. Nessuna parte del
sito le usava — non compaiono da nessuna parte nel codice.

Alle funzioni `SECURITY DEFINER` è stato anche fissato il `search_path`: senza,
si dirottano creando un oggetto con lo stesso nome in uno schema che viene
prima nel percorso di ricerca.

## Cosa continua a funzionare

- **Il sito**: legge e basta, e la lettura è aperta.
- **L'import** (`scripts/importToSupabase.mjs`): usa `SUPABASE_SERVICE_ROLE_KEY`,
  che non passa né dai grant né dalla RLS.
- **Il Fanta**: passa dalle API route, che usano la stessa chiave.

La regola pratica per il futuro: **se una cosa deve scrivere, scrive dal
server.** Non esiste una scrittura legittima dal browser in questo progetto, e
il giorno in cui servisse, la strada è una API route — non una policy di
`INSERT` per `anon`.

## Verificare che regga

```sql
-- tabelle senza RLS: deve dare 0
select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- funzioni SECURITY DEFINER chiamabili da anon: deve dare 0
select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and has_function_privilege('anon', p.oid, 'EXECUTE');
```

Il linter di Supabase (Advisors → Security) deve restare pulito a parte cinque
avvisi `rls_enabled_no_policy` di livello INFO: sono le quattro tabelle
`fanta_*` e `sync_meta`, chiuse **apposta**.
