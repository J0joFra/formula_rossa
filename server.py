from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import pandas as pd
import numpy as np
from fastf1 import get_session
import logging
from datetime import datetime
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app) 

fastf1.Cache.enable_cache('fastf1_cache') 
@app.route('/api/fastf1/telemetry', methods=['GET'])
def get_telemetry():
    """
    Endpoint per ottenere i dati telemetrici di un pilota
    Parametri: year, gp, session, driver
    """
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'Q')  # Q = Qualifying
        driver_code = request.args.get('driver', 'LEC')
        
        logger.info(f"Richiesta telemetria: {year} {gp} {session_type} {driver_code}")

        session = get_session(year, gp, session_type)
        
        session.load(laps=True, telemetry=True, weather=False)
        driver = session.results[session.results['Abbreviation'] == driver_code]
        
        if driver.empty:
            return jsonify({'error': 'Pilota non trovato'}), 404
            
        driver_number = str(driver.iloc[0]['DriverNumber'])
        
        laps = session.laps.pick_driver(driver_number)
        
        if laps.empty:
            return jsonify({'error': 'Nessun giro trovato per questo pilota'}), 404
            
        # Prendi il giro più veloce o l'ultimo giro
        fastest_lap = laps.pick_fastest()
        
        # Ottieni la telemetria
        telemetry = fastest_lap.get_telemetry()
        
        # Prepara i dati per il frontend
        telemetry_data = []
        for idx, row in telemetry.iterrows():
            telemetry_data.append({
                'Distance': float(row['Distance']),
                'Speed': float(row['Speed']),
                'RPM': float(row.get('RPM', 0)),
                'nGear': int(row.get('nGear', 0)),
                'Throttle': float(row.get('Throttle', 0)),
                'Brake': float(row.get('Brake', 0)),
                'DRS': int(row.get('DRS', 0)),
                'Time': float(row.get('Time', idx * 0.1))
            })
        
        # Statistiche aggiuntive
        stats = {
            'max_speed': float(telemetry['Speed'].max()),
            'avg_speed': float(telemetry['Speed'].mean()),
            'max_rpm': float(telemetry.get('RPM', pd.Series([0])).max()),
            'lap_time': str(fastest_lap['LapTime']),
            'sector_1': str(fastest_lap['Sector1Time']) if 'Sector1Time' in fastest_lap else None,
            'sector_2': str(fastest_lap['Sector2Time']) if 'Sector2Time' in fastest_lap else None,
            'sector_3': str(fastest_lap['Sector3Time']) if 'Sector3Time' in fastest_lap else None
        }
        
        response = {
            'driver': driver_code,
            'session': f"{year} {gp} {session_type}",
            'telemetry': telemetry_data,
            'stats': stats
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Errore: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/fastf1/comparison', methods=['GET'])
def get_comparison():
    """
    Endpoint per confrontare due piloti
    """
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'Q')
        driver1 = request.args.get('driver1', 'LEC')
        driver2 = request.args.get('driver2', 'SAI')
        
        # Carica sessione
        session = get_session(year, gp, session_type)
        session.load(laps=True, telemetry=True)
        
        # Ottieni dati per entrambi i piloti
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
        
    except Exception as e:
        logger.error(f"Errore comparazione: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/fastf1/session-info', methods=['GET'])
def get_session_info():
    """
    Endpoint per info sulla sessione (meteo, stato, etc.)
    """
    try:
        year = int(request.args.get('year', 2024))
        gp = request.args.get('gp', 'Monza')
        session_type = request.args.get('session', 'Q')
        
        session = get_session(year, gp, session_type)
        session.load(weather=True)
        
        # Ottieni info meteo se disponibili
        weather_data = None
        if hasattr(session, 'weather_data') and session.weather_data is not None:
            weather = session.weather_data.iloc[0] if not session.weather_data.empty else None
            if weather is not None:
                weather_data = {
                    'air_temp': float(weather['AirTemp']) if 'AirTemp' in weather else None,
                    'track_temp': float(weather['TrackTemp']) if 'TrackTemp' in weather else None,
                    'humidity': float(weather['Humidity']) if 'Humidity' in weather else None,
                    'wind_speed': float(weather['WindSpeed']) if 'WindSpeed' in weather else None
                }
        
        # Ottieni classifica
        classification = []
        if session.results is not None:
            for _, row in session.results.head(5).iterrows():
                classification.append({
                    'position': int(row['Position']),
                    'driver': row['Abbreviation'],
                    'team': row['TeamName'] if 'TeamName' in row else 'Unknown',
                    'time': str(row['Time']) if 'Time' in row and pd.notna(row['Time']) else None
                })
        
        response = {
            'event': f"{year} {gp}",
            'session': session_type,
            'weather': weather_data,
            'classification': classification,
            'status': session.status if hasattr(session, 'status') else 'Unknown'
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Errore session info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/fastf1/health', methods=['GET'])
def health_check():
    """Endpoint per verificare che il server sia attivo"""
    return jsonify({
        'status': 'online',
        'fastf1_version': fastf1.__version__,
        'cache_enabled': fastf1.Cache.enabled
    })

@app.route('/api/fastf1/latest-race', methods=['GET'])
def get_latest_race():
    """
    Restituisce l'ultima gara disponibile nella cache FastF1
    """
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
                logger.warning(f"Nessun evento trovato per {year}: {inner_e}")
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
        
@app.route('/api/fastf1/lap-chart', methods=['GET'])
def get_lap_chart():
    """Restituisce i tempi sul giro per tutti i piloti"""
    year = int(request.args.get('year', 2024))
    gp = request.args.get('gp', 'Monza')
    session_type = request.args.get('session', 'R')
    
    session = get_session(year, gp, session_type)
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
            ]
    
    return jsonify(result)

@app.route('/api/fastf1/lap-telemetry', methods=['GET'])
def get_lap_telemetry():
    """Restituisce la telemetria per un giro specifico"""
    year = int(request.args.get('year', 2024))
    gp = request.args.get('gp', 'Monza')
    session_type = request.args.get('session', 'R')
    driver_code = request.args.get('driver', 'LEC')
    lap_number = int(request.args.get('lap', 1))
    
    session = get_session(year, gp, session_type)
    session.load(laps=True, telemetry=True)
    
    driver_laps = session.laps.pick_driver(driver_code)
    specific_lap = driver_laps[driver_laps['LapNumber'] == lap_number].iloc[0]
    telemetry = specific_lap.get_telemetry()
    
    telemetry_data = []
    for _, row in telemetry.iterrows():
        telemetry_data.append({
            'Distance': float(row['Distance']),
            'Speed': float(row['Speed']),
            'RPM': float(row.get('RPM', 0)),
            'nGear': int(row.get('nGear', 0)),
            'Throttle': float(row.get('Throttle', 0)),
            'Brake': float(row.get('Brake', 0)),
            'DRS': int(row.get('DRS', 0)),
            'Time': float(row.get('Time', 0))
        })
    
    return jsonify({'telemetry': telemetry_data})
              
if __name__ == '__main__':
    print("="*50)
    print("🚀 Server FastF1 avviato!")
    print("📡 Endpoint disponibili:")
    print("   - GET /api/fastf1/health")
    print("   - GET /api/fastf1/telemetry?year=2024&gp=Monza&session=Q&driver=LEC")
    print("   - GET /api/fastf1/comparison?driver1=LEC&driver2=SAI")
    print("   - GET /api/fastf1/session-info")
    print("="*50)
    
    # Avvia il server
    app.run(host='0.0.0.0', port=5000, debug=True)