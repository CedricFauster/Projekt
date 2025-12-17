import { useState } from "react";
import "./styles.css";
import ExploreView from "./components/ExploreView";
import FilterBar from "./components/FilterBar";
import FocusView from "./components/FocusView";

export default function App() {
  const [location, setLocation] = useState("nord");
  const [dateFrom, setDateFrom] = useState("2024-01");
  const [dateTo, setDateTo] = useState("2024-12");
  const [weather, setWeather] = useState("nebel");
  const [view, setView] = useState("fokus"); // "fokus" | "explore"


  const resetFilters = () => {
    setLocation("nord");
    setDateFrom("2024-01");
    setDateTo("2024-12");
    setWeather("nebel");
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

  const weatherLabel =
    weather === "nebel"
      ? "Nebel"
      : weather === "regen"
      ? "Regen"
      : weather === "sonne"
      ? "Sonne"
      : weather === "bewoelkt"
      ? "Bewoelkt"
      : weather === "schnee"
      ? "Schnee"
      : "Alle";

  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">
          <div className="logoText">
            <span className="logoTitle">Passantenfrequenzen Bahnhofstrasse</span>
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
            weather={weather}
            setWeather={setWeather}
            onReset={resetFilters}
          />
        )}

        {view === "fokus" && (
          <div className="card">
            <h2>Fokusfrage</h2>
            <p>
              Wie unterscheidet sich der Anteil von <strong>Kindern</strong> und{" "}
              <strong>Erwachsenen</strong> bei <strong>Nebel</strong> an der{" "}
              <strong>Bahnhofstrasse Nord</strong> im Jahr <strong>2024</strong>?
            </p>

            <p className="meta">
              Ort: Bahnhofstrasse Nord · Wetter: Nebel · Jahr: 2024
            </p>

            <div className="chartBox">
              <FocusView />
            </div>

            <p className="meta">
             Der Anteil der Kinder ist in den Sommermonaten am höchsten, während im Winter
             der Anteil der Erwachsenen überwiegt.
            </p>
          </div>
        )}

        {view === "explore" && (
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
              weather={weather}
            />
          </div>
        </div>
      )}

      </main>
    </div>
  );
}