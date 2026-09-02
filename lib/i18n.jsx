'use client';
/**
 * lib/i18n.jsx
 * Traduzioni del sito, sullo stesso schema dell'app GridUp (src/lib/i18n.jsx):
 * un dizionario piatto, la lingua scelta salvata nel browser, e le chiavi che
 * mancano in una lingua che ricadono sull'italiano.
 *
 * Perché non l'i18n di Next: quello lavora sulle URL (/en/...), e senza pagine
 * davvero tradotte serviva solo a servire il sito italiano sotto un secondo
 * indirizzo. Qui la lingua è una preferenza di chi legge, non un pezzo di URL.
 *
 * Il fallback all'italiano è la parte che rende sostenibile tradurre a tappe:
 * una chiave non ancora tradotta esce in italiano invece di sparire o mostrare
 * il nome della chiave.
 */

import { createContext, useContext, useState, useEffect } from 'react';

export const LANGS = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
];

const DICT = {
  it: {
    // navigazione
    nav_archive: 'Archivio', nav_season: 'Stagione', nav_play: 'Gioca',
    nav_stats: 'Statistiche', nav_drivers: 'Piloti', nav_circuits: 'Circuiti',
    nav_standings: 'Classifiche', nav_gp: 'Analisi GP', nav_news: 'News',
    nav_app: 'App GridUp', nav_signin: 'Accedi', nav_signout: 'Esci',
    nav_menu: 'Menu', nav_theme: 'Cambia tema', nav_language: 'Lingua',

    // footer
    ft_project: 'Progetto', ft_fanzone: 'Fan Zone', ft_about: 'Chi siamo',
    ft_contact: 'Contatti', ft_tagline: 'Data Intelligence',
    ft_description: 'Piattaforma indipendente dedicata alle statistiche e alla storia della Scuderia Ferrari in Formula 1.',
    ft_counts: '{seasons} stagioni · oltre 1.100 gran premi in archivio',
    ft_privacy: 'Privacy', ft_cookies: 'Cookie', ft_terms: 'Termini',
    ft_cookiePrefs: 'Preferenze cookie',
    ft_legal: 'Note legali',
    ft_madeBy: '© {year} Formula Rossa · fatto con',
    ft_by: 'da',

    // stati comuni
    // banner cookie
    ck_title: 'Rispettiamo la tua privacy',
    ck_body: 'Usiamo cookie tecnici necessari e, con il tuo consenso, cookie analitici (Google Analytics) e pubblicitari (Google AdSense) per capire come viene usato il sito e sostenere il progetto. Puoi accettare, rifiutare o cambiare idea in qualsiasi momento. Dettagli nella',
    ck_policy: 'Cookie Policy', ck_accept: 'Accetta tutti', ck_reject: 'Rifiuta non essenziali',
    ck_close: 'Chiudi e rifiuta i cookie non essenziali',

    loading: 'Caricamento dati…', retry: 'Riprova',
    err_title: 'Dati non disponibili',
    err_archive: 'Non riusciamo a raggiungere l’archivio dati. Riprova fra poco.',
  },

  en: {
    nav_archive: 'Archive', nav_season: 'Season', nav_play: 'Play',
    nav_stats: 'Statistics', nav_drivers: 'Drivers', nav_circuits: 'Circuits',
    nav_standings: 'Standings', nav_gp: 'Race analysis', nav_news: 'News',
    nav_app: 'GridUp app', nav_signin: 'Sign in', nav_signout: 'Sign out',
    nav_menu: 'Menu', nav_theme: 'Switch theme', nav_language: 'Language',

    ft_project: 'Project', ft_fanzone: 'Fan Zone', ft_about: 'About',
    ft_contact: 'Contact', ft_tagline: 'Data Intelligence',
    ft_description: 'An independent platform devoted to the statistics and history of Scuderia Ferrari in Formula 1.',
    ft_counts: '{seasons} seasons · over 1,100 Grands Prix on record',
    ft_privacy: 'Privacy', ft_cookies: 'Cookies', ft_terms: 'Terms',
    ft_cookiePrefs: 'Cookie preferences',
    ft_legal: 'Legal',
    ft_madeBy: '© {year} Formula Rossa · made with',
    ft_by: 'by',

    ck_title: 'We respect your privacy',
    ck_body: 'We use necessary technical cookies and, with your consent, analytics (Google Analytics) and advertising (Google AdSense) cookies to understand how the site is used and to support the project. You can accept, decline or change your mind at any time. Details in the',
    ck_policy: 'Cookie Policy', ck_accept: 'Accept all', ck_reject: 'Reject non-essential',
    ck_close: 'Close and reject non-essential cookies',

    loading: 'Loading data…', retry: 'Try again',
    err_title: 'Data unavailable',
    err_archive: 'We can’t reach the data archive right now. Please try again shortly.',
  },

  fr: {
    nav_archive: 'Archives', nav_season: 'Saison', nav_play: 'Jouer',
    nav_stats: 'Statistiques', nav_drivers: 'Pilotes', nav_circuits: 'Circuits',
    nav_standings: 'Classements', nav_gp: 'Analyse des GP', nav_news: 'Actualités',
    nav_app: 'Appli GridUp', nav_signin: 'Se connecter', nav_signout: 'Se déconnecter',
    nav_menu: 'Menu', nav_theme: 'Changer de thème', nav_language: 'Langue',

    ft_project: 'Projet', ft_fanzone: 'Fan Zone', ft_about: 'À propos',
    ft_contact: 'Contact', ft_tagline: 'Data Intelligence',
    ft_description: 'Plateforme indépendante consacrée aux statistiques et à l’histoire de la Scuderia Ferrari en Formule 1.',
    ft_counts: '{seasons} saisons · plus de 1 100 Grands Prix archivés',
    ft_privacy: 'Confidentialité', ft_cookies: 'Cookies', ft_terms: 'Conditions',
    ft_cookiePrefs: 'Préférences cookies',
    ft_legal: 'Mentions légales',
    ft_madeBy: '© {year} Formula Rossa · fait avec',
    ft_by: 'par',

    ck_title: 'Nous respectons votre vie privée',
    ck_body: 'Nous utilisons des cookies techniques nécessaires et, avec votre consentement, des cookies analytiques (Google Analytics) et publicitaires (Google AdSense) pour comprendre comment le site est utilisé et soutenir le projet. Vous pouvez accepter, refuser ou changer d’avis à tout moment. Détails dans la',
    ck_policy: 'Politique de cookies', ck_accept: 'Tout accepter', ck_reject: 'Refuser les non essentiels',
    ck_close: 'Fermer et refuser les cookies non essentiels',

    loading: 'Chargement des données…', retry: 'Réessayer',
    err_title: 'Données indisponibles',
    err_archive: 'Impossible d’accéder aux données pour le moment. Réessayez dans quelques instants.',
  },

  es: {
    nav_archive: 'Archivo', nav_season: 'Temporada', nav_play: 'Jugar',
    nav_stats: 'Estadísticas', nav_drivers: 'Pilotos', nav_circuits: 'Circuitos',
    nav_standings: 'Clasificaciones', nav_gp: 'Análisis de GP', nav_news: 'Noticias',
    nav_app: 'App GridUp', nav_signin: 'Iniciar sesión', nav_signout: 'Cerrar sesión',
    nav_menu: 'Menú', nav_theme: 'Cambiar tema', nav_language: 'Idioma',

    ft_project: 'Proyecto', ft_fanzone: 'Fan Zone', ft_about: 'Quiénes somos',
    ft_contact: 'Contacto', ft_tagline: 'Data Intelligence',
    ft_description: 'Plataforma independiente dedicada a las estadísticas y a la historia de Scuderia Ferrari en la Fórmula 1.',
    ft_counts: '{seasons} temporadas · más de 1.100 Grandes Premios en el archivo',
    ft_privacy: 'Privacidad', ft_cookies: 'Cookies', ft_terms: 'Términos',
    ft_cookiePrefs: 'Preferencias de cookies',
    ft_legal: 'Avisos legales',
    ft_madeBy: '© {year} Formula Rossa · hecho con',
    ft_by: 'por',

    ck_title: 'Respetamos tu privacidad',
    ck_body: 'Usamos cookies técnicas necesarias y, con tu consentimiento, cookies analíticas (Google Analytics) y publicitarias (Google AdSense) para entender cómo se usa el sitio y sostener el proyecto. Puedes aceptar, rechazar o cambiar de opinión en cualquier momento. Detalles en la',
    ck_policy: 'Política de cookies', ck_accept: 'Aceptar todo', ck_reject: 'Rechazar no esenciales',
    ck_close: 'Cerrar y rechazar las cookies no esenciales',

    loading: 'Cargando datos…', retry: 'Reintentar',
    err_title: 'Datos no disponibles',
    err_archive: 'No podemos acceder al archivo de datos en este momento. Inténtalo de nuevo en unos minutos.',
  },

  de: {
    nav_archive: 'Archiv', nav_season: 'Saison', nav_play: 'Spielen',
    nav_stats: 'Statistiken', nav_drivers: 'Fahrer', nav_circuits: 'Strecken',
    nav_standings: 'Wertungen', nav_gp: 'GP-Analyse', nav_news: 'News',
    nav_app: 'GridUp App', nav_signin: 'Anmelden', nav_signout: 'Abmelden',
    nav_menu: 'Menü', nav_theme: 'Design wechseln', nav_language: 'Sprache',

    ft_project: 'Projekt', ft_fanzone: 'Fan Zone', ft_about: 'Über uns',
    ft_contact: 'Kontakt', ft_tagline: 'Data Intelligence',
    ft_description: 'Unabhängige Plattform für Statistiken und die Geschichte der Scuderia Ferrari in der Formel 1.',
    ft_counts: '{seasons} Saisons · über 1.100 Grands Prix im Archiv',
    ft_privacy: 'Datenschutz', ft_cookies: 'Cookies', ft_terms: 'Nutzungsbedingungen',
    ft_cookiePrefs: 'Cookie-Einstellungen',
    ft_legal: 'Rechtliches',
    ft_madeBy: '© {year} Formula Rossa · gemacht mit',
    ft_by: 'von',

    ck_title: 'Wir respektieren deine Privatsphäre',
    ck_body: 'Wir verwenden notwendige technische Cookies und, mit deiner Einwilligung, Analyse- (Google Analytics) und Werbe-Cookies (Google AdSense), um zu verstehen, wie die Website genutzt wird, und das Projekt zu unterstützen. Du kannst jederzeit zustimmen, ablehnen oder deine Meinung ändern. Details in der',
    ck_policy: 'Cookie-Richtlinie', ck_accept: 'Alle akzeptieren', ck_reject: 'Nicht notwendige ablehnen',
    ck_close: 'Schließen und nicht notwendige Cookies ablehnen',

    loading: 'Daten werden geladen…', retry: 'Erneut versuchen',
    err_title: 'Daten nicht verfügbar',
    err_archive: 'Das Datenarchiv ist gerade nicht erreichbar. Bitte in Kürze erneut versuchen.',
  },
};

