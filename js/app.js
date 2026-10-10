/**
 * app.js — Punto de entrada de la SPA "Control Nutricional & Menú Semanal".
 *
 * Flujo de datos:
 *   state (plan + platos + objetivos)  ──computeWeek()──▶  week (raciones finales por día)
 *   Toda la UI (Semana, modal, Compra) se pinta a partir de `week`, de modo que
 *   los gramos mostrados, la lista de la compra y los indicadores siempre coinciden.
 */
import {
  state, loadState, saveState, applyData, clearStoredState,
  getAllFoods, getAllDishes, isDefaultDish, DEFAULT_TARGETS
} from './state.js';
import { calcNutrients, formatNutrientSummary, emptyNutrients } from './nutrition.js';
import { computeWeek, tolerance, MEALS, OUT, POST_WORKOUT, ALL_KEYS } from './engine.js';
import { MEAL_TYPES } from './data/dishes.js';
import { pickDayDishes } from './planner.js';
import { shopGroupOf } from './data/shopGroups.js';
import { TARGET_MODES, targetsFromKcal } from './targets.js';

/* ───────────────────────── Utilidades ───────────────────────── */

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const TYPE_LABEL = {
  desayuno: '🥞 Desayuno',
  almuerzo: '🥪 Almuerzo (Media Mañana)',
  comida: '🍲 Comida',
  merienda: '🍎 Merienda (Media Tarde)',
  cena: '🥗 Cena'
};
const MACRO_INFO = {
  k: { icon: '⚡', name: 'Calorías', unit: 'kcal' },
  p: { icon: '🥩', name: 'Proteínas', unit: 'g' },
  g: { icon: '🥑', name: 'Grasas', unit: 'g' },
  h: { icon: '🍞', name: 'Carbohidratos', unit: 'g' }
};
const MAIN = ['k', 'p', 'g', 'h'];

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const r = n => Math.round(n || 0);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
const formatQty = g => (g >= 1000 ? (g / 1000).toFixed(2).replace(/\.?0+$/, '') + ' kg' : r(g) + ' g');
const dayInTarget = d => MAIN.every(k => tolerance(d.nut[k], d.target[k], state.t.m) === 'ok');

/** Resultado del motor para la semana actual (se recalcula en cada renderAll). */
let week = [];
/** Sub-pestañas activas: día en Semana (por defecto hoy) y categoría en Platos. */
let selDay = (new Date().getDay() + 6) % 7;
let selType = 'desayuno';

/* ───────────────────────── Indicadores ───────────────────────── */

/**
 * 4 chips principales (kcal, P, G, H) coloreados según tolerancia
 * + línea secundaria de texto (sin recuadros) con Sat, Azúcar y Fibra.
 */
function renderIndicators(nut, target) {
  const chips = MAIN.map(key => {
    const info = MACRO_INFO[key];
    const cls = tolerance(nut[key], target[key], state.t.m);
    return `<div class="chip ${cls}" title="${info.name}: objetivo ${r(target[key])} ${info.unit}">
      <span class="chip-label">${info.icon} ${info.name}</span>
      <b>${r(nut[key])}</b>
      <small>/ ${r(target[key])} ${info.unit}</small>
    </div>`;
  }).join('');

  // Secundarios: grasa saturada y azúcar son máximos; fibra es mínimo.
  const m = (state.t.m || 5) / 100;
  const over = (v, max) => (v > max * (1 + m) ? ' class="color-danger"' : '');
  const under = (v, min) => (v < min * (1 - m) ? ' class="color-danger"' : '');
  const secondary = `<p class="mm sec">Sat: <span${over(nut.gSat, target.gSat)}>${r(nut.gSat)} g</span> (máx ${r(target.gSat)})
    · Azúcar: <span${over(nut.az, target.az)}>${r(nut.az)} g</span> (máx ${r(target.az)})
    · Fibra: <span${under(nut.fib, target.fib)}>${r(nut.fib)} g</span> (mín ${r(target.fib)})</p>`;

  return `<div class="chips-grid">${chips}</div>${secondary}`;
}

