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

      if (selected && selected.upgrading) {
        const now = Date.now();
        const prog = (now - selected.upgradeStart) / selected.upgradeDuration;
        const menuProgress = document.getElementById('menu-progress');
        const pbar = document.getElementById('menu-progress-bar');
        const speedupBtn = document.getElementById('speedup-btn');

        // Show upgrade progress bar
        if (menuProgress) {
          menuProgress.classList.remove('hidden');
          pbar.style.width = `${Math.min(Math.floor(prog * 100), 100)}%`;
          pbar.textContent = `${Math.min(Math.floor(prog * 100), 100)}%`;
        }

        // Show speedup button
        if (speedupBtn) {
          const rem = selected.upgradeDuration - (now - selected.upgradeStart);
          const cost = Math.ceil(rem / 60000 / 6);
          speedupBtn.style.display = 'inline-block';
          speedupBtn.innerHTML = `Ускорить (<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${cost})`;
        }

        // If complete, finish upgrade
        if (prog >= 1) {
          selected.finishUpgrade();
          if (menuProgress) menuProgress.classList.add('hidden');
          if (speedupBtn) speedupBtn.style.display = 'none';
        }
      }

      requestAnimationFrame(loop);
    })();
  };
}
