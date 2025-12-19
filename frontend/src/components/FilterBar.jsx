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

      {/* Von Datum */}
      <div className="filterGroup">
        <label className="filterLabel">Von</label>
        <div style={{ display: "flex", gap: "4px" }}>
          <select
            className="filterControl"
            value={fromYear}
            onChange={(e) => handleFromYearChange(e.target.value)}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            className="filterControl"
            value={fromMonth}
            onChange={(e) => handleFromMonthChange(e.target.value)}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label.slice(0, 3)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bis Datum */}
      <div className="filterGroup">
        <label className="filterLabel">Bis</label>
        <div style={{ display: "flex", gap: "4px" }}>
          <select
            className="filterControl"
            value={toYear}
            onChange={(e) => handleToYearChange(e.target.value)}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            className="filterControl"
            value={toMonth}
            onChange={(e) => handleToMonthChange(e.target.value)}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label.slice(0, 3)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divider"></div>

      {/* Gruppe */}
      <div className="filterGroup">
        <label className="filterLabel">Gruppe</label>
        <div className="optionContainer">
          {["beide", "kinder", "erwachsene"].map((g) => (
            <label key={g} className="checkLabel">
              <input
                type="radio"
                name="groupSelect"
                value={g}
                checked={group === g}
                onChange={(e) => setGroup(e.target.value)}
              />
              {g === "beide" ? "Beide" : g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Wetter */}
      <div className="filterGroup fullWidth">
        <label className="filterLabel">Wetter (Mehrfachauswahl)</label>
        <div className="checkboxGrid">
          {WEATHER_OPTIONS.map((w) => (
            <label key={w.id} className="checkLabel">
              <input
                type="checkbox"
                checked={weatherList.includes(w.id)}
                onChange={() => toggleWeather(w.id)}
              />
              {w.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filterActions">
        <button type="button" className="btnSecondary" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
