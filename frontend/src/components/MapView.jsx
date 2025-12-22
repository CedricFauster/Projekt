import React, { useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";

/**
 * GeoJSON -> Leaflet:
 * GeoJSON: [lon, lat]
 * Leaflet: [lat, lon]
 */
const swapLonLat = (coords) => coords.map(([lon, lat]) => [lat, lon]);

const AREAS = [
  {
    id: "mitte",
    name: "Bahnhofstrasse (Mitte)",
    ring: [
      [8.538947, 47.370233],
      [8.539215, 47.370273],
      [8.538936, 47.371039],
      [8.53863, 47.371879],
      [8.538453, 47.372373],
      [8.538405, 47.37315],
      [8.538383, 47.373735],
      [8.538405, 47.373848],
      [8.538099, 47.373811],
      [8.538099, 47.373753],
      [8.538115, 47.373045],
      [8.538147, 47.372395],
      [8.538244, 47.372108],
      [8.538587, 47.371148],
      [8.538614, 47.371018],
      [8.53871, 47.370785],
      [8.538796, 47.370633],
      [8.538947, 47.370233],
    ],
  },
  {
    id: "sued",
    name: "Bahnhofstrasse (Süd)",
    ring: [
      [8.539939, 47.367523],
      [8.540229, 47.367581],
      [8.540014, 47.368162],
      [8.539649, 47.369139],
      [8.539526, 47.369568],
      [8.539215, 47.369543],
      [8.539322, 47.369154],
      [8.539617, 47.368376],
      [8.539939, 47.367523],
    ],
  },
  {
    id: "nord",
    name: "Bahnhofstrasse (Nord)",
    ring: [
      [8.538222, 47.374015],
      [8.538598, 47.374015],
      [8.538694, 47.374211],
      [8.538823, 47.374429],
      [8.538845, 47.374654],
      [8.539445, 47.375744],
      [8.539767, 47.376427],
      [8.540025, 47.376812],
      [8.539681, 47.376921],
      [8.539177, 47.375897],
      [8.538845, 47.375272],
      [8.538501, 47.374582],
      [8.538222, 47.374015],
    ],
  },
  {
    id: "lintheschergasse",
    name: "Lintheschergasse",
    ring: [
      [8.537881, 47.374798],
      [8.537808, 47.374701],
      [8.537996, 47.374691],
      [8.53833, 47.375339],
      [8.538654, 47.375953],
      [8.538498, 47.375985],
      [8.538444, 47.375873],
      [8.538455, 47.375833],
      [8.538304, 47.375561],
      [8.537923, 47.374849],
      [8.537881, 47.374798],
    ],
  },
];

export default function MapView({ location, setLocation }) {
  const center = useMemo(() => [47.3722, 8.5392], []);

  return (
    <div className="mapWrap">
      <div className="mapHeader">
        <h2>Karte</h2>
        <p className="meta">Klicke auf einen Abschnitt, um den Standort-Filter zu setzen.</p>
      </div>

      <div className="mapBox">
        <MapContainer
          center={center}
          zoom={15}
          scrollWheelZoom={false}
          className="leafletRoot"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {AREAS.map((a) => {
            const isAll = location === "all";
            const isActive = isAll || a.id === location;

            return (
              <Polygon
                key={a.id}
                positions={swapLonLat(a.ring)}
                pathOptions={{
                  color: isActive ? "#38bdf8" : "#fb7185",
                  weight: isActive ? 3 : 2,
                  fillColor: isActive ? "#38bdf8" : "#fb7185",
                  fillOpacity: isActive ? 0.35 : 0.2,
                }}
                eventHandlers={{
                  click: () => setLocation(a.id),
                  mouseover: (e) => e.target.setStyle({ fillOpacity: isActive ? 0.45 : 0.3 }),
                  mouseout: (e) => e.target.setStyle({ fillOpacity: isActive ? 0.35 : 0.2 }),
                }}
              >
                <Tooltip sticky direction="top">
                  {a.name}
                </Tooltip>
              </Polygon>
            );
          })}
        </MapContainer>
      </div>

      <div className="mapLegend">
        <span className="legendDot activeDot" />
        <span className="meta">Aktiv</span>
        <span className="legendDot" />
        <span className="meta">Andere</span>
      </div>
    </div>
  );
}
