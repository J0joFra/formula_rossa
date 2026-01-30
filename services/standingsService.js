// lib/services/standingsService.js
export function getDriverStandings(season) {
  // Dati mock per far passare il build
  console.log(`Getting driver standings for ${season}...`);
  
  return [
    { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 400 },
    { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 285 },
    { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 270 },
    { driverId: 4, forename: 'Lando', surname: 'Norris', constructor: 'McLaren', points: 250 },
    { driverId: 5, forename: 'Carlos', surname: 'Sainz', constructor: 'Ferrari', points: 230 },
    { driverId: 6, forename: 'George', surname: 'Russell', constructor: 'Mercedes', points: 210 },
    { driverId: 7, forename: 'Oscar', surname: 'Piastri', constructor: 'McLaren', points: 190 },
    { driverId: 8, forename: 'Fernando', surname: 'Alonso', constructor: 'Aston Martin', points: 175 },
    { driverId: 9, forename: 'Sergio', surname: 'Pérez', constructor: 'Red Bull Racing', points: 160 },
    { driverId: 10, forename: 'Lance', surname: 'Stroll', constructor: 'Aston Martin', points: 140 },
  ];
}

export function getConstructorStandings(season) {
  return [
    { constructorId: 1, name: 'Red Bull Racing', points: 650 },
    { constructorId: 2, name: 'Ferrari', points: 500 },
    { constructorId: 3, name: 'Mercedes', points: 480 },
  ];
}