/** Texto de ayuda cuando algún macro principal de un día no entra en tolerancia. */
function dayHint(res) {
  const issues = MAIN
    .filter(k => tolerance(res.nut[k], res.target[k], state.t.m) !== 'ok')
    .map(k => `${MACRO_INFO[k].name.toLowerCase()} ${res.nut[k] < res.target[k] ? 'por debajo' : 'por encima'}`);
  if (!issues.length) return '';
  const advice = state.adjust
    ? 'Con estos platos no se puede cuadrar sin raciones desproporcionadas: cambia alguna toma por un plato más acorde.'
    : 'Pulsa «Ajustar raciones a objetivos» para reescalar las cantidades.';
  return `<p class="hint">⚠️ ${issues.join(', ')}. ${advice}</p>`;
}

/* ───────────────────────── Pestaña Semana ───────────────────────── */

function renderWeek() {
  const dishes = getAllDishes();
  const foods = getAllFoods();
  const names = new Set(dishes.map(d => d.n));

  $('#btn-auto').textContent = `🎲 Elegir platos del ${DAYS[selDay].toLowerCase()}`;

  // Sub-pestañas de días con indicador de estado (gris: vacío · verde: en objetivo · naranja: revisar)
  $('#day-tabs').innerHTML = state.plan.map((day, i) => {
    const res = week[i];
    const st = res.target.share > 0 ? (dayInTarget(res) ? 'ok' : 'wa') : '';
    return `<button type="button" class="sub-tab${i === selDay ? ' on' : ''}" data-day-tab="${i}" role="tab"
      aria-selected="${i === selDay}" title="${DAYS[i]}">${DAYS_SHORT[i]}${day.e ? '<small class="train" aria-label="Entreno">⚡</small>' : ''}<i class="dot ${st}"></i></button>`;
  }).join('');

  $('#wk').innerHTML = state.plan.map((day, i) => {
    if (i !== selDay) return '';
    const res = week[i];

    const mealRow = ({ key, type, label }) => {
      const current = day[key] || '';
      const valid = current === OUT || names.has(current);
      const opts = [
        `<option value="">— Elegir ${type} —</option>`,
        `<option value="${OUT}"${current === OUT ? ' selected' : ''}>🍴 Fuera de casa</option>`,
        ...dishes.filter(d => d.t === type).map(d =>
          `<option value="${esc(d.n)}"${d.n === current ? ' selected' : ''}>${esc(d.n)}</option>`)
      ].join('');

      let summary;
      if (current === OUT) summary = 'Fuera de casa: no cuenta en el objetivo del día';
      else if (!current || !valid) summary = 'Sin asignar';
      else summary = formatNutrientSummary(calcNutrients(res.meals[key], foods));

      return `<div class="meal">
        <label for="sel-${key}-${i}">${label}</label>
        <select id="sel-${key}-${i}" data-day="${i}" data-meal="${key}">${opts}</select>
        <p class="mm">${summary}</p>
      </div>`;
    };

    // Batido post-entreno (solo días con el check "Entreno")
    const post = day.e ? `<div class="meal post">
        <label>${POST_WORKOUT.label}</label>
        <p class="post-line">${POST_WORKOUT.items.map(([n, g]) => `${esc(n)} ${g} g`).join(', ')} · ${formatNutrientSummary(calcNutrients(POST_WORKOUT.items, foods))}</p>
      </div>` : '';

    const hasDishes = res.target.share > 0;
    const shareNote = hasDishes && res.target.share < 0.999
      ? `<p class="mm">Objetivo del día al ${r(res.target.share * 100)} % (solo cuentan las tomas en casa).</p>` : '';

    return `<article class="card day">
      <h3>
        <span>${DAYS[i]}${res.adjusted ? ' <span class="badge">Ajustado</span>' : ''}</span>
        <label class="inline"><input type="checkbox" data-train="${i}"${day.e ? ' checked' : ''}> Entreno</label>
      </h3>
      ${MEALS.map(mealRow).join('')}
      ${post}
      ${hasDishes
        ? shareNote + renderIndicators(res.nut, res.target) + dayHint(res)
        : '<p class="mm">Elige los platos del día para ver sus indicadores.</p>'}
    </article>`;
  }).join('');

  renderWeekSummary();
}

