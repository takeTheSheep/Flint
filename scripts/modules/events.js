// scripts/modules/events.js
// Модуль для обработки событий в игре
// Этот модуль содержит функции для обработки событий мыши и взаимодействия с элементами на канвасе.
// Он также управляет состоянием выбранного здания и перемещения юнитов.
// Импортируем необходимые модули и функции
// из модуля «точки входа» main.js
import { buildings} from './buildings.js';
// из модуля «точки входа» ui.js
import {
  openMenu,
  closeMenu,
  collectBtn,
  upgradeBtn,
  speedupBtn,
  moveBtn
} from './ui.js';
// из модуля карусели
import {
  openPiratesMenu,
  openBeastsMenu,
  closePiratesMenu
} from './unitCarousel.js';
import { getBuildingAt } from './hitDetection.js';
import { endDrag} from './dragAndDrop.js';
import { initContextMenu } from './contextMenuHandler.js';
import { initClickHandler } from './clickHandler.js';
import { initPointerController } from './pointerController.js';



export let mouseX = 0, mouseY = 0, selected = null;






export function resetSelected() {
  selected = null; // Сбрасываем состояние
}

export function initEvents() {

 initContextMenu(({ hit, x, y }) => {
  if (!hit) return;
  selected = hit;
  openMenu(hit);

  // 1) Прячем всю логику таверны (детали и список пиратов)
  closePiratesMenu();
  const carousel = document.getElementById('pirates-carousel');
  if (carousel) carousel.classList.add('hidden');

  // 2) Прячем все поля меню «building-menu», кроме кнопки «Переместить»
  document.getElementById('menu-buffer')         .classList.add('hidden');
  document.getElementById('menu-cost')           .classList.add('hidden');
  document.getElementById('menu-progress')       .classList.add('hidden');
  document.getElementById('menu-harvest-progress').classList.add('hidden');
  collectBtn.style.display = 'none';
  upgradeBtn.style.display = 'none';
  speedupBtn.style.display = 'none';

  // 3) Показываем только кнопку «Переместить»
  moveBtn.style.display = 'inline-block';
});

// Обработчик левого клика: выбор или завершение перетаскивания
initClickHandler(() => {
  // Завершаем перетаскивание, если оно было
  if (endDrag(openMenu, moveBtn)) return;

  // Определяем, по какому зданию кликнули
  const hit = getBuildingAt(mouseX, mouseY, buildings);

  if (hit) {
    selected = hit;
    openMenu(hit);
    // при левом клике «Переместить» должно быть скрыто
    moveBtn.style.display = 'none';
  } else {
    selected = null;
    closeMenu();
  }

  // В зависимости от типа здания — показываем нужную карусель
  if (selected?.kind === 'tavern') {
    openPiratesMenu(selected.level);
  } else if (selected?.kind === 'beast_tavern') {
    openBeastsMenu(selected.level);
  } else {
    closePiratesMenu();
  }
});

// Обработчик движения указателя: перемещение и тултип
// Инициализируем обработчики движения мыши и ухода курсора с канваса
// Передаем функции для обновления координат мыши
initPointerController(
  x => { mouseX = x; },
  y => { mouseY = y; }
);
}
