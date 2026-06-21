/**
 * Dwa kolejne requestAnimationFrame — stabilne „po malowaniu”
 * (np. włączenie fade-in shellu bez sztucznego setTimeout(10)).
 */
export function runAfterNextPaint(callback: () => void): () => void {
  let id2: number | undefined;
  const id1 = requestAnimationFrame(() => {
    id2 = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(id1);
    if (id2 !== undefined) cancelAnimationFrame(id2);
  };
}
