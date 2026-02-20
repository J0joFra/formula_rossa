from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import pandas as pd
import numpy as np
from datetime import datetime
import logging

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fastf1.Cache.enable_cache('f1_cache')

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",  # Sviluppo locale
    "http://localhost:3001",
    "https://formula-rossa.it",  
    "https://www.formula-rossa.it",
    "https://formula-rossa.onrender.com", 
    "*" 
])

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'message': 'F1 Backend API - Powered by FastF1',
        'endpoints': [
            '/session_info',
            '/drivers',
            '/live_timing',
            '/telemetry/<driver_number>',
            '/weather'
        ]
    })

@app.route('/session_info', methods=['GET'])
def session_info():
    """Ottieni info sulla prossima/ultima sessione"""
    try:
        # Puoi rendere questo parametrizzabile
        year = request.args.get('year', datetime.now().year)
        gp = request.args.get('gp', 'Monaco')  # Default Monaco per test
        session_type = request.args.get('session', 'R')
        
        # Carica la sessione
        session = fastf1.get_session(int(year), gp, session_type)
        session.load()
        
        return jsonify({
            'year': year,
            'gp': gp,
            'session': session_type,
            'name': session.event['EventName'],
            'circuit': session.event['CircuitName'],
            'date': session.date.isoformat() if session.date else None,
            'total_laps': session.total_laps or 0
        })
    except Exception as e:
        logger.error(f"Errore session_info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/drivers', methods=['GET'])
def get_drivers():
    """Lista piloti per la sessione"""
    try:
        # Usa una sessione di default per test
        session = fastf1.get_session(2025, 'Monaco', 'R')
        session.load()
        
        drivers = []
        for drv in session.drivers:
            driver_info = session.get_driver(drv)
            drivers.append({
                'driver_number': drv,
                'name': driver_info['FullName'],
                'abbreviation': driver_info['Abbreviation'],
                'team': driver_info['TeamName'],
                'team_colour': driver_info['TeamColor']
            })
        
        return jsonify(drivers)
    except Exception as e:
        logger.error(f"Errore drivers: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/live_timing', methods=['GET'])
def live_timing():
    """Dati live timing (classifica)"""
    try:
        # Per test, usa una sessione passata
        session = fastf1.get_session(2025, 'Monaco', 'R')
        session.load()
        
        # Ottieni i risultati
        results = session.results
        if results is None or results.empty:
            return jsonify([])
        
        standings = []
        for idx, row in results.iterrows():
            standings.append({
                'position': idx + 1,
                'driver_number': row['DriverNumber'],
                'name': row['FullName'],
                'team': row['TeamName'],
                'gap_to_leader': str(row['Time']),
                'status': row['Status']
            })
        
        return jsonify(standings)
    except Exception as e:
        logger.error(f"Errore live_timing: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/telemetry/<driver_number>', methods=['GET'])
def telemetry(driver_number):
    """Telemetria per un pilota specifico"""
    try:
        session = fastf1.get_session(2025, 'Monaco', 'R')
        session.load()
        
        # Ottieni i giri del pilota
        laps = session.laps.pick_driver(driver_number)
        if laps.empty:
            return jsonify({'error': 'Nessun dato trovato'}), 404
        
        # Prendi il giro più veloce
        fastest_lap = laps.pick_fastest()
        
        # Ottieni telemetria
        telemetry_data = fastest_lap.get_telemetry()
        
        sampled = telemetry_data.iloc[::10]  # Ogni 10 righe
        
        return jsonify({
            'driver_number': driver_number,
            'fastest_lap_time': str(fastest_lap['LapTime']),
            'telemetry': sampled.to_dict(orient='records')
        })
    except Exception as e:
        logger.error(f"Errore telemetry: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/weather', methods=['GET'])
def weather():
    """Dati meteo della sessione"""
    try:
        session = fastf1.get_session(2025, 'Monaco', 'R')
        session.load()
        
        return jsonify({
            'air_temperature': '24°C',
            'track_temperature': '38°C',
            'humidity': '45%',
            'rainfall': False
        })
    except Exception as e:
        logger.error(f"Errore weather: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)