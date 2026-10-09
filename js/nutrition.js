export function calcNutrients(items, foodDb) {
  return items.reduce((acc, [name, weight]) => {
    const f = foodDb[name];
    if (!f) return acc;
    const factor = (weight || 0) / 100;
    
    acc.k += (f.k || 0) * factor;
    acc.p += (f.p || 0) * factor;
    acc.g += (f.g || 0) * factor;
    acc.gSat += (f.gSat || 0) * factor;
    acc.h += (f.h || 0) * factor;
    acc.az += (f.az || 0) * factor;
    acc.fib += (f.fib || 0) * factor;
    acc.hNet += Math.max(0, (f.h || 0) - (f.fib || 0)) * factor;

    return acc;
  }, { k: 0, p: 0, g: 0, gSat: 0, h: 0, az: 0, fib: 0, hNet: 0 });
}

export function formatNutrientSummary(n) {
  const r = Math.round;
  return r(n.k) + ' kcal · P ' + r(n.p) + 'g · G ' + r(n.g) + 'g (Sat: ' + r(n.gSat) + 'g) · H ' + r(n.h) + 'g (Azúcar: ' + r(n.az) + 'g, Fibra: ' + r(n.fib) + 'g)';
}