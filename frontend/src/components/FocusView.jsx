import React, { useEffect, useState, useMemo } from "react";
import { VegaEmbed } from "react-vega";

export default function FocusView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/fokusfrage")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fokusfrage Fehler:", err);
        setLoading(false);
      });
  }, []);

  // Die Spec in useMemo, damit sie nicht bei jedem Render neu gebaut wird
  const spec = useMemo(
    () => ({
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: "container", // Passt sich der Box an
      height: 280,
      padding: { left: 55, right: 10, top: 20, bottom: 40 },

      data: { values: data },

      mark: { type: "bar", tooltip: true },

      encoding: {
        x: {
          field: "month",
          type: "ordinal",
          title: "Monat (2024)",
          sort: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          axis: {
            labelAngle: 0,
            labelPadding: 8,
            labelExpr:
              "datum.value === 'Mar' ? 'Mär' : datum.value === 'May' ? 'Mai' : datum.value === 'Oct' ? 'Okt' : datum.value === 'Dec' ? 'Dez' : datum.value",
          },
        },

        y: {
          field: "share",
          type: "quantitative",
          title: "Anteil Kinder vs. Erwachsene",
          stack: "normalize", // Stapelt auf 100%
          axis: {
            format: ".0%",
            grid: true,
            tickCount: 5,
            titlePadding: 15,
          },
        },

        color: {
          field: "group",
          type: "nominal",
          scale: {
            domain: ["Erwachsene", "Kinder"],
            range: ["#4C78A8", "#F58518"],
          },
          legend: {
            title: null,
            orient: "top",
            direction: "horizontal",
            labelFontSize: 12,
          },
        },

        tooltip: [
          { field: "month", title: "Monat" },
          { field: "group", title: "Gruppe" },
          { field: "share", title: "Anteil", format: ".1%" },
        ],
      },

      config: {
        background: "transparent",
        view: { stroke: null },
        axis: {
          labelColor: "#e5e7eb",
          titleColor: "#e5e7eb",
          gridColor: "rgba(255,255,255,0.1)",
          domainColor: "rgba(255,255,255,0.2)",
        },
        legend: {
          labelColor: "#e5e7eb",
        },
      },
    }),
    [data]
  );

  if (loading) return <div className="loader">Berechne Fokusfrage...</div>;

  if (data.length === 0)
    return (
      <p style={{ color: "#9ca3af" }}>
        Keine Daten für diese Kombination gefunden.
      </p>
    );

  return (
    <div style={{ width: "100%", paddingTop: 12 }}>
      <VegaEmbed spec={spec} actions={false} style={{ width: "100%" }} />
    </div>
  );
}
