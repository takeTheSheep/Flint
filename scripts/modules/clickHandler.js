// modules/clickHandler.js
// Обработчик левого клика по канвасу

import { canvas } from './canvas.js';

/**
 * Инициализирует обработчик левого клика по канвасу.
 * @param {Function} callback - функция-обработчик события click.
 */
export function initClickHandler(callback) {
  canvas.addEventListener('click', callback);
}