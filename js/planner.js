/**
 * planner.js — Elección automática de los 5 platos de un día.
 *
 * Objetivo: encontrar, entre los platos disponibles de cada categoría, la
 * combinación que mejor encaja con los objetivos del día DESPUÉS del ajuste
 * de raciones, con variedad semanal.
 *
 * Proceso (rápido, < 100 ms en móvil):
 *   1. Se generan combinaciones aleatorias (o todas si son pocas) de
 *      desayuno + almuerzo + comida + merienda + cena. Las tomas marcadas como
 *      "Fuera de casa" se respetan y no se rellenan.
 *   2. Filtro previo: se puntúa cada combinación por lo parecido que es su
 *      REPARTO de energía (% proteína / grasa / hidratos) al del objetivo. El
 *      total de kcal no importa aquí porque el ajuste de raciones lo corrige.
 *      Se penalizan platos ya usados en otros días de la semana y repetir la
 *      misma proteína principal en el mismo día (p. ej. atún en dos tomas).
 *   3. Las mejores candidatas se pasan por el motor de ajuste real y se elige
 *      la que queda más cerca del objetivo (con un pequeño factor aleatorio
 *      para no proponer siempre lo mismo).
 */
import { calcNutrients } from './nutrition.js';
import { MEALS, OUT, POST_WORKOUT, computeDay, dayError } from './engine.js';

const SAMPLES = 600;      // combinaciones evaluadas en el filtro previo
const FINALISTS = 14;     // combinaciones que pasan por el motor de ajuste
const REPEAT_PENALTY = 0.04;
const SAME_PROTEIN_PENALTY = 0.06; // dos platos del mismo día con la misma proteína principal (p. ej. atún y atún)

/** Alimento que más proteína aporta a un plato (para evitar repetirlo en el mismo día). */
function mainProtein(dish, foods) {
  let best = null, max = 0;
  dish.i.forEach(([n, g]) => {
    const p = ((foods[n]?.p) || 0) * g / 100;
    if (p > max) { max = p; best = n; }
  });
  return best;
}

/**
 * Propone los platos de un día.
 * @param {number} dayIdx  Índice del día (0 = lunes).
 * @param {object} state   Estado global.
 * @param {Array} dishes   Platos disponibles.
 * @param {object} foods   Base de alimentos.
 * @returns {object|null}  { b, a, c, m, n } con los nombres elegidos, o null si falta alguna categoría.
 */
export function pickDayDishes(dayIdx, state, dishes, foods) {
  const day = state.plan[dayIdx];
  const byName = new Map(dishes.map(d => [d.n, d]));
  const toFill = MEALS.filter(({ key }) => day[key] !== OUT);
  if (!toFill.length) return null;

  // Candidatos por toma, con sus nutrientes base precalculados
  const cands = {};
  for (const { key, type } of toFill) {
    cands[key] = dishes.filter(d => d.t === type)
      .map(d => ({ n: d.n, nut: calcNutrients(d.i, foods), prot: mainProtein(d, foods) }));
    if (!cands[key].length) return null;
  }

  // Cuántas veces aparece cada plato en los OTROS días (para dar variedad)
  const used = {};
  state.plan.forEach((d, i) => {
    if (i === dayIdx) return;
    MEALS.forEach(({ key }) => { if (d[key] && d[key] !== OUT) used[d[key]] = (used[d[key]] || 0) + 1; });
  });

  // Reparto objetivo de la energía
  const T = state.t;
  const tk = T.p * 4 + T.g * 9 + T.h * 4 || 1;
  const goal = { p: (T.p * 4) / tk, g: (T.g * 9) / tk, h: (T.h * 4) / tk };
  const shake = day.e ? calcNutrients(POST_WORKOUT.items, foods) : null;

  // 1) Generar combinaciones
  const keys = toFill.map(m => m.key);
  const total = keys.reduce((acc, k) => acc * cands[k].length, 1);
  const combos = [];
  if (total <= SAMPLES) {
    const rec = (i, cur) => {
      if (i === keys.length) { combos.push(cur.slice()); return; }
      cands[keys[i]].forEach(c => { cur.push(c); rec(i + 1, cur); cur.pop(); });
    };
    rec(0, []);
  } else {
    const seen = new Set();
    for (let t = 0; t < SAMPLES * 2 && combos.length < SAMPLES; t++) {
      const combo = keys.map(k => cands[k][Math.floor(Math.random() * cands[k].length)]);
      const id = combo.map(c => c.n).join('|');
      if (!seen.has(id)) { seen.add(id); combos.push(combo); }
    }
  }

  // 2) Filtro previo por reparto de macros + variedad
  const scored = combos.map(combo => {
    const s = { p: 0, g: 0, h: 0 };
    combo.forEach(c => { s.p += c.nut.p; s.g += c.nut.g; s.h += c.nut.h; });
    if (shake) { s.p += shake.p; s.g += shake.g; s.h += shake.h; }
    const e = s.p * 4 + s.g * 9 + s.h * 4 || 1;
    const dist = Math.abs(s.p * 4 / e - goal.p) + Math.abs(s.g * 9 / e - goal.g) + Math.abs(s.h * 4 / e - goal.h);
    const rep = combo.reduce((acc, c) => acc + (used[c.n] || 0), 0);
    const prots = combo.map(c => c.prot).filter(Boolean);
    const dupProt = prots.length - new Set(prots).size;
    const variety = rep * REPEAT_PENALTY + dupProt * SAME_PROTEIN_PENALTY;
    return { combo, score: dist + variety + Math.random() * 0.02, rep, variety };
  }).sort((a, b) => a.score - b.score).slice(0, FINALISTS);

  // 3) Evaluación real con el motor de ajuste
  let best = null;
  for (const cand of scored) {
    const trial = { ...day };
    keys.forEach((k, i) => { trial[k] = cand.combo[i].n; });
    const res = computeDay(trial, state, byName, foods, true);
    const final = dayError(res) + cand.variety * 0.25 + Math.random() * 0.005;
    if (!best || final < best.final) best = { final, trial };
  }

  const out = {};
  keys.forEach(k => { out[k] = best.trial[k]; });
  return out;
}
