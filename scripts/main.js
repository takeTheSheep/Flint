// main.js
// Основной файл игры
// Этот файл отвечает за инициализацию игры, загрузку ресурсов и
// запуск игрового цикла. Он также содержит обработчики событий
// для взаимодействия с пользователем и обновления интерфейса.
import { initCanvas, startLoop } from './modules/canvas.js';
import { initUI } from './modules/ui.js';
import { initBuildingMenu }       from './modules/buildingMenu.js'; 
import { initEvents } from './modules/events.js';

document.addEventListener('DOMContentLoaded', () => {
  initCanvas('gameCanvas');
  initUI();
  initEvents();
  startLoop();
});