const I18nContext = createContext({ lang: 'it', setLang: () => {}, t: (k) => k });

/** Traduce `key`, sostituendo gli eventuali segnaposto {nome}. */
function tradotto(lang, key, params) {
  let s = (DICT[lang] && DICT[lang][key]) || DICT.it[key] || key;
  if (params) for (const k in params) s = s.split(`{${k}}`).join(String(params[k]));
  return s;
}

export function I18nProvider({ children }) {
  /* Si parte sempre da 'it', anche quando il browser è in un'altra lingua: il
     server non può leggere localStorage, e rendere qualcosa di diverso al primo
     giro del client farebbe fallire l'idratazione di React. La lingua vera si
     applica subito dopo il montaggio. */
  const [lang, setLang] = useState('it');

  useEffect(() => {
    try {
      const salvata = localStorage.getItem('lang');
      if (salvata && LANGS.some((l) => l.code === salvata)) {
        setLang(salvata);
        return;
      }
      const dalBrowser = (navigator.language || 'it').slice(0, 2).toLowerCase();
      if (LANGS.some((l) => l.code === dalBrowser)) setLang(dalBrowser);
    } catch {
      /* modalità privata o storage negato: si resta in italiano */
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch { /* vedi sopra */ }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, params) => tradotto(lang, key, params);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
