// modules/resourcesUI.js
// Модуль для обновления отображения ресурсов в UI

import { formatNum } from './utils.js';
import { resources } from './buildings.js';

/**
 * Обновляет панель ресурсов в DOM.
 * Ожидается, что в index.html есть контейнер с id="resources".
 */
export function updateResourcesUI() {
  document.getElementById('gold').textContent    = formatNum(resources.gold);
  document.getElementById('wood').textContent    = formatNum(resources.wood);
  document.getElementById('stone').textContent   = formatNum(resources.stone);
  document.getElementById('cristal').textContent = formatNum(resources.cristal);
}
