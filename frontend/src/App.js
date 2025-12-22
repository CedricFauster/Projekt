import { useState } from "react";
import "./styles.css";
import ExploreView from "./components/ExploreView";
import FilterBar from "./components/FilterBar";
import FocusView from "./components/FocusView";
import MapView from "./components/MapView";

export default function App() {
  const [location, setLocation] = useState("nord");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-12-31");
  const [group, setGroup] = useState("beide");
  const [weatherList, setWeatherList] = useState([]);
  const [view, setView] = useState("fokus");

  const resetFilters = () => {
    setLocation("nord");
    setDateFrom("2024-01-01");
    setDateTo("2024-12-31");
    setGroup("beide");
    setWeatherList([]);
  };

  const locationLabel =
    location === "nord"
      ? "Bahnhofstrasse Nord"
      : location === "mitte"
      ? "Bahnhofstrasse Mitte"
      : location === "sued"
      ? "Bahnhofstrasse Sued"
      : location === "lintheschergasse"
      ? "Lintheschergasse"
      : location === "bahnhofplatz"
      ? "Bahnhofplatz"
      : "Alle";

  const countMonthsInclusive = (fromYM, toYM) => {
  const [fy, fm] = fromYM.split("-").map(Number);
  const [ty, tm] = toYM.split("-").map(Number);
    return (ty - fy) * 12 + (tm - fm) + 1;
  };

const monthsCount = countMonthsInclusive(dateFrom, dateTo);
const wideExplore = monthsCount > 12; // z.B. 2022–2024


  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">
          <div className="logoText">
            <span className="logoTitle">
              Passantenfrequenzen Bahnhofstrasse
            </span>
            <span className="logoSubtitle">
              Webvisualisierung · Projekt 3050 · Open Data Stadt Zuerich
            </span>
          </div>

          <nav className="navButtons">
            <button
              className={view === "fokus" ? "navBtn active" : "navBtn"}
              onClick={() => setView("fokus")}
            >
              Fokusfrage
            </button>

            <button
              className={view === "explore" ? "navBtn active" : "navBtn"}
              onClick={() => setView("explore")}
            >
              Interaktive Abfrage
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {view === "explore" && (
          <FilterBar
            location={location}
            setLocation={setLocation}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            group={group}
            setGroup={setGroup}
            weatherList={weatherList}
            setWeatherList={setWeatherList}
            onReset={resetFilters}
          />
        )}

        {view === "fokus" && (
          <div className="card">
            <h2>Fokusfrage</h2>
            <p>
              Wie verhält sich der Anteil von <strong>Kindern</strong> und{" "}
              <strong>Erwachsenen</strong> bei <strong>Nebel</strong> an der{" "}
              <strong>Bahnhofstrasse Nord</strong> im Jahr <strong>2024</strong>
              ?
            </p>

            <p className="meta">
              Ort: Bahnhofstrasse Nord · Wetter: Nebel · Jahr: 2024
            </p>

            <div className="chartBox">
              <FocusView />
            </div>

            <p className="meta">
              Der Anteil der Kinder an den Passantenfrequenzen bei Nebel
              ist im Januar 2024 am höchsten. In den weiteren Wintermonaten 
              nimmt dieser Anteil ab. Zwischen Februar und Oktober 2024 
              liegen keine Messungen bei Nebel vor, weshalb für diesen Zeitraum keine 
              Aussagen zum Vergleich möglich sind. 
              Die Auswertung basiert daher ausschliesslich auf den vorhandenen 
              Nebel-Messungen in den Wintermonaten.
            </p>
          </div>
        )}

        {view === "explore" && (
          <div className="twoCol">
            <div className="card">
              <h2>Interaktive Abfrage</h2>
                <p className="meta">
                  Vergleich der absoluten Passantenfrequenzen pro Monat (Kinder vs Erwachsene).
                </p>

                <div className="chartBox">
                  <ExploreView
                    location={location}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    group={group}
                    weatherList={weatherList}
                  />
                </div>
              </div>

              <div className="card">
                <MapView location={location} setLocation={setLocation} />
              </div>
            </div>
          )}

      </main>
    </div>
  );
}
