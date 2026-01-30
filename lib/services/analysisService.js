// lib/services/analysisService.js - VERSIONE SEMPLIFICATA

export function getMaidenAchievements(season) {
  console.log(`🏆 Loading maiden achievements for ${season}...`);
  
  if (season === 2025) {
    return {
      firstWins: [
        { driverId: 100, driverName: 'Oliver Bearman', grandPrix: 'Saudi Arabia Grand Prix', date: '2025-03-09' }
      ],
      firstPodiums: [
        { driverId: 101, driverName: 'Jack Doohan', grandPrix: 'Hungarian Grand Prix', date: '2025-07-27' }
      ],
      firstPoles: [
        { driverId: 102, driverName: 'Victor Martins', grandPrix: 'Monaco Grand Prix', date: '2025-05-25' }
      ]
    };
  } else if (season === 2024) {
    return {
      firstWins: [
        { driverId: 103, driverName: 'Liam Lawson', grandPrix: 'Qatar Grand Prix', date: '2024-12-01' }
      ],
      firstPodiums: [
        { driverId: 104, driverName: 'Andrea Kimi Antonelli', grandPrix: 'Brazilian Grand Prix', date: '2024-11-03' }
      ],
      firstPoles: []
    };
  } else if (season === 2023) {
    return {
      firstWins: [
        { driverId: 105, driverName: 'Oscar Piastri', grandPrix: 'Qatar Grand Prix', date: '2023-10-08' }
      ],
      firstPodiums: [
        { driverId: 106, driverName: 'Logan Sargeant', grandPrix: 'British Grand Prix', date: '2023-07-09' }
      ],
      firstPoles: [
        { driverId: 107, driverName: 'Nyck de Vries', grandPrix: 'Monaco Grand Prix', date: '2023-05-28' }
      ]
    };
  } else {
    return {
      firstWins: [],
      firstPodiums: [],
      firstPoles: []
    };
  }
}
