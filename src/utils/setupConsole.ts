/**
 * W produkcji wyciszamy najgłośniejsze metody konsoli (log/debug/info),
 * aby nie zaśmiecać konsoli i nie wyciekać danych diagnostycznych.
 * Zostawiamy warn i error — przydają się do diagnozowania realnych problemów.
 *
 * Uruchamiane raz, przy starcie aplikacji (import w index.tsx).
 */
export function setupConsole(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
}
