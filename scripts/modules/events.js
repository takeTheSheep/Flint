// events.js
import { canvas } from './canvas.js';
import { buildings, resources } from './buildings.js';
import {
  openMenu, closeMenu,
  updateResourcesUI,
  collectBtn, upgradeBtn, speedupBtn, moveBtn, tooltip
} from './ui.js';
import { names, storageNames } from './utils.js';

export let mouseX = 0, mouseY = 0, selected = null, moving = false;

export function initEvents() {
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    const hit = buildings.find(b => b.contains(mouseX, mouseY));
    if (hit) {
      selected = hit;
      openMenu(hit);
      moveBtn.style.display = 'inline-block';
      collectBtn.style.display = 'none';
      upgradeBtn.style.display = 'none';
      speedupBtn.style.display = 'none';
    }
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    if (moving && selected) {
      selected.x = mouseX - selected.w/2;
      selected.y = mouseY - selected.h/2;
    }
    const hit = buildings.find(b => b.contains(mouseX, mouseY));
    if (hit) {
      tooltip.textContent = hit.kind === 'storage' ? storageNames[hit.type] : names[hit.type];
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = 'block';
      canvas.style.cursor = moving ? 'move' : 'pointer';
    } else {
      tooltip.style.display = 'none';
      canvas.style.cursor = moving ? 'move' : 'default';
    }
  });

  canvas.addEventListener('click', () => {
    if (moving && selected) {
      moving = false;
      openMenu(selected);
      moveBtn.style.display = 'none';
      return;
    }
    const hit = buildings.find(b => b.contains(mouseX, mouseY));
    if (hit) {
      selected = hit;
      openMenu(hit);
    } else {
      selected = null;
      closeMenu();
    }
  });

  collectBtn.addEventListener('click', () => {
    if (selected?.kind === 'mine') {
      selected.collect();
      updateResourcesUI();
      openMenu(selected);
    }
  });
  upgradeBtn.addEventListener('click', () => {
    if (selected) selected.startUpgrade();
  });
  speedupBtn.addEventListener('click', () => {
    if (!selected?.upgrading) return;
    const now = Date.now();
    const remMs = selected.upgradeDuration - (now - selected.upgradeStart);
    if (remMs <= 0) return;
    const remMin = remMs / 60000;
    const cost = Math.ceil(remMin / 6);
    if (resources.cristal < cost) {
      alert(`Нужно ${cost} кристаллов`);
      return;
    }
    resources.cristal -= cost;
    updateResourcesUI();
    selected.finishUpgrade();
  });
  moveBtn.addEventListener('click', () => {
    moving = true;
    closeMenu();
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}
