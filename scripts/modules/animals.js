// scripts/modules/animals.js

export const animals = [
  {
    name: 'Полярный медведь',
    portrait: 'assets/images/units/polar_bear_portret.png',
    // showPirateDetails будет строить картинку через portrait.replace('_portret','')
    description: 'Гигантский белый медведь, грозный и выносливый страж ледяных просторов.',
    stats: { attack: 500, defense: 200, speed: 20, health: 3500 },
    cost: { gold: 300, wood: 120, stone: 60 },
    unlockLevel: 2
  },
  {
    name: 'Королева полярных медведей',
    portrait: 'assets/images/units/polar_bear_queen_portret.png',
    description: 'Мудрая и непреклонная королева стаи, её рык сотрясает лёд.',
    stats: { attack: 800, defense: 400, speed: 20, health: 6000 },
    cost: { gold: 600, wood: 240, stone: 120 },
    unlockLevel: 3
  }
];
