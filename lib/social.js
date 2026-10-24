/**
 * lib/social.js
 * I profili social di Formula Rossa e i contenuti da mostrare nella Fan Zone.
 *
 * Per mettere in pagina un post o un video basta incollarne l'indirizzo
 * negli elenchi qui sotto (quello che si copia con "Copia link").
 */

export const INSTAGRAM = {
  id: 'instagram',
  name: 'Instagram',
  handle: '@formularossa.it',
  url: 'https://www.instagram.com/formularossa.it',
  desc: 'Grafiche, record e curiosità sulla Ferrari, gara dopo gara.',
};

export const TIKTOK = {
  id: 'tiktok',
  name: 'TikTok',
  handle: '@formularossa.it',
  user: 'formularossa.it',
  url: 'https://www.tiktok.com/@formularossa.it',
  desc: 'I numeri della Rossa in un minuto: statistiche, confronti e momenti storici.',
};

export const SOCIAL_FANZONE = [INSTAGRAM, TIKTOK];

/** Post Instagram da incorporare, es. 'https://www.instagram.com/p/XXXXXXXX/'. */
export const INSTAGRAM_POSTS = [];

/** Video TikTok da incorporare, es. 'https://www.tiktok.com/@formularossa.it/video/1234567890'. */
export const TIKTOK_VIDEOS = [];
