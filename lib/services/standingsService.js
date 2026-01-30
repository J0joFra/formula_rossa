// lib/services/standingsService.js 
export function getDriverStandings(season) {
  console.log(`📊 Loading driver standings for ${season}...`);
  
  // Dati diversi per ogni stagione
  if (season === 2025) {
    return [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 400, wins: 8 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 285, wins: 2 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 270, wins: 3 },
      { driverId: 4, forename: 'Lando', surname: 'Norris', constructor: 'McLaren', points: 250, wins: 1 },
      { driverId: 5, forename: 'Carlos', surname: 'Sainz', constructor: 'Ferrari', points: 230, wins: 1 },
    ];
  } else if (season === 2024) {
    return [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 380, wins: 7 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 275, wins: 3 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 260, wins: 2 },
      { driverId: 4, forename: 'Lando', surname: 'Norris', constructor: 'McLaren', points: 240, wins: 1 },
      { driverId: 5, forename: 'Carlos', surname: 'Sainz', constructor: 'Ferrari', points: 225, wins: 1 },
    ];
  } else if (season === 2023) {
    return [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 350, wins: 6 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 265, wins: 3 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 245, wins: 2 },
      { driverId: 4, forename: 'Lando', surname: 'Norris', constructor: 'McLaren', points: 220, wins: 1 },
      { driverId: 5, forename: 'Carlos', surname: 'Sainz', constructor: 'Ferrari', points: 210, wins: 1 },
    ];
  } else {
    // Per tutte le altre stagioni
    return [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 300, wins: 5 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 250, wins: 2 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 230, wins: 2 },
    ];
  }
}

export function getConstructorStandings(season) {
  console.log(`🏭 Loading constructor standings for ${season}...`);
  
  if (season === 2025) {
    return [
      { constructorId: 1, name: 'Red Bull Racing', points: 650, wins: 12 },
      { constructorId: 2, name: 'Ferrari', points: 500, wins: 5 },
      { constructorId: 3, name: 'Mercedes', points: 480, wins: 3 },
      { constructorId: 4, name: 'McLaren', points: 440, wins: 2 },
      { constructorId: 5, name: 'Aston Martin', points: 315, wins: 1 },
    ];
  } else if (season === 2024) {
    return [
      { constructorId: 1, name: 'Red Bull Racing', points: 600, wins: 10 },
      { constructorId: 2, name: 'Ferrari', points: 480, wins: 4 },
      { constructorId: 3, name: 'Mercedes', points: 460, wins: 3 },
      { constructorId: 4, name: 'McLaren', points: 420, wins: 2 },
      { constructorId: 5, name: 'Aston Martin', points: 300, wins: 1 },
    ];
  } else {
    return [
      { constructorId: 1, name: 'Red Bull Racing', points: 550, wins: 9 },
      { constructorId: 2, name: 'Ferrari', points: 450, wins: 3 },
      { constructorId: 3, name: 'Mercedes', points: 420, wins: 2 },
    ];
  }
}
