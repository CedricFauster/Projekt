from typing import Optional # um Anfragen mit optionalen parameter zu machen
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse # Wird benötigt, wenn wir JSON-String zurückgeben
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

# Datensatz laden (muss in data liegen)
DATA_FILE = "data/Gesamtdatensatz.csv" 

'''
1.  Instanzierung
2.  Cross-Origin Resource Sharing definieren
3.  CSV als DataFrame laden
'''

app = FastAPI()

# middleware prüft wer und über was frontend und backend reden dürfen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Anfragen von jeder Adresse erlauben
    allow_credentials=False, # Haben eh keine Logindaten - erhöht Sicherheit
    allow_methods=["GET"], # Nur Lesezugriff erlauben
    allow_headers=["*"], # Erlaube alle Metadaten im Header
)

# 2. DataFrame für die Speicherung der Daten initialisieren
try:
    df_data = pd.read_csv(DATA_FILE)
    
    # Formatscheisse: format='ISO8601' (2004-06-14T23:34:30).Das panda richtig parsen kann. 
    df_data['timestamp'] = pd.to_datetime(
        df_data['timestamp'], 
        format = 'ISO8601', 
        utc = True
    )
    
    print(f"Daten erfolgreich geladen. Anzahl Zeilen: {len(df_data)}")

except FileNotFoundError:
    print(f"FEHLER: Die Datei '{DATA_FILE}' wurde nicht gefunden. Konsultieren Sie bitte das README.md")
    df_data = pd.DataFrame() 


'''
Abgeschlossen:
1.  df_data enthält alle Daten von gottgegebenen DATA_FILE
2.  fängt ab falls kein Datensatz vorhanden
3.  Kommunikation zwischen front- und backend freigegeben

Folgend:
1.  Endpunkt für Datenexploration
'''

# Alle Daten senden oder optional nach (1) Standort, (2) Startzeit, (3) Endzeit, (4) Uhrzeit, (5) Fussgängergruppe und (6) Wetter filtern.
@app.get("/data")
def get_filtered_data(
    location_name: Optional[str] = None, 
    start_time: Optional[str] = None,    
    end_time: Optional[str] = None,
    hour: Optional[int] = None,
    group: str = "beide", # 'kinder', 'erwachsene' oder 'beide'
    weather: Optional[list[str]] = Query(None) 
):
    df_filtered = df_data.copy()
    
    if location_name and location_name != "Alle": # Wenn er "Alle" will soll nicht gefiltert werden.
        df_filtered = df_filtered[df_filtered['location_name'] == location_name]
    
    if start_time:
        st = pd.to_datetime(start_time, utc=True)
        df_filtered = df_filtered[df_filtered['timestamp'] >= st]
        
    if end_time:
        et = pd.to_datetime(end_time, utc=True) + pd.Timedelta(days=1) - pd.Timedelta(seconds=1)
        df_filtered = df_filtered[df_filtered['timestamp'] <= et]

    if hour is not None:
        df_filtered = df_filtered[df_filtered['timestamp'].dt.hour == hour]

    if weather and len(weather) > 0:
        # .isin() prüft, ob das Wetter in der vom User geschickten Liste enthalten ist
        df_filtered = df_filtered[df_filtered['weather_condition'].isin(weather)]

    if group == "kinder":
        df_filtered = df_filtered.drop(columns=['adult_pedestrians_count'])

    elif group == "erwachsene":
        df_filtered = df_filtered.drop(columns=['child_pedestrians_count'])
    # bei "beide" lassen wir einfach alles drin

    # Performance-Check
    if len(df_filtered) > 5000:
        # Hier Performance weiter verbessern
        pass 

    return JSONResponse(content=df_filtered.to_json(orient='records'))

'''
Abgeschlossen:
1.  Datenexploration laden

Folgend:
1. Fokusfrage lösen
'''

# Kinder- und Erwachsenenanteil an Bahnhofstrasse Nord bei Nebel im Jahr 2024
@app.get("/fokusfrage")
def get_fokusfrage_data():
    ist_2024 = df_data['timestamp'].dt.year == 2024
    ist_nord = df_data['location_name'] == 'Bahnhofstrasse (Nord)'
    ist_nebel = df_data['weather_condition'].str.lower().str.contains('fog', na=False)

    df_gefiltert = df_data[ist_2024 & ist_nord & ist_nebel].copy()

    monats_namen = {
        1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"May", 6:"Jun", 
        7:"Jul", 8:"Aug", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Dec"
    }
    
    ergebnis_liste = []

    for monat_nr in range(1, 13):
        name = monats_namen[monat_nr]
        
        # Daten für iterierten Monat abrufen
        daten_monat = df_gefiltert[df_gefiltert['timestamp'].dt.month == monat_nr]
        
        # Anteile berechnen 
        kinder = daten_monat['child_pedestrians_count'].sum()
        erwachsene = daten_monat['adult_pedestrians_count'].sum()
        gesamt = kinder + erwachsene
        
        if gesamt > 0:
            anteil_kinder = kinder / gesamt
            anteil_erwachsene = erwachsene / gesamt
        else:
            anteil_kinder = 0
            anteil_erwachsene = 0
    
        # Formatierung für frontendboss
        ergebnis_liste.append({"month": name, "group": "Kinder", "share": anteil_kinder})
        ergebnis_liste.append({"month": name, "group": "Erwachsene", "share": anteil_erwachsene})

    return ergebnis_liste

'''
Abgeschlossen:
1.  Fokusfrage gelöst

Folgend:
1.  Spezifische Endpunkt Abfragen
    vorwiegend für entwicklung!
'''

# Datenübersicht
@app.get("/stats")
def get_data_stats():
    
    if df_data.empty:
        raise HTTPException(
            status_code=500,
            detail="Daten konnten nicht geladen werden. Bitte stellen Sie unser Projekt nich so sehr auf die Probe (wir wissen nicht was wir tun!)."
        )
    
    return{
        "status": "Daten geladen",
        "total_rows": len(df_data),
        "columns": list(df_data.columns),
        "memory_usage": f"{df_data.memory_usage(deep=True).sum() / (1024**2):.2f} MB"
    }

# Zeitspanne von {YYYY-MM-DD} bis {YYYY-MM-DD} laden
@app.get("/time_range")
def get_time_range():
    
    if df_data.empty:
        raise HTTPException(
            status_code=500, 
            detail="Daten konnten nicht geladen werden. Keine Zeitinformation verfügbar."
        )
        
    min_time = df_data['timestamp'].min()
    max_time = df_data['timestamp'].max()
    
    # return mit .isoformat wird datum wieder als ISO8601 Format gesendet -> eindeutige front- backend verarbeitung.
    return{
        "min_timestamp": min_time.isoformat(),
        "max_timestamp": max_time.isoformat()
    }

# Standorte laden
@app.get("/locations")
def get_all_locations():
    
    if df_data.empty:
        raise HTTPException(
            status_code = 500, 
            detail = "Daten konnten nicht geladen werden. In Zürich gibt es gar keine Strassen."
        )
    
    # .unique sucht in der richtigen Spalte, .tolist macht aus einem array eine hübsche python list
    location_list = df_data['location_name'].unique().tolist()
    
    return{
        "locations": location_list
    }

# Wetter laden
@app.get("/weather")
def get_weather_conditions():
    
    if df_data.empty:
        raise HTTPException(
            status_code = 500, 
            detail = "Daten konnten nicht geladen werden. Keine Wetterbedingungen verfügbar."
        )

    weather_list = df_data['weather_condition'].unique().tolist()

    return{
        "weather_condition": weather_list
    }