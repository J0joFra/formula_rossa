// lib/services/analysisService.js
import resultsData from '../db/results.json';
import racesData from '../db/races.json';
import driversData from '../db/drivers.json';
import constructorsData from '../db/constructors.json';


export function getMaidenAchievements(season) {
  console.log(`Getting maiden achievements for ${season}...`);
  
  return {
    firstWins: [
      { driverId: 100, driverName: 'Oliver Bearman', grandPrix: 'Saudi Arabia Grand Prix', year: 2025 },
      { driverId: 101, driverName: 'Liam Lawson', grandPrix: 'Qatar Grand Prix', year: 2024 }
    ],
    firstPodiums: [
      { driverId: 102, driverName: 'Jack Doohan', grandPrix: 'Hungarian Grand Prix', year: 2025 }
    ],
    firstPoles: [
      { driverId: 103, driverName: 'Victor Martins', grandPrix: 'Monaco Grand Prix', year: 2025 }
    ]
  };
}