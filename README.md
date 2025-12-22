# Fussgänger-Analyse Stadt Zürich – Projektarbeit HS 25

Herzlich willkommen geschätztes Dozierenden-Team.

Dieses Projekt ist im Rahmen des Moduls "3050 Webprogrammierung und interaktive Datenvisualisierung" entstanden. Es analysiert die Passantenfrequenzen an der Bahnhofstrasse Zürich basierend auf den zur Verfügung gestellten Open-Data-Sätzen.

## Voraussetzungen:

Backend: Python 3.10+
Frontend: Node.js v18+

## Installation & Lokales Setup:

1. Daten vorbereiten
   Da der Gesamtdatensatz zu gross für das Repository ist, muss dieser manuell hinzugefügt werden:

   Laden Sie die Datei "Gesamtdatensatz.csv" herunter und fügen Sie diese hier ein: "Projekt/backend/data/Gesamtdatensatz.csv".

2. Backend einrichten
   Erstellen Sie eine virtuelle Umgebung, aktivieren Sie diese und installieren Sie die Abhängigkeiten:

   cd backend
   python -m venv (z.B. "fauster_brun_env")

   und aktivieren Sie die entsprechende Umgebung auch gleich.

   ### Installieren der Pakete

   pip install -r requirements.txt

3. Applikation starten
   Verwenden Sie zwei separate Terminals:

   ### Terminal A (Backend):

   cd backend
   uvicorn backend_app:app
   Die API ist nun unter http://127.0.0.1:8000 erreichbar.

   ### Terminal B (Frontend):

   cd frontend
   npm install
   npm start
   Nun öffnet sich http://localhost:3000 automatisch.

Viel Spass beim Erkunden.
