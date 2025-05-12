// main.js

// Ждём полной загрузки DOM, чтобы все элементы страницы были доступны
document.addEventListener('DOMContentLoaded', () => {
  // ================================================
  //              ИНИЦИАЛИЗАЦИЯ CANVAS
  // ================================================
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  // Координаты мыши на canvas
  let mouseX = 0, mouseY = 0;
  // Текущее выбранное здание и флаг режима перемещения
  let selected = null;
  let moving   = false;

  // Функция подгоняет внутренние размеры canvas под CSS-ширину/высоту
  function resizeCanvas() {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  // Слушаем изменение окна, чтобы ресайзить canvas
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // ================================================
  //                 ЗАГРУЗКА ФОНА
  // ================================================
  const bg = new Image();
  bg.src = 'assets/images/island.png';

  // ================================================
  //               ХРАНИЛИЩЕ ДАННЫХ
  // ================================================
  // Сколько ресурсов накоплено у игрока
  const resources = { gold: 0, wood: 0, stone: 0, cristal: 0 };
  // Буферы добычи для шахт (до сбора)
  const buffers   = { gold: 0, wood: 0, stone: 0, cristal: 0 };

  // Удобное форматирование больших чисел (K, M, МЛ)
  function formatNum(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'МЛ';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  }

  // ================================================
  //               КЛАСС Building
  // ================================================
  class Building {
    /**
     * @param {number} x — координата X
     * @param {number} y — координата Y
     * @param {object} opts — опции { kind, type, img, imgClick }
     */
    constructor(x, y, { kind, type, img, imgClick }) {
      // Позиция и размер
      this.x = x; this.y = y;
      this.w = 192; this.h = 192;

      // Тип здания: mine/storage/tavern/beast_tavern
      this.kind = kind;
      // Ресурс (gold, wood, stone, cristal) или 'tavern'
      this.type = type;

      this.level = 1;                 // Уровень здания
      this.img = new Image();         // Обычное изображение
      this.img.src = img;
      this.imgClick = new Image();    // Изображение при наведении/клике
      this.imgClick.src = imgClick;

      // Для шахт: буфер, интервал сбора и метка времени последнего сбора
      this.buffer = 0;
      this.collectInterval = (type === 'cristal' ? 120_000 : 5_000);
      this.lastCollect     = Date.now();

      // Параметры апгрейда
      this.upgrading       = false;
      this.upgradeStart    = 0;
      this.upgradeDuration = 0;
    }

    // Проверяем, попадает ли точка (mx,my) в пределы здания
    contains(mx, my) {
      return mx >= this.x && mx <= this.x + this.w &&
             my >= this.y && my <= this.y + this.h;
    }

    // =====  Расчёт добычи за один тик  =====
    getHarvestAmount() {
      if (this.type === 'cristal') {
        // Кристаллы: 1 за уровень до 2, дальше +3 за уровень
        if (this.level <= 2) return this.level;
        return 2 + 3 * (this.level - 2);
      }
      // Остальные ресурсы: линейная шкала между базовыми min и max
      const lvl = this.level;
      if (this.type === 'gold') {
        const step = (2500 - 200) / 9;
        return Math.floor(200 + (lvl - 1) * step);
      }
      if (this.type === 'wood') {
        const step = (2000 - 150) / 9;
        return Math.floor(150 + (lvl - 1) * step);
      }
      if (this.type === 'stone') {
        const step = (1500 - 100) / 9;
        return Math.floor(100 + (lvl - 1) * step);
      }
      return 0;
    }

    // =====  Максимальный буфер до сбора  =====
    getBufferLimit() {
      if (this.type === 'cristal') {
        return 50 + (this.level - 1) * 10;
      }
      // Остальные ресурсы: экспоненциальный рост
      return Math.floor(2000 * Math.pow(50, (this.level - 1) / 9));
    }

    // =====  Ёмкость склада (storage)  =====
    capacity() {
      if (this.type === 'cristal') {
        return 50 * this.level;
      }
      return Math.floor(10000 * Math.pow(1e6, (this.level - 1) / 9));
    }

    // =====  Стоимость улучшения здания  =====
    getUpgradeCost() {
      const lvl  = this.level;
      const base = Math.pow(lvl, 3) * 1000;
      const g    = Math.floor(base);
      const w    = Math.floor(base * 0.9);
      const s    = Math.floor(base * 0.5);
      let goldC = 0, woodC = 0, stoneC = 0, cristalC = 0;

      if (this.kind === 'mine') {
        // Минная логика стоимости
        if (this.type === 'stone') {
          goldC  = Math.floor(g * 1.5);
          woodC  = Math.floor(w * 1.5);
          stoneC = Math.floor(s * 1.5);
        } else if (this.type === 'cristal') {
          goldC    = g * 2;
          woodC    = w * 2;
          stoneC   = s * 2;
          cristalC = Math.floor(10 * Math.pow(2.5, lvl - 1));
        } else {
          goldC = g; woodC = w; stoneC = s;
        }
      } else if (this.kind === 'storage') {
        // Складская логика стоимости
        if (this.type === 'stone') {
          goldC  = Math.floor(g * 2.5);
          woodC  = Math.floor(w * 2.5);
          stoneC = Math.floor(s * 2.5);
        } else if (this.type === 'cristal') {
          goldC    = g * 3;
          woodC    = w * 3;
          stoneC   = s * 3;
          cristalC = Math.floor(20 * Math.pow(2.5, lvl - 1));
        } else {
          goldC = g * 2; woodC = w * 2; stoneC = s * 2;
        }
      }
      return { gold: goldC, wood: woodC, stone: stoneC, cristal: cristalC };
    }

    // =====  Сбор ресурсов из шахты в личное хранилище  =====
    collect() {
      // Кладём буфер в общие ресурсы, но не превышаем ёмкость склада
      resources[this.type] = Math.min(
        resources[this.type] + this.buffer,
        storageMap[this.type].capacity()
      );
      // Сбрасываем буфер
      this.buffer = 0;
      buffers[this.type] = 0;
      // Обновляем UI и возвращаем меню
      updateResourcesUI();
      openMenu(this);
    }

    // =====  Старт апгрейда  =====
    startUpgrade() {
      const cost = this.getUpgradeCost();
      const missing = [];
      // Проверяем, хватает ли ресурсов
      ['gold','wood','stone','cristal'].forEach(r => {
        if (resources[r] < cost[r]) {
          missing.push(`${cost[r] - resources[r]} ${r}`);
        }
      });
      if (missing.length) {
        return alert('Не хватает: ' + missing.join(', '));
      }
      // Снимаем ресурсы
      ['gold','wood','stone','cristal'].forEach(r => {
        resources[r] -= cost[r];
      });
      updateResourcesUI();
      // Переводим здание в режим апгрейда
      this.upgrading = true;
      this.upgradeStart = Date.now();
      // Длительность зависит от типа и уровня
      const durations = this.type === 'cristal'
        ? [10,30,60,120,180,240,360,480,600]
        : [1,15,30,60,90,120,180,240,300];
      this.upgradeDuration = durations[this.level - 1] * 60_000;
      // Показываем полосу прогресса при следующем openMenu
      if (selected === this) openMenu(this);
    }

    // =====  Завершение апгрейда  =====
    finishUpgrade() {
      this.level++;
      this.upgrading = false;

      // Если меню открыто для текущего здания, обновляем его
      if (selected === this) {
        openMenu(this);
      }
    }

    // =====  Обновление логики здания за кадр  =====
    update() {
      // Во время перемещения пропускаем логику
      if (moving) return;

      const now = Date.now();

      // Логика добычи для шахты
      if (this.kind === 'mine') {
        const diff = now - this.lastCollect;
        const ticks = Math.floor(diff / this.collectInterval);
        if (ticks > 0) {
          const amt = this.getHarvestAmount();
          this.buffer = Math.min(this.buffer + ticks * amt, this.getBufferLimit());
          buffers[this.type] = this.buffer;
          this.lastCollect += ticks * this.collectInterval;

          // Если меню открыто для текущего здания, обновляем буфер в UI
          if (selected === this) {
            bufferEl.textContent = `Буфер: ${formatNum(this.buffer)} / ${formatNum(this.getBufferLimit())}`;
          }
        }

        // Обновляем шкалу получения ресурсов
        if (selected === this) {
          const harvestBar = document.getElementById('menu-harvest-bar');
          const harvestProgressText = document.querySelector('#menu-harvest-progress .progress-text');

          const harvestProgress = Math.min((now - this.lastCollect) / this.collectInterval, 1);
          const nextHarvest = this.getHarvestAmount();
          const timeLeft = Math.ceil((1 - harvestProgress) * this.collectInterval / 1000);

          harvestBar.style.width = `${harvestProgress * 100}%`;
          harvestProgressText.textContent = `${nextHarvest} через ${timeLeft} сек`;
        }
      }

      // Логика апгрейда
      if (this.upgrading) {
        const prog = (now - this.upgradeStart) / this.upgradeDuration;

        // Обновляем шкалу прогресса, если меню открыто
        if (selected === this) {
          const progressBar = document.getElementById('menu-progress-bar');
          const progressPercent = Math.min(Math.floor(prog * 100), 100);
          progressBar.style.width = `${progressPercent}%`;
          progressBar.textContent = `${progressPercent}%`;
          document.getElementById('menu-progress').classList.remove('hidden');
        }

        if (prog >= 1) {
          this.finishUpgrade();
        }
      }
    }

    // =====  Отрисовка здания  =====
    draw(ctx) {
      const hover = this.contains(mouseX, mouseY) || selected === this;
      const imgToDraw = hover ? this.imgClick : this.img;
      ctx.drawImage(imgToDraw, this.x, this.y, this.w, this.h);
    }
  }

  // ================================================
  //          СОЗДАНИЕ ВСЕХ BUILDINGS
  // ================================================
  const buildings = [];
  ['gold','wood','stone','cristal'].forEach((type, i) => {
    // шахта
    buildings.push(new Building(
      50 + i * 250, 400,
      {
        kind: 'mine',
        type,
        img:      `assets/images/mine_${type}.png`,
        imgClick: `assets/images/mine_${type}_click.png`
      }
    ));
    // склад
    buildings.push(new Building(
      50 + i * 250, 100,
      {
        kind: 'storage',
        type,
        img:      `assets/images/${type}Storage.png`,
        imgClick: `assets/images/${type}Storage_click.png`
      }
    ));
  });
// таверны
  buildings.push(new Building(50, 250, {
    kind:     'tavern',
    type:     'tavern',
    img:      'assets/images/tavern.png',
    imgClick: 'assets/images/tavern_click.png'
  }));
  buildings.push(new Building(300, 250, {
    kind:     'beast_tavern',
    type:     'beast_tavern',
    img:      'assets/images/beast_tavern.png',
    imgClick: 'assets/images/beast_tavern_click.png'
  }));

  // Карта складов для проверки capacity
  const storageMap = {};
  buildings
    .filter(b => b.kind === 'storage')
    .forEach(b => storageMap[b.type] = b);

  // ================================================
  //                UI ЭЛЕМЕНТЫ МЕНЮ
  // ================================================
  const menu       = document.getElementById('building-menu');
  const menuImg    = document.getElementById('menu-building-img');
  const closeBtn   = document.getElementById('menu-close');
  const titleEl    = document.getElementById('menu-title');
  const levelEl    = document.getElementById('menu-level');
  const bufferEl   = document.getElementById('menu-buffer');
  const costEl     = document.getElementById('menu-cost');
  const collectBtn = document.getElementById('collect-btn');
  const upgradeBtn = document.getElementById('upgrade-btn');
  const speedupBtn = document.getElementById('speedup-btn');

  // Кнопка «Переместить»
  const moveBtn = document.createElement('button');
  moveBtn.id          = 'move-btn';
  moveBtn.textContent = 'Переместить';
  moveBtn.classList.add('menu-button');
  moveBtn.style.display = 'none';
  menu.appendChild(moveBtn);

  // ================================================
  //              ОБРАБОТЧИКИ КНОПОК
  // ================================================
  collectBtn.addEventListener('click', () => {
    if (selected?.kind === 'mine') selected.collect();
  });
  upgradeBtn.addEventListener('click', () => {
    if (selected) selected.startUpgrade();
  });
  speedupBtn.addEventListener('click', () => {
    if (!selected?.upgrading) return;
    const now   = Date.now();
    const remMs = selected.upgradeDuration - (now - selected.upgradeStart);
    if (remMs <= 0) return;
    const remMin = remMs / 60000;
    const cost   = Math.ceil(remMin / 6);
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
    menu.classList.add('hidden');
  });
  closeBtn.addEventListener('click', () => {
    selected = null;
    moving   = false;
    menu.classList.add('hidden');
    moveBtn.style.display = 'none';
  });

  // Обновление панели ресурсов
  function updateResourcesUI() {
    ['gold','wood','stone','cristal'].forEach(r => {
      document.getElementById(r).textContent = formatNum(resources[r]);
    });
  }
  updateResourcesUI();

  // ================================================
  //        ОБРАБОТКА ПРАВОГО КЛИКА ПО CANVAS
  // ================================================
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    const hit = buildings.find(b => b.contains(mouseX, mouseY));
    if (hit) {
      selected = hit;
      openMenu(hit);
      // Показываем только кнопку «Переместить»
      moveBtn.style.display    = 'inline-block';
      collectBtn.style.display = 'none';
      upgradeBtn.style.display = 'none';
      speedupBtn.style.display = 'none';
    }
  });

  // ================================================
  //        ОБРАБОТКА MOVING РЕЖИМА (mousemove)
  // ================================================
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (moving && selected) {
      // Центрируем постройку под курсор
      selected.x = mouseX - selected.w / 2;
      selected.y = mouseY - selected.h / 2;
    }

    // Курсор меняется: move при перемещении, pointer при наведении, default иначе
    canvas.style.cursor = moving
      ? 'move'
      : (buildings.some(b => b.contains(mouseX, mouseY)) ? 'pointer' : 'default');
  });

  // ================================================
  //        ОБРАБОТКА ЛЕВОГО КЛИКА ПО CANVAS
  // ================================================
  canvas.addEventListener('click', () => {
    if (moving) {
      // Фиксируем позицию и возвращаем меню
      moving = false;
      openMenu(selected);
      moveBtn.style.display = 'none';
      return;
    }
    // Обычный клик: открываем меню или закрываем, если клик вне зданий
    const hit = buildings.find(b => b.contains(mouseX, mouseY));
    if (hit) {
      openMenu(hit);
    } else {
      closeBtn.click();
    }
  });

  // ================================================
  //   ФУНКЦИЯ openMenu — заполняет и показывает меню
  // ================================================
  function openMenu(b) {
    selected = b;
    menuImg.src = b.img.src;
    menu.classList.remove('hidden');
    moveBtn.style.display = 'none';

    // ---- 1) Таверны: показываем только заголовок ----
    if (b.kind === 'tavern' || b.kind === 'beast_tavern') {
        titleEl.textContent = b.kind === 'tavern' ? 'Таверна' : 'Таверна для животных';
        levelEl.textContent = '';
        bufferEl.textContent = '';
        costEl.textContent = '';
        collectBtn.style.display = 'none';
        upgradeBtn.style.display = 'none';
        speedupBtn.style.display = 'none';
        document.getElementById('menu-harvest-progress').classList.add('hidden');
        document.getElementById('menu-harvest-progress').style.display = 'none';
        document.getElementById('menu-progress').classList.add('hidden');
        return;
    }

    // ---- 2) Шахты и склады: заголовок, уровень ----
    const names = { gold: 'Золотая', wood: 'Лесная', stone: 'Каменная', cristal: 'Кристалльная' };
    const kinds = { mine: 'шахта', storage: 'склад' };
    titleEl.textContent = `${names[b.type]} ${kinds[b.kind]}`;
    levelEl.textContent = `Уровень: ${b.level}`;

    // ---- буфер или текущее хранение ----
    if (b.kind === 'mine') {
        bufferEl.textContent = `Буфер: ${formatNum(b.buffer)} / ${formatNum(b.getBufferLimit())}`;
        collectBtn.style.display = 'inline-block';

         // Восстанавливаем видимость шкалы получения ресурсов
        document.getElementById('menu-harvest-progress').style.display = 'block';

        // Обновляем шкалу получения ресурсов
        const harvestBar = document.getElementById('menu-harvest-bar');
        const harvestProgress = Math.min((Date.now() - b.lastCollect) / b.collectInterval, 1);
        const nextHarvest = b.getHarvestAmount();
        const timeLeft = Math.ceil((1 - harvestProgress) * b.collectInterval / 1000);
        harvestBar.style.width = `${harvestProgress * 100}%`;

        // Обновляем текст внутри полосы
        const harvestProgressText = document.querySelector('#menu-harvest-progress .progress-text');
        harvestProgressText.textContent = `${nextHarvest} через ${timeLeft} сек`;

        document.getElementById('menu-harvest-progress').classList.remove('hidden');
    } else if (b.kind === 'storage') {
        bufferEl.textContent = `Хранение: ${formatNum(resources[b.type])} / ${formatNum(b.capacity())}`;
        collectBtn.style.display = 'none';

        // Полностью скрываем шкалу получения ресурсов для складов
        const harvestBar = document.getElementById('menu-harvest-bar');
        const harvestProgressText = document.querySelector('#menu-harvest-progress .progress-text');
        harvestBar.style.width = '0%';
        harvestProgressText.textContent = '';
        document.getElementById('menu-harvest-progress').style.display = 'none';
    }

    // ---- кнопка «Ускорить» ----
    if (b.upgrading) {
        const now = Date.now();
        const remMs = b.upgradeDuration - (now - b.upgradeStart);
        const remMin = Math.max(remMs / 60000, 0);
        const cost = Math.ceil(remMin / 6);
        speedupBtn.innerHTML = `Ускорить (<img src="assets/images/resurces_cristal.png" class="icon-cost">${cost})`;
        speedupBtn.style.display = 'inline-block';

        // Показываем прогресс-бар только для текущего здания
        const progressBar = document.getElementById('menu-progress-bar');
        const progressPercent = Math.min(Math.floor((now - b.upgradeStart) / b.upgradeDuration * 100), 100);
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${progressPercent}%`;
        document.getElementById('menu-progress').classList.remove('hidden');
    } else {
        // Скрываем прогресс-бар, если здание не улучшается
        speedupBtn.style.display = 'none';
        const progressBar = document.getElementById('menu-progress-bar');
        progressBar.style.width = '0%';
        progressBar.textContent = '';
        document.getElementById('menu-progress').classList.add('hidden');
    }

    // ---- кнопка «Улучшить» всегда доступна ----
    upgradeBtn.style.display = 'inline-block';

    // ---- стоимость улучшения ----
    const cost = b.getUpgradeCost();
    const parts = [];
    if (cost.gold) parts.push(`<img src="assets/images/resurces_gold.png"   class="icon-cost">${formatNum(cost.gold)}`);
    if (cost.wood) parts.push(`<img src="assets/images/resurces_wood.png"   class="icon-cost">${formatNum(cost.wood)}`);
    if (cost.stone) parts.push(`<img src="assets/images/resurces_stone.png"  class="icon-cost">${formatNum(cost.stone)}`);
    if (cost.cristal) parts.push(`<img src="assets/images/resurces_cristал.png"class="icon-cost">${formatNum(cost.cristal)}`);
    costEl.innerHTML = 'Стоимость: ' + (parts.length ? parts.join(' ') : '—');
}

  // ================================================
  //         ЦИКЛ ОТРИСОВКИ И ОБНОВЛЕНИЯ
  // ================================================
  bg.onload = () => {
    (function loop() {
      // Очищаем и рисуем фон на весь canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Для каждого здания: обновляем логику и отрисовываем
      buildings.forEach(b => {
        b.update();
        b.draw(ctx);
      });

      requestAnimationFrame(loop);
    })();
  };
});