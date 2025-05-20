// modules/tavernMenu.js
// Вынесенная логика отображения меню таверны и карусели юнитов

import {
  openPiratesMenu,
  openBeastsMenu,
  closePiratesMenu
} from './unitCarousel.js';

/**
 * Показывает или прячет карусель в зависимости от типа здания.
 * Ожидает, что в HTML есть элемент с id="pirates-carousel".
 * @param {Object} b - объект здания с полями kind и level
 */
export function handleTavernMenu(b) {
  const carousel = document.getElementById('pirates-carousel');
  const collectBtn  = document.getElementById('collect-btn');
  const upgradeBtn  = document.getElementById('upgrade-btn');
  const speedupBtn  = document.getElementById('speedup-btn');

  // Сначала сбросим состояние меню на «чистое»
  collectBtn.style.display  = 'none';
  upgradeBtn.style.display  = 'none';
  speedupBtn.style.display  = 'none';
  carousel.classList.add('hidden');
  closePiratesMenu();
  if (b.kind === 'tavern') {
    carousel.classList.remove('hidden');
    openPiratesMenu(b.level);
    // для таверны всегда только «Улучшить» и цена
    upgradeBtn.style.display = 'inline-block';
  } else if (b.kind === 'beast_tavern') {
    carousel.classList.remove('hidden');
    openBeastsMenu(b.level);
    upgradeBtn.style.display = 'inline-block';
  } else {
    carousel.classList.add('hidden');
    closePiratesMenu();
  }
}