/** Media diaria de la semana (solo días con algún plato) frente a la media de objetivos. */
function renderWeekSummary() {
  const active = week.filter(d => d.target.share > 0);
  if (!active.length) {
    $('#wk-sum').innerHTML = '<h3>Resumen semanal</h3><p class="mm">Todavía no hay platos elegidos esta semana.</p>';
    return;
  }
  const keys = ['k', 'p', 'g', 'h', 'gSat', 'az', 'fib'];
  const nut = emptyNutrients();
  const tgt = emptyNutrients();
  active.forEach(d => keys.forEach(k => {
    nut[k] += d.nut[k] / active.length;
    tgt[k] += d.target[k] / active.length;
  }));
  const ok = active.filter(dayInTarget).length;

  $('#wk-sum').innerHTML = `<h3>Resumen semanal</h3>
    <p class="mm">Media diaria de ${active.length} ${active.length === 1 ? 'día planificado' : 'días planificados'} · ${ok}/${active.length} dentro del objetivo (±${state.t.m} %)</p>
    ${renderIndicators(nut, tgt)}`;
}

/* ───────────────────────── Modal: menú completo ───────────────────────── */

function renderMenuModal() {
  const foods = getAllFoods();
  $('#menu-modal-content').innerHTML = state.plan.map((day, i) => {
    const res = week[i];
    const blocks = MEALS.map(({ key, label }) => {
      const val = day[key];
      let body;
      if (val === OUT) body = '<p class="mm">🍴 Fuera de casa</p>';
      else if (!val || !res.meals[key].length) body = '<p class="mm">Sin asignar</p>';
      else {
        const items = res.meals[key].map(([n, g]) => `<li>${esc(n)}: <b>${r(g)} g</b></li>`).join('');
        body = `<details class="dish-details" open>
          <summary>${esc(val)}</summary>
          <ul class="dish-ingredients">${items}</ul>
          <p class="mm">${formatNutrientSummary(calcNutrients(res.meals[key], foods))}</p>
        </details>`;
      }
      return `<div class="meal-block"><div class="meal-title">${label}</div>${body}</div>`;
    }).join('') + (day.e ? `<div class="meal-block"><div class="meal-title">${POST_WORKOUT.label}</div>
        <p class="dish-sub">${esc(POST_WORKOUT.name)}</p>
        <ul class="dish-ingredients">${POST_WORKOUT.items.map(([n, g]) => `<li>${esc(n)}: <b>${g} g</b></li>`).join('')}</ul>
      </div>` : '');

    return `<section class="day-menu-card">
      <h3>${DAYS[i]} · ${day.e ? '⚡ Entreno' : '🛋️ Descanso'}</h3>
      ${blocks}
      ${res.target.share > 0 ? `<p class="day-total">Total del día: ${formatNutrientSummary(res.nut)}</p>` : ''}
    </section>`;
  }).join('');
}

/* ───────────────────────── Pestaña Compra ───────────────────────── */

/**
 * Lista de la compra agrupada por tipo de alimento.
 * Suma los gramos de toda la semana (raciones ya ajustadas) y los agrupa
 * según shopGroups.js: p. ej. todas las piezas de pollo en una línea.
 * @returns {Array<{group, cat, total, parts: Array<{name, g}>}>}
 */
function shoppingGroups() {
  const foods = getAllFoods();
  const perFood = {};
  week.forEach(d => ALL_KEYS.forEach(key => (d.meals[key] || []).forEach(([name, g]) => {
    perFood[name] = (perFood[name] || 0) + (Number(g) || 0);
  })));

  const groups = {};
  Object.entries(perFood).forEach(([name, g]) => {
    const grp = shopGroupOf(name, foods[name]);
    const entry = groups[grp] || (groups[grp] = { group: grp, cat: foods[name]?.cat || 'Otros', total: 0, parts: [] });
    entry.total += g;
    entry.parts.push({ name, g });
  });
  return Object.values(groups).map(e => {
    e.parts.sort((a, b) => b.g - a.g);
    e.cat = foods[e.parts[0].name]?.cat || 'Otros'; // categoría del alimento principal del grupo
    return e;
  });
}

