/**
 * engine.js — Motor matemático de ajuste de raciones.
 *
 * Principios:
 *  1. Cada día es una unidad independiente de 24 h: nunca se mueven, vacían ni
 *     reasignan platos entre días. Solo se reescalan los GRAMOS de los
 *     ingredientes de los platos que el usuario eligió para ese día.
 *  2. Cada ingrediente recibe un "rol" según su perfil de macronutrientes:
 *       - proteico   (pollo, ternera, claras, atún, whey, yogur proteico…)
 *       - hidratos   (arroz, pasta, pan, avena, patata…)
 *       - grasa      (aceites, frutos secos, crema de cacahuete, aguacate…)
 *       - fijo       (verduras, fruta, bebidas, condimentos): no se tocan.
 *  3. Se resuelve un problema de mínimos cuadrados con límites (descenso por
 *     coordenadas con proyección): se buscan los gramos que minimizan el error
 *     relativo en kcal, proteína, grasa e hidratos respecto al objetivo, con una
 *     pequeña penalización por alejarse de la ración original (raciones
 *     naturales) y con límites lógicos por rol (nunca 0 g ni cantidades absurdas).
 *  4. Si tras resolver algún macro queda fuera de tolerancia, se aumenta su peso
 *     y se vuelve a resolver (hasta 6 rondas). Si aun así no entra, se repite con
 *     límites algo más amplios (fase 2). Al final se redondea a gramos enteros.
 *  5. Comidas "Fuera de casa" o sin asignar: el objetivo del día se reduce en la
 *     parte proporcional de esa toma (MEAL_SHARE), para no inflar el resto de
 *     platos intentando cubrir lo que se come fuera.
 */
import { calcNutrients } from './nutrition.js';

/** Claves de las 5 tomas diarias en el plan y su categoría de plato. */
export const MEALS = [
  { key: 'b', type: 'desayuno', label: '🥞 Desayuno' },
  { key: 'a', type: 'almuerzo', label: '🥪 Almuerzo (Media Mañana)' },
  { key: 'c', type: 'comida', label: '🍲 Comida' },
  { key: 'm', type: 'merienda', label: '🍎 Merienda (Media Tarde)' },
  { key: 'n', type: 'cena', label: '🥗 Cena' }
];

/** Valor que identifica "Fuera de casa" en los desplegables. */
export const OUT = '#fuera';

/** Peso aproximado de cada toma en el total diario (suma 1). */
export const MEAL_SHARE = { b: 0.20, a: 0.10, c: 0.35, m: 0.10, n: 0.25 };

const MACROS = ['k', 'p', 'g', 'h'];

/**
 * Límites de escalado por rol: [multiplicador mínimo, multiplicador máximo, gramos máx. absolutos].
 * Fase 1 = raciones moderadas. La fase 2 solo se usa si con la fase 1 el día
 * no puede entrar en tolerancia (por ejemplo, objetivos de proteína muy altos).
 */
const BOUNDS = [
  { prot: [0.5, 2.5, 400], carb: [0.3, 2.5, 350], fat: [0.2, 2.0, 60] },
  { prot: [0.4, 3.0, 450], carb: [0.2, 3.0, 400], fat: [0.15, 2.5, 70] }
];

/** Tope absoluto extra para alimentos muy densos (≥ 300 kcal/100 g: whey, arroz/pasta secos, frutos secos…). */
const DENSE_CAP = { prot: 70, carb: 200, fat: 50 };

/**
 * Clasifica un alimento según su perfil nutricional.
 * @returns {'prot'|'carb'|'fat'|'fixed'}
 */
export function foodRole(f) {
  if (!f || !f.k) return 'fixed';
  const eP = (f.p || 0) * 4, eH = (f.h || 0) * 4, eG = (f.g || 0) * 9;
  if (f.p >= 10 && eP >= eH && eP >= 0.3 * f.k) return 'prot';
  if (f.g >= 10 && eG >= 0.6 * f.k) return 'fat';
  if (f.h >= 14 && eH >= 0.5 * f.k) return 'carb';
  return 'fixed';
}

/**
 * Objetivo efectivo de un día: objetivos diarios × fracción de tomas planificadas en casa.
 * @param {object} day    Día del plan ({b,a,c,m,n,...}).
 * @param {object} T      Objetivos (state.t).
 * @param {Function} hasDish  (nombre) => boolean, indica si el plato existe.
 */
export function dayTarget(day, T, hasDish) {
  let share = 0;
  MEALS.forEach(({ key }) => {
    const v = day[key];
    if (v && v !== OUT && hasDish(v)) share += MEAL_SHARE[key];
  });
  const out = { share };
  ['k', 'p', 'g', 'h', 'gSat', 'az', 'fib'].forEach(k => { out[k] = (T[k] || 0) * share; });
  return out;
}

/**
 * Evalúa un valor frente al objetivo.
 * @returns {'ok'|'wa'|'bd'} verde dentro de ±margen, naranja hasta ±2·margen, rojo fuera.
 */
export function tolerance(val, target, marginPct) {
  if (!target) return 'ok';
  const m = (marginPct || 5) / 100;
  const err = Math.abs(val - target) / target;
  return err <= m ? 'ok' : err <= 2 * m ? 'wa' : 'bd';
}

/**
 * Ajusta las raciones de UN día.
 * @param {Array<{key:string, items:Array<[string, number]>}>} meals  Tomas con sus ingredientes base.
 * @param {object} target  Objetivo efectivo del día ({k,p,g,h}).
 * @param {object} foods   Base de alimentos.
 * @param {number} marginPct  Tolerancia en %.
 * @returns {Object<string, Array<[string, number]>>} ingredientes ajustados por toma.
 */
