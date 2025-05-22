// buildings.js
/*
Модуль для работы со зданиями в игре.
Содержит классы и функции для создания, обновления и взаимодействия со зданиями.
Включает в себя логику сбора ресурсов, улучшения зданий и отображения информации о них.
Также содержит функции для управления ресурсами и буферами.
*/ 
import { formatNum } from './utils.js';
import { /* mouseX, mouseY, */ selected } from './events.js';
import { store } from './store.js';
import { openPiratesMenu, openBeastsMenu } from './unitCarousel.js';




export class Building {
  constructor(x, y, { kind, type, img, imgClick }) {
    // уникальный идентификатор по типу и назначению здания
    this.id = `${kind}_${type}`;
    this.x = x; this.y = y; this.w = 192; this.h = 192;
    this.kind = kind; this.type = type;
    this.level = 1;
    this.img = new Image(); this.img.src = img;
    this.imgClick = new Image(); this.imgClick.src = imgClick;
    this.buffer = 0;
    this.collectInterval = type === 'cristal' ? 120000 : 5000;
    this.lastCollect = Date.now();
    this.upgrading = false; this.upgradeStart = 0; this.upgradeDuration = 0;
    
// —————— Восстанавливаем или инициализируем запись в store ——————
   const persisted = store.getState().buildings[this.id];
   if (persisted) {
     // присваиваем только реально существующие поля
     if (persisted.level        != null) this.level        = persisted.level;
     if (persisted.buffer       != null) this.buffer       = persisted.buffer;
     if (persisted.lastCollect  != null) this.lastCollect  = persisted.lastCollect;
     if (persisted.upgrading    != null) this.upgrading    = persisted.upgrading;
     if (persisted.upgradeStart != null) this.upgradeStart = persisted.upgradeStart;
    if (persisted.upgradeDuration != null)
       this.upgradeDuration = persisted.upgradeDuration;
   } else {
     // первый раз — сохраняем дефолтное состояние
    store.updateBuilding(this.id, {
       level:        this.level,
       buffer:       this.buffer,
       lastCollect:  this.lastCollect,
       upgrading:    this.upgrading,
       upgradeStart: this.upgradeStart,
       upgradeDuration: this.upgradeDuration
     });
   }
  // Подписка на дальнейшие изменения из store
  store.subscribe('buildings', (newAll) => {
    const data = newAll[this.id];
    if (data) Object.assign(this, data);
  });

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
   const amount = this.buffer;
 // обнуляем буфер, но НЕ трогаем lastCollect
  this.buffer = 0;
  // сохраняем только буфер — таймер продолжается
  store.updateBuilding(this.id, {
    buffer: this.buffer
  });
  return { [this.type]: amount };
 }

  /**
   * Пытается запустить апгрейд.
   * @returns {boolean} true — если апгрейд стартовал, false — если не хватило ресурсов.
   */
 /**
 * Пытается запустить апгрейд здания через store.
 * @returns {boolean} true — если апгрейд начался, false — если не хватило ресурсов.
 */
startUpgrade() {
  const cost = this.getUpgradeCost();
  const missing = [];
  // Получаем текущие ресурсы из store
  const { resources } = store.getState();

  // Проверяем, хватает ли
  Object.entries(cost).forEach(([r, amt]) => {
    if ((resources[r] || 0) < amt) missing.push(`${amt - (resources[r]||0)} ${r}`);
  });
  if (missing.length) {
    alert('Не хватает: ' + missing.join(', '));
    return false;
  }

  // Списываем ресурсы через store
  Object.entries(cost).forEach(([r, amt]) =>
    store.updateResource(r, -amt)
  );

  // Запускаем апгрейд
  this.upgrading = true;
  this.upgradeStart = Date.now();
  const durations = [1, 15, 30, 60, 90, 120, 180, 240, 300];
  this.upgradeDuration = durations[this.level - 1] * 60000;

  // Обновляем состояние здания в store
  store.updateBuilding(this.id, {
    upgrading: this.upgrading,
    upgradeStart: this.upgradeStart,
    upgradeDuration: this.upgradeDuration,
    level: this.level,
    buffer: this.buffer,
    lastCollect: this.lastCollect
  });

  return true;
}

  /**
 * Завершает апгрейд здания: повышает уровень, обновляет UI и сохраняет состояние в store.
 */
finishUpgrade() {
  // 1) Обновляем логическое состояние
  if (this.level < 10) this.level++;
  this.upgrading = false;

  // 2) Сохраняем новое состояние здания в store
  store.updateBuilding(this.id, {
    level: this.level,
    upgrading: this.upgrading,
    buffer: this.buffer,
    lastCollect: this.lastCollect,
    upgradeStart: this.upgradeStart,
    upgradeDuration: this.upgradeDuration
  });

  // 3) Если меню этого здания сейчас открыто, обновляем интерфейс
  if (selected === this) {
    // Обновляем текст уровня
    const levelEl = document.getElementById('menu-level');
    if (levelEl) levelEl.textContent = `Уровень: ${this.level}`;

    // Скрываем индикатор прогресса
    const menuProgress = document.getElementById('menu-progress');
    if (menuProgress) menuProgress.classList.add('hidden');

    // Скрываем кнопку ускорения
    const speedupBtn = document.getElementById('speedup-btn');
    if (speedupBtn) speedupBtn.style.display = 'none';

    // Обновляем карусель для таверны или зверинца
    if (this.kind === 'tavern') {
      openPiratesMenu(this.level);
    } else if (this.kind === 'beast_tavern') {
      openBeastsMenu(this.level);
    }
  }

  // 4) Обновляем отображение буфера или хранилища
  const bufferEl = document.getElementById('menu-buffer');
  if (bufferEl) {
    const { resources } = store.getState();
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
 this.lastCollect += ticks * this.collectInterval;
 // Сохраняем буфер и время
 store.updateBuilding(this.id, {
   buffer:      this.buffer,
   lastCollect: this.lastCollect
 });
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
