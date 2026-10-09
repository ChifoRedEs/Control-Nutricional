import { DEFAULT_FOODS } from './data/foods.js';
import { DEFAULT_DISHES } from './data/dishes.js';

const STORAGE_KEY = 'menu_nutricional_v3';

export const state = {
  foods: {},
  dishes: [],
  del: [],
  chk: {},
  t: { k: 2100, p: 230, g: 70, h: 140, gSat: 22, az: 35, fib: 30, m: 5 },
  plan: Array.from({ length: 7 }, () => ({ b: 'Desayuno clásico: Avena, matcha, aguacate y jamón cocido', c: '', n: '', e: false }))
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('menu_nutricional_v2') || localStorage.getItem('mp1');
    if (!raw) return;
    const loaded = JSON.parse(raw);
    Object.assign(state, {
      ...loaded,
      t: { ...state.t, ...(loaded.t || {}) },
      plan: loaded.plan?.length === 7 ? loaded.plan.map(p => ({
        b: p.b || 'Desayuno clásico: Avena, matcha, aguacate y jamón cocido',
        c: p.c || '',
        n: p.n || '',
        e: !!p.e
      })) : state.plan
    });
  } catch (e) {
    console.warn("Error al cargar state:", e);
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error al persistir state:", e);
  }
}

export function getAllFoods() {
  return { ...DEFAULT_FOODS, ...state.foods };
}

export function getAllDishes() {
  const merged = DEFAULT_DISHES.map(d => state.dishes.find(x => x.n === d.n) || d);
  return merged
    .filter(d => !state.del.includes(d.n))
    .concat(state.dishes.filter(x => !DEFAULT_DISHES.some(d => d.n === x.n)));
}