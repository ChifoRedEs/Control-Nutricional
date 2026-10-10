/**
 * targets.js — Fórmulas para calcular los objetivos a partir de las kcal.
 *
 * Repartos de la energía (todos dentro de los rangos AMDR de referencia:
 * proteína 10–35 %, grasa 20–35 %, hidratos 45–65 %):
 *   · Pérdida de peso         : 30 % proteína · 25 % grasa · 45 % hidratos
 *     (proteína alta para conservar masa muscular en déficit)
 *   · Mantenimiento           : 25 % proteína · 30 % grasa · 45 % hidratos
 *     (perfil habitual en personas que entrenan fuerza)
 *   · Aumento de masa muscular: 25 % proteína · 25 % grasa · 50 % hidratos
 *     (más hidratos para rendir en el entrenamiento y recuperar glucógeno)
 *
 * Secundarios (OMS / EFSA / IOM):
 *   · Grasa saturada  < 10 % de las kcal
 *   · Azúcares        ≤ 10 % de las kcal
 *   · Fibra           14 g por cada 1000 kcal
 *
 * Conversión: proteína e hidratos 4 kcal/g, grasa 9 kcal/g, de forma que
 * P·4 + H·4 + G·9 ≈ kcal objetivo.
 */
export const TARGET_MODES = {
  perdida: { label: 'Pérdida de peso', p: 0.30, g: 0.25, h: 0.45 },
  mantenimiento: { label: 'Mantenimiento', p: 0.25, g: 0.30, h: 0.45 },
  volumen: { label: 'Aumento de masa muscular', p: 0.25, g: 0.25, h: 0.50 }
};

/** Devuelve { p, g, h, gSat, az, fib } para unas kcal y una fórmula, o null si no es válida. */
export function targetsFromKcal(kcal, mode) {
  const split = TARGET_MODES[mode];
  if (!split || !(kcal > 0)) return null;
  return {
    p: Math.round((kcal * split.p) / 4),
    g: Math.round((kcal * split.g) / 9),
    h: Math.round((kcal * split.h) / 4),
    gSat: Math.round((kcal * 0.10) / 9),
    az: Math.round((kcal * 0.10) / 4),
    fib: Math.round((kcal / 1000) * 14)
  };
}
