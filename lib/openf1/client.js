// lib/openf1/client.js
export async function getFerrariData() {
  // Versione mock per ora
  return {
    wins: 244,
    poles: 249,
    championships: 16
  };
}

export async function getSeasonData(year) {
  // Mock data
  return {
    year,
    winner: "Ferrari",
    points: 500
  };
}
