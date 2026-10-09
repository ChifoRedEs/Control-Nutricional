import { state, loadState, saveState, getAllFoods, getAllDishes } from './state.js';
import { BASE_MEALS } from './data/dishes.js';
import { calcNutrients, formatNutrientSummary } from './nutrition.js';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const r = Math.round;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function init() {
  loadState();
  bindEvents();
  syncSettingsInputs();
  renderAll();
  addRow();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function getDayItems(d) {
  let it = [...BASE_MEALS.desayuno, ...BASE_MEALS.almuerzo, ...(d.e ? BASE_MEALS.meriendaEntreno : BASE_MEALS.meriendaDescanso)];
  const dishes = getAllDishes();
  const cDish = dishes.find(x => x.n === d.c);
  const nDish = dishes.find(x => x.n === d.n);
  if (cDish) it = it.concat(cDish.i);
  if (nDish) it = it.concat(nDish.i);
  return it;
}

function evaluateTolerance(val, target, isMaxCap) {
  const margin = state.t.m / 100;
  if (isMaxCap) return val > target * (1 + margin) ? 'bd' : val > target ? 'wa' : 'ok';
  const err = Math.abs(val - target) / (target || 1);
  return err <= margin ? 'ok' : err <= 2 * margin ? 'wa' : 'bd';
}

function renderChips(nutrients, multiplier = 1) {
  const T = state.t;
  const cards = [
    { label: 'kcal', val: nutrients.k, t: T.k * multiplier, max: false },
    { label: 'Prot (g)', val: nutrients.p, t: T.p * multiplier, max: false },
    { label: 'Grasa (g)', val: nutrients.g, t: T.g * multiplier, max: true },
    { label: 'Hidr (g)', val: nutrients.h, t: T.h * multiplier, max: false }
  ];

  const mainChips = cards.map(c => 
    '<div class="chip ' + evaluateTolerance(c.val, c.t, c.max) + '">' +
      '<b>' + r(c.val) + '</b>' +
      '<span>' + c.label + ' / ' + r(c.t) + '</span>' +
    '</div>'
  ).join('');

  const subChips = 
    '<div class="sub-chips">' +
      '<span>Sat: <b>' + r(nutrients.gSat) + 'g</b></span>' +
      '<span>Azúcar: <b>' + r(nutrients.az) + 'g</b></span>' +
      '<span>Fibra: <b>' + r(nutrients.fib) + 'g</b></span>' +
      '<span>H. Netos: <b>' + r(nutrients.hNet) + 'g</b></span>' +
    '</div>';

  return '<div class="chips-grid">' + mainChips + '</div>' + subChips;
}

function renderWeek() {
  const dishes = getAllDishes();
  const foods = getAllFoods();

  $('#wk').innerHTML = state.plan.map((d, i) => {
    const tot = calcNutrients(getDayItems(d), foods);
    const dc = dishes.find(x => x.n === d.c);
    const dn = dishes.find(x => x.n === d.n);

    const dishOptions = (type, current) => 
      '<option value="">— Elegir plato —</option>' +
      '<option value="#fuera" ' + (current === '#fuera' ? 'selected' : '') + '>🍴 Comer fuera</option>' +
      dishes.filter(x => x.t === type).map(x => '<option value="' + esc(x.n) + '" ' + (x.n === current ? 'selected' : '') + '>' + esc(x.n) + '</option>').join('');

    return '<div class="card">' +
      '<h3>' +
        DAYS[i] +
        '<label style="display:inline-flex;gap:4px;align-items:center;cursor:pointer;">' +
          '<input type="checkbox" data-e="' + i + '" ' + (d.e ? 'checked' : '') + ' style="width:auto;margin:0"> Entreno' +
        '</label>' +
      '</h3>' +
      '<label for="comida-' + i + '">Comida</label>' +
      '<select id="comida-' + i + '" data-c="' + i + '">' + dishOptions('comida', d.c) + '</select>' +
      '<p class="mm">' + (dc ? formatNutrientSummary(calcNutrients(dc.i, foods)) : d.c === '#fuera' ? 'Fuera de casa' : 'Sin asignar') + '</p>' +

      '<label for="cena-' + i + '">Cena</label>' +
      '<select id="cena-' + i + '" data-n="' + i + '">' + dishOptions('cena', d.n) + '</select>' +
      '<p class="mm">' + (dn ? formatNutrientSummary(calcNutrients(dn.i, foods)) : d.n === '#fuera' ? 'Fuera de casa' : 'Sin asignar') + '</p>' +

      renderChips(tot, 1) +
    '</div>';
  }).join('');

  const foodsDb = getAllFoods();
  const weeklyTotals = state.plan.reduce((acc, d) => {
    const dayNuts = calcNutrients(getDayItems(d), foodsDb);
    for (const k in acc) acc[k] += dayNuts[k];
    return acc;
  }, { k: 0, p: 0, g: 0, gSat: 0, h: 0, az: 0, fib: 0, hNet: 0 });

  const dailyAvg = {};
  for (const k in weeklyTotals) dailyAvg[k] = weeklyTotals[k] / 7;

  $('#sum').innerHTML = 
    '<h3>📊 Resumen Semanal</h3>' +
    '<p class="mm">Media diaria real</p>' +
    renderChips(dailyAvg, 1) +
    '<p class="mm" style="margin-top:10px">Total acumulado 7 días</p>' +
    renderChips(weeklyTotals, 7);
}

function renderShop() {
  const foods = getAllFoods();
  const totals = {};
  state.plan.forEach(d => {
    getDayItems(d).forEach(([name, grams]) => {
      totals[name] = (totals[name] || 0) + grams;
    });
  });

  const categories = {};
  Object.keys(totals).forEach(name => {
    const cat = foods[name]?.cat || 'Otros';
    (categories[cat] = categories[cat] || []).push(name);
  });

  const formatQty = g => g >= 1000 ? (g / 1000).toFixed(2).replace(/\.?0+$/, '') + ' kg' : r(g) + ' g';

  $('#shop').innerHTML = Object.keys(categories).sort().map(cat => 
    '<h4 style="margin:12px 0 4px;color:var(--ac)">' + esc(cat) + '</h4>' +
    categories[cat].sort().map(name => {
      const f = foods[name] || {};
      const unitInfo = f.u ? ' · ≈ ' + (totals[name] / f.u).toFixed(1) + ' ' + esc(f.un || 'ud') : '';
      const isChecked = !!state.chk[name];
      return '<label class="it ' + (isChecked ? 'd' : '') + '">' +
        '<input type="checkbox" data-k="' + esc(name) + '" ' + (isChecked ? 'checked' : '') + '>' +
        '<span>' + esc(name) + '</span>' +
        '<em>' + formatQty(totals[name]) + unitInfo + '</em>' +
      '</label>';
    }).join('')
  ).join('');
}

function renderDishes() {
  const dishes = getAllDishes();
  const foods = getAllFoods();

  $('#dl').innerHTML = ['comida', 'cena'].map(type => 
    '<h4 style="margin:12px 0 6px;text-transform:capitalize;color:var(--ac)">' + type + 's</h4>' +
    dishes.filter(d => d.t === type).map(d => 
      '<div class="card">' +
        '<h3>' +
          esc(d.n) +
          '<span style="display:flex;gap:4px">' +
            '<button class="btn s" data-ed="' + esc(d.n) + '" aria-label="Editar" style="padding:4px 8px">✏️</button>' +
            '<button class="btn r" data-del="' + esc(d.n) + '" aria-label="Eliminar" style="padding:4px 8px">✕</button>' +
          '</span>' +
        '</h3>' +
        '<p class="mm">' + formatNutrientSummary(calcNutrients(d.i, foods)) + '</p>' +
        '<p class="mm" style="font-size:11px">' + d.i.map(([name, w]) => esc(name) + ' (' + w + 'g)').join(' · ') + '</p>' +
      '</div>'
    ).join('')
  ).join('');

  $('#cats').innerHTML = [...new Set(Object.values(foods).map(f => f.cat))].map(c => '<option value="' + esc(c) + '">').join('');
  $('#foods-dl').innerHTML = Object.keys(foods).sort().map(f => '<option value="' + esc(f) + '">').join('');
}

let editingDish = null;

function addRow(name = '', grams = '') {
  const container = document.createElement('div');
  container.className = 'row mt-1';
  container.innerHTML = 
    '<input list="foods-dl" class="ing-name" placeholder="Selecciona o escribe alimento" value="' + esc(name) + '">' +
    '<input class="w" type="number" step="1" placeholder="g" value="' + grams + '">' +
    '<button class="btn r x" aria-label="Quitar">✕</button>';
  $('#dr').appendChild(container);
  previewCurrentDish();
}

function previewCurrentDish() {
  const rows = $$('#dr .row').map(row => [
    row.querySelector('.ing-name').value.trim(),
    +row.querySelector('.w').value || 0
  ]).filter(([n, w]) => n && w > 0);

  const nutrients = calcNutrients(rows, getAllFoods());
  $('#dp').textContent = formatNutrientSummary(nutrients);
}

function syncSettingsInputs() {
  const mapping = [
    ['tk', 'k'], ['tp', 'p'], ['tg', 'g'], ['th', 'h'],
    ['tsat', 'gSat'], ['taz', 'az'], ['tfib', 'fib'], ['tm', 'm']
  ];
  mapping.forEach(([id, key]) => {
    const el = $('#' + id);
    if (el) el.value = state.t[key] ?? '';
  });
}

function renderAll() {
  renderWeek();
  renderShop();
  renderDishes();
}

function bindEvents() {
  $$('nav button').forEach(btn => {
    btn.onclick = () => {
      $$('nav button, .tab').forEach(el => el.classList.remove('on'));
      btn.classList.add('on');
      $('#' + btn.dataset.t).classList.add('on');
      window.scrollTo(0, 0);
    };
  });

  $('#wk').onchange = e => {
    const t = e.target;
    const d = t.dataset;
    if (d.e !== undefined) state.plan[d.e].e = t.checked;
    if (d.c !== undefined) state.plan[d.c].c = t.value;
    if (d.n !== undefined) state.plan[d.n].n = t.value;
    saveState();
    renderWeek();
    renderShop();
  };

  $('#rnd').onclick = () => {
    const dishes = getAllDishes();
    const pick = type => {
      const pool = dishes.filter(d => d.t === type);
      return pool[Math.floor(Math.random() * pool.length)]?.n || '';
    };
    state.plan.forEach(day => {
      day.c = pick('comida');
      day.n = pick('cena');
    });
    saveState();
    renderAll();
  };

  $('#clr').onclick = () => {
    state.plan.forEach(day => { day.c = ''; day.n = ''; });
    saveState();
    renderAll();
  };

  $('#shop').onchange = e => {
    state.chk[e.target.dataset.k] = e.target.checked;
    saveState();
    renderShop();
  };

  $('#un').onclick = () => {
    state.chk = {};
    saveState();
    renderShop();
  };

  $('#cp').onclick = () => {
    const foods = getAllFoods();
    const totals = {};
    state.plan.forEach(d => getDayItems(d).forEach(([name, g]) => totals[name] = (totals[name] || 0) + g));
    const lines = Object.keys(totals).sort().map(name => {
      const f = foods[name] || {};
      const u = f.u ? ' (≈ ' + (totals[name] / f.u).toFixed(1) + ' ' + f.un + ')' : '';
      return '- ' + name + ': ' + totals[name] + ' g' + u;
    });
    const text = 'LISTA DE LA COMPRA:\n\n' + lines.join('\n');
    navigator.clipboard?.writeText(text).then(() => alert('Lista copiada al portapapeles.'));
  };

  $('#ar').onclick = () => addRow();
  $('#dr').oninput = previewCurrentDish;
  $('#dr').onclick = e => {
    if (e.target.tagName === 'BUTTON') {
      e.target.closest('.row').remove();
      previewCurrentDish();
    }
  };

  $('#ds').onclick = () => {
    const name = $('#dn').value.trim();
    const rows = $$('#dr .row').map(row => [
      row.querySelector('.ing-name').value.trim(),
      +row.querySelector('.w').value || 0
    ]).filter(([n, w]) => n && w > 0);

    if (!name || !rows.length) return alert('Introduce un nombre y al menos un ingrediente válido.');

    if (editingDish && editingDish !== name) {
      state.dishes = state.dishes.filter(d => d.n !== editingDish);
      state.plan.forEach(d => {
        if (d.c === editingDish) d.c = name;
        if (d.n === editingDish) d.n = name;
      });
    }

    state.dishes = state.dishes.filter(d => d.n !== name);
    state.del = state.del.filter(x => x !== name);
    state.dishes.push({ n: name, t: $('#dt').value, i: rows });

    saveState();
    resetDishForm();
    renderAll();
  };

  $('#xc').onclick = resetDishForm;

  $('#dl').onclick = e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const name = btn.dataset.ed || btn.dataset.del;

    if (btn.dataset.del && confirm('¿Eliminar "' + name + '"?')) {
      state.dishes = state.dishes.filter(d => d.n !== name);
      if (!state.del.includes(name)) state.del.push(name);
      state.plan.forEach(d => {
        if (d.c === name) d.c = '';
        if (d.n === name) d.n = '';
      });
      saveState();
      renderAll();
    }

    if (btn.dataset.ed) {
      const dish = getAllDishes().find(d => d.n === name);
      if (!dish) return;
      editingDish = dish.n;
      $('#dn').value = dish.n;
      $('#dt').value = dish.t;
      $('#dr').innerHTML = '';
      dish.i.forEach(([n, w]) => addRow(n, w));
      $('#ds').textContent = 'Guardar cambios';
      $('#xc').style.display = 'inline-block';
      $('#ft').textContent = '✏️ Editar plato';
      $('#dish-form-card').scrollIntoView({ behavior: 'smooth' });
    }
  };

  $('#fs').onclick = () => {
    const name = $('#fn').value.trim();
    if (!name) return alert('Indica el nombre del alimento.');
    const num = id => +$('#' + id).value || 0;

    state.foods[name] = {
      cat: $('#fc').value.trim() || 'Otros',
      k: num('fk'),
      p: num('fp'),
      g: num('fg'),
      gSat: num('fsat'),
      h: num('fh'),
      az: num('faz'),
      fib: num('ffib'),
      u: num('fu'),
      un: $('#fx').value.trim()
    };

    saveState();
    ['fn', 'fc', 'fk', 'fp', 'fg', 'fsat', 'fh', 'faz', 'ffib', 'fu', 'fx'].forEach(id => $('#' + id).value = '');
    renderAll();
    alert('Alimento "' + name + '" guardado.');
  };

  const settingsMapping = [
    ['tk', 'k'], ['tp', 'p'], ['tg', 'g'], ['th', 'h'],
    ['tsat', 'gSat'], ['taz', 'az'], ['tfib', 'fib'], ['tm', 'm']
  ];
  settingsMapping.forEach(([id, key]) => {
    $('#' + id).oninput = e => {
      state.t[key] = +e.target.value || 0;
      saveState();
      renderWeek();
    };
  });

  $('#bd').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'menu-nutricional', v: 2, state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-nutricional-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  $('#bi').onclick = () => $('#bf').click();
  $('#bf').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        if (json.state) {
          Object.assign(state, json.state);
          saveState();
          syncSettingsInputs();
          renderAll();
          alert('Copia de seguridad restaurada correctamente.');
        }
      } catch (err) {
        alert('Archivo JSON no válido.');
      }
    };
    reader.readAsText(file);
  };

  $('#rs').onclick = () => {
    if (confirm('¿Restablecer y borrar todos los datos personalizados?')) {
      localStorage.clear();
      location.reload();
    }
  };
}

function resetDishForm() {
  editingDish = null;
  $('#dn').value = '';
  $('#dr').innerHTML = '';
  addRow();
  $('#ds').textContent = 'Guardar plato';
  $('#xc').style.display = 'none';
  $('#ft').textContent = '➕ Nuevo plato';
}

document.addEventListener('DOMContentLoaded', init);