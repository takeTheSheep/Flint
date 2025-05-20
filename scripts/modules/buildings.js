// buildings.js
/*
Модуль для работы со зданиями в игре.
Содержит классы и функции для создания, обновления и взаимодействия со зданиями.
Включает в себя логику сбора ресурсов, улучшения зданий и отображения информации о них.
Также содержит функции для управления ресурсами и буферами.
*/ 
import { formatNum } from './utils.js';
import { mouseX, mouseY, selected } from './events.js';
import { updateResourcesUI } from './ui.js';
import { openPiratesMenu, openBeastsMenu } from './unitCarousel.js';

export const resources = { gold: 0, wood: 0, stone: 0, cristal: 0 };
export const buffers = { gold: 0, wood: 0, stone: 0, cristal: 0 };

export class Building {
  constructor(x, y, { kind, type, img, imgClick }) {
    this.x = x; this.y = y; this.w = 192; this.h = 192;
    this.kind = kind; this.type = type;
    this.level = 1;
    this.img = new Image(); this.img.src = img;
    this.imgClick = new Image(); this.imgClick.src = imgClick;
    this.buffer = 0;
    this.collectInterval = type === 'cristal' ? 120000 : 5000;
    this.lastCollect = Date.now();
    this.upgrading = false; this.upgradeStart = 0; this.upgradeDuration = 0;
    
  }
getAvailablePirates() {
    return pirates.filter(pirate => pirate.unlockLevel <= this.level);
  }
  

  contains(mx, my) {
    return mx >= this.x && mx <= this.x + this.w &&
           my >= this.y && my <= this.y + this.h;
  }

  getHarvestAmount() {
    if (this.type === 'cristal') {
      if (this.level <= 2) return this.level;
      return 2 + 3 * (this.level - 2);
    }
    const lvl = this.level;
    if (this.type === 'gold') {
      const step = (2500 - 200) / 9;
      return Math.floor(2000 + (lvl - 1) * step);
    }
    if (this.type === 'wood') {
      const step = (2000 - 150) / 9;
      return Math.floor(2000 + (lvl - 1) * step);
    }
    if (this.type === 'stone') {
      const step = (1500 - 100) / 9;
      return Math.floor(2000 + (lvl - 1) * step);
    }
    return 0;
  }

  getBufferLimit() {
    if (this.type === 'cristal') {
      return 50 + (this.level - 1) * 10;
    }
    return Math.floor(2000 * Math.pow(50, (this.level - 1) / 9));
  }

  capacity() {
    if (this.type === 'cristal') {
      return 50 * this.level;
    }
    return Math.floor(10000 * Math.pow(1e6, (this.level - 1) / 9));
  }

  getUpgradeCost() {
    const lvl = this.level;
    if (this.kind === 'tavern' || this.kind === 'beast_tavern') {
      if (lvl >= 10) return { gold: 0, wood: 0, stone: 0, cristal: 0 }; // Максимальный уровень
      const baseCost = 10000;
      const multiplier = lvl === 1 ? 1 : Math.pow(2, lvl - 1);
      const cost = baseCost * multiplier;
      return { gold: cost, wood: cost, stone: cost, cristal: 0 };
    }

    const base = Math.pow(lvl, 3) * 1000;
    const g = Math.floor(base), w = Math.floor(base * 0.9), s = Math.floor(base * 0.5);
    let goldC = 0, woodC = 0, stoneC = 0, cristalC = 0;
    if (this.kind === 'mine') {
      if (this.type === 'stone') {
        goldC = Math.floor(g * 1.5); woodC = Math.floor(w * 1.5); stoneC = Math.floor(s * 1.5);
      } else if (this.type === 'cristal') {
        goldC = g * 2; woodC = w * 2; stoneC = s * 2;
        cristalC = Math.floor(10 * Math.pow(2.5, lvl - 1));
      } else {
        goldC = g; woodC = w; stoneC = s;
      }
    } else if (this.kind === 'storage') {
      if (this.type === 'stone') {
        goldC = Math.floor(g * 2.5); woodC = Math.floor(w * 2.5); stoneC = Math.floor(s * 2.5);
      } else if (this.type === 'cristal') {
        goldC = g * 3; woodC = w * 3; stoneC = s * 3;
        cristalC = Math.floor(20 * Math.pow(2.5, lvl - 1));
      } else {
        goldC = g * 2; woodC = w * 2; stoneC = s * 2;
      }
    }
    return { gold: goldC, wood: woodC, stone: stoneC, cristal: cristalC };
  }

  collect() {
    resources[this.type] = Math.min(resources[this.type] + this.buffer,
      storageMap[this.type].capacity());
    this.buffer = 0;
    buffers[this.type] = 0;
  }

  /**
   * Пытается запустить апгрейд.
   * @returns {boolean} true — если апгрейд стартовал, false — если не хватило ресурсов.
   */
  startUpgrade() {
    const cost = this.getUpgradeCost();
    const missing = [];
    ['gold', 'wood', 'stone', 'cristal'].forEach(r => {
      if (resources[r] < cost[r]) missing.push(`${cost[r] - resources[r]} ${r}`);
    });
    if (missing.length) {
      alert('Не хватает: ' + missing.join(', '));
      return false;
    }
    // ресурсы достаточно — списываем и запускаем апгрейд
    ['gold', 'wood', 'stone', 'cristal'].forEach(r => resources[r] -= cost[r]);
    updateResourcesUI();
    this.upgrading = true;
    this.upgradeStart = Date.now();
    const menuProgress = document.getElementById('menu-progress');
    if (menuProgress) menuProgress.style.removeProperty('display');
    const durations = [1, 15, 30, 60, 90, 120, 180, 240, 300];
    this.upgradeDuration = durations[this.level - 1] * 60000;
    return true;
  }

  finishUpgrade() {
  if (this.level < 10) this.level++;
  this.upgrading = false;

  // Если в этот момент открыто меню этого здания —
  // обновляем все элементы сразу и, для таверны, перестраиваем карусель пиратов.
  if (selected === this) {
    // 1) Текст уровня
    const levelEl = document.getElementById('menu-level');
    if (levelEl) levelEl.textContent = `Уровень: ${this.level}`;

    // 2) Скрыть полосу прогресса через класс .hidden
    const menuProgress = document.getElementById('menu-progress');
    if (menuProgress) menuProgress.classList.add('hidden');

    // 3) Скрыть кнопку «Ускорить» обычным display
    const speedupBtn = document.getElementById('speedup-btn');
    if (speedupBtn) speedupBtn.style.display = 'none';

    // 4) Особенность таверны: сразу перестроить список пиратов
    if (this.kind === 'tavern') {
  openPiratesMenu(this.level);
  } else if (this.kind === 'beast_tavern') {
  
  // сразу перестраиваем список животных
    openBeastsMenu(this.level);
}
  }

  // Обновляем «буфер» или «хранение» как было у вас
  const bufferEl = document.getElementById('menu-buffer');
  if (bufferEl) {
    if (this.kind === 'storage') {
      bufferEl.textContent = `Хранение: ${formatNum(resources[this.type])} / ${formatNum(this.capacity())}`;
    } else if (this.kind === 'mine') {
      bufferEl.textContent = `Буфер: ${formatNum(this.buffer)} / ${formatNum(this.getBufferLimit())}`;
    }
  }
}

  update() {
    const now = Date.now();
    if (this.kind === 'mine') {
      const diff = now - this.lastCollect;
      const ticks = Math.floor(diff / this.collectInterval);
      if (ticks > 0) {
        const amt = this.getHarvestAmount();
        this.buffer = Math.min(this.buffer + ticks * amt, this.getBufferLimit());
        buffers[this.type] = this.buffer;
        this.lastCollect += ticks * this.collectInterval;
      }
      // Обновляем отображение буфера в реальном времени
    if (selected === this) {
      const bufferEl = document.getElementById('menu-buffer');
      if (bufferEl) {
        bufferEl.textContent = `Буфер: ${formatNum(this.buffer)} / ${formatNum(this.getBufferLimit())}`;
      }
    } 
    

    // Обновляем шкалу заполнения ресурсов
    if (selected === this) {
      const harvestBar = document.getElementById('menu-harvest-bar');
      const progressText = document.querySelector('#menu-harvest-progress .progress-text');
      const timeLeft = this.collectInterval - (now - this.lastCollect);
      const harvestProgress = ((this.collectInterval - timeLeft) / this.collectInterval) * 100;

      if (harvestBar) {
        harvestBar.style.width = `${Math.min(harvestProgress, 100)}%`;
        harvestBar.style.transition = 'width 0.3s ease';
      }

      

     if (progressText) {
  progressText.textContent = `${Math.floor(this.getHarvestAmount())} / ${Math.ceil(timeLeft / 1000)}с`;
}
    }
  
  
  
    }
    if (this.upgrading) {
      const prog = (Date.now() - this.upgradeStart) / this.upgradeDuration;

      if (selected === this) {
      // Обновляем шкалу уровня в реальном времени
      const pbar = document.getElementById('menu-progress-bar');
      pbar.style.width = `${Math.min(Math.floor(prog * 100), 100)}%`;
      pbar.textContent = `${Math.min(Math.floor(prog * 100), 100)}%`;
    }
      if (prog >= 1) this.finishUpgrade();
    }
  }

  draw(ctx, mx, my) {
    const hover = this.contains(mx,my);
    const img = hover ? this.imgClick : this.img;
    ctx.drawImage(img,this.x,this.y,this.w,this.h);
  }
}

export const buildings = [];
['gold','wood','stone','cristal'].forEach((type,i) => {
  buildings.push(new Building(50+i*250,400,{
    kind:'mine',type,
    img:`assets/images/objects/mine_${type}.png`,
    imgClick:`assets/images/objects/mine_${type}_click.png`
  }));
  buildings.push(new Building(50+i*250,100,{
    kind:'storage',type,
    img:`assets/images/objects/${type}Storage.png`,
    imgClick:`assets/images/objects/${type}Storage_click.png`
  }));
});
buildings.push(new Building(50,250,{kind:'tavern',type:'tavern',
  img:'assets/images/objects/tavern.png',imgClick:'assets/images/objects/tavern_click.png'}));
buildings.push(new Building(300,250,{kind:'beast_tavern',type:'beast_tavern',
  img:'assets/images/objects/beast_tavern.png',imgClick:'assets/images/objects/beast_tavern_click.png'}));

export const storageMap = {};
buildings.filter(b=>b.kind==='storage').forEach(b=>storageMap[b.type] = b);
