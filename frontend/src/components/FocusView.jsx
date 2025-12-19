import React, { useEffect, useState } from "react"; // Imports ergänzen
import { VegaEmbed } from "react-vega";

export default function FocusView() {
  const [data, setData] = useState([]); // State für Backend-Daten
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/fokusfrage")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => console.error("Fokusfrage Fehler:", err));
  }, []);

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 900,
    height: 260,
    padding: { left: 55, right: 10, top: 10, bottom: 35 },

    data: { values: data },

    mark: { type: "bar" },

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
          labelPadding: 6,
          titlePadding: 12,
          // Deutsche Abkuerzungen (nur Anzeige)
          labelExpr:
            "datum.value === 'Jan' ? 'Jan' :" +
            "datum.value === 'Feb' ? 'Feb' :" +
            "datum.value === 'Mar' ? 'Mär' :" +
            "datum.value === 'Apr' ? 'Apr' :" +
            "datum.value === 'May' ? 'Mai' :" +
            "datum.value === 'Jun' ? 'Jun' :" +
            "datum.value === 'Jul' ? 'Jul' :" +
            "datum.value === 'Aug' ? 'Aug' :" +
            "datum.value === 'Sep' ? 'Sep' :" +
            "datum.value === 'Oct' ? 'Okt' :" +
            "datum.value === 'Nov' ? 'Nov' :" +
            "'Dez'",
        },
      },

      y: {
        field: "share",
        type: "quantitative",
        title: "Anteil",
        stack: "normalize",
        scale: { domain: [0, 1] },
        axis: { format: ".0%", grid: true, tickCount: 5, titlePadding: 10 },
      },

      color: {
        field: "group",
        type: "nominal",
        legend: {
          title: "Gruppe",
          orient: "top",
          direction: "horizontal",
        },
        scale: {
          domain: ["Erwachsene", "Kinder"],
          range: ["#4C78A8", "#F58518"],
        },
      },

      tooltip: [
        { field: "month", type: "ordinal", title: "Monat" },
        { field: "group", type: "nominal", title: "Gruppe" },
        {
          field: "share",
          type: "quantitative",
          title: "Anteil",
          format: ".1%",
        },
      ],
    },

    config: {
      background: "transparent",
      view: { stroke: null },

      axis: {
        labelColor: "#e5e7eb",
        titleColor: "#e5e7eb",
        gridColor: "rgba(255,255,255,0.12)",
        domainColor: "rgba(255,255,255,0.22)",
        tickColor: "rgba(255,255,255,0.22)",
      },

      legend: {
        labelColor: "#e5e7eb",
        titleColor: "#e5e7eb",
      },
    },
  };
  if (loading) return <p style={{ color: "white" }}>Berechne Fokusfrage...</p>;

  return (
    <div style={{ paddingTop: 8 }}>
      <VegaEmbed spec={spec} actions={false} />
    </div>
  );
}
