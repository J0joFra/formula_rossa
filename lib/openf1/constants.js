// lib/openf1/constants.js
export const FERRARI_DRIVERS = {
  LECLERC: {
    number: 16,
    name: 'Charles Leclerc',
    fullName: 'Charles Leclerc',
    broadcastName: 'LEC',
    country: 'Monaco',
    color: '#DC0000'
  },
  SAINZ: {
    number: 55,
    name: 'Carlos Sainz',
    fullName: 'Carlos Sainz Jr.',
    broadcastName: 'SAI',
    country: 'Spain',
    color: '#FFD700'
  },
  HAMILTON: {
    number: 44,
    name: 'Lewis Hamilton',
    fullName: 'Lewis Hamilton',
    broadcastName: 'HAM',
    country: 'United Kingdom',
    color: '#00D2BE'
  }
};

export const CIRCUITS_2025 = {
  MONZA: {
    id: 'monza',
    name: 'Italian Grand Prix',
    track: 'Monza Circuit',
    country: 'Italy',
    session_key: 9601,
    meeting_key: 2401,
    length: 5.793,
    laps: 53,
    ferrariWins: 20,
    lastFerrariWin: 2023,
    characteristics: ['high_speed', 'low_downforce', 'braking']
  },
  MONACO: {
    id: 'monaco',
    name: 'Monaco Grand Prix',
    track: 'Circuit de Monaco',
    country: 'Monaco',
    session_key: 9602,
    meeting_key: 2402,
    length: 3.337,
    laps: 78,
    ferrariWins: 9,
    lastFerrariWin: 2024,
    characteristics: ['street_circuit', 'technical', 'low_speed']
  },
  SILVERSTONE: {
    id: 'silverstone',
    name: 'British Grand Prix',
    track: 'Silverstone Circuit',
    country: 'United Kingdom',
    session_key: 9603,
    meeting_key: 2403,
    length: 5.891,
    laps: 52,
    ferrariWins: 17,
    lastFerrariWin: 2024,
    characteristics: ['high_speed', 'flowing', 'medium_downforce']
  },
  SPA: {
    id: 'spa',
    name: 'Belgian Grand Prix',
    track: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    session_key: 9604,
    meeting_key: 2404,
    length: 7.004,
    laps: 44,
    ferrariWins: 18,
    lastFerrariWin: 2024,
    characteristics: ['high_speed', 'elevation', 'mixed']
  },
  SUZUKA: {
    id: 'suzuka',
    name: 'Japanese Grand Prix',
    track: 'Suzuka International Racing Course',
    country: 'Japan',
    session_key: 9605,
    meeting_key: 2405,
    length: 5.807,
    laps: 53,
    ferrariWins: 7,
    lastFerrariWin: 2024,
    characteristics: ['technical', 'flowing', 'high_downforce']
  }
};

export const SESSION_TYPES = {
  PRACTICE: 'Practice',
  QUALIFYING: 'Qualifying',
  SPRINT: 'Sprint',
  RACE: 'Race'
};

export const DRS_STATUS = {
  0: 'Not available',
  1: 'Off',
  2: 'On',
  3: 'Unknown'
};

export const BRAKE_STATUS = {
  0: 'Off',
  100: 'On'
};