// modules/dragAndDrop.js
// Модуль для управления режимом перетаскивания зданий

/**
 * Состояние перетаскивания
 */
export let moving = false;
export let moveTarget = null;

/**
 * Начать перетаскивание выбранного здания
 * @param {Building} target
 */
export function startDrag(target) {
  moving = true;
  moveTarget = target;
}

/**
 * Обновить координаты при перетаскивании
 * @param {number} x - позиция курсора внутри канваса по X
 * @param {number} y - позиция курсора внутри канваса по Y
 */
export function updateDrag(x, y) {
  if (moving && moveTarget) {
    moveTarget.x = x - moveTarget.w / 2;
    moveTarget.y = y - moveTarget.h / 2;
  }
}

/**
 * Завершить перетаскивание: открыть меню для перемещённого здания
 * и скрыть кнопку перемещения. Возвращает true, если перетаскивание завершено.
 * @param {function} openMenuFn - функция открытия меню здания
 * @param {HTMLElement} moveBtn - кнопка "Переместить"
 */
export function endDrag(openMenuFn, moveBtn) {
  if (moving && moveTarget) {
    moving = false;
    openMenuFn(moveTarget);
    moveBtn.style.display = 'none';
    moveTarget = null;
    return true;
  }
  return false;
}
