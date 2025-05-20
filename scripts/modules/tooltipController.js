// modules/tooltipController.js
import { tooltip } from './tooltip.js';

/**
 * Показывает тултип с текстом и позиционирует рядом с курсором.
 * @param {string} text — содержимое тултипа
 * @param {number} pageX — глобальная координата X события
 * @param {number} pageY — глобальная координата Y события
 */
export function showTooltip(text, pageX, pageY) {
  tooltip.textContent = text;
  tooltip.style.left  = `${pageX + 10}px`;
  tooltip.style.top   = `${pageY + 10}px`;
  tooltip.classList.remove('hidden'); // теперь убираем класс hidden
}

/**
 * Скрывает тултип.
 */
export function hideTooltip() {
  tooltip.classList.add('hidden');    // и возвращаем его обратно
}