/**
 * nutrition.js — Cálculo de nutrientes.
 */

/** Nutrientes vacíos. */
export const emptyNutrients = () => ({ k: 0, p: 0, g: 0, gSat: 0, h: 0, az: 0, fib: 0 });

/**
 * Suma los nutrientes de una lista de ingredientes [nombre, gramos].
 * Los alimentos inexistentes en la base se ignoran.
 */
export function calcNutrients(items, foodDb) {
  return (items || []).reduce((acc, [name, weight]) => {
    const f = foodDb[name];
    if (!f) return acc;
    const factor = (Number(weight) || 0) / 100;
    acc.k += (f.k || 0) * factor;
    acc.p += (f.p || 0) * factor;
    acc.g += (f.g || 0) * factor;
    acc.gSat += (f.gSat || 0) * factor;
    acc.h += (f.h || 0) * factor;
    acc.az += (f.az || 0) * factor;
    acc.fib += (f.fib || 0) * factor;
    return acc;
  }, emptyNutrients());
}

/** Resumen corto en una línea: "520 kcal · P 38 g · G 14 g · H 55 g". */
export function formatNutrientSummary(n) {
  const r = Math.round;
  return `${r(n.k)} kcal · P ${r(n.p)} g · G ${r(n.g)} g · H ${r(n.h)} g`;
}
