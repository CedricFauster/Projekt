import React from "react";

const WEATHER_OPTIONS = [
  { id: "cloudy", label: "Bewölkt" },
  { id: "partly-cloudy-day", label: "Teils bewölkter Tag" },
  { id: "partly-cloudy-night", label: "Teils bewölkte Nacht" },
  { id: "rain", label: "Regen" },
  { id: "clear-day", label: "Klarer Himmel (Tag)" },
  { id: "clear-night", label: "Freier Himmel (Nacht)" },
  { id: "fog", label: "Nebel" },
  { id: "snow", label: "Schnee" },
  { id: "wind", label: "Wind" },
];

export default function FilterBar({
  location,
  setLocation,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  group,
  setGroup,
  weatherList,
  setWeatherList,
  onReset,
}) {
  // Funktion zum Hinzufügen/Entfernen von Wetter-Filtern
  const handleToggleWeather = (id) => {
    if (weatherList.includes(id)) {
      setWeatherList(weatherList.filter((w) => w !== id));
    } else {
      setWeatherList([...weatherList, id]);
    }
  };

  return (
    <div className="filterBar">
      {/* Standort-Auswahl */}
      <div className="filterGroup">
        <label className="filterLabel">Standort</label>
        <select
          className="filterControl"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="all">Alle</option>
          <option value="nord">Bahnhofstrasse Nord</option>
          <option value="mitte">Bahnhofstrasse Mitte</option>
          <option value="sued">Bahnhofstrasse Süd</option>
          <option value="lintheschergasse">Lintheschergasse</option>
        </select>
      </div>

      <div className="divider" />

      {/* Zeit-Zeitraum (HTML5 Date Picker) */}
      <div className="timeBlock">
        <div className="filterGroup">
          <label className="filterLabel">Von</label>
          <input
            className="filterControl"
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => {
              const val = e.target.value;
              setDateFrom(val > dateTo ? dateTo : val);
            }}
          />
        </div>

        <div className="filterGroup">
          <label className="filterLabel">Bis</label>
          <input
            className="filterControl"
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => {
              const val = e.target.value;
              setDateTo(val < dateFrom ? dateFrom : val);
            }}
          />
        </div>
      </div>

      <div className="divider" />

      {/* Gruppe (Segmented Control) */}
      <div className="filterGroup">
        <label className="filterLabel">Gruppe</label>
        <div className="segmented">
          {["beide", "kinder", "erwachsene"].map((g) => (
            <button
              key={g}
              type="button"
              className={group === g ? "segBtn active" : "segBtn"}
              onClick={() => setGroup(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Wetter-Chips (Mehrfachauswahl) */}
      <div className="filterGroup fullWidth">
        <label className="filterLabel">Wetter (Mehrfachauswahl)</label>
        <div className="chipRow">
          <button
            type="button"
            className={weatherList.length === 0 ? "chip active" : "chip"}
            onClick={() => setWeatherList([])}
          >
            Alle
          </button>

          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w.id}
              type="button"
              className={weatherList.includes(w.id) ? "chip active" : "chip"}
              onClick={() => handleToggleWeather(w.id)}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aktionen */}
      <div className="filterActions">
        <button type="button" className="btnReset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
