from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS esplicito per Next.js
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Crea la cartella cache se non esiste
os.makedirs('fastf1_cache', exist_ok=True)
fastf1.Cache.enable_cache('fastf1_cache')


# ─── Helper: trova l'evento nel calendario ───────────────────────────────────
def find_event(year: int, gp: str):
    """
    Cerca l'evento nel calendario FastF1 per nome, location o nome ufficiale.
    Ritorna il nome dell'evento (EventName) o lancia ValueError se non trovato.
    """
    schedule = fastf1.get_event_schedule(year, include_testing=False)
    gp_lower = gp.lower().strip()

    # Cerca in EventName, Location e OfficialEventName
    matched = schedule[
        schedule['EventName'].str.lower().str.contains(gp_lower, na=False) |
        schedule['Location'].str.lower().str.contains(gp_lower, na=False) |
        schedule['OfficialEventName'].str.lower().str.contains(gp_lower, na=False)
    ]

    if matched.empty:
        available = schedule[['RoundNumber', 'EventName', 'Location']].to_dict('records')
        logger.error(f"GP non trovato: '{gp}' per {year}. Disponibili: {available}")
        raise ValueError(f"GP '{gp}' non trovato per {year}. Usa /api/fastf1/schedule?year={year} per vedere i nomi validi.")

    event_name = matched.iloc[0]['EventName']
    logger.info(f"Evento trovato: '{event_name}' (cercato: '{gp}')")
    return event_name


