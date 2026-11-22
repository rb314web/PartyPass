/**

 * Tempo animacji dashboardu — zsynchronizuj z _party-pass-variables.scss.

 * Przełączanie kart (sidebar): PageTransition + fade treści (jak Ustawienia).

 */

/** Cross-fade obszaru treści (PageTransition) */

export const DASHBOARD_ROUTE_CROSSFADE_MS = 250;



/** Wyjście starej karty (krótkie — nie blokuje nawigacji) */

export const DASHBOARD_ROUTE_EXIT_MS = 140;



/** Wejście nowej karty (fade + lekki ruch w górę) */

export const DASHBOARD_ROUTE_ENTER_MS = 360;



/** Zgodne z cross-fade (shell nie dodaje osobnego fade) */

export const DASHBOARD_SHELL_FADE_MS = DASHBOARD_ROUTE_CROSSFADE_MS;



/** Fade-in treści po loaderze — ten sam rytm co wejście Ustawień */

export const DASHBOARD_CONTENT_REVEAL_MS = DASHBOARD_ROUTE_CROSSFADE_MS;



/** Bez sztucznego wydłużania loadera */

export const DASHBOARD_MIN_LOADER_MS = 0;

