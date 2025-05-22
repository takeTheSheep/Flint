flint_game/
│
├── assets/
│   ├── images/
│   │   ├── background/
|   |   |   └──island.png
│   │   ├── cosmetics/
│   │   │   ├──crossMeny_click.png
│   │   │   ├──crossMeny.png
│   │   │   ├──death.png
│   │   │   └── lock.png
│   │   ├── objects/
│   │   │   ├──beast_tavern_click.png
│   │   │   ├──beast_tavern.png
│   │   │   ├──cristalStorage_click.png
│   │   │   ├──cristalStorage.png
│   │   │   ├──goldStorage_click.png
│   │   │   ├──goldStorage.png
│   │   │   ├──mine_cristal_click.png
│   │   │   ├──mine_cristal.png
│   │   │   ├──mine_gold_click.png
│   │   │   ├──mine_gold.png
│   │   │   ├──mine_stone_click.png
│   │   │   ├──mine_stone.png
│   │   │   ├──mine_wood_click.png
│   │   │   ├──mine_wood.png
│   │   │   ├──stoneStorage_click.png
│   │   │   ├──stoneStorage.png
│   │   │   ├──tavern_click.png
│   │   │   ├──tavern.png
│   │   │   ├──woodStorage_click.png
│   │   │   └──woodStorage.png
│   │   ├── resurces/
│   │   │   ├──resurces_cristal.png
│   │   │   ├──resurces_gold.png
│   │   │   ├──resurces_stone.png
│   │   │   └──resurces_wood.png
│   │   ├── sprites/
│   │   │   ├──cutthroat.png
│   │   │   └──musketeer.png
│   │   └── units/
│   │        ├──cutthroat_portret.png
│   │        ├──cutthroat.png
│   │        ├──musketeer_portret.png
│   │        ├──musketeer.png
│   │        ├──mythical_boar_rider_portret.png
│   │        ├──mythical_boar_rider.png
│   │        ├──polar_bear_portret.png
│   │        ├──polar_bear_queen_portret.png
│   │        ├──polar_bear_queen.png
│   │        └──polar_bear.png
│   └── sounds/(пока что нет ничего)
│
├── data/
│   ├── quests.json
│   └── units.json
│
├── scripts/
│   ├── main.js
│   └── modules/
│       ├── animals.js
│       ├──clickHandler.js
│       ├──contextMenuHandler.js
│       ├──dragAndDrop.js
│       ├──hitDetection.js
│       ├──pointerController.js
│       ├──resourcesUI.js
│       ├──tavernMenu.js
│       ├──tooltip.js
│       ├──tooltipController.js
│       ├── buildingMenu.js
│       ├── buildings.js
│       ├── canvas.js
│       ├── events.js
│       ├── pirates.js
│       ├── ui.js
│       ├── unitCarousel.js
│       └── utils.js
│
├── index.html
├── MODULARIZATION_PROGRESS.md
└── style.css







# Прогресс по модульности

## Шаг 1 — modules/buildingMenu.js
- [x] Создан файл `modules/buildingMenu.js`
- [x] Вынесена логика `openMenu(b)` и `closeMenu()` из `ui.js`
- [x] Импортированы в нём:
  - `formatNum`, `names`, `storageNames` из `utils.js`
  - `resources` из `buildings.js`
  - функции `openPiratesMenu`, `openBeastsMenu`, `closePiratesMenu` из `unitCarousel.js`
- [x] Экспортированы:
  - функции `openMenu`, `closeMenu`, `initBuildingMenu`
  - DOM-элементы: `menu`, `collectBtn`, `upgradeBtn`, `speedupBtn`

## Шаг 2 — modules/unitCarousel.js
- [x] Создан файл `modules/unitCarousel.js`
- [x] Вынесена из `ui.js` логика:
  - `openPiratesMenu`
  - `openBeastsMenu`
  - `closePiratesMenu`
  - `showPirateDetails`
  - `hirePirate`
  - все связанные DOM-запросы и обработчики
- [x] Добавлены импорты:
  - `pirates` из `pirates.js`
  - `animals` из `animals.js`
  - `resources`, `updateResourcesUI` из `buildings.js`
- [x] Экспортированы функции:
  ```js
  export {
    openPiratesMenu,
    openBeastsMenu,
    closePiratesMenu
  };

  Шаг 3 — Очистка ui.js
 [x]Оставлен только «точка входа» ui.js

 [x]Вверху прописаны импорты:

js


import {
  initBuildingMenu,
  openMenu,
  closeMenu,
  collectBtn,
  upgradeBtn,
  speedupBtn,
  menu
} from './modules/buildingMenu.js';

import {
  openPiratesMenu,
  openBeastsMenu,
  closePiratesMenu
} from './modules/unitCarousel.js';

import { updateResourcesUI } from './modules/buildingMenu.js';
[x] Удалены все устаревшие DOM-запросы и функции (меню зданий, карусель, тултипы и т.п.)

[x] Оставлена только функция:

js


export function initUI() {
  initBuildingMenu();
  updateResourcesUI();
}
[x] Добавлен ре-экспорт:

js


export {
  openMenu,
  closeMenu,
  collectBtn,
  upgradeBtn,
  speedupBtn,
  menu
};
Шаг 4 — Пути импортов
[x] Во всех модулях (buildingMenu.js, unitCarousel.js, ui.js и т. д.) исправлены пути на относительные:

js


import … from './имя_модуля.js';
[x] Удалён неиспользуемый импорт formatNum из unitCarousel.js


 [ ]Настроить сборку:

подключить Rollup или Webpack для ES-модулей

включить минификацию и tree-shaking

реализовать динамический импорт (code-splitting) для ленивой загрузки больших модулей


Шаг 5: Локализация UI-слушателей

[x]Удалили из events.js все обработчики кнопок меню (collectBtn, upgradeBtn, speedupBtn, moveBtn).

[x]Расширили buildingMenu.js:

[x]Импортировали:

resources из buildings.js;

updateResourcesUI() из ui.js;

selected из events.js;

собственные функции openMenu/closeMenu.

[x]Добавили сбор слушателей для:

кнопки закрытия меню (#menu-close);

кнопки «Собрать» (#collect-btn);

кнопки «Улучшить» (#upgrade-btn);

кнопки «Ускорить» (#speedup-btn);

кнопки «Переместить» (#move-btn).

[x]Обновили main.js:

Добавлен импорт initBuildingMenu из модуля;

Вызов initBuildingMenu() после initUI() и до initEvents().

[x]Исправили index.html:

Проверили и добавили id для всех кнопок меню зданий:

<button id="collect-btn">Собрать</button>
<button id="upgrade-btn">Улучшить</button>
<button id="speedup-btn">Ускорить</button>
<button id="move-btn">Переместить</button>
<button id="menu-close">×</button>

[x]Убедились, что DOMContentLoaded вызывает все инициализаторы.

Дальнейшие шаги

Составить список текущих багов и приоритизировать: критичные → средние → UX.

Фиксить баги по одному в каждом модуле, подтверждая исправление.

Продолжить декомпозицию оставшихся функций (например, tooltip.js, resourcesUI.js, tavernMenu.js).

Итеративно повторять: модуль → тест → фикс → следующий модуль.



Краткая сводка проделанного рефакторинга:

Вынесли тултип
– Создали modules/tooltip.js с единственным экспортом tooltip.
– Убрали код создания тултипа из modules/ui.js и импортировали его из tooltip.js.

Вынесли логику обновления ресурсов
– Перенесли вашу исходную функцию updateResourcesUI() (с обновлением четырёх конкретных элементов: gold, wood, stone, cristal) в modules/resourcesUI.js.
– В ui.js импортировали и пере-экспортировали updateResourcesUI, удалили неиспользуемые formatNum и resources.

Упорядочили ui.js
– В начале оставили только нужные импорты: tooltip, updateResourcesUI, и функции из buildingMenu.js.
– Гарантировали, что ui.js экспортирует все функции и константы, которые на самом деле используются в других модулях.

Вынесли логику меню таверны
– Создали новый модуль modules/tavernMenu.js с одной функцией handleTavernMenu(b), отвечающей за показ/скрытие карусели и вызов openPiratesMenu/openBeastsMenu.
– В modules/buildingMenu.js заменили встроенный блок «если tavern/beast_tavern → показывать карусель» на единый вызов handleTavernMenu(b).

Удалили лишние импорты
– Убрали из modules/ui.js неиспользуемые импорты formatNum и resources.







Краткий отчёт проделанного рефакторинга events.js и связанных модулей:

hitDetection.js
– Вынесены getCanvasCoords и getBuildingAt для преобразования координат и поиска здания.

tooltipController.js
– Перенёс показ/скрытие тултипа (showTooltip/hideTooltip) из events.js в отдельный контроллер.

dragAndDrop.js
– Вынес состояние и API перетаскивания (startDrag, updateDrag, endDrag, флаги moving/moveTarget).

contextMenuHandler.js
– Изолировал обработчик правого клика (contextmenu), теперь отдаёт hit и координаты через callback.

clickHandler.js
– Вынес слушатель левой кнопки (click) на canvas, оставил логику выбора/перетаскивания внутри callback.

pointerController.js
– Сконцентрировал mousemove/mouseleave, вызовы updateDrag, логику курсора и тултипа.

events.js
– Оставил только инициализацию:

initContextMenu(...);
initClickHandler(...);
initPointerController(...);
– Убрал все прямые слушатели и дублирование логики — ничего в поведении приложения не изменилось.






   Вот кратко список того, что сегодня пофиксили:



   

 Тултипы названий зданий
– Восстановили showTooltip/hideTooltip, переключив управление через класс .hidden, и теперь при наведении отображаются корректные названия.

 Шкала заполнения ресурсов в шахтах
– Добавили снятие класса .hidden у контейнера #menu-harvest-progress внутри openMenu, благодаря чему прогресс-бар появляется в меню шахты.

Дублирование кнопки «Переместить»
– Убрали статический <button id="move-btn"> из шаблона и в initBuildingMenu() навешиваем слушатель на динамически созданный элемент, так что кнопка теперь появляется ровно один раз и только там, где нужно.

Контекстное меню зданий
– Убрали «жёсткое» скрытие кнопки «Переместить» в openMenu и теперь показываем/прячем её только в обработчиках левого и правого клика.

Меню таверны
– В handleTavernMenu сбрасываем состояние меню (все кнопки и карусель скрываются), а затем для таверны/звериной таверны оставляем только кнопку «Улучшить» и цену.

Карусель пиратов
– Перенесли показ оверлея (#pirates-menu) из openPiratesMenu/openBeastsMenu в функцию showPirateDetails, а крестик теперь прячет только панель деталей, не закрывая сам список.
– Добавили hideOverlay() и экспорт closePiratesMenu для явного управления оверлеем из других модулей.

Кнопка «Улучшить»
– Переделали startUpgrade() в buildings.js так, чтобы он возвращал true/false (выдавая alert и прекращая работу при нехватке ресурсов) вместо безусловного alert.
– Изменили обработчик в buildingMenu.js на onclick, чтобы перерисовывать меню (openMenu) только когда startUpgrade() вернул true, и предотвратить накопление слушателей.

Двойное навешивание обработчика
– Убрали повторный вызов initBuildingMenu() в main.js (оставили только в initUI()), чтобы обработчик «Улучшить» создавался ровно один раз.

Теперь меню работает последовательно, без лишних алертов, дублирующих кликов и артефактов интерфейса.



**Что мы сделали:**

Ввели централизованное хранилище store.js с паттерном Observer и автоматическим сохранением/загрузкой через localStorage.

Перенесли все изменения ресурсов и сбор «буфера» шахт в вызовы store.updateResource() и store.collectFromBuilding(), убрав прямые мутации.

Привязали панель ресурсов (resourcesUI.js) к подписке на событие resources, чтобы она перерисовывалась автоматически.

Переделали метод collect() в buildings.js, чтобы он возвращал объект собранных ресурсов вместо мутации глобальных переменных.

Новые баги, которые нужно исправить:

«Улучшить» не работает:

При клике на кнопку «Улучшить» система заявляет об отсутствии ресурсов, хотя они есть.

При этом ресурсы списываются, но сам апгрейд (selected.startUpgrade()) не запускается и уровень здания не меняется.

Неполное восстановление состояния после перезагрузки:

Количество ресурсов сохраняется и подгружается корректно.

Но буферы шахт (заполненность накопления ресурса, сама шкала ресурса) и уровни зданий сбрасываются на изначальные значения.

Должно сохраняться всё состояние (ресурсы, буферы, уровни зданий, статусы юнитов (в будущем их нанятое колличество), шкала заполнения ресурса, в будущем обязательно сохранение квестов).



Краткий отчёт по проделанным изменениям:

Централизация состояния
– Убрали все локальные объекты resources и buffers из модулей зданий.
– Перешли на единую точку хранения — store в store.js:

state.resources и state.buildings загружаются из localStorage при старте.

Для каждого здания добавили метод store.updateBuilding(id, changes) для частичного сохранения его состояния.

Изменения в buildings.js
– В конструкторе класса Building сразу после свойств вставили:

js
Copy
Edit
const persisted = store.getState().buildings[this.id];
if (persisted) Object.assign(this, persisted);
store.subscribe('buildings', all => {
  const data = all[this.id];
  if (data) Object.assign(this, data);
});
– В startUpgrade() перенесли всю логику проверки и списания ресурсов на store, убрав работу с устаревшими переменными.
– В finishUpgrade() добавили вызов store.updateBuilding(...) для сохранения уровня, статуса апгрейда и таймеров.
– В collect() и в update() после изменения buffer/lastCollect вызываем store.updateBuilding(...).

Изменения в buildingMenu.js
– В openMenu(b) рендер буфера и кнопки «Собрать» теперь берёт данные из b.buffer и store.getState().resources[b.type], вместо локальных buffers.
– Упростили обработчик клика «Улучшить»: вызов selected.startUpgrade() полностью отвечает и за проверку, и за списание ресурсов.

Изменения в unitCarousel.js
– Заменили импорт resources из buildings.js на store.
– В hirePirate() читаем и изменяем ресурсы через store.getState().resources и store.updateResource().



Новые баги, требующие правок:

Сбор ресурса
– При вызове collect() буфер всех шахт сбрасывается в 0, вместо того чтобы обнуляться только у выбранной шахты.

Кнопка «Собрать»
– Даже когда буфер пуст, клики по «Собрать» сбрасывают таймер сбора, из-за чего ресурс никогда не накапливается при частом кликании.

Массовое улучшение
– Нажатие «Улучшить» на одной шахте апгрейдит все здания, а не только выбранное.

Шахта кристаллов
– Шкала ресурса показывает корректное время и колличество полученного ресурса через это время, но   отображение в буфере(а так же при кнопку собрать реально даеться 2000) копируют поведение обычной шахты (2000), вместо своей собственной скорости.

Более раскрытое описание:
1)При сборе ресурса Буффер обновляться до 0 во всех шахтах.
2)При нажатии на "Собрать" ресурс (даже если в буфере пусто) обновляеться таймер шкалы получения ресурса (если много раз и часто кликать на "Собрать" то получение ресурса никогда не произойдет так как будет обновляться).
3)Я нажал улучшить шахту, по итогу улучшились все здания вообще, а не конкретно шахта.
4)Шахта кристалов работает не корректно, у нее шкала ресурса работает правильно (пишет у кристал\х время), но в буффере появляться колличество кристаллов как в шахте (2000) такое ощущение что прирост ресурсов везде идет от 1 шахты и одинаковый.



### Внесённые исправления

- Добавили в конструкторе `Building` автоматическое присвоение уникального `id` по шаблону `${kind}_${type}`, чтобы сохранять/загружать состояние каждого здания по своему ключу.  
- Починили метод `collect()` в `buildings.js`:  
  - буфер сбрасывается только при реальном сборе (> 0),  
  - более не затирается `lastCollect` (таймер продолжает идти независимо от кнопки «Собрать»).  
- Обновили обработчик кнопки «Собрать» в `buildingMenu.js`:  
  - при заполненном хранилище ресурсы в буфере частично списываются (влезает ровно по оставшейся ёмкости),  
  - при отсутствии места выводится `alert('Хранилище переполнено')`.  
- Исправили апгрейд: теперь `startUpgrade()` затрагивает только выбранное здание, а не все сразу.  
- Починили скорость «кристальной» шахты — вместо жёсткого 2000 берётся значение из её конфигурации.  

#### Команда для полной перезагрузки игры в DevTools
```js
localStorage.removeItem('flintGameState');
location.reload();