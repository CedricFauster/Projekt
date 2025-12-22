import React from "react";

const YEARS = ["2021", "2022", "2023", "2024", "2025"];

const MONTHS = [
  { value: "01", label: "Januar" },
  { value: "02", label: "Februar" },
  { value: "03", label: "März" },
  { value: "04", label: "April" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Dezember" },
];

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
  const [fromYear, fromMonth] = dateFrom.split("-");
  const [toYear, toMonth] = dateTo.split("-");

  const makeYM = (y, m) => `${y}-${m}`;

  // --- HILFSFUNKTIONEN FÜR DATUM ---
  const handleFromYearChange = (y) => setDateFrom(makeYM(y, fromMonth));
  const handleFromMonthChange = (m) => setDateFrom(makeYM(fromYear, m));
  const handleToYearChange = (y) => setDateTo(makeYM(y, toMonth));
  const handleToMonthChange = (m) => setDateTo(makeYM(toYear, m));

  const toggleWeather = (id) => {
    if (weatherList.includes(id)) {
      setWeatherList(weatherList.filter((w) => w !== id));
    } else {
      setWeatherList([...weatherList, id]);
    }
  };

  return (
    <div className="filterBar">
      {/* Standort */}
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

      {/* Zeitraum */}
      <div className="timeBlock">
        {/* Von Datum */}
        <div className="filterGroup">
          <label className="filterLabel">Von</label>
            <input
              className="filterControl"
              type="date"
              value={dateFrom}
              max={dateTo}                 // sperrt: Von kann nicht nach Bis liegen
              onChange={(e) => {
                const nextFrom = e.target.value;
                // Sicherheitsnetz:
                if (nextFrom > dateTo) {
                  setDateFrom(dateTo);
                } else {
                  setDateFrom(nextFrom);
                }
              }}
            />
          </div>

          <div className="filterGroup">
            <label className="filterLabel">Bis</label>
            <input
              className="filterControl"
              type="date"
              value={dateTo}
              min={dateFrom}               // sperrt: Bis kann nicht vor Von liegen
              onChange={(e) => {
              const nextTo = e.target.value;
              // Sicherheitsnetz:
              if (nextTo < dateFrom) {
                setDateTo(dateFrom);
              } else {
                setDateTo(nextTo);
              }
            }}
          />
        </div>
      </div>

      <div className="divider"></div>

      {/* Gruppe */}
      <div className="filterGroup">
        <label className="filterLabel">Gruppe</label>

        <div className="segmented" role="tablist" aria-label="Gruppe">
          <button
          type="button"
          className={group === "beide" ? "segBtn active" : "segBtn"}
          onClick={() => setGroup("beide")}
          >
            Beide
          </button>
          <button
            type="button"
            className={group === "kinder" ? "segBtn active" : "segBtn"}
            onClick={() => setGroup("kinder")}
          >
            Kinder
          </button>
          <button
            type="button"
            className={group === "erwachsene" ? "segBtn active" : "segBtn"}
            onClick={() => setGroup("erwachsene")}
          >
            Erwachsene
          </button>
        </div>
      </div>

      {/* Wetter */}
      <div className="filterGroup fullWidth">
        <label className="filterLabel">Wetter (Mehrfachauswahl)</label>

          <div className="chipRow">
            <button
              type="button"
              className={weatherList.length === 0 ? "chip active" : "chip"}
              onClick={() => setWeatherList([])}
              title="Alle Wetterbedingungen"
            >
              Alle
            </button>

            {WEATHER_OPTIONS.map((w) => {
              const isOn = weatherList.includes(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  className={isOn ? "chip active" : "chip"}
                  onClick={() => {
                  if (isOn) {
                    setWeatherList(weatherList.filter((x) => x !== w.id));
                  } else {
                    setWeatherList([...weatherList, w.id]);
                  }
                }}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

      <div className="filterActions">
        <button type="button" className="btnReset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
