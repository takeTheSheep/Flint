// modules/pointerController.js
// Обработчик движения указателя: перемещение и тултип

import { canvas } from './canvas.js';
import { buildings } from './buildings.js';
import { getCanvasCoords, getBuildingAt } from './hitDetection.js';
import { updateDrag, moving } from './dragAndDrop.js';
import { showTooltip, hideTooltip } from './tooltipController.js';
import { names, storageNames } from './utils.js';

/**
 * Инициализирует обработчики движения мыши и ухода курсора с канваса.
 * @param {function(number):void} setMouseX - функция для обновления mouseX
 * @param {function(number):void} setMouseY - функция для обновления mouseY
 */
export function initPointerController(setMouseX, setMouseY) {
  canvas.addEventListener('mousemove', e => {
    const { x, y } = getCanvasCoords(e, canvas);
    setMouseX(x);
    setMouseY(y);
    updateDrag(x, y);

    const hit = getBuildingAt(x, y, buildings);
    if (hit) {
      const text = hit.kind === 'storage'
        ? storageNames[hit.type]
        : names[hit.type];
      showTooltip(text, e.pageX, e.pageY);
      canvas.style.cursor = moving ? 'move' : 'pointer';
    } else {
      hideTooltip();
      canvas.style.cursor = moving ? 'move' : 'default';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hideTooltip();
    canvas.style.cursor = moving ? 'move' : 'default';
  });
}