/** Texto de unidades aproximadas ("≈ 3 latas") para un alimento que se compra por unidades. */
function unitsText(name, grams, foods) {
  const f = foods[name] || {};
  return f.u ? ` ≈ ${(grams / f.u).toFixed(1).replace('.0', '')} ${f.un || 'ud.'}` : '';
}

function renderShop() {
  const foods = getAllFoods();
  const groups = shoppingGroups();
  if (!groups.length) {
    $('#shop').innerHTML = '<p class="mm">La lista se genera sola cuando eliges platos en la pestaña Semana.</p>';
    return;
  }

  const byCat = {};
  groups.forEach(g => (byCat[g.cat] = byCat[g.cat] || []).push(g));
  const cats = Object.keys(byCat).sort((a, b) => a.localeCompare(b, 'es'));

  let idx = 0;
  $('#shop').innerHTML = cats.map(cat => `<div class="card">
    <h3>${esc(cat)}</h3>
    ${byCat[cat].sort((a, b) => a.group.localeCompare(b.group, 'es')).map(g => {
      const done = !!state.chk[g.group];
      const id = 'shop-' + (idx++);
      const single = g.parts.length === 1 && g.parts[0].name === g.group;
      const units = single ? unitsText(g.group, g.total, foods).trim() : '';
      // Desglose: una línea por alimento (solo si el grupo junta varios o cambia el nombre)
      const detail = single ? '' : `<ul class="it-parts">${g.parts.map(p =>
        `<li><span>${esc(p.name)}</span><span>${formatQty(p.g)}${esc(unitsText(p.name, p.g, foods))}</span></li>`).join('')}</ul>`;
      return `<div class="it${done ? ' d' : ''}">
        <input type="checkbox" id="${id}" data-item="${esc(g.group)}"${done ? ' checked' : ''}>
        <label class="it-name" for="${id}">${esc(g.group)}${units ? `<small>${esc(units)}</small>` : ''}</label>
        <b class="it-total">${formatQty(g.total)}</b>
        ${detail}
      </div>`;
    }).join('')}
  </div>`).join('');
}

/* ───────────────────────── Pestaña Platos ───────────────────────── */

let editingName = null;   // nombre original del plato en edición (null = alta nueva)
let ingRows = [];         // filas del formulario [{ n, w }]

function renderDishes() {
  const dishes = getAllDishes();
  const foods = getAllFoods();

  // Sub-pestañas por tipo de comida
  $('#dish-tabs').innerHTML = MEAL_TYPES.map(type => {
    const [icon, ...rest] = TYPE_LABEL[type].split(' ');
    const name = rest.join(' ').replace(/ \(.*\)/, '');
    return `<button type="button" class="sub-tab${type === selType ? ' on' : ''}" data-type-tab="${type}" role="tab"
      aria-selected="${type === selType}" title="${TYPE_LABEL[type]}"><span class="ico">${icon}</span>${name}</button>`;
  }).join('');

  $('#dish-list').innerHTML = [selType].map(type => {
    const list = dishes.filter(d => d.t === type);
    if (!list.length) return '<p class="mm">No hay platos de este tipo. Créalo con el formulario.</p>';
    return `<h3 class="group-title">${TYPE_LABEL[type]} <small>(${list.length})</small></h3>` +
      list.map(dish => `<div class="card dish">
        <div class="dish-head">
          <b>${esc(dish.n)}</b>
          <div class="dish-actions">
            <button class="btn s sm" data-edit="${esc(dish.n)}">Editar</button>
            <button class="btn r sm" data-del="${esc(dish.n)}" aria-label="Eliminar ${esc(dish.n)}">✕</button>
          </div>
        </div>
        <p class="mm">${formatNutrientSummary(calcNutrients(dish.i, foods))} · ración base${isDefaultDish(dish.n) ? '' : ' · plato propio'}</p>
        <p class="ing-line">${dish.i.map(([n, w]) => `${esc(n)} ${w} g`).join(', ')}</p>
      </div>`).join('');
  }).join('');
}

