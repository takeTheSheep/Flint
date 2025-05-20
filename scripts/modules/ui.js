// Импортируем необходимые модули
// Импортируем функции и переменные из других модулей
//Модуль для работы с UI
import { tooltip } from './tooltip.js';
import { updateResourcesUI } from './resourcesUI.js';



import {
  initBuildingMenu,
  openMenu,
  closeMenu,
  collectBtn,
  upgradeBtn,
  speedupBtn,
  menu
} from './buildingMenu.js';

// DOM-элементы
export const moveBtn = (() => {
  const btn = document.createElement('button');
  btn.id = 'move-btn';
  btn.textContent = 'Переместить';
  btn.style.display = 'none';
  btn.classList.add('menu-button');
  menu.appendChild(btn);
  return btn;
})();


// Инициализация UI
export function initUI() {
   // Инициализируем обработчики меню зданий
  initBuildingMenu();
  // Обновляем ресурсы (остальное оставляем)
  updateResourcesUI();
}

 // Инициализация UI
 export {
  tooltip,
  openMenu,
  closeMenu,
  collectBtn,
  upgradeBtn,
  speedupBtn,
  updateResourcesUI,
  menu
};
