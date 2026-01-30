// scripts/convert-csv-to-json.js
const fs = require('fs');
const csv = require('csv-parser'); 

const csvFiles = {
    circuits: 'scripts/circuits.csv',
    races: 'scripts/races.csv',
    results: 'scripts/results.csv',
    qualifying: 'scripts/qualifying.csv',
    drivers: 'scripts/drivers.csv',
    constructors: 'scripts/constructors.csv',
    constructors_standings: 'scripts/constructor_standings.csv',
    driver_standings: 'scripts/driver_standings.csv',
    f1_2025_last_race_results: 'scripts/f1_2025_last_race_results.csv'

};

Object.entries(csvFiles).forEach(([key, path]) => {
  const results = [];
  fs.createReadStream(path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.writeFileSync(`./lib/db/${key}.json`, JSON.stringify(results, null, 2));
      console.log(`✅ Convertito ${key}`);
    });
});