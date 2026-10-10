import { state, loadState, saveState, getAllFoods, getAllDishes } from './state.js';
import { calcNutrients, formatNutrientSummary } from './nutrition.js';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const r = n => Math.round(n || 0);
const esc = s => (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

export function getDayItems(d) {
  if (d.customItems && d.customItems.length) return d.customItems;
  let it = [];
  const dishes = getAllDishes();
  ['b', 'a', 'c', 'm', 'n'].forEach(key => {
    const val = d[key];
    if (val && val !== '#fuera') {
      const dish = dishes.find(x => x.n === val);
      if (dish && dish.i) it = it.concat(dish.i);
    }
  });
  return it;
}

function evaluateTolerance(val, target, isMaxCap) {
  const margin = (state.t.m || 5) / 100;
  if (isMaxCap) return val > target * (1 + margin) ? 'bd' : val > target ? 'wa' : 'ok';
  const err = Math.abs(val - target) / (target || 1);
  return err <= margin ? 'ok' : err <= 2 * margin ? 'wa' : 'bd';
}

function renderChips(nut, daysCount = 1) {
  const T = state.t;
  const target = k => T[k] * daysCount;

  return '<div class="macro-chips">' +
    '<span class="chip ' + evaluateTolerance(nut.k, target('k')) + '">⚡ ' + r(nut.k) + ' / ' + r(target('k')) + ' kcal</span>' +
    '<span class="chip ' + evaluateTolerance(nut.p, target('p')) + '">🥩 ' + r(nut.p) + ' / ' + r(target('p')) + 'g P</span>' +
    '<span class="chip ' + evaluateTolerance(nut.g, target('g')) + '">🥑 ' + r(nut.g) + ' / ' + r(target('g')) + 'g G</span>' +
    '<span class="chip ' + evaluateTolerance(nut.h, target('h')) + '">🍞 ' + r(nut.h) + ' / ' + r(target('h')) + 'g H</span>' +
    '<span class="chip ' + evaluateTolerance(nut.gSat, target('gSat'), true) + '">🧈 Sat: ' + r(nut.gSat) + ' / ' + r(target('gSat')) + 'g</span>' +
    '<span class="chip ' + evaluateTolerance(nut.az, target('az'), true) + '">🍬 Az: ' + r(nut.az) + ' / ' + r(target('az')) + 'g</span>' +
    '<span class="chip ' + (nut.fib < target('fib') ? 'bd' : 'ok') + '">🌾 Fib: ' + r(nut.fib) + ' / ' + r(target('fib')) + 'g</span>' +
  '</div>';
}

function renderWeek() {
  const dishes = getAllDishes();
  const foods = getAllFoods();

  $('#wk').innerHTML = state.plan.map((d, i) => {
    const tot = calcNutrients(getDayItems(d), foods);
    const getItemsFor = key => (d.customMeals && d.customMeals[key]) || (dishes.find(x => x.n === d[key])?.i || []);

    const dishOptions = (type, current) => 
      '<option value="">— Elegir ' + type + ' —</option>' +
      '<option value="#fuera" ' + (current === '#fuera' ? 'selected' : '') + '>🍴 Fuera de casa</option>' +
      dishes.filter(x => x.t === type).map(x => '<option value="' + esc(x.n) + '" ' + (x.n === current ? 'selected' : '') + '>' + esc(x.n) + '</option>').join('');

    const mealRow = (label, type, key) => {
      const current = d[key];
      const items = getItemsFor(key);
      const summary = current === '#fuera' ? 'Fuera de casa' : current ? formatNutrientSummary(calcNutrients(items, foods)) : 'Sin asignar';
      return '<label for="' + type + '-' + i + '">' + label + '</label>' +
             '<select id="' + type + '-' + i + '" data-' + key + '="' + i + '">' + dishOptions(type, current) + '</select>' +
             '<p class="mm">' + summary + '</p>';
    };

    const adjustedBadge = d.customItems ? '<span style="font-size:11px;background:var(--ok);color:white;padding:2px 6px;border-radius:4px;margin-left:6px">Ajustado</span>' : '';

    return '<div class="card">' +
      '<h3>' +
        '<span>' + DAYS[i] + adjustedBadge + '</span>' +
        '<label style="display:inline-flex;gap:4px;align-items:center;cursor:pointer;">' +
          '<input type="checkbox" data-e="' + i + '" ' + (d.e ? 'checked' : '') + ' style="width:auto;margin:0"> Entreno' +
        '</label>' +
      '</h3>' +
      mealRow('🥞 Desayuno', 'desayuno', 'b') +
      mealRow('🥪 Almuerzo (Media Mañana)', 'almuerzo', 'a') +
      mealRow('🍲 Comida', 'comida', 'c') +
      mealRow('🍎 Merienda (Tarde)', 'merienda', 'm') +
      mealRow('🥗 Cena', 'cena', 'n') +
      renderChips(tot, 1) +
    '</div>';
  }).join('');

  const weeklyTotals = state.plan.reduce((acc, d) => {
    const dayNuts = calcNutrients(getDayItems(d), foods);
    for (const k in acc) acc[k] += dayNuts[k];
    return acc;
  }, { k: 0, p: 0, g: 0, h: 0, gSat: 0, az: 0, fib: 0 });

  $('#wk-sum').innerHTML = '<h3>Resumen Semanal Nutricional</h3>' +
    '<p class="mm">Media diaria (7 días)</p>' +
    renderChips({
      k: weeklyTotals.k / 7,
      p: weeklyTotals.p / 7,
      g: weeklyTotals.g / 7,
      h: weeklyTotals.h / 7,
      gSat: weeklyTotals.gSat / 7,
      az: weeklyTotals.az / 7,
      fib: weeklyTotals.fib / 7
    }, 1) +
    '<p class="mm" style="margin-top:10px">Total acumulado 7 días</p>' +
    renderChips(weeklyTotals, 7);
}

export function adjustPortionsToTargets(notify = true) {
  const dishes = getAllDishes();
  const foods = getAllFoods();
  const T = state.t;

  let adjustedCount = 0;

  state.plan.forEach(day => {
    const mealKeys = ['b', 'a', 'c', 'm', 'n'];
    let allMealItems = [];

    mealKeys.forEach(mKey => {
      const val = day[mKey];
      if (val && val !== '#fuera') {
        const dish = dishes.find(x => x.n === val);
        if (dish && dish.i) {
          dish.i.forEach(([n, w]) => {
            allMealItems.push({ n, w: Number(w), m: mKey });
          });
        }
      }
    });

    if (!allMealItems.length) {
      day.customMeals = null;
      day.customItems = null;
      return;
    }

    const protItems = [];
    const carbItems = [];
    const fatItems = [];

    allMealItems.forEach(item => {
      const f = foods[item.n];
      if (!f) return;
      if (item.n.includes('Aceite') || (f.g >= 20 && f.g > f.p && f.g > f.h)) {
        fatItems.push(item);
      } else if (f.p >= 12 && f.p >= f.h) {
        protItems.push(item);
      } else if (f.h >= 14 && f.h > f.p) {
        carbItems.push(item);
      }
    });

    for (let step = 0; step < 20; step++) {
      const currentList = allMealItems.map(x => [x.n, x.w]);
      const cur = calcNutrients(currentList, foods);

      const diffP = T.p - cur.p;
      const diffH = T.h - cur.h;
      const diffG = T.g - cur.g;

      if (protItems.length && Math.abs(diffP) > 0.4) {
        const deltaEach = (diffP / protItems.length) / 0.22;
        protItems.forEach(item => {
          item.w = Math.max(15, Math.min(500, item.w + deltaEach * 0.7));
        });
      }

      if (carbItems.length && Math.abs(diffH) > 0.4) {
        const deltaEach = (diffH / carbItems.length) / 0.65;
        carbItems.forEach(item => {
          item.w = Math.max(10, Math.min(300, item.w + deltaEach * 0.7));
        });
      }

      if (fatItems.length && Math.abs(diffG) > 0.4) {
        const deltaEach = (diffG / fatItems.length) / 1.0;
        fatItems.forEach(item => {
          item.w = Math.max(2, Math.min(50, item.w + deltaEach * 0.7));
        });
      }
    }

    allMealItems.forEach(item => { item.w = Math.round(item.w); });

    const filterM = k => allMealItems.filter(x => x.m === k).map(x => [x.n, x.w]);
    day.customMeals = {
      b: filterM('b'),
      a: filterM('a'),
      c: filterM('c'),
      m: filterM('m'),
      n: filterM('n')
    };
    day.customItems = allMealItems.map(x => [x.n, x.w]);
    adjustedCount++;
  });

  saveState();
  renderAll();

  if (notify) {
    if (adjustedCount > 0) alert('✅ Las raciones de las 5 comidas se han ajustado exactamente a tus objetivos.');
    else alert('ℹ️ Selecciona primero los platos en los días de la semana.');
  }
}

function renderMenuModal() {
  const content = $('#menu-modal-content');
  const formatList = items => (items && items.length) 
    ? items.map(([n, w]) => '<li>' + esc(n) + ': <b>' + r(w) + ' g</b></li>').join('') 
    : '<li>Sin datos</li>';

  const dishes = getAllDishes();

  content.innerHTML = state.plan.map((d, i) => {
    const isTraining = d.e;
    const getItems = key => (d.customMeals && d.customMeals[key]) || (dishes.find(x => x.n === d[key])?.i || []);

    const block = (title, key) => {
      const val = d[key];
      const items = getItems(key);
      return '<div class="meal-block"><div class="meal-title">' + title + '</div><details class="dish-details" open><summary>' + esc(val === '#fuera' ? 'Fuera de casa' : val || 'Sin asignar') + '</summary><ul class="dish-ingredients">' + (val === '#fuera' ? '<li>Comida fuera de casa</li>' : formatList(items)) + '</ul></details></div>';
    };

    return '<div class="day-menu-card">' +
      '<h3>' + DAYS[i] + ' ' + (isTraining ? '⚡ (Entreno)' : '🛋️ (Descanso)') + '</h3>' +
      block('🥞 Desayuno', 'b') +
      block('🥪 Almuerzo (Media Mañana)', 'a') +
      block('🍲 Comida', 'c') +
      block('🍎 Merienda (Tarde)', 'm') +
      block('🥗 Cena', 'n') +
    '</div>';
  }).join('');
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
      const checked = state.chk[name] ? 'checked' : '';
      return '<div class="shop-item">' +
        '<input type="checkbox" data-s="' + esc(name) + '" ' + checked + ' id="chk-' + esc(name) + '">' +
        '<label for="chk-' + esc(name) + '" style="margin:0;cursor:pointer;flex:1">' + esc(name) + unitInfo + '</label>' +
        '<b>' + formatQty(totals[name]) + '</b>' +
      '</div>';
    }).join('')
  ).join('') || '<p class="mm">No hay ingredientes en el menú semanal.</p>';
}

