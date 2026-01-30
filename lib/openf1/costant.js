// lib/openf1/constants.js 
export const FERRARI_DRIVERS = {
  LECLERC: { number: 16, name: 'Charles Leclerc', country: 'Monaco' },
  SAINZ: { number: 55, name: 'Carlos Sainz', country: 'Spain' },
  HAMILTON: { number: 44, name: 'Lewis Hamilton', country: 'UK' }
};

export const CIRCUITS_2025 = [
  {
    id: 'bahrain',
    name: 'Bahrain Grand Prix',
    openf1Key: 1,
    sessionKey: 9501,
    country: 'Bahrain',
    length: 5.412,
    laps: 57,
    ferrariWins: 7,
    lastFerrariWin: 2022
  },
  {
    id: 'jeddah',
    name: 'Saudi Arabian Grand Prix',
    openf1Key: 77,
    sessionKey: 9502,
    country: 'Saudi Arabia',
    length: 6.174,
    laps: 50,
    ferrariWins: 0,
    lastFerrariWin: null
  }
];

export const SESSION_TYPES = {
  PRACTICE: 'Practice',
  QUALIFYING: 'Qualifying',
  SPRINT: 'Sprint',
  RACE: 'Race'
};
