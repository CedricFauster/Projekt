import { useState } from "react";
import "./styles.css";

export default function App() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(q.trim());
  };

  const [hue, setHue] = useState(210);

  return (
    <div className="app" style={{ "--accent": "hsl(" + hue + " 90% 50%)" }}>
      <header className="toolbar">
        <div className="brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            title="Youtube-Logo"
            className="logo"
          />

          <form
            role="search"
            aria-label="Webseite durchsuchen"
            onSubmit={onSubmit}
            className="searchForm"
          >
            <div className="searchWrap">
              <input
                type="search"
                placeholder="Suchen..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="searchInput"
              />

              <button
                type="submit"
                aria-label="Suchen"
                title="Suchen"
                className="searchBtn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="10"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79L20 20.5 21.5 19 15.5 14zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </form>

          <div className="control">
            <label htmlFor="hue">Farbe</label>
            <input
              id="hue"
              type="range"
              min="0"
              max="360"
              step="1"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="slider"
              aria-label="Akzentfarbe"
              title={"Farbton: " + hue + "°"}
            />
            <span className="badge">{hue}°</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="card">
          <h2>Willkommen auf der Startseite</h2>
          <p>
            Geben Sie etwas in die Suchleiste ein oder testen Sie den Regler.
          </p>
          {submitted && (
            <p>
              <strong>Gesucht:</strong> {submitted}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
