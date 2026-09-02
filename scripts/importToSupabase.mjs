/**
 * FORMULA ROSSA — Import JSON → Supabase
 *
 * npm install @supabase/supabase-js dotenv
 * node scripts/importToSupabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
/* I dump F1DB stanno in ./data e non più in ./public/data: erano 44 MB serviti
   pubblicamente e spediti a ogni deploy, per un uso che è solo questo — il
   caricamento iniziale su Supabase, che gira a mano da riga di comando. */
function loadJson(filename) {
  const raw = readFileSync(resolve(`./data/${filename}`), 'utf-8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [data];
}

function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '')
  );
}

async function insertBatch(table, rows) {
  if (rows.length === 0) return;
  console.log(`\n📤 ${table} — ${rows.length} righe...`);

  const CHUNK = 200;
  let done = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(clean);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id', ignoreDuplicates: true });
    if (error) { console.error(`   ❌ Errore:`, error.message); return; }
    done += chunk.length;
    process.stdout.write(`\r   ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
  console.log(`   ✅ ${table} completato!`);
}

// ─── Import ───────────────────────────────────────────────────────────────────
async function importCircuits() {
  const rows = loadJson('f1db-circuits.json').map(r => ({
    id: r.id, name: r.name, full_name: r.fullName,
    previous_names: r.previousNames, type: r.type, direction: r.direction,
    place_name: r.placeName, country_id: r.countryId,
    latitude: r.latitude, longitude: r.longitude,
    length: r.length, turns: r.turns, total_races_held: r.totalRacesHeld,
  }));
  await insertBatch('circuits', rows);
}

async function importConstructors() {
  const rows = loadJson('f1db-constructors.json').map(r => ({
    id: r.id, name: r.name, full_name: r.fullName, country_id: r.countryId,
    best_championship_position: r.bestChampionshipPosition,
    best_starting_grid_position: r.bestStartingGridPosition,
    best_race_result: r.bestRaceResult,
    total_championship_wins: r.totalChampionshipWins ?? 0,
    total_race_entries: r.totalRaceEntries ?? 0,
    total_race_starts: r.totalRaceStarts ?? 0,
    total_race_wins: r.totalRaceWins ?? 0,
    total_race_laps: r.totalRaceLaps ?? 0,
    total_podiums: r.totalPodiums ?? 0,
    total_podium_races: r.totalPodiumRaces ?? 0,
    total_points: r.totalPoints ?? 0,
    total_championship_points: r.totalChampionshipPoints ?? 0,
    total_pole_positions: r.totalPolePositions ?? 0,
    total_fastest_laps: r.totalFastestLaps ?? 0,
    total_sprint_race_starts: r.totalSprintRaceStarts ?? 0,
    total_sprint_race_wins: r.totalSprintRaceWins ?? 0,
  }));
  await insertBatch('constructors', rows);
}

async function importDrivers() {
  const rows = loadJson('f1db-drivers.json').map(r => ({
    id: r.id, name: r.name, first_name: r.firstName, last_name: r.lastName,
    full_name: r.fullName, abbreviation: r.abbreviation,
    permanent_number: r.permanentNumber, gender: r.gender,
    date_of_birth: r.dateOfBirth, date_of_death: r.dateOfDeath,
    place_of_birth: r.placeOfBirth,
    country_of_birth_country_id: r.countryOfBirthCountryId,
    nationality_country_id: r.nationalityCountryId,
    second_nationality_country_id: r.secondNationalityCountryId,
    best_championship_position: r.bestChampionshipPosition,
    best_starting_grid_position: r.bestStartingGridPosition,
    best_race_result: r.bestRaceResult,
    total_championship_wins: r.totalChampionshipWins ?? 0,
    total_race_entries: r.totalRaceEntries ?? 0,
    total_race_starts: r.totalRaceStarts ?? 0,
    total_race_wins: r.totalRaceWins ?? 0,
    total_race_laps: r.totalRaceLaps ?? 0,
    total_podiums: r.totalPodiums ?? 0,
    total_points: r.totalPoints ?? 0,
    total_championship_points: r.totalChampionshipPoints ?? 0,
    total_pole_positions: r.totalPolePositions ?? 0,
    total_fastest_laps: r.totalFastestLaps ?? 0,
    total_sprint_race_starts: r.totalSprintRaceStarts ?? 0,
    total_sprint_race_wins: r.totalSprintRaceWins ?? 0,
    total_driver_of_the_day: r.totalDriverOfTheDay ?? 0,
    total_grand_slams: r.totalGrandSlams ?? 0,
  }));
  await insertBatch('drivers', rows);
}

async function importRaces() {
  const rows = loadJson('f1db-races.json').map(r => ({
    id: r.id, year: r.year, round: r.round, date: r.date, time: r.time,
    grand_prix_id: r.grandPrixId, official_name: r.officialName,
    qualifying_format: r.qualifyingFormat,
    sprint_qualifying_format: r.sprintQualifyingFormat,
    circuit_id: r.circuitId, circuit_type: r.circuitType,
    direction: r.direction, course_length: r.courseLength,
    turns: r.turns, laps: r.laps, distance: r.distance,
    drivers_championship_decider: r.driversChampionshipDecider ?? false,
    constructors_championship_decider: r.constructorsChampionshipDecider ?? false,
    qualifying_date: r.qualifyingDate, sprint_race_date: r.sprintRaceDate,
  }));
  await insertBatch('races', rows);
}

async function importRaceResults() {
  const rows = loadJson('f1db-races-race-results.json').map(r => ({
    race_id: r.raceId, year: r.year, round: r.round,
    position_display_order: r.positionDisplayOrder,
    position_number: r.positionNumber, position_text: r.positionText,
    driver_number: r.driverNumber, driver_id: r.driverId,
    constructor_id: r.constructorId, engine_manufacturer_id: r.engineManufacturerId,
    tyre_manufacturer_id: r.tyreManufacturerId, shared_car: r.sharedCar ?? false,
    laps: r.laps, time: r.time, time_millis: r.timeMillis,
    time_penalty: r.timePenalty, time_penalty_millis: r.timePenaltyMillis,
    gap: r.gap, gap_millis: r.gapMillis, gap_laps: r.gapLaps,
    interval: r.interval, interval_millis: r.intervalMillis,
    reason_retired: r.reasonRetired, points: r.points,
    pole_position: r.polePosition ?? false,
    qualification_position_number: r.qualificationPositionNumber,
    qualification_position_text: r.qualificationPositionText,
    grid_position_number: r.gridPositionNumber,
    grid_position_text: r.gridPositionText,
    positions_gained: r.positionsGained, pit_stops: r.pitStops,
    fastest_lap: r.fastestLap ?? false,
    driver_of_the_day: r.driverOfTheDay ?? false,
    grand_slam: r.grandSlam ?? false,
  }));
  // race_results non ha id univoco nel JSON, usiamo upsert su campi compositi
  console.log(`\n📤 race_results — ${rows.length} righe...`);
  const CHUNK = 200;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(clean);
    const { error } = await supabase.from('race_results').insert(chunk);
    if (error && !error.message.includes('duplicate')) {
      console.error(`   ❌`, error.message); return;
    }
    done += chunk.length;
    process.stdout.write(`\r   ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
  console.log(`   ✅ race_results completato!`);
}

async function importQualifying(filename, table) {
  const rows = loadJson(filename).map(r => ({
    race_id: r.raceId, year: r.year, round: r.round,
    position_display_order: r.positionDisplayOrder,
    position_number: r.positionNumber, position_text: r.positionText,
    driver_number: r.driverNumber, driver_id: r.driverId,
    constructor_id: r.constructorId, engine_manufacturer_id: r.engineManufacturerId,
    tyre_manufacturer_id: r.tyreManufacturerId,
    time: r.time, time_millis: r.timeMillis,
    q1: r.q1, q1_millis: r.q1Millis,
    q2: r.q2, q2_millis: r.q2Millis,
    q3: r.q3, q3_millis: r.q3Millis,
    gap: r.gap, gap_millis: r.gapMillis,
    interval: r.interval, interval_millis: r.intervalMillis,
    laps: r.laps,
  }));
  console.log(`\n📤 ${table} — ${rows.length} righe...`);
  const CHUNK = 200;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(clean);
    const { error } = await supabase.from(table).insert(chunk);
    if (error && !error.message.includes('duplicate')) {
      console.error(`   ❌`, error.message); return;
    }
    done += chunk.length;
    process.stdout.write(`\r   ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
  console.log(`   ✅ ${table} completato!`);
}

async function importStandings(filename, table) {
  const data = loadJson(filename);
  const rows = data.map(r => ({
    race_id: r.raceId, year: r.year, round: r.round,
    position_display_order: r.positionDisplayOrder,
    position_number: r.positionNumber, position_text: r.positionText,
    driver_id: r.driverId, constructor_id: r.constructorId,
    engine_manufacturer_id: r.engineManufacturerId,
    points: r.points, positions_gained: r.positionsGained,
    championship_won: r.championshipWon ?? false,
  }));
  console.log(`\n📤 ${table} — ${rows.length} righe...`);
  const CHUNK = 200;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(clean);
    const { error } = await supabase.from(table).insert(chunk);
    if (error && !error.message.includes('duplicate')) {
      console.error(`   ❌`, error.message); return;
    }
    done += chunk.length;
    process.stdout.write(`\r   ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
  console.log(`   ✅ ${table} completato!`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Formula Rossa — Import JSON → Supabase');
  console.log('==========================================');

  await importCircuits();
  await importConstructors();
  await importDrivers();
  await importRaces();
  await importRaceResults();
  await importQualifying('f1db-races-qualifying-results.json',        'qualifying_results');
  await importQualifying('f1db-races-qualifying-1-results.json',      'qualifying_1_results');
  await importQualifying('f1db-races-qualifying-2-results.json',      'qualifying_2_results');
  await importQualifying('f1db-races-sprint-qualifying-results.json', 'sprint_qualifying_results');
  await importStandings('f1db-races-driver-standings.json',           'driver_standings');
  await importStandings('f1db-races-constructor-standings.json',      'constructor_standings');

  console.log('\n==========================================');
  console.log('🏁 Import completato!');
  process.exit(0);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