# ─── Telemetria ──────────────────────────────────────────────────────────────
@app.route('/api/fastf1/telemetry', methods=['GET'])
def get_telemetry():
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'Q')
        driver_code = request.args.get('driver', 'LEC')

        logger.info(f"Richiesta telemetria: {year} | {gp} | {session_type} | {driver_code}")

        event_name = find_event(year, gp)
        session = fastf1.get_session(year, event_name, session_type)
        session.load(laps=True, telemetry=True, weather=False)

        driver = session.results[session.results['Abbreviation'] == driver_code]
        if driver.empty:
            available_drivers = list(session.results['Abbreviation'])
            return jsonify({
                'error': f"Pilota '{driver_code}' non trovato in questa sessione.",
                'available_drivers': available_drivers
            }), 404

        driver_number = str(driver.iloc[0]['DriverNumber'])
        laps = session.laps.pick_driver(driver_number)

        if laps.empty:
            return jsonify({'error': 'Nessun giro trovato per questo pilota'}), 404

        fastest_lap = laps.pick_fastest()
        telemetry = fastest_lap.get_telemetry()

        telemetry_data = []
        for idx, row in telemetry.iterrows():
            time_val = row.get('Time', None)
            if hasattr(time_val, 'total_seconds'):
                time_val = float(time_val.total_seconds())
            else:
                try:
                    time_val = float(time_val)
                except (TypeError, ValueError):
                    time_val = float(idx) * 0.1

            telemetry_data.append({
                'Distance': float(row['Distance']),
                'Speed': float(row['Speed']),
                'RPM': float(row.get('RPM', 0) or 0),
                'nGear': int(row.get('nGear', 0) or 0),
                'Throttle': float(row.get('Throttle', 0) or 0),
                'Brake': float(row.get('Brake', 0) or 0),
                'DRS': int(row.get('DRS', 0) or 0),
                'Time': time_val
            })

        def safe_str(val):
            try:
                if pd.isna(val):
                    return None
            except Exception:
                pass
            return str(val)

        stats = {
            'max_speed': float(telemetry['Speed'].max()),
            'avg_speed': float(telemetry['Speed'].mean()),
            'max_rpm': float(telemetry['RPM'].max()) if 'RPM' in telemetry.columns else 0,
            'lap_time': safe_str(fastest_lap['LapTime']),
            'sector_1': safe_str(fastest_lap.get('Sector1Time')),
            'sector_2': safe_str(fastest_lap.get('Sector2Time')),
            'sector_3': safe_str(fastest_lap.get('Sector3Time')),
        }

        return jsonify({
            'driver': driver_code,
            'event': event_name,
            'session': f"{year} {event_name} {session_type}",
            'telemetry': telemetry_data,
            'stats': stats
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Errore: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ─── Comparazione ────────────────────────────────────────────────────────────
@app.route('/api/fastf1/comparison', methods=['GET'])
def get_comparison():
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'Q')
        driver1 = request.args.get('driver1', 'LEC')
        driver2 = request.args.get('driver2', 'SAI')

        event_name = find_event(year, gp)
        session = fastf1.get_session(year, event_name, session_type)
        session.load(laps=True, telemetry=True)

        drivers_data = {}
        for driver_code in [driver1, driver2]:
            driver = session.results[session.results['Abbreviation'] == driver_code]
            if not driver.empty:
                driver_number = str(driver.iloc[0]['DriverNumber'])
                laps = session.laps.pick_driver(driver_number)
                if not laps.empty:
                    fastest_lap = laps.pick_fastest()
                    telemetry = fastest_lap.get_telemetry()
                    drivers_data[driver_code] = [
                        {'distance': float(row['Distance']), 'speed': float(row['Speed'])}
                        for _, row in telemetry.iterrows()
                    ]

        return jsonify(drivers_data)

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Errore comparazione: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ─── Session info ─────────────────────────────────────────────────────────────
@app.route('/api/fastf1/session-info', methods=['GET'])
def get_session_info():
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'Q')

        event_name = find_event(year, gp)
        session = fastf1.get_session(year, event_name, session_type)
        session.load(weather=True)

        weather_data = None
        if hasattr(session, 'weather_data') and session.weather_data is not None and not session.weather_data.empty:
            weather = session.weather_data.iloc[0]
            weather_data = {
                'air_temp': float(weather['AirTemp']) if 'AirTemp' in weather else None,
                'track_temp': float(weather['TrackTemp']) if 'TrackTemp' in weather else None,
                'humidity': float(weather['Humidity']) if 'Humidity' in weather else None,
                'wind_speed': float(weather['WindSpeed']) if 'WindSpeed' in weather else None
            }

        classification = []
        if session.results is not None:
            for _, row in session.results.head(5).iterrows():
                classification.append({
                    'position': int(row['Position']) if pd.notna(row['Position']) else 0,
                    'driver': row['Abbreviation'],
                    'team': row.get('TeamName', 'Unknown'),
                    'time': str(row['Time']) if 'Time' in row and pd.notna(row['Time']) else None
                })

        return jsonify({
            'event': event_name,
            'session': session_type,
            'weather': weather_data,
            'classification': classification,
            'status': getattr(session, 'status', 'Unknown')
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Errore session info: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ─── Lap chart ───────────────────────────────────────────────────────────────
@app.route('/api/fastf1/lap-chart', methods=['GET'])
def get_lap_chart():
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'R')

        event_name = find_event(year, gp)
        session = fastf1.get_session(year, event_name, session_type)
        session.load(laps=True)

        result = {}
        for driver in session.results['Abbreviation']:
            driver_laps = session.laps.pick_driver(driver)
            if not driver_laps.empty:
                result[driver] = [
                    {
                        'lapNumber': int(lap['LapNumber']),
                        'lapTime': str(lap['LapTime'])
                    }
                    for _, lap in driver_laps.iterrows()
                    if pd.notna(lap['LapTime'])
                ]

        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Errore lap chart: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ─── Lap telemetry ───────────────────────────────────────────────────────────
@app.route('/api/fastf1/lap-telemetry', methods=['GET'])
def get_lap_telemetry():
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'R')
        driver_code = request.args.get('driver', 'LEC')
        lap_number = int(request.args.get('lap', 1))

        event_name = find_event(year, gp)
        session = fastf1.get_session(year, event_name, session_type)
        session.load(laps=True, telemetry=True)

        driver_laps = session.laps.pick_driver(driver_code)
        lap_rows = driver_laps[driver_laps['LapNumber'] == lap_number]

        if lap_rows.empty:
            return jsonify({'error': f'Giro {lap_number} non trovato per {driver_code}'}), 404

        specific_lap = lap_rows.iloc[0]
        telemetry = specific_lap.get_telemetry()

        telemetry_data = [
            {
                'Distance': float(row['Distance']),
                'Speed': float(row['Speed']),
                'RPM': float(row.get('RPM', 0) or 0),
                'nGear': int(row.get('nGear', 0) or 0),
                'Throttle': float(row.get('Throttle', 0) or 0),
                'Brake': float(row.get('Brake', 0) or 0),
                'DRS': int(row.get('DRS', 0) or 0),
                'Time': float(row['Time'].total_seconds()) if hasattr(row.get('Time'), 'total_seconds') else 0
            }
            for _, row in telemetry.iterrows()
        ]

        return jsonify({'telemetry': telemetry_data})

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Errore lap telemetry: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ─── Schedule ────────────────────────────────────────────────────────────────
@app.route('/api/fastf1/schedule', methods=['GET'])
def get_schedule():
    """Lista tutti gli eventi disponibili per un anno — utile per debug"""
    try:
        year = int(request.args.get('year', 2024))
        schedule = fastf1.get_event_schedule(year, include_testing=False)
        events = schedule[['RoundNumber', 'EventName', 'Location', 'EventDate']].to_dict('records')
        return jsonify({'year': year, 'events': events})
    except Exception as e:
        logger.error(f"Errore schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ─── Latest race ─────────────────────────────────────────────────────────────
@app.route('/api/fastf1/latest-race', methods=['GET'])
def get_latest_race():
    """Restituisce l'ultima gara passata disponibile"""
    try:
        current_year = datetime.now().year

        for year in [current_year, current_year - 1]:
            try:
                schedule = fastf1.get_event_schedule(year, include_testing=False)
                today = pd.Timestamp.now(tz='UTC')
                past_events = schedule[schedule['Session5Date'] < today]

                if not past_events.empty:
                    latest = past_events.iloc[-1]
                    return jsonify({
                        'year': int(year),
                        'circuit': str(latest['Location']),
                        'event_name': str(latest['EventName']),
                        'session': 'Q',
                        'driver': 'LEC'
                    })
            except Exception as inner_e:
                logger.warning(f"Nessun evento per {year}: {inner_e}")
                continue

        # Fallback
        return jsonify({
            'year': 2024,
            'circuit': 'Monza',
            'event_name': 'Italian Grand Prix',
            'session': 'Q',
            'driver': 'LEC'
        })

    except Exception as e:
        logger.error(f"Errore latest-race: {str(e)}")
        return jsonify({
            'year': 2024,
            'circuit': 'Monza',
            'event_name': 'Italian Grand Prix',
            'session': 'Q',
            'driver': 'LEC'
        })


# ─── Health ──────────────────────────────────────────────────────────────────
@app.route('/api/fastf1/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'fastf1_version': fastf1.__version__,
        'cache_enabled': fastf1.Cache.enabled
    })


if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Server FastF1 avviato!")
    print("📡 Endpoint disponibili:")
    print("   GET /api/fastf1/health")
    print("   GET /api/fastf1/schedule?year=2024")
    print("   GET /api/fastf1/latest-race")
    print("   GET /api/fastf1/telemetry?year=2024&gp=Monza&session=Q&driver=LEC")
    print("   GET /api/fastf1/comparison?year=2024&gp=Monza&session=Q&driver1=LEC&driver2=SAI")
    print("   GET /api/fastf1/session-info?year=2024&gp=Monza&session=Q")
    print("   GET /api/fastf1/lap-chart?year=2024&gp=Monza&session=R")
    print("   GET /api/fastf1/lap-telemetry?year=2024&gp=Monza&session=R&driver=LEC&lap=5")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True)
