/**
 * state.js — Estado global de la app y persistencia en LocalStorage.
 *
 * Estructura del estado:
 *   foods   : alimentos añadidos/sobrescritos por el usuario { nombre: {...} }
 *   dishes  : platos creados o editados por el usuario [{ n, t, i }]
 *   del     : nombres de platos/alimentos por defecto que el usuario eliminó
 *   chk     : items tachados en la lista de la compra { nombre: true }
 *   t       : objetivos nutricionales diarios (m = margen de tolerancia ±%)
 *   adjust  : true → las raciones se ajustan automáticamente a los objetivos
 *   plan    : 7 días × { b, a, c, m, n, e }  (desayuno, almuerzo, comida, merienda, cena, entreno)
 *             Cada toma guarda el NOMBRE del plato, '#fuera' o '' (sin asignar).
 *             No hay asignaciones automáticas: por defecto todo está vacío.
 */
import { DEFAULT_FOODS } from './data/foods.js';
import { DEFAULT_DISHES } from './data/dishes.js';

const STORAGE_KEY = 'menu_nutricional_v15';
/** Claves antiguas de las que se migra la información una sola vez. */
const LEGACY_KEYS = ['menu_nutricional_v14', 'menu_nutricional_v8'];
const MEAL_KEYS = ['b', 'a', 'c', 'm', 'n'];

export const DEFAULT_TARGETS = { k: 2100, p: 230, g: 70, h: 140, gSat: 22, az: 35, fib: 30, m: 5 };

const emptyDay = () => ({ b: '', a: '', c: '', m: '', n: '', e: false });

export const state = {
  foods: {},
  dishes: [],
  del: [],
  chk: {},
  t: { ...DEFAULT_TARGETS },
  adjust: true,
  plan: Array.from({ length: 7 }, emptyDay)
};

/** Normaliza un día cargado (descarta campos obsoletos como customMeals/customItems). */
function sanitizeDay(p) {
  const d = emptyDay();
  if (!p || typeof p !== 'object') return d;
  MEAL_KEYS.forEach(k => { d[k] = typeof p[k] === 'string' ? p[k] : ''; });
  d.e = !!p.e;
  return d;
}

/**
 * Vuelca en el estado unos datos cargados (LocalStorage o copia importada),
 * validando tipos para que un JSON incompleto no rompa la app.
 * @returns {boolean} true si los datos tenían un formato reconocible.
 */
export function applyData(data) {
  if (!data || typeof data !== 'object') return false;
  state.foods = data.foods && typeof data.foods === 'object' ? data.foods : {};
  state.dishes = Array.isArray(data.dishes)
    ? data.dishes.filter(d => d && d.n && Array.isArray(d.i)).map(d => ({ n: String(d.n), t: d.t || 'comida', i: d.i }))
    : [];
  state.del = Array.isArray(data.del) ? data.del : [];
  state.chk = data.chk && typeof data.chk === 'object' ? data.chk : {};
  state.t = { ...DEFAULT_TARGETS };
  if (data.t) Object.keys(DEFAULT_TARGETS).forEach(k => { if (+data.t[k] > 0) state.t[k] = +data.t[k]; });
  state.adjust = data.adjust !== false;
  state.plan = Array.isArray(data.plan) && data.plan.length === 7
    ? data.plan.map(sanitizeDay)
    : Array.from({ length: 7 }, emptyDay);
  return true;
}

export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) raw = LEGACY_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if (raw) applyData(JSON.parse(raw));
  } catch (e) {
    console.warn('Error cargando el estado:', e);
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error guardando el estado:', e);
  }
}

/**
 * Borra SOLO las claves de esta app. No se usa localStorage.clear() porque en
 * GitHub Pages todas las apps de usuario.github.io comparten el mismo origen
 * y se borrarían también sus datos.
 */
export function clearStoredState() {
  [STORAGE_KEY, ...LEGACY_KEYS].forEach(k => localStorage.removeItem(k));
}

/** Alimentos por defecto + los del usuario (estos sobrescriben). */
export function getAllFoods() {
  const merged = { ...DEFAULT_FOODS, ...state.foods };
  state.del.forEach(name => { if (!state.foods[name]) delete merged[name]; });
  return merged;
}

/** ¿El plato es uno de los incluidos por defecto? */
export function isDefaultDish(name) {
  return DEFAULT_DISHES.some(d => d.n === name);
}

/** Platos por defecto (con las ediciones del usuario aplicadas) + platos propios. */
export function getAllDishes() {
  const merged = DEFAULT_DISHES
    .filter(d => !state.del.includes(d.n))
    .map(d => state.dishes.find(x => x.n === d.n) || d);
  return merged.concat(state.dishes.filter(x => !isDefaultDish(x.n)));
}