let editingDishIndex = null;
function renderDishes() {
  const dishes = getAllDishes();
  const foods = getAllFoods();

  $('#dish-list').innerHTML = dishes.map((dish, idx) => {
    const isCustom = idx >= (dishes.length - state.dishes.length);
    const nuts = calcNutrients(dish.i, foods);

    return '<div class="card mb-2">' +
      '<div style="display:flex;justify-content:space-between;align-items:start">' +
        '<div>' +
          '<b>' + esc(dish.n) + '</b> <span class="badge">' + esc(dish.t) + '</span>' +
          '<p class="mm" style="margin:4px 0">' + formatNutrientSummary(nuts) + '</p>' +
          '<ul style="margin:4px 0 0;padding-left:18px;font-size:12px;color:var(--tx-m)">' +
            dish.i.map(([name, weight]) => '<li>' + esc(name) + ': ' + weight + 'g</li>').join('') +
          '</ul>' +
        '</div>' +
        '<div style="display:flex;gap:6px">' +
          (isCustom ? '<button class="btn s" data-ed="' + (idx - (dishes.length - state.dishes.length)) + '">Editar</button>' : '') +
          (isCustom ? '<button class="btn r x" data-dd="' + (idx - (dishes.length - state.dishes.length)) + '">✕</button>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderSettings() {
  $('#tk').value = state.t.k;
  $('#tp').value = state.t.p;
  $('#tg').value = state.t.g;
  $('#th').value = state.t.h;
  $('#tgs').value = state.t.gSat;
  $('#taz').value = state.t.az;
  $('#tfb').value = state.t.fib;
  $('#tm').value = state.t.m || 5;
}

function renderAll() {
  renderWeek();
  renderShop();
  renderDishes();
  renderSettings();
}

function setupEvents() {
  // Pestañas (corrige la navegación entre secciones usando .tab)
  $$('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.tab-btn').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
      $$('.tab').forEach(p => p.classList.remove('on'));
      btn.classList.add('on');
      btn.setAttribute('aria-selected', 'true');
      $('#t' + btn.dataset.t).classList.add('on');
    };
  });

  $('#open-menu-modal').onclick = () => { renderMenuModal(); $('#menu-modal').showModal(); };
  $('#close-menu-modal').onclick = () => $('#menu-modal').close();
  $('#close-menu-modal-btn').onclick = () => $('#menu-modal').close();

  // Actualización reactiva al cambiar cualquier comida
  $('#wk').addEventListener('change', e => {
    const t = e.target;
    const d = t.dataset;
    if (d.e !== undefined) state.plan[d.e].e = t.checked;
    if (d.b !== undefined) state.plan[d.b].b = t.value;
    if (d.a !== undefined) state.plan[d.a].a = t.value;
    if (d.c !== undefined) state.plan[d.c].c = t.value;
    if (d.m !== undefined) state.plan[d.m].m = t.value;
    if (d.n !== undefined) state.plan[d.n].n = t.value;
    adjustPortionsToTargets(false);
  });

  $('#btn-adjust').onclick = () => adjustPortionsToTargets(true);

  $('#clr').onclick = () => {
    if (confirm('¿Vaciar todos los platos de la semana?')) {
      state.plan.forEach(day => { 
        day.b = ''; day.a = ''; day.c = ''; day.m = ''; day.n = '';
        day.customMeals = null; day.customItems = null; 
      });
      saveState();
      renderAll();
    }
  };

  $('#shop').addEventListener('change', e => {
    if (e.target.dataset.s) {
      state.chk[e.target.dataset.s] = e.target.checked;
      saveState();
    }
  });

  $('#un').onclick = () => {
    state.chk = {};
    saveState();
    renderShop();
  };

  $('#cp').onclick = () => {
    const totals = {};
    state.plan.forEach(d => getDayItems(d).forEach(([name, g]) => totals[name] = (totals[name] || 0) + g));
    const lines = Object.keys(totals).sort().map(name => {
      const g = totals[name];
      const qty = g >= 1000 ? (g/1000).toFixed(2) + ' kg' : r(g) + ' g';
      return '- ' + name + ': ' + qty;
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => alert('Lista copiada al portapapeles.'));
  };

  ['tk', 'tp', 'tg', 'th', 'tgs', 'taz', 'tfb', 'tm'].forEach(id => {
    $('#' + id).onchange = () => {
      state.t.k = +$('#tk').value || 2100;
      state.t.p = +$('#tp').value || 230;
      state.t.g = +$('#tg').value || 70;
      state.t.h = +$('#th').value || 140;
      state.t.gSat = +$('#tgs').value || 22;
      state.t.az = +$('#taz').value || 35;
      state.t.fib = +$('#tfb').value || 30;
      state.t.m = +$('#tm').value || 5;
      adjustPortionsToTargets(false);
    };
  });

  $('#bd').onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-semanal-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  $('#bi').onclick = () => $('#fi').click();
  $('#fi').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.assign(state, data);
        saveState();
        renderAll();
        alert('Datos importados correctamente.');
      } catch (err) {
        alert('Archivo JSON no válido.');
      }
    };
    reader.readAsText(file);
  };

  $('#rs').onclick = () => {
    if (confirm('¿Restablecer datos por defecto?')) {
      localStorage.clear();
      location.reload();
    }
  };

  let ingRows = [];
  function renderIngRows() {
    const foods = getAllFoods();
    const foodOptions = Object.keys(foods).sort().map(f => '<option value="' + esc(f) + '">' + esc(f) + '</option>').join('');
    $('#ing-list').innerHTML = ingRows.map((row, idx) => 
      '<div style="display:flex;gap:8px;margin-bottom:6px;">' +
        '<select data-ii="' + idx + '" style="flex:2"><option value="">— Alimento —</option>' + foodOptions + '</select>' +
        '<input type="number" data-iw="' + idx + '" value="' + (row.w || '') + '" placeholder="Gramos" style="flex:1">' +
        '<button class="btn r x" data-ri="' + idx + '">✕</button>' +
      '</div>'
    ).join('');

    ingRows.forEach((row, idx) => {
      const sel = $('[data-ii="' + idx + '"]');
      if (sel) sel.value = row.n || '';
    });
  }

  $('#ar').onclick = () => {
    ingRows.push({ n: '', w: 100 });
    renderIngRows();
  };

  $('#ing-list').addEventListener('change', e => {
    if (e.target.dataset.ii !== undefined) ingRows[e.target.dataset.ii].n = e.target.value;
    if (e.target.dataset.iw !== undefined) ingRows[e.target.dataset.iw].w = +e.target.value;
  });

  $('#ing-list').addEventListener('click', e => {
    if (e.target.dataset.ri !== undefined) {
      ingRows.splice(e.target.dataset.ri, 1);
      renderIngRows();
    }
  });

  $('#ds').onclick = () => {
    const n = $('#dn').value.trim();
    const t = $('#dt').value;
    const items = ingRows.filter(r => r.n && r.w > 0).map(r => [r.n, r.w]);
    if (!n || !items.length) return alert('Indica un nombre y al menos un ingrediente.');

    if (editingDishIndex !== null) {
      state.dishes[editingDishIndex] = { n, t, i: items };
      editingDishIndex = null;
      $('#xc').style.display = 'none';
      $('#form-dish-title').textContent = 'Nuevo / Editar plato';
    } else {
      state.dishes.push({ n, t, i: items });
    }

    saveState();
    $('#dn').value = '';
    ingRows = [];
    renderIngRows();
    renderDishes();
    renderWeek();
  };

  $('#xc').onclick = () => {
    editingDishIndex = null;
    $('#dn').value = '';
    ingRows = [];
    renderIngRows();
    $('#xc').style.display = 'none';
    $('#form-dish-title').textContent = 'Nuevo / Editar plato';
  };

  $('#dish-list').addEventListener('click', e => {
    if (e.target.dataset.ed !== undefined) {
      editingDishIndex = +e.target.dataset.ed;
      const d = state.dishes[editingDishIndex];
      $('#dn').value = d.n;
      $('#dt').value = d.t;
      ingRows = d.i.map(([n, w]) => ({ n, w }));
      renderIngRows();
      $('#xc').style.display = 'inline-block';
      $('#form-dish-title').textContent = 'Editando plato: ' + d.n;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.target.dataset.dd !== undefined) {
      if (confirm('¿Eliminar este plato?')) {
        state.dishes.splice(+e.target.dataset.dd, 1);
        saveState();
        renderDishes();
        renderWeek();
      }
    }
  });

  $('#fs').onclick = () => {
    const n = $('#fn').value.trim();
    if (!n) return alert('Nombre obligatorio');
    state.foods[n] = {
      cat: $('#fc').value.trim() || 'Otros',
      k: +$('#fk').value || 0,
      p: +$('#fp').value || 0,
      g: +$('#fg').value || 0,
      gSat: +$('#fgs').value || 0,
      h: +$('#fh').value || 0,
      az: +$('#faz').value || 0,
      fib: +$('#ffb').value || 0,
      u: +$('#fu').value || 0,
      un: $('#fun').value.trim() || ''
    };
    saveState();
    alert('Alimento guardado');
    renderDishes();
  };
}

loadState();
renderAll();
setupEvents();
