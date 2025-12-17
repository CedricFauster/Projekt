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
  { value: "12", label: "Dezember" }
];

export default function FilterBar({
  location,
  setLocation,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  weather,
  setWeather,
  onReset
}) {
  // dateFrom/dateTo sind "YYYY-MM"
  const [fromYear, fromMonth] = dateFrom.split("-");
  const [toYear, toMonth] = dateTo.split("-");

  const makeYM = (y, m) => `${y}-${m}`;

  const handleFromYearChange = (y) => {
    const newFrom = makeYM(y, fromMonth);
    setDateFrom(newFrom);
    if (dateTo < newFrom) setDateTo(newFrom);
  };

  const handleFromMonthChange = (m) => {
    const newFrom = makeYM(fromYear, m);
    setDateFrom(newFrom);
    if (dateTo < newFrom) setDateTo(newFrom);
  };

  const handleToYearChange = (y) => {
    const newTo = makeYM(y, toMonth);
    setDateTo(newTo);
    if (dateFrom > newTo) setDateFrom(newTo);
  };

  const handleToMonthChange = (m) => {
    const newTo = makeYM(toYear, m);
    setDateTo(newTo);
    if (dateFrom > newTo) setDateFrom(newTo);
  };

  return (
    <div className="filterBar">
      {/* Standort */}
      <div className="filterGroup">
        <label className="filterLabel" htmlFor="location">Standort</label>
        <select
          id="location"
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

      {/* Von: Jahr */}
      <div className="filterGroup">
        <label className="filterLabel">Von (Jahr)</label>
        <select
          className="filterControl"
          value={fromYear}
          onChange={(e) => handleFromYearChange(e.target.value)}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Von: Monat */}
      <div className="filterGroup">
        <label className="filterLabel">Von (Monat)</label>
        <select
          className="filterControl"
          value={fromMonth}
          onChange={(e) => handleFromMonthChange(e.target.value)}
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bis: Jahr */}
      <div className="filterGroup">
        <label className="filterLabel">Bis (Jahr)</label>
        <select
          className="filterControl"
          value={toYear}
          onChange={(e) => handleToYearChange(e.target.value)}
        >
          {YEARS.map((y) => (
            <option key={y} value={y} disabled={y < fromYear}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Bis: Monat */}
      <div className="filterGroup">
        <label className="filterLabel">Bis (Monat)</label>
        <select
          className="filterControl"
          value={toMonth}
          onChange={(e) => handleToMonthChange(e.target.value)}
        >
          {MONTHS.map((m) => {
            const disabled = toYear === fromYear ? m.value < fromMonth : false;
            return (
              <option key={m.value} value={m.value} disabled={disabled}>
                {m.label}
              </option>
            );
          })}
        </select>
      </div>

      {/* Wetter */}
      <div className="filterGroup">
        <label className="filterLabel" htmlFor="weather">Wetter</label>
        <select
          id="weather"
          className="filterControl"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        >
          <option value="all">Alle</option>
          <option value="nebel">Nebel</option>
          <option value="regen">Regen</option>
          <option value="sonne">Sonne</option>
          <option value="bewoelkt">Bewölkt</option>
        </select>
      </div>

      {/* Reset */}
      <div className="filterActions">
        <button type="button" className="btnSecondary" onClick={onReset}>
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
