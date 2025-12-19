'''
1.  richtige env auswählen "3050-WID_Backend"
2.  lokal laden: code in terminal eingeben: "cd backend" "uvicorn backend_app:app --reload"
3.  Uvicorn "http://127.0.0.1:8000" aufrufen, muss aber mit "/{z.B. data, stats oder location}" ergänzt werden

##################################################################################################################

Verarbeitbare Perimeter:
1.  start_time = "YYYY-MM-DD"
2.  end_time = "YYYY-MM-DD"
3.  hour = [1, 2, 3, ... , 22, 23, 0] as int
4.  location_name = ["Bahnhofstrasse (Mitte)", "Bahnhofstrasse (Nord)", "Bahnhofstrasse (Süd)", "Lintheschergasse"]
5.  Weather = []
6.  granularity = ["day", "week", "month", "quarter", "year"]
'''

from typing import Optional # um Anfragen optional genauer einzugrenzen
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse # Wird benötigt, wenn wir JSON-String zurückgeben
import pandas as pd

# Datensatz laden (muss in data liegen)
DATA_FILE = "data/Gesamtdatensatz.csv" 


'''
Abgeschlossen:
1.  alle imports abgeschlossen
2.  Richtiger Datensatz geladen

Folgend
1.  Instanzierung
2.  Datensatz lesen
'''

app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware

# Das ist der "Türsteher", der deinem Kollegen den Zutritt erlaubt
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Das Sternchen bedeutet: Erlaube Anfragen von JEDER Adresse
    allow_credentials=True,
    allow_methods=["*"], # Erlaube alle Funktionen (GET, POST, etc.)
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
    print(f"FEHLER: Die Datei '{DATA_FILE}' wurde nicht gefunden.")
    df_data = pd.DataFrame() 


'''
Abgeschlossen:
1.  df_data enthält alle Daten von gottgegebenen DATA_FILE
2.  fängt ab falls kein Datensatz vorhanden

Folgend:
1.  Endpunkte für Datenabfrage
'''

# Datenübersicht laden
@app.get("/stats")
def get_data_stats():
    
    if df_data.empty:
        return {"error": "Daten konnten nicht geladen werden. Bitte stellen Sie unser Projekt nich so sehr auf die Probe (wir wissen nicht was wir tun!)."}
        
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
            status_code = 500, 
            detail = "Daten konnten nicht geladen werden. Keine Zeitinformation verfügbar."
        )
        
    min_time = df_data['timestamp'].min()
    max_time = df_data['timestamp'].max()
    
    # return mit .isoformat wird datum als ISO8601 Format gesendet -> eindeutige front- backend verarbeitung.
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
            detail = "Daten konnten nicht geladen werden. Keine Standortinformation verfügbar."
        )
    
    # .unique sucht in der richtigen Spalte
    # .tolist macht aus einem array eine hübsche python list
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
            detail = "Daten konnten nicht geladen werden. Keine Wetterkondizionen verfügbar."
        )

    weather_list = df_data['weather_condition'].unique().tolist()

    return{
        "weather_condition": weather_list
    }

