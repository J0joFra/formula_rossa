from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/telemetry")
def get_telemetry(year: int, gp: str, session_type: str, driver: str):
    try:
        fastf1.Cache.enable_cache('cache_folder') 
        
        session = fastf1.get_session(year, gp, session_type)
        session.load(telemetry=True, laps=True, weather=False)
        
        fastest_lap = session.laps.pick_driver(driver).pick_fastest()
        telemetry = fastest_lap.get_telemetry().add_distance()
        
        data = telemetry[['Distance', 'Speed', 'Throttle', 'Brake', 'Gear']].to_dict(orient='records')
        
        return {"driver": driver, "telemetry": data}
    except Exception as e:
        return {"error": str(e), "telemetry": []}