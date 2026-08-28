// lib/db.js — Client Supabase per Next.js
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

let client;

function getClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // service role per query server-side
    );
  }
  return client;
}

/** Esegui una query SQL raw */
export async function query(sql, params = []) {
  const { data, error } = await getClient().rpc('run_query', { sql });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Circuits ────────────────────────────────────────────────────────────────
export async function getAllCircuits() {
  const { data, error } = await getClient()
    .from('circuits').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function getCircuitById(id) {
  const { data, error } = await getClient()
    .from('circuits').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

// ─── Drivers ─────────────────────────────────────────────────────────────────
export async function getAllDrivers() {
  const { data, error } = await getClient()
    .from('drivers').select('*').order('last_name');
  if (error) throw new Error(error.message);
  return data;
}

export async function getDriverById(id) {
  const { data, error } = await getClient()
    .from('drivers').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

// ─── Constructors ─────────────────────────────────────────────────────────────
export async function getAllConstructors() {
  const { data, error } = await getClient()
    .from('constructors').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function getConstructorById(id) {
  const { data, error } = await getClient()
    .from('constructors').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

// ─── Races ────────────────────────────────────────────────────────────────────
export async function getAllRaces() {
  const { data, error } = await getClient()
    .from('races').select('*').order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getRacesByYear(year) {
  const { data, error } = await getClient()
    .from('races').select('*').eq('year', year).order('round');
  if (error) throw new Error(error.message);
  return data;
}

export async function getRaceById(id) {
  const { data, error } = await getClient()
    .from('races').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

// ─── Race Results ─────────────────────────────────────────────────────────────
export async function getRaceResults(raceId) {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, drivers(name), constructors(name)`)
    .eq('race_id', raceId)
    .order('position_display_order');
  if (error) throw new Error(error.message);
  return data;
}

export async function getRaceResultsByDriver(driverId) {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, races(official_name, date, year)`)
    .eq('driver_id', driverId)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Qualifying ───────────────────────────────────────────────────────────────
export async function getQualifyingResults(raceId) {
  const { data, error } = await getClient()
    .from('qualifying_results')
    .select(`*, drivers(name)`)
    .eq('race_id', raceId)
    .order('position_display_order');
  if (error) throw new Error(error.message);
  return data;
}

// ─── Standings ────────────────────────────────────────────────────────────────
export async function getDriverStandingsByYear(year) {
  const { data, error } = await getClient()
    .from('driver_standings')
    .select(`*, drivers(name)`)
    .eq('year', year)
    .order('position_number');
  if (error) throw new Error(error.message);
  // prendi solo l'ultimo round
  const maxRound = Math.max(...data.map(d => d.round));
  return data.filter(d => d.round === maxRound);
}

export async function getConstructorStandingsByYear(year) {
  const { data, error } = await getClient()
    .from('constructor_standings')
    .select(`*, constructors(name)`)
    .eq('year', year)
    .order('position_number');
  if (error) throw new Error(error.message);
  const maxRound = Math.max(...data.map(d => d.round));
  return data.filter(d => d.round === maxRound);
}

// ─── Query Ferrari ────────────────────────────────────────────────────────────
export async function getFerrariWins() {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, drivers(name), races(official_name, year, date)`)
    .eq('constructor_id', 'ferrari')
    .eq('position_number', 1)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getFerrariPodiums() {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, drivers(name), races(official_name, year, date)`)
    .eq('constructor_id', 'ferrari')
    .lte('position_number', 3)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getFerrariPoles() {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, drivers(name), races(official_name, year, date)`)
    .eq('constructor_id', 'ferrari')
    .eq('pole_position', true)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getFerrarisFastestLaps() {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, drivers(name), races(official_name, year, date)`)
    .eq('constructor_id', 'ferrari')
    .eq('fastest_lap', true)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getFerrariGrandSlams() {
  const { data, error } = await getClient()
    .from('race_results')
    .select(`*, drivers(name), races(official_name, year, date)`)
    .eq('constructor_id', 'ferrari')
    .eq('grand_slam', true)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}