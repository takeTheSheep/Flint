// main.js
import { initCanvas, startLoop } from './modules/canvas.js';
import { initUI } from './modules/ui.js';
import { initEvents } from './modules/events.js';

document.addEventListener('DOMContentLoaded', () => {
  initCanvas('gameCanvas');
  initUI();
  initEvents();
  startLoop();
});