'''
Abgeschlossen:
1.  Spezifische Metadaten laden

Folgend:
1. Fokusfrage lösen
2. Lösung laden und senden
'''


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
1.  Zusammengefasste Daten
'''

# Aggregierte Daten von entweder tagen, wochen, monaten, quartalen oder jahre
@app.get("/aggregate")
def get_aggregated_data(
    granularity: str, # 'day', 'week', 'month', 'quarter', 'year'
    location_name: Optional[str] = None
):

    df_agg = df_data.copy()
    
    # 1. Filterung nach Standort
    if location_name:
        if location_name not in df_agg['location_name'].unique():
            raise HTTPException(
                status_code = 404, 
                detail = f"Standort '{location_name}' nicht gefunden."
                )
        df_agg = df_agg[df_agg['location_name'] == location_name]


    '''
    Code zur Aggregation aus https://pandas.pydata.org/docs/user_guide/timeseries.html#resampling.
    '''
    # 2. Definiere die Aggregationsbasis
    if granularity.lower() == 'day':
        resample_rule = 'D'
    elif granularity.lower() == 'week':
        resample_rule = 'W'
    elif granularity.lower() == 'month':
        resample_rule = 'M'
    elif granularity.lower() == 'quarter':
        resample_rule = 'Q'
    elif granularity.lower() == 'year':
        resample_rule = 'YE'
    else:
        raise HTTPException(
            status_code = 400, 
            detail="Ungültige Granularität. Wähle 'day', 'week', 'month', 'quarter' oder 'year'."
            )

    # 3. Resampling und Aggregation
    
    # Setze 'timestamp' als Index für das Resampling
    df_agg = df_agg.set_index('timestamp')
    
    # Wähle nur die relevanten Zählspalten für die Summe aus
    count_columns = [col for col in df_agg.columns if 'count' in col and 'id' not in col]
    
    # Führe das Resampling (zeitliche Aggregation) durch und summiere die Zählungen
    df_resampled = df_agg[count_columns].resample(resample_rule).sum()
    
    # Die Aggregation erfordert, dass Standort und Wetter-Infos als neue Spalten hinzugefügt werden (oder weggelassen)
    # Für diesen einfachen Endpunkt geben wir nur die Zählungen zurück.
    
    df_resampled = df_resampled.reset_index() # Mache 'timestamp' wieder zu einer Spalte
    
    # 4. JSON-Konformität sicherstellen und Rückgabe
    df_resampled = df_resampled.where(pd.notnull, None) 
    
    # Wir senden das JSON als String zurück, um Serialisierungsprobleme zu vermeiden (wie zuvor gelernt)
    return JSONResponse(content=df_resampled.to_json(orient='records'))


'''
Abgeschlossen:
1.  Zusammengefasste Daten

Folgend:
1.  Datenexploration
'''

# Alle Daten senden oder optional nach (1) Standort, (2) Startzeit, (3) Endzeit, (4) Uhrzeit, (5) Fussgängergruppe und 6(Wetter) filtern.
from fastapi import Query

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

    # --- NEU: FILTER FÜR GRUPPE (Radiobox) ---
    # Wir löschen einfach die Spalten, die der User NICHT sehen will
    if group == "kinder":
        # Nur Kinder behalten, Erwachsene-Spalte weg
        df_filtered = df_filtered.drop(columns=['adult_pedestrians_count'])
    elif group == "erwachsene":
        # Nur Erwachsene behalten, Kinder-Spalte weg
        df_filtered = df_filtered.drop(columns=['child_pedestrians_count'])
    # bei 'beide' lassen wir einfach alles drin

    # Performance-Check (wie gehabt)
    if len(df_filtered) > 5000:
        # Hier könntest du bei Bedarf wieder eine Aggregation einbauen
        pass 

    return JSONResponse(content=df_filtered.to_json(orient='records'))














    # 5. Leistungsprüfung (Aggregation ab 5000 Zeilen)
    if len(df_filtered) > 5000:
        
        # ... (Deine gesamte Aggregationslogik, wie zuvor definiert)
        df_filtered['date'] = df_filtered['timestamp'].dt.date
        aggregation_columns = [
             col for col in df_filtered.columns 
             if 'count' in col or col in ['location_name', 'date']
        ]
        df_aggregated = df_filtered[aggregation_columns].groupby(['location_name', 'date']).sum().reset_index()
        
        # option='split' ist das bevorzugte Format für Altair/Vega.
        return df_aggregated.to_json(orient='records')
    
    
    # Rückgabe des ungefilterten, aber kleinen Datensatzes direkt als JSON-String
    print(f"INFO: Rückgabe von {len(df_filtered)} Zeilen (keine Aggregation).")
    return JSONResponse(content = df_filtered.to_json(orient='records'))













