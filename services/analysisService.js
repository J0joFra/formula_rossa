// lib/services/analysisService.js
export function getMaidenAchievements(year) {
  const allResults = getResultsUpToYear(year);
  const firsts = { firstWins: [], firstPodiums: [], firstPoles: [] };
  
  // Analizza ogni pilota
  drivers.forEach(driver => {
    const driverResults = allResults.filter(r => r.driverId === driver.driverId);
    const firstWin = findFirstAchievement(driverResults, 'win');
    if (firstWin?.year == year) firsts.firstWins.push(firstWin);
  });
  
  return firsts;
}