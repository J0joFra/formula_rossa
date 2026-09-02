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

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

    // home — hero
    hp_heroEyebrow: 'Data Intelligence · Scuderia Ferrari',
    hp_heroTitleA: 'La Rossa', hp_heroTitleB: 'nei numeri',
    hp_heroLead: 'Ogni vittoria, pole e giro veloce della Scuderia Ferrari dal 1950 a oggi. Statistiche, classifiche e archivio storico, in un’unica piattaforma indipendente.',
    hp_ctaStats: 'Esplora le statistiche', hp_ctaStandings: 'Classifiche {year}',
    hp_allTime: 'Ferrari · F1 all-time', hp_na: 'N/D',
    hp_wins: 'Vittorie', hp_podiums: 'Podi', hp_poles: 'Pole position', hp_fastestLaps: 'Giri veloci',
    hp_ctorTitles: '{n} Titoli Costruttori', hp_driverTitles: '{n} Titoli Piloti',

    // home — i tre pilastri
    hp_platformEyebrow: 'La piattaforma',
    hp_platformTitle: 'Tre modi per vivere la Rossa',
    hp_platformLead: 'L’archivio storico al centro, la stagione in corso sempre aggiornata e un angolo per giocare. Il calcolatore del Mondiale vive nell’app GridUp.',
    hp_archiveDesc: 'Il cuore del sito: {years} anni di Ferrari in Formula 1. Record, statistiche, schede piloti e circuiti, con numeri verificabili.',
    hp_seasonDesc: 'Il campionato in corso: classifiche aggiornate, l’analisi di ogni Gran Premio e le notizie dal mondo Ferrari.',
    hp_playDesc: 'Un angolo leggero: mini-giochi a tema Ferrari per mettere alla prova la tua conoscenza tra un GP e l’altro.',
    hp_trivia: 'Trivia', hp_pitstop: 'Pit Stop', hp_circuitRush: 'Circuit Rush',

    // home — fascia dei numeri
    hp_factGpValue: '1.000+',
    hp_factSeasons: 'Stagioni in F1', hp_factGp: 'GP disputati',
    hp_factCtor: 'Titoli costruttori', hp_factDriver: 'Titoli piloti',
    hp_factSince: 'Dal primo GP',

    // home — flash news
    nw_eyebrow: 'Aggiornamenti in tempo reale',
    nw_title: 'Flash news',
    nw_lead: 'Le ultime notizie dalla Formula 1 e dalla Scuderia Ferrari, aggiornate durante la giornata.',
    nw_source: 'Fonte: Motorsport.com',
    nw_read: 'Leggi', nw_loading: 'Caricamento notizie', nw_retry: 'Riprova',
    nw_empty: 'Le notizie non sono raggiungibili in questo momento.',
    nw_catTeam: 'Scuderia', nw_catDrivers: 'Piloti', nw_catF1: 'F1',

    // home — promo GridUp
    gu_eyebrow: 'App companion · GridUp',
    gu_titleA: 'Scarica', gu_titleB: 'GridUp',
    gu_lead: 'Tutto sul Mondiale di Formula 1 in tasca: calcola i punti necessari per vincere il campionato, esplora gli scenari in tempo reale e consulta le classifiche di piloti e costruttori — sempre aggiornati.',
    gu_f1t: 'Calcolatore titolo',  gu_f1d: 'I punti che servono per essere sicuri del Mondiale.',
    gu_f2t: 'Scenari live',        gu_f2d: 'Chi può ancora vincere e con quale margine.',
    gu_f3t: 'Classifiche',         gu_f3d: 'Piloti e costruttori sempre aggiornati.',
    gu_f4t: 'Confronti',           gu_f4d: 'Metti a paragone i piloti gara dopo gara.',
    gu_openWeb: 'Apri la web app',
    gu_getOn: 'Scarica su', gu_playAria: 'Scarica GridUp su Google Play',
    gu_terms: 'Gratis · Android & Web · Nessuna registrazione richiesta',
    gu_iconAlt: 'Icona dell’app GridUp',
    gu_subtitle: 'Calcolatore titolo F1',
    gu_leader: 'Leader', gu_rival: 'Rivale', gu_toTitle: 'Punti per il titolo',

    // home — scheda tecnica SF-26
    sf_eyebrow: 'Scheda tecnica 2026',
    sf_titleA: 'Engineering', sf_titleB: 'Legend',
    sf_imgAlt: 'Ferrari SF-26 — monoposto di Formula 1 della stagione 2026',
    sf_newEra: 'Nuova era', sf_projectCode: 'Codice progetto: 677',
    sf_car: 'Vettura', sf_pu: 'Power unit', sf_ers: 'Sistema ERS',
    sf_source: 'Fonte tecnica: Motorsport.com',
    sf_weight: 'Peso totale',   sf_weightSub: 'Con pilota e liquidi',
    sf_chassisVal: 'Composito',
    sf_chassis: 'Telaio',       sf_chassisSub: 'Carbonio a nido d’ape',
    sf_gearbox: 'Cambio',       sf_gearboxVal: '8 marce + RM', sf_gearboxSub: 'Longitudinale Ferrari',
    sf_brakes: 'Freni',         sf_brakesSub: 'Carbonio autoventilanti',
    sf_wheels: 'Ruote',         sf_wheelsVal: '18 pollici',    sf_wheelsSub: 'Anteriore e posteriore',
    sf_model: 'Nome modello',   sf_modelSub: 'V6 90° sovralimentato',
    sf_displ: 'Cilindrata',     sf_displSub: 'Max 15.000 giri/min',
    sf_inject: 'Iniezione',     sf_injectSub: 'Diretta ad alta pressione',
    sf_turbo: 'Turbo',          sf_turboVal: 'Singolo',        sf_turboSub: '150.000 giri/min max',
    sf_energy: 'Energia',       sf_energySub: 'Portata energetica benzina',
    sf_mguk: 'Potenza MGU-K',   sf_mgukSub: 'Recupero di energia singolo',
    sf_volt: 'Tensione max',    sf_voltSub: 'Elettronica di controllo',
    sf_batt: 'Batteria',        sf_battSub: 'Ioni di litio (35 kg)',
    sf_rpm: 'MGU-K giri/min',   sf_rpmSub: 'Giri al minuto massimi',
    sf_charge: 'Ricarica',      sf_chargeVal: '9 MJ max',      sf_chargeSub: 'Energia in ricarica',
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

    hp_heroEyebrow: 'Data Intelligence · Scuderia Ferrari',
    hp_heroTitleA: 'The Rossa', hp_heroTitleB: 'in numbers',
    hp_heroLead: 'Every Scuderia Ferrari win, pole and fastest lap from 1950 to today. Statistics, standings and a historical archive, on one independent platform.',
    hp_ctaStats: 'Explore the statistics', hp_ctaStandings: '{year} standings',
    hp_allTime: 'Ferrari · F1 all-time', hp_na: 'N/A',
    hp_wins: 'Wins', hp_podiums: 'Podiums', hp_poles: 'Pole positions', hp_fastestLaps: 'Fastest laps',
    hp_ctorTitles: '{n} Constructors’ titles', hp_driverTitles: '{n} Drivers’ titles',

    hp_platformEyebrow: 'The platform',
    hp_platformTitle: 'Three ways to follow the Rossa',
    hp_platformLead: 'The historical archive at the centre, the season kept up to date, and a corner to play in. The title calculator lives in the GridUp app.',
    hp_archiveDesc: 'The heart of the site: {years} years of Ferrari in Formula 1. Records, statistics, driver and circuit profiles, with numbers you can check.',
    hp_seasonDesc: 'The championship as it happens: live standings, an analysis of every Grand Prix and news from the Ferrari world.',
    hp_playDesc: 'A lighter corner: Ferrari-themed mini-games to test what you know between one Grand Prix and the next.',
    hp_trivia: 'Trivia', hp_pitstop: 'Pit Stop', hp_circuitRush: 'Circuit Rush',

    hp_factGpValue: '1,000+',
    hp_factSeasons: 'Seasons in F1', hp_factGp: 'Grands Prix run',
    hp_factCtor: 'Constructors’ titles', hp_factDriver: 'Drivers’ titles',
    hp_factSince: 'Since the first GP',

    nw_eyebrow: 'Updated live',
    nw_title: 'Flash news',
    nw_lead: 'The latest from Formula 1 and Scuderia Ferrari, refreshed through the day.',
    nw_source: 'Source: Motorsport.com',
    nw_read: 'Read', nw_loading: 'Loading news', nw_retry: 'Try again',
    nw_empty: 'The news feed cannot be reached right now.',
    nw_catTeam: 'Team', nw_catDrivers: 'Drivers', nw_catF1: 'F1',

    gu_eyebrow: 'Companion app · GridUp',
    gu_titleA: 'Get', gu_titleB: 'GridUp',
    gu_lead: 'The Formula 1 championship in your pocket: work out the points needed to win the title, explore live scenarios and check the drivers’ and constructors’ standings — always up to date.',
    gu_f1t: 'Title calculator', gu_f1d: 'The points needed to make the title safe.',
    gu_f2t: 'Live scenarios',   gu_f2d: 'Who can still win, and by what margin.',
    gu_f3t: 'Standings',        gu_f3d: 'Drivers and constructors, always current.',
    gu_f4t: 'Head to head',     gu_f4d: 'Compare drivers race after race.',
    gu_openWeb: 'Open the web app',
    gu_getOn: 'Get it on', gu_playAria: 'Get GridUp on Google Play',
    gu_terms: 'Free · Android & web · No sign-up required',
    gu_iconAlt: 'GridUp app icon',
    gu_subtitle: 'F1 title calculator',
    gu_leader: 'Leader', gu_rival: 'Rival', gu_toTitle: 'Points to the title',

    sf_eyebrow: '2026 technical sheet',
    sf_titleA: 'Engineering', sf_titleB: 'Legend',
    sf_imgAlt: 'Ferrari SF-26 — the 2026 Formula 1 car',
    sf_newEra: 'New era', sf_projectCode: 'Project code: 677',
    sf_car: 'Car', sf_pu: 'Power unit', sf_ers: 'ERS system',
    sf_source: 'Technical source: Motorsport.com',
    sf_weight: 'Total weight',  sf_weightSub: 'With driver and fluids',
    sf_chassisVal: 'Composite',
    sf_chassis: 'Chassis',      sf_chassisSub: 'Carbon honeycomb',
    sf_gearbox: 'Gearbox',      sf_gearboxVal: '8 speeds + reverse', sf_gearboxSub: 'Ferrari longitudinal',
    sf_brakes: 'Brakes',        sf_brakesSub: 'Self-ventilated carbon',
    sf_wheels: 'Wheels',        sf_wheelsVal: '18 inches',      sf_wheelsSub: 'Front and rear',
    sf_model: 'Model name',     sf_modelSub: 'V6 90° turbocharged',
    sf_displ: 'Displacement',   sf_displSub: 'Max 15,000 rpm',
    sf_inject: 'Injection',     sf_injectSub: 'Direct, high pressure',
    sf_turbo: 'Turbo',          sf_turboVal: 'Single',          sf_turboSub: '150,000 rpm max',
    sf_energy: 'Energy',        sf_energySub: 'Fuel energy flow',
    sf_mguk: 'MGU-K power',     sf_mgukSub: 'Single energy recovery',
    sf_volt: 'Max voltage',     sf_voltSub: 'Control electronics',
    sf_batt: 'Battery',         sf_battSub: 'Lithium-ion (35 kg)',
    sf_rpm: 'MGU-K rpm',        sf_rpmSub: 'Maximum revolutions',
    sf_charge: 'Recharge',      sf_chargeVal: '9 MJ max',       sf_chargeSub: 'Energy on recharge',
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

    hp_heroEyebrow: 'Data Intelligence · Scuderia Ferrari',
    hp_heroTitleA: 'La Rossa', hp_heroTitleB: 'en chiffres',
    hp_heroLead: 'Chaque victoire, pole et meilleur tour de la Scuderia Ferrari depuis 1950. Statistiques, classements et archives historiques, sur une seule plateforme indépendante.',
    hp_ctaStats: 'Explorer les statistiques', hp_ctaStandings: 'Classements {year}',
    hp_allTime: 'Ferrari · F1 all-time', hp_na: 'N/D',
    hp_wins: 'Victoires', hp_podiums: 'Podiums', hp_poles: 'Pole positions', hp_fastestLaps: 'Meilleurs tours',
    hp_ctorTitles: '{n} titres constructeurs', hp_driverTitles: '{n} titres pilotes',

    hp_platformEyebrow: 'La plateforme',
    hp_platformTitle: 'Trois façons de vivre la Rossa',
    hp_platformLead: 'Les archives historiques au centre, la saison en cours toujours à jour, et un coin pour jouer. Le calculateur du championnat vit dans l’application GridUp.',
    hp_archiveDesc: 'Le cœur du site : {years} ans de Ferrari en Formule 1. Records, statistiques, fiches pilotes et circuits, avec des chiffres vérifiables.',
    hp_seasonDesc: 'Le championnat en cours : classements à jour, l’analyse de chaque Grand Prix et les nouvelles du monde Ferrari.',
    hp_playDesc: 'Un coin plus léger : des mini-jeux aux couleurs de Ferrari pour tester vos connaissances entre deux Grands Prix.',
    hp_trivia: 'Quiz', hp_pitstop: 'Pit Stop', hp_circuitRush: 'Circuit Rush',

    hp_factGpValue: '1 000+',
    hp_factSeasons: 'Saisons en F1', hp_factGp: 'Grands Prix disputés',
    hp_factCtor: 'Titres constructeurs', hp_factDriver: 'Titres pilotes',
    hp_factSince: 'Depuis le premier GP',

    nw_eyebrow: 'Mise à jour en direct',
    nw_title: 'Flash news',
    nw_lead: 'Les dernières nouvelles de la Formule 1 et de la Scuderia Ferrari, actualisées au fil de la journée.',
    nw_source: 'Source : Motorsport.com',
    nw_read: 'Lire', nw_loading: 'Chargement des actualités', nw_retry: 'Réessayer',
    nw_empty: 'Le fil d’actualités est injoignable pour le moment.',
    nw_catTeam: 'Écurie', nw_catDrivers: 'Pilotes', nw_catF1: 'F1',

    gu_eyebrow: 'Application compagnon · GridUp',
    gu_titleA: 'Télécharger', gu_titleB: 'GridUp',
    gu_lead: 'Tout le championnat de Formule 1 dans la poche : calculez les points nécessaires au titre, explorez les scénarios en direct et consultez les classements pilotes et constructeurs — toujours à jour.',
    gu_f1t: 'Calculateur de titre', gu_f1d: 'Les points nécessaires pour assurer le titre.',
    gu_f2t: 'Scénarios en direct',  gu_f2d: 'Qui peut encore gagner, et avec quelle marge.',
    gu_f3t: 'Classements',          gu_f3d: 'Pilotes et constructeurs toujours à jour.',
    gu_f4t: 'Comparaisons',         gu_f4d: 'Comparez les pilotes course après course.',
    gu_openWeb: 'Ouvrir la web app',
    gu_getOn: 'Disponible sur', gu_playAria: 'Télécharger GridUp sur Google Play',
    gu_terms: 'Gratuit · Android et web · Sans inscription',
    gu_iconAlt: 'Icône de l’application GridUp',
    gu_subtitle: 'Calculateur de titre F1',
    gu_leader: 'Leader', gu_rival: 'Rival', gu_toTitle: 'Points pour le titre',

    sf_eyebrow: 'Fiche technique 2026',
    sf_titleA: 'Engineering', sf_titleB: 'Legend',
    sf_imgAlt: 'Ferrari SF-26 — la monoplace de Formule 1 de la saison 2026',
    sf_newEra: 'Nouvelle ère', sf_projectCode: 'Code projet : 677',
    sf_car: 'Voiture', sf_pu: 'Groupe propulseur', sf_ers: 'Système ERS',
    sf_source: 'Source technique : Motorsport.com',
    sf_weight: 'Poids total',   sf_weightSub: 'Avec pilote et fluides',
    sf_chassisVal: 'Composite',
    sf_chassis: 'Châssis',      sf_chassisSub: 'Nid d’abeille carbone',
    sf_gearbox: 'Boîte',        sf_gearboxVal: '8 rapports + MAR', sf_gearboxSub: 'Longitudinale Ferrari',
    sf_brakes: 'Freins',        sf_brakesSub: 'Carbone autoventilés',
    sf_wheels: 'Roues',         sf_wheelsVal: '18 pouces',      sf_wheelsSub: 'Avant et arrière',
    sf_model: 'Nom du modèle',  sf_modelSub: 'V6 90° suralimenté',
    sf_displ: 'Cylindrée',      sf_displSub: 'Max 15 000 tr/min',
    sf_inject: 'Injection',     sf_injectSub: 'Directe haute pression',
    sf_turbo: 'Turbo',          sf_turboVal: 'Simple',          sf_turboSub: '150 000 tr/min max',
    sf_energy: 'Énergie',       sf_energySub: 'Débit énergétique du carburant',
    sf_mguk: 'Puissance MGU-K', sf_mgukSub: 'Récupération d’énergie unique',
    sf_volt: 'Tension max',     sf_voltSub: 'Électronique de contrôle',
    sf_batt: 'Batterie',        sf_battSub: 'Lithium-ion (35 kg)',
    sf_rpm: 'MGU-K tr/min',     sf_rpmSub: 'Tours par minute maximum',
    sf_charge: 'Recharge',      sf_chargeVal: '9 MJ max',       sf_chargeSub: 'Énergie en recharge',
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

    hp_heroEyebrow: 'Data Intelligence · Scuderia Ferrari',
    hp_heroTitleA: 'La Rossa', hp_heroTitleB: 'en cifras',
    hp_heroLead: 'Cada victoria, pole y vuelta rápida de la Scuderia Ferrari desde 1950. Estadísticas, clasificaciones y archivo histórico, en una única plataforma independiente.',
    hp_ctaStats: 'Explorar las estadísticas', hp_ctaStandings: 'Clasificaciones {year}',
    hp_allTime: 'Ferrari · F1 all-time', hp_na: 'N/D',
    hp_wins: 'Victorias', hp_podiums: 'Podios', hp_poles: 'Pole positions', hp_fastestLaps: 'Vueltas rápidas',
    hp_ctorTitles: '{n} títulos de constructores', hp_driverTitles: '{n} títulos de pilotos',

    hp_platformEyebrow: 'La plataforma',
    hp_platformTitle: 'Tres formas de vivir la Rossa',
    hp_platformLead: 'El archivo histórico en el centro, la temporada en curso siempre al día y un rincón para jugar. La calculadora del Mundial vive en la app GridUp.',
    hp_archiveDesc: 'El corazón del sitio: {years} años de Ferrari en la Fórmula 1. Récords, estadísticas, fichas de pilotos y circuitos, con cifras verificables.',
    hp_seasonDesc: 'El campeonato en curso: clasificaciones actualizadas, el análisis de cada Gran Premio y las noticias del mundo Ferrari.',
    hp_playDesc: 'Un rincón más ligero: minijuegos con temática Ferrari para poner a prueba lo que sabes entre un Gran Premio y otro.',
    hp_trivia: 'Trivia', hp_pitstop: 'Pit Stop', hp_circuitRush: 'Circuit Rush',

    hp_factGpValue: '1.000+',
    hp_factSeasons: 'Temporadas en F1', hp_factGp: 'Grandes Premios disputados',
    hp_factCtor: 'Títulos de constructores', hp_factDriver: 'Títulos de pilotos',
    hp_factSince: 'Desde el primer GP',

    nw_eyebrow: 'Actualizado en directo',
    nw_title: 'Flash news',
    nw_lead: 'Las últimas noticias de la Fórmula 1 y de la Scuderia Ferrari, actualizadas a lo largo del día.',
    nw_source: 'Fuente: Motorsport.com',
    nw_read: 'Leer', nw_loading: 'Cargando noticias', nw_retry: 'Reintentar',
    nw_empty: 'Las noticias no están disponibles en este momento.',
    nw_catTeam: 'Escudería', nw_catDrivers: 'Pilotos', nw_catF1: 'F1',

    gu_eyebrow: 'App complementaria · GridUp',
    gu_titleA: 'Descarga', gu_titleB: 'GridUp',
    gu_lead: 'Todo el Mundial de Fórmula 1 en el bolsillo: calcula los puntos necesarios para ganar el campeonato, explora los escenarios en directo y consulta las clasificaciones de pilotos y constructores — siempre al día.',
    gu_f1t: 'Calculadora del título', gu_f1d: 'Los puntos que hacen falta para asegurar el título.',
    gu_f2t: 'Escenarios en directo',  gu_f2d: 'Quién puede ganar todavía y con qué margen.',
    gu_f3t: 'Clasificaciones',        gu_f3d: 'Pilotos y constructores siempre actualizados.',
    gu_f4t: 'Comparativas',           gu_f4d: 'Compara pilotos carrera tras carrera.',
    gu_openWeb: 'Abrir la web app',
    gu_getOn: 'Disponible en', gu_playAria: 'Descargar GridUp en Google Play',
    gu_terms: 'Gratis · Android y web · Sin registro',
    gu_iconAlt: 'Icono de la app GridUp',
    gu_subtitle: 'Calculadora del título de F1',
    gu_leader: 'Líder', gu_rival: 'Rival', gu_toTitle: 'Puntos para el título',

    sf_eyebrow: 'Ficha técnica 2026',
    sf_titleA: 'Engineering', sf_titleB: 'Legend',
    sf_imgAlt: 'Ferrari SF-26 — el monoplaza de Fórmula 1 de la temporada 2026',
    sf_newEra: 'Nueva era', sf_projectCode: 'Código de proyecto: 677',
    sf_car: 'Coche', sf_pu: 'Unidad de potencia', sf_ers: 'Sistema ERS',
    sf_source: 'Fuente técnica: Motorsport.com',
    sf_weight: 'Peso total',    sf_weightSub: 'Con piloto y líquidos',
    sf_chassisVal: 'Compuesto',
    sf_chassis: 'Chasis',       sf_chassisSub: 'Nido de abeja de carbono',
    sf_gearbox: 'Caja de cambios', sf_gearboxVal: '8 marchas + MA', sf_gearboxSub: 'Longitudinal Ferrari',
    sf_brakes: 'Frenos',        sf_brakesSub: 'Carbono autoventilados',
    sf_wheels: 'Ruedas',        sf_wheelsVal: '18 pulgadas',    sf_wheelsSub: 'Delantera y trasera',
    sf_model: 'Nombre del modelo', sf_modelSub: 'V6 90° sobrealimentado',
    sf_displ: 'Cilindrada',     sf_displSub: 'Máx. 15.000 rpm',
    sf_inject: 'Inyección',     sf_injectSub: 'Directa de alta presión',
    sf_turbo: 'Turbo',          sf_turboVal: 'Único',           sf_turboSub: '150.000 rpm máx.',
    sf_energy: 'Energía',       sf_energySub: 'Caudal energético de la gasolina',
    sf_mguk: 'Potencia MGU-K',  sf_mgukSub: 'Recuperación de energía única',
    sf_volt: 'Tensión máx.',    sf_voltSub: 'Electrónica de control',
    sf_batt: 'Batería',         sf_battSub: 'Iones de litio (35 kg)',
    sf_rpm: 'MGU-K rpm',        sf_rpmSub: 'Revoluciones máximas',
    sf_charge: 'Recarga',       sf_chargeVal: '9 MJ máx.',      sf_chargeSub: 'Energía en recarga',
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

    hp_heroEyebrow: 'Data Intelligence · Scuderia Ferrari',
    hp_heroTitleA: 'Die Rossa', hp_heroTitleB: 'in Zahlen',
    hp_heroLead: 'Jeder Sieg, jede Pole und jede schnellste Runde der Scuderia Ferrari seit 1950. Statistiken, Tabellen und ein historisches Archiv auf einer unabhängigen Plattform.',
    hp_ctaStats: 'Statistiken erkunden', hp_ctaStandings: 'Tabellen {year}',
    hp_allTime: 'Ferrari · F1 all-time', hp_na: 'k. A.',
    hp_wins: 'Siege', hp_podiums: 'Podestplätze', hp_poles: 'Pole-Positions', hp_fastestLaps: 'Schnellste Runden',
    hp_ctorTitles: '{n} Konstrukteurstitel', hp_driverTitles: '{n} Fahrertitel',

    hp_platformEyebrow: 'Die Plattform',
    hp_platformTitle: 'Drei Wege zur Rossa',
    hp_platformLead: 'Das historische Archiv im Zentrum, die laufende Saison stets aktuell und eine Ecke zum Spielen. Der WM-Rechner lebt in der GridUp-App.',
    hp_archiveDesc: 'Das Herz der Seite: {years} Jahre Ferrari in der Formel 1. Rekorde, Statistiken, Fahrer- und Streckenprofile, mit nachprüfbaren Zahlen.',
    hp_seasonDesc: 'Die laufende Meisterschaft: aktuelle Tabellen, die Analyse jedes Grand Prix und Nachrichten aus der Ferrari-Welt.',
    hp_playDesc: 'Eine leichtere Ecke: Ferrari-Minispiele, um zwischen zwei Rennen das eigene Wissen zu testen.',
    hp_trivia: 'Quiz', hp_pitstop: 'Boxenstopp', hp_circuitRush: 'Circuit Rush',

    hp_factGpValue: '1.000+',
    hp_factSeasons: 'Saisons in der F1', hp_factGp: 'Ausgetragene Grands Prix',
    hp_factCtor: 'Konstrukteurstitel', hp_factDriver: 'Fahrertitel',
    hp_factSince: 'Seit dem ersten GP',

    nw_eyebrow: 'Laufend aktualisiert',
    nw_title: 'Flash News',
    nw_lead: 'Das Neueste aus der Formel 1 und von der Scuderia Ferrari, über den Tag hinweg aktualisiert.',
    nw_source: 'Quelle: Motorsport.com',
    nw_read: 'Lesen', nw_loading: 'Nachrichten werden geladen', nw_retry: 'Erneut versuchen',
    nw_empty: 'Der Nachrichten-Feed ist gerade nicht erreichbar.',
    nw_catTeam: 'Team', nw_catDrivers: 'Fahrer', nw_catF1: 'F1',

    gu_eyebrow: 'Begleit-App · GridUp',
    gu_titleA: 'Hol dir', gu_titleB: 'GridUp',
    gu_lead: 'Die Formel-1-WM in der Tasche: Berechne die Punkte für den Titel, sieh dir die Szenarien in Echtzeit an und verfolge die Fahrer- und Konstrukteurswertung — immer aktuell.',
    gu_f1t: 'Titelrechner',     gu_f1d: 'Die Punkte, die den Titel sicher machen.',
    gu_f2t: 'Live-Szenarien',   gu_f2d: 'Wer noch gewinnen kann — und mit welchem Vorsprung.',
    gu_f3t: 'Tabellen',         gu_f3d: 'Fahrer und Konstrukteure, stets aktuell.',
    gu_f4t: 'Vergleiche',       gu_f4d: 'Fahrer Rennen für Rennen gegenüberstellen.',
    gu_openWeb: 'Web-App öffnen',
    gu_getOn: 'Jetzt bei', gu_playAria: 'GridUp bei Google Play herunterladen',
    gu_terms: 'Kostenlos · Android & Web · Ohne Registrierung',
    gu_iconAlt: 'Symbol der GridUp-App',
    gu_subtitle: 'F1-Titelrechner',
    gu_leader: 'Führender', gu_rival: 'Rivale', gu_toTitle: 'Punkte bis zum Titel',

    sf_eyebrow: 'Technisches Datenblatt 2026',
    sf_titleA: 'Engineering', sf_titleB: 'Legend',
    sf_imgAlt: 'Ferrari SF-26 — der Formel-1-Wagen der Saison 2026',
    sf_newEra: 'Neue Ära', sf_projectCode: 'Projektcode: 677',
    sf_car: 'Fahrzeug', sf_pu: 'Antriebseinheit', sf_ers: 'ERS-System',
    sf_source: 'Technische Quelle: Motorsport.com',
    sf_weight: 'Gesamtgewicht', sf_weightSub: 'Mit Fahrer und Betriebsstoffen',
    sf_chassisVal: 'Verbundwerkstoff',
    sf_chassis: 'Chassis',      sf_chassisSub: 'Karbon-Wabenstruktur',
    sf_gearbox: 'Getriebe',     sf_gearboxVal: '8 Gänge + R',   sf_gearboxSub: 'Ferrari, längs eingebaut',
    sf_brakes: 'Bremsen',       sf_brakesSub: 'Innenbelüftetes Karbon',
    sf_wheels: 'Räder',         sf_wheelsVal: '18 Zoll',        sf_wheelsSub: 'Vorne und hinten',
    sf_model: 'Modellname',     sf_modelSub: 'V6 90° aufgeladen',
    sf_displ: 'Hubraum',        sf_displSub: 'Max. 15.000 U/min',
    sf_inject: 'Einspritzung',  sf_injectSub: 'Direkt, Hochdruck',
    sf_turbo: 'Turbo',          sf_turboVal: 'Einfach',         sf_turboSub: 'Max. 150.000 U/min',
    sf_energy: 'Energie',       sf_energySub: 'Energiedurchsatz Kraftstoff',
    sf_mguk: 'MGU-K-Leistung',  sf_mgukSub: 'Einfache Energierückgewinnung',
    sf_volt: 'Max. Spannung',   sf_voltSub: 'Steuerelektronik',
    sf_batt: 'Batterie',        sf_battSub: 'Lithium-Ionen (35 kg)',
    sf_rpm: 'MGU-K U/min',      sf_rpmSub: 'Maximale Umdrehungen',
    sf_charge: 'Aufladung',     sf_chargeVal: 'Max. 9 MJ',      sf_chargeSub: 'Energie beim Laden',
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
  const [lang, setLangState] = useState('it');

  useEffect(() => {
    try {
      const salvata = localStorage.getItem('lang');
      if (salvata && LANGS.some((l) => l.code === salvata)) {
        setLangState(salvata);
        return;
      }
      const dalBrowser = (navigator.language || 'it').slice(0, 2).toLowerCase();
      if (LANGS.some((l) => l.code === dalBrowser)) setLangState(dalBrowser);
    } catch {
      /* modalità privata o storage negato: si resta in italiano */
    }
  }, []);

  /* La lingua si salva qui, quando qualcuno la sceglie — non in un effetto su
     `lang`.
     Con l'effetto, al montaggio ne partivano due nello stesso commit: il primo
     leggeva 'en' e chiamava setLang, il secondo scriveva `lang`, che in quel
     render valeva ancora 'it'. La preferenza salvata veniva quindi sovrascritta
     con 'it' prima che lo stato nuovo arrivasse; e con `reactStrictMode` (che è
     attivo in next.config.js) React monta due volte in sviluppo, quindi la
     seconda lettura trovava l'italiano appena riscritto e ci restava. Risultato:
     la lingua scelta durava fino al primo ricaricamento della pagina, poi il
     sito tornava in italiano. */
  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem('lang', code); } catch { /* vedi sopra */ }
  }, []);

  // L'attributo `lang` del documento invece segue sempre lo stato: serve agli
  // screen reader e ai motori di ricerca, e riscriverlo non ha effetti.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const t = useCallback((key, params) => tradotto(lang, key, params), [lang]);

  const valore = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <I18nContext.Provider value={valore}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