function renderIngRows() {
  const foods = Object.keys(getAllFoods()).sort((a, b) => a.localeCompare(b, 'es'));
  $('#ing-list').innerHTML = ingRows.map((row, idx) => `<div class="row ing-row">
    <select data-ing-name="${idx}" aria-label="Alimento">
      <option value="">— Alimento —</option>
      ${foods.map(f => `<option value="${esc(f)}"${f === row.n ? ' selected' : ''}>${esc(f)}</option>`).join('')}
    </select>
    <input class="w" type="number" min="1" data-ing-w="${idx}" value="${row.w || ''}" placeholder="g" aria-label="Gramos">
    <button class="btn r x" data-ing-del="${idx}" aria-label="Quitar ingrediente">✕</button>
  </div>`).join('') || '<p class="mm">Añade al menos un ingrediente.</p>';
}

function resetDishForm() {
  editingName = null;
  ingRows = [];
  $('#dn').value = '';
  $('#dt').value = selType;
  $('#xc').style.display = 'none';
  $('#form-dish-title').textContent = '➕ Nuevo plato';
  $('#dish-form').open = false;
  renderIngRows();
}

/** Cambia el nombre de un plato en todo el plan semanal (o lo quita si newName = ''). */
function renamePlanRefs(oldName, newName) {
  state.plan.forEach(day => MEALS.forEach(({ key }) => { if (day[key] === oldName) day[key] = newName; }));
}

function saveDish() {
  const n = $('#dn').value.trim();
  const t = $('#dt').value;
  const items = ingRows.filter(x => x.n && x.w > 0).map(x => [x.n, Math.round(x.w)]);
  if (!n) return alert('Escribe un nombre para el plato.');
  if (!items.length) return alert('Añade al menos un ingrediente con sus gramos.');
  if (n !== editingName && getAllDishes().some(d => d.n === n)) return alert('Ya existe un plato con ese nombre.');

  if (editingName) {
    // Renombrado: el plato original desaparece y el plan apunta al nuevo nombre.
    if (editingName !== n) {
      if (isDefaultDish(editingName) && !state.del.includes(editingName)) state.del.push(editingName);
      state.dishes = state.dishes.filter(d => d.n !== editingName);
      renamePlanRefs(editingName, n);
    }
    // Si cambia la categoría, el plato deja de valer en tomas de otra categoría.
    const typeKey = MEALS.find(m => m.type === t).key;
    state.plan.forEach(day => MEALS.forEach(({ key }) => { if (day[key] === n && key !== typeKey) day[key] = ''; }));
  }

  state.del = state.del.filter(x => x !== n);
  const dish = { n, t, i: items };
  const pos = state.dishes.findIndex(d => d.n === n);
  if (pos >= 0) state.dishes[pos] = dish; else state.dishes.push(dish);

  selType = t; // mostrar la categoría donde ha quedado el plato
  saveState();
  resetDishForm();
  renderAll();
}

