// modules/tooltip.js
// Модуль для создания и управления тултипом на игровом поле
//
// Этот модуль отвечает за создание и отображение тултипа, который
// появляется при наведении на элементы интерфейса. Тултип содержит
// информацию о текущем состоянии игры, ресурсах и других элементах.

/**
 * Создаёт и экспортирует элемент тултипа.
 * Тултип позиционируется абсолютно, имеет базовые стили и изначально скрыт.
 */
export const tooltip = (() => {
  const t = document.createElement('div');
  t.id = 'tooltip';
  t.style.position = 'absolute';
  t.style.background = 'rgba(0,0,0,0.7)';
  t.style.color = 'white';
  t.style.padding = '5px 10px';
  t.style.borderRadius = '5px';
  t.style.pointerEvents = 'none';
  t.classList.add('hidden');
  document.body.appendChild(t);
  return t;
})();