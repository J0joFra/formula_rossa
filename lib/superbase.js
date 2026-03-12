// lib/supabase.js
// Unica istanza Supabase per tutta l'app — importa da qui in ogni pagina/componente
import { createClient } from '@supabase/supabase-js';

// Il modulo viene eseguito una volta sola → nessun "Multiple GoTrueClient"
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);