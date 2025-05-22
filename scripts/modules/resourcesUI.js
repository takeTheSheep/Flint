// scripts/modules/resourcesUI.js
import { store }      from './store.js';
import { formatNum }  from './utils.js';

/** Ссылки на DOM-элементы */
const goldEl    = document.getElementById('gold');
const woodEl    = document.getElementById('wood');
const stoneEl   = document.getElementById('stone');
const cristalEl = document.getElementById('cristal');

/** Перерисовывает панель ресурсов из актуального store */
export function updateResourcesUI() {
  const { gold, wood, stone, cristal } = store.getState().resources;
  goldEl.textContent    = formatNum(gold);
  woodEl.textContent    = formatNum(wood);
  stoneEl.textContent   = formatNum(stone);
  cristalEl.textContent = formatNum(cristal);
}

// Подписываемся на любые изменения “resources” в store
store.subscribe('resources', updateResourcesUI);

// Делаем первую отрисовку сразу после импорта
updateResourcesUI();