function editDish(name) {
  const d = getAllDishes().find(x => x.n === name);
  if (!d) return;
  editingName = d.n;
  $('#dn').value = d.n;
  $('#dt').value = d.t;
  ingRows = d.i.map(([n, w]) => ({ n, w }));
  renderIngRows();
  $('#xc').style.display = '';
  $('#form-dish-title').textContent = '✏️ Editando: ' + d.n;
  $('#dish-form').open = true;
  $('#dish-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteDish(name) {
  if (!confirm(`¿Eliminar «${name}»? También se quitará de los días donde esté elegido.`)) return;
  state.dishes = state.dishes.filter(d => d.n !== name);
  if (isDefaultDish(name) && !state.del.includes(name)) state.del.push(name);
  renamePlanRefs(name, '');
  if (editingName === name) resetDishForm();
  saveState();
  renderAll();
}

/* ───────────────────────── Pestaña Ajustes ───────────────────────── */

const TARGET_FIELDS = { tk: 'k', tp: 'p', tg: 'g', th: 'h', tgs: 'gSat', taz: 'az', tfb: 'fib', tm: 'm' };
const FOOD_FIELDS = { fk: 'k', fp: 'p', fg: 'g', fgs: 'gSat', fh: 'h', faz: 'az', ffb: 'fib', fu: 'u' };

/** Campos que calcula la fórmula a partir de las kcal. */
const FORMULA_FIELDS = { p: 'Proteína', g: 'Grasas', h: 'Hidratos', gSat: 'Sat.', az: 'Azúcar', fib: 'Fibra' };

/**
 * Botón «Calcular nutrientes»: aplica la fórmula elegida a las kcal escritas.
 * Lee las kcal directamente del campo por si el usuario aún no ha salido de él.
 */
function applyFormula() {
  const kcal = +$('#tk').value;
  if (!(kcal >= 800)) return alert('Indica primero unas calorías válidas (mínimo 800 kcal).');
  state.t.k = kcal;
  state.t.mode = $('#tmode').value;
  Object.assign(state.t, targetsFromKcal(kcal, state.t.mode));
  saveState();
  renderAll();
  const t = state.t;
  alert(`✅ Objetivos calculados (${TARGET_MODES[t.mode].label}, ${t.k} kcal):\n` +
    `Proteína ${t.p} g · Grasas ${t.g} g · Hidratos ${t.h} g\n` +
    `Sat. máx. ${t.gSat} g · Azúcar máx. ${t.az} g · Fibra mín. ${t.fib} g`);
}

function renderSettings() {
  Object.entries(TARGET_FIELDS).forEach(([id, k]) => { $('#' + id).value = state.t[k]; });
  $('#tmode').value = state.t.mode;
  renderFormulaInfo();
  $('#aj').checked = !!state.adjust;
  $('#food-names').innerHTML = Object.keys(getAllFoods()).sort((a, b) => a.localeCompare(b, 'es'))
    .map(f => `<option value="${esc(f)}"></option>`).join('');
}

/** Texto bajo el desplegable: reparto de la fórmula y aviso si los valores actuales no coinciden. */
function renderFormulaInfo() {
  const mode = $('#tmode').value;
  const split = TARGET_MODES[mode];
  const expected = targetsFromKcal(+$('#tk').value || state.t.k, mode);
  const differs = expected && Object.keys(FORMULA_FIELDS).some(k => Math.abs(expected[k] - state.t[k]) > 1);
  $('#mode-info').innerHTML =
    `Reparto: proteína ${Math.round(split.p * 100)} % · grasa ${Math.round(split.g * 100)} % · hidratos ${Math.round(split.h * 100)} %. ` +
    'Grasa saturada y azúcar &lt; 10 % de las kcal; fibra 14 g por cada 1000 kcal.' +
    (differs ? '<br><b class="warn-text">Los valores actuales no siguen esta fórmula: pulsa «Calcular nutrientes» para aplicarla.</b>' : '');
}

/** Al escribir el nombre de un alimento existente, rellena el formulario para editarlo. */
function prefillFood() {
  const f = getAllFoods()[$('#fn').value.trim()];
  if (!f) return;
  $('#fc').value = f.cat || '';
  Object.entries(FOOD_FIELDS).forEach(([id, k]) => { $('#' + id).value = f[k] || 0; });
  $('#fun').value = f.un || '';
  $('#fgr').value = f.grp || '';
}

function saveFood() {
  const n = $('#fn').value.trim();
  if (!n) return alert('El nombre del alimento es obligatorio.');
  const food = { cat: $('#fc').value.trim() || 'Otros', un: $('#fun').value.trim() };
  const grp = $('#fgr').value.trim();
  if (grp) food.grp = grp;
  Object.entries(FOOD_FIELDS).forEach(([id, k]) => { food[k] = Math.max(0, +$('#' + id).value || 0); });
  if (!food.k) return alert('Indica las kcal por 100 g.');
  state.foods[n] = food;
  state.del = state.del.filter(x => x !== n);
  saveState();
  renderAll();
  renderIngRows();
  ['fn', 'fc', 'fun', 'fgr', ...Object.keys(FOOD_FIELDS)].forEach(id => { $('#' + id).value = ''; });
  alert(`Alimento «${n}» guardado.`);
}

/* ───────────────────────── Render global ───────────────────────── */

function renderAll() {
  week = computeWeek(state, getAllDishes(), getAllFoods());
  renderWeek();
  renderShop();
  renderDishes();
  renderSettings();
  if ($('#menu-modal').open) renderMenuModal();
}

/** Botón «Elegir platos del día»: propone los 5 platos del día seleccionado según los objetivos. */
function autoPickDay() {
  const day = state.plan[selDay];
  const filled = MEALS.some(({ key }) => day[key] && day[key] !== OUT);
  if (filled && !confirm(`¿Sustituir los platos del ${DAYS[selDay].toLowerCase()} por una propuesta automática?\n(Las tomas «Fuera de casa» se mantienen).`)) return;
  const pick = pickDayDishes(selDay, state, getAllDishes(), getAllFoods());
  if (!pick) return alert('No hay platos suficientes en alguna categoría, o todas las tomas están marcadas como «Fuera de casa».');
  Object.assign(day, pick);
  state.adjust = true; // la propuesta está pensada para usarse con las raciones ajustadas
  saveState();
  renderAll();
}

/** Botón "Ajustar raciones": activa el ajuste, recalcula e informa del resultado. */
function adjustAndReport() {
  state.adjust = true;
  saveState();
  renderAll();
  const active = week.map((d, i) => ({ d, i })).filter(x => x.d.target.share > 0);
  if (!active.length) return alert('ℹ️ Elige primero los platos de algún día.');
  const off = active.filter(({ d }) => !dayInTarget(d));
  if (!off.length) {
    alert(`✅ Raciones ajustadas: los ${active.length} días planificados están dentro del objetivo (±${state.t.m} %).`);
  } else {
    alert(`⚖️ Raciones ajustadas. ${active.length - off.length}/${active.length} días dentro del objetivo.\n` +
      `Revisa: ${off.map(x => DAYS[x.i]).join(', ')} (cada día indica qué falla).`);
  }
}

/* ───────────────────────── Eventos ───────────────────────── */

function activateTab(btn) {
  $$('.tab-btn').forEach(b => {
    const on = b === btn;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', String(on));
  });
  $$('.tab').forEach(sec => sec.classList.toggle('on', sec.id === 't' + btn.dataset.t));
  window.scrollTo({ top: 0 });
}

function setupEvents() {
  // Navegación: solo la pestaña activa lleva .on (y por CSS solo ella es visible)
  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => activateTab(btn)));

  // Semana: cambio de plato o de día de entreno → recalcular y repintar
  $('#wk').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.meal !== undefined) state.plan[+t.dataset.day][t.dataset.meal] = t.value;
    else if (t.dataset.train !== undefined) state.plan[+t.dataset.train].e = t.checked;
    else return;
    saveState();
    renderAll();
  });

  $('#day-tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-day-tab]');
    if (!b) return;
    selDay = +b.dataset.dayTab;
    renderWeek();
  });

  $('#dish-tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-type-tab]');
    if (!b) return;
    selType = b.dataset.typeTab;
    if (!editingName) $('#dt').value = selType;
    renderDishes();
  });

  $('#btn-adjust').addEventListener('click', adjustAndReport);
  $('#btn-auto').addEventListener('click', autoPickDay);

  $('#clr').addEventListener('click', () => {
    if (!confirm('¿Vaciar todos los platos de la semana?')) return;
    state.plan.forEach(day => MEALS.forEach(({ key }) => { day[key] = ''; }));
    saveState();
    renderAll();
  });

  // Modal del menú completo
  const modal = $('#menu-modal');
  $('#open-menu-modal').addEventListener('click', () => { renderMenuModal(); modal.showModal(); });
  $('#close-menu-modal').addEventListener('click', () => modal.close());
  $('#close-menu-modal-btn').addEventListener('click', () => modal.close());
  $('#print-menu').addEventListener('click', () => window.print());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); }); // clic en el fondo

  // Compra: tachar / destachar
  $('#shop').addEventListener('change', e => {
    const name = e.target.dataset.item;
    if (name === undefined) return;
    if (e.target.checked) state.chk[name] = true; else delete state.chk[name];
    e.target.closest('.it').classList.toggle('d', e.target.checked);
    saveState();
  });

  // Tocar cualquier parte de la fila (desglose incluido) también tacha el grupo
  $('#shop').addEventListener('click', e => {
    const row = e.target.closest('.it');
    if (!row || e.target.closest('input, label')) return;
    const cb = row.querySelector('input[type="checkbox"]');
    cb.checked = !cb.checked;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
  });

  $('#un').addEventListener('click', () => { state.chk = {}; saveState(); renderShop(); });

  $('#cp').addEventListener('click', () => {
    const lines = shoppingGroups()
      .sort((a, b) => a.group.localeCompare(b.group, 'es'))
      .filter(g => !state.chk[g.group])
      .map(g => `- ${g.group}: ${formatQty(g.total)}` +
        (g.parts.length > 1 ? ` (${g.parts.map(p => p.name + ' ' + formatQty(p.g)).join(', ')})` : ''));
    if (!lines.length) return alert('No queda nada pendiente en la lista.');
    const text = 'Lista de la compra\n' + lines.join('\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => alert('Lista copiada (sin los productos tachados).'),
        () => prompt('Copia la lista:', text));
    } else prompt('Copia la lista:', text);
  });

  // Platos: formulario
  $('#ar').addEventListener('click', () => { ingRows.push({ n: '', w: 100 }); renderIngRows(); });
  $('#ing-list').addEventListener('change', e => {
    const d = e.target.dataset;
    if (d.ingName !== undefined) ingRows[+d.ingName].n = e.target.value;
    if (d.ingW !== undefined) ingRows[+d.ingW].w = +e.target.value;
  });
  $('#ing-list').addEventListener('click', e => {
    const i = e.target.dataset.ingDel;
    if (i !== undefined) { ingRows.splice(+i, 1); renderIngRows(); }
  });
  $('#ds').addEventListener('click', saveDish);
  $('#xc').addEventListener('click', resetDishForm);
  $('#dish-list').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.edit !== undefined) editDish(b.dataset.edit);
    if (b.dataset.del !== undefined) deleteDish(b.dataset.del);
  });

  // Ajustes: objetivos
  Object.entries(TARGET_FIELDS).forEach(([id, k]) => {
    $('#' + id).addEventListener('change', e => {
      const v = +e.target.value;
      state.t[k] = v > 0 ? v : DEFAULT_TARGETS[k];
      saveState();
      renderAll();
    });
  });
  // La fórmula solo se aplica al pulsar el botón; aquí solo se guarda la elección.
  $('#tmode').addEventListener('change', e => {
    state.t.mode = e.target.value;
    saveState();
    renderFormulaInfo();
  });
  $('#tk').addEventListener('input', renderFormulaInfo);
  $('#calc-targets').addEventListener('click', applyFormula);
  $('#aj').addEventListener('change', e => { state.adjust = e.target.checked; saveState(); renderAll(); });

  // Ajustes: alimentos
  $('#fn').addEventListener('change', prefillFood);
  $('#fs').addEventListener('click', saveFood);

  // Copia de seguridad
  $('#bd').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-semanal-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#bi').addEventListener('click', () => $('#fi').click());
  $('#fi').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        if (!applyData(JSON.parse(ev.target.result))) throw new Error('formato');
        saveState();
        resetDishForm();
        renderAll();
        alert('Copia importada correctamente.');
      } catch {
        alert('El archivo no es una copia válida de esta app.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  $('#rs').addEventListener('click', () => {
    if (!confirm('¿Restablecer todos los datos de esta app? Se perderán tus platos, alimentos y menú.')) return;
    clearStoredState();
    location.reload();
  });
}

/* ───────────────────────── Arranque ───────────────────────── */

loadState();
setupEvents();
resetDishForm();
renderAll();

// Service worker sin caché: reemplaza versiones antiguas que pudieran seguir
// sirviendo CSS/JS obsoletos (causa típica de "todas las pestañas visibles").
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
