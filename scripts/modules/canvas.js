// canvas.js
import { buildings } from './buildings.js';
import { mouseX, mouseY, selected } from './events.js';

export let canvas, ctx;
const bg = new Image();

export function initCanvas(id) {
  canvas = document.getElementById(id);
  ctx = canvas.getContext('2d');
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  bg.src = 'assets/images/background/island.png';
}

export function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

export function startLoop() {
  bg.onload = () => {
    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      buildings.forEach(b => b.draw(ctx, mouseX, mouseY, selected));
      buildings.forEach(b => b.update());

      // Обновляем шкалу уровня в реальном времени, если меню открыто
      if (selected && selected.upgrading) {
        const now = Date.now();
        const prog = (now - selected.upgradeStart) / selected.upgradeDuration;
        const pbar = document.getElementById('menu-progress-bar');
        const menuProgress = document.getElementById('menu-progress');

        if (menuProgress) {
          menuProgress.style.display = 'block';
          pbar.style.width = `${Math.min(Math.floor(prog * 100), 100)}%`;
          pbar.textContent = `${Math.min(Math.floor(prog * 100), 100)}%`;
        }

        // Скрываем шкалу и кнопку, если улучшение завершено
       if (prog >= 1) {
       selected.finishUpgrade();
      }

        // Обновляем кнопку "Ускорить"
        const speedupBtn = document.getElementById('speedup-btn');
        if (speedupBtn) {
          const rem = selected.upgradeDuration - (now - selected.upgradeStart);
          const cost = Math.ceil(rem / 60000 / 6); // Стоимость ускорения
          speedupBtn.style.display = 'inline-block';
          speedupBtn.innerHTML = `Ускорить (<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${cost})`;

          // Скрываем кнопку и шкалу, если улучшение завершено
          if (prog >= 1) {
            menuProgress.style.display = 'none';
            speedupBtn.style.display = 'none';
          }
        }
      }

      requestAnimationFrame(loop);
    })();
  };
}
