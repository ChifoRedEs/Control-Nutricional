import { DEFAULT_FOODS } from './data/foods.js';
import { DEFAULT_DISHES } from './data/dishes.js';

const STORAGE_KEY = 'menu_nutricional_v14';

export const state = {
  foods: {},
  dishes: [],
  del: [],
  chk: {},
  t: { k: 2100, p: 230, g: 70, h: 140, gSat: 22, az: 35, fib: 30, m: 5 },
  plan: Array.from({ length: 7 }, () => ({
    b: 'Desayuno clásico: Avena, matcha, aguacate y jamón cocido',
    a: 'Tostada con queso fresco 0% y pavo extra',
    c: 'Asado de pollo con verduras y patatas',
    m: 'Yogur proteico con arándanos y nueces',
    n: 'Lomo de merluza con patata cocida y ensalada mixta',
    e: false,
    customMeals: null,
    customItems: null
  }))
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('menu_nutricional_v8');
    if (!raw) return;
    const loaded = JSON.parse(raw);

    Object.assign(state, {
      ...loaded,
      t: { ...state.t, ...(loaded.t || {}) },
      plan: loaded.plan?.length === 7 ? loaded.plan.map((p) => ({
        b: p.b || 'Desayuno clásico: Avena, matcha, aguacate y jamón cocido',
        a: p.a || 'Tostada con queso fresco 0% y pavo extra',
        c: p.c || 'Asado de pollo con verduras y patatas',
        m: p.m || 'Yogur proteico con arándanos y nueces',
        n: p.n || 'Lomo de merluza con patata cocida y ensalada mixta',
        e: !!p.e,
        customMeals: p.customMeals || null,
        customItems: p.customItems || null
      })) : state.plan
    });
  } catch (e) {
    console.warn("Error cargando state:", e);
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error guardando state:", e);
  }
}

export function getAllFoods() {
  const merged = { ...DEFAULT_FOODS, ...state.foods };
  state.del.forEach(name => delete merged[name]);
  return merged;
}

export function getAllDishes() {
  const merged = DEFAULT_DISHES.map(d => state.dishes.find(x => x.n === d.n) || d);
  return merged
    .filter(d => !state.del.includes(d.n))
    .concat(state.dishes.filter(x => !DEFAULT_DISHES.some(d => d.n === x.n)));
}