export function adjustDay(meals, target, foods, marginPct = 5) {
  const first = solveDay(meals, target, foods, marginPct, BOUNDS[0]);
  if (first.ok) return first.meals;
  const second = solveDay(meals, target, foods, marginPct, BOUNDS[1]);
  return second.err < first.err ? second.meals : first.meals;
}

/**
 * Resuelve un día con un juego de límites concreto.
 * @returns {{meals: object, ok: boolean, err: number}}
 */
function solveDay(meals, target, foods, marginPct, bounds) {
  const m = (marginPct || 5) / 100;

  // 1) Aplanar ingredientes: cada ingrediente de cada toma es una variable independiente
  const vars = [];
  meals.forEach(({ key, items }) => {
    items.forEach(([name, grams]) => {
      const f = foods[name];
      const base = Math.max(1, Number(grams) || 0);
      let role = foodRole(f);
      // Condimentos en cantidades mínimas (ajo, matcha…) no se escalan, salvo grasas añadidas.
      if (role !== 'fat' && base < 8) role = 'fixed';
      const v = { key, name, base, x: base, role, a: {} };
      MACROS.forEach(mc => { v.a[mc] = f ? (f[mc] || 0) / 100 : 0; });
      if (role === 'fixed') {
        v.lo = v.hi = base;
      } else {
        const [mn, mx, abs] = bounds[role];
        const cap = f.k >= 300 ? Math.min(abs, DENSE_CAP[role]) : abs;
        v.lo = Math.max(role === 'fat' ? 2 : 5, Math.round(base * mn));
        // Si la ración base ya supera el tope, se respeta la base (nunca se fuerza a reducirla por el tope).
        v.hi = Math.max(v.lo, base, Math.min(cap, base * mx));
        if (v.lo > v.hi) v.lo = v.hi;
      }
      vars.push(v);
    });
  });

  const T = {};
  MACROS.forEach(mc => { T[mc] = Math.max(1, target[mc] || 0); });

  // Totales actuales por macro
  const tot = {};
  const recompute = () => {
    MACROS.forEach(mc => { tot[mc] = 0; });
    vars.forEach(v => MACROS.forEach(mc => { tot[mc] += v.a[mc] * v.x; }));
  };
  const relErr = () => Math.max(...MACROS.map(mc => Math.abs(tot[mc] - T[mc]) / T[mc]));

  const free = vars.filter(v => v.hi > v.lo);
  recompute();

  if (free.length && target.share > 0) {
    const w = { k: 1, p: 1, g: 1, h: 1 };
    const LAMBDA = 0.0008; // penalización por alejarse de la ración base (mantiene raciones naturales)

    for (let round = 0; round < 6; round++) {
      for (let sweep = 0; sweep < 300; sweep++) {
        let moved = 0;
        for (const v of free) {
          // Paso de Newton exacto en la coordenada v.x (la función es cuadrática) + proyección a [lo, hi]
          let grad = 0, hess = 0;
          for (const mc of MACROS) {
            const a = v.a[mc] / T[mc];
            const res = (tot[mc] - T[mc]) / T[mc];
            grad += 2 * w[mc] * a * res;
            hess += 2 * w[mc] * a * a;
          }
          const b2 = v.base * v.base;
          grad += 2 * LAMBDA * (v.x - v.base) / b2;
          hess += 2 * LAMBDA / b2;
          if (hess <= 0) continue;
          const nx = Math.min(v.hi, Math.max(v.lo, v.x - grad / hess));
          const d = nx - v.x;
          if (d !== 0) {
            MACROS.forEach(mc => { tot[mc] += v.a[mc] * d; });
            v.x = nx;
            moved += Math.abs(d);
          }
        }
        if (moved < 0.01) break;
      }
      // Si algún macro sigue fuera (con un pequeño colchón para el redondeo), se refuerza su peso.
      let allOk = true;
      MACROS.forEach(mc => {
        if (Math.abs(tot[mc] - T[mc]) / T[mc] > m * 0.8) { w[mc] *= 4; allOk = false; }
      });
      if (allOk) break;
    }
  }

  // 2) Redondeo a gramos enteros (nunca 0 g) y reagrupación por toma
  vars.forEach(v => { v.x = Math.max(1, Math.round(v.x)); });
  recompute();
  const out = {};
  meals.forEach(({ key }) => { out[key] = []; });
  vars.forEach(v => out[v.key].push([v.name, v.x]));
  const err = relErr();
  return { meals: out, ok: err <= m, err };
}

/**
 * Calcula el plan completo de la semana (raciones finales por día y toma).
 * Devuelve, para cada día: { meals: {b:[...],...}, nut, target, adjusted }.
 * @param {object} state  Estado global.
 * @param {Array} dishes  Lista de platos.
 * @param {object} foods  Base de alimentos.
 */
export function computeWeek(state, dishes, foods) {
  const byName = new Map(dishes.map(d => [d.n, d]));
  const hasDish = n => byName.has(n);

  return state.plan.map(day => {
    const target = dayTarget(day, state.t, hasDish);
    const meals = MEALS.map(({ key }) => {
      const v = day[key];
      const dish = v && v !== OUT ? byName.get(v) : null;
      return { key, items: dish ? dish.i.map(([n, g]) => [n, Number(g) || 0]) : [] };
    });

    const anyDish = meals.some(m => m.items.length);
    let result;
    if (anyDish && state.adjust) {
      result = adjustDay(meals, target, foods, state.t.m);
    } else {
      result = {};
      meals.forEach(m => { result[m.key] = m.items; });
    }

    const all = MEALS.flatMap(({ key }) => result[key]);
    return {
      meals: result,
      nut: calcNutrients(all, foods),
      target,
      adjusted: anyDish && !!state.adjust
    };
  });
}
