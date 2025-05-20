// modules/hitDetection.js
// modules/hitDetection.js
// Утилиты для определения позиции мыши на канвасе и попадания по зданиям

/**
 * Преобразует координаты события мыши в координаты внутри канваса.
 * @param {MouseEvent} e
 * @param {HTMLCanvasElement} canvas
 * @returns {{x: number, y: number}}
 */
export function getCanvasCoords(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/**
 * Ищет здание, содержащее точку (x, y).
 * @param {number} x
 * @param {number} y
 * @param {Array<Building>} buildings
 * @returns {Building|undefined}
 */
export function getBuildingAt(x, y, buildings) {
  return buildings.find(b => b.contains(x, y));
}