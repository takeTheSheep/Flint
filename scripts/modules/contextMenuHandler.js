// modules/contextMenuHandler.js
// Обработчик правого клика по канвасу для открытия меню зданий

import { canvas } from './canvas.js';
import { buildings } from './buildings.js';
import { getCanvasCoords, getBuildingAt } from './hitDetection.js';

/**
 * Инициализирует обработчик правого клика по канвасу.
 * @param {(arg: { hit: Object, x: number, y: number }) => void} callback
 */
export function initContextMenu(callback) {
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e, canvas);
    const hit = getBuildingAt(x, y, buildings);
    callback({ hit, x, y });
  });
}