export const pirates = [
  {
    name: 'Головорез',
    portrait: 'assets/images/units/cutthroat_portret.png',
    description: 'Пират с бутылкой рома и саблей.',
    stats: { attack: 200, defense: 50, speed: 20, health: 1500 },
    cost: { gold: 100, wood: 50, stone: 20 },
    unlockLevel: 1
  },
  {
    name: 'Мушкетер',
    portrait: 'assets/images/units/musketeer_portret.png',
    description: 'Мастер стрельбы с дальнего расстояния.',
    stats: { attack: 450, defense: 20, speed: 20, health: 900 },
    cost: { gold: 150, wood: 70, stone: 30 },
    unlockLevel: 1
  },
  {
    name: 'Мифический всадник на кабане',
    portrait: 'assets/images/units/mythical_boar_rider_portret.png',
    description: 'Мифический всадник на кабане, который может атаковать врагов с расстояния.',
    stats: { attack: 780, defense: 60, speed: 20, health: 3000 },
    cost: { gold: 200, wood: 100, stone: 50 },
    unlockLevel: 2
  }
];