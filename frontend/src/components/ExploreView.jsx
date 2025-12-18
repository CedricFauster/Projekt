import React, { useEffect, useState, useMemo } from "react"; // useState und useEffect hinzugefügt
import { VegaEmbed } from "react-vega";

const MONTH_ORDER = [
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
];
const MONTH_MAP = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export default function ExploreView({ location, dateFrom, dateTo, weather }) {
  const [backendData, setBackendData] = useState([]); // State für die echten Daten
  const [loading, setLoading] = useState(false);

  // 1. Daten vom Backend holen
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mapping für Backend-Standorte (da dein Backend lange Namen erwartet)
        const locationMapping = {
          nord: "Bahnhofstrasse (Nord)",
          mitte: "Bahnhofstrasse (Mitte)",
          sued: "Bahnhofstrasse (Süd)",
          lintheschergasse: "Lintheschergasse",
          bahnhofplatz: "Bahnhofplatz",
        };
        const realLocation = locationMapping[location] || location;

        // URL zusammenbauen (wir nutzen deinen /aggregate Endpunkt für Performance!)
        const url = `http://127.0.0.1:8000/aggregate?granularity=month&location_name=${encodeURIComponent(
          realLocation
        )}`;

        const response = await fetch(url);
        const result = await response.json();

        // FastAPI sendet manchmal JSON als String -> parsen falls nötig
        const data = typeof result === "string" ? JSON.parse(result) : result;
        setBackendData(data);
      } catch (error) {
        console.error("Backend-Verbindung fehlgeschlagen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location, dateFrom, dateTo, weather]); // Effekt triggert bei Filteränderung

  // 2. Daten für Vega formatieren (Mapping von Spalten auf Zeilen)
  const { values, isSingleYear } = useMemo(() => {
    const out = [];

    backendData.forEach((item) => {
      const dateObj = new Date(item.timestamp);
      const year = dateObj.getFullYear();
      const monthNum = String(dateObj.getMonth() + 1).padStart(2, "0");
      const ym = `${year}-${monthNum}`;

      // Wir müssen die Spalten "adults_count" und "children_count"
      // in einzelne Einträge für Vega umwandeln (Tidy Data Format)
      out.push({
        ym: ym,
        month: MONTH_MAP[monthNum],
        monthNum: monthNum,
        group: "Erwachsene",
        count: item.pedestrians_count || 0, // Passe Spaltennamen an dein Backend an!
      });
      // Falls dein Backend Kinder separat zählt:
      out.push({
        ym: ym,
        month: MONTH_MAP[monthNum],
        monthNum: monthNum,
        group: "Kinder",
        count: item.children_count || 0,
      });
    });

    // Prüfen ob nur ein Jahr ausgewählt ist
    const fromY = dateFrom?.slice(0, 4);
    const toY = dateTo?.slice(0, 4);
    const singleYear = fromY === toY;

    return { values: out, isSingleYear: singleYear };
  }, [backendData, dateFrom, dateTo]);

  const spec = useMemo(() => {
    const axisCommon = {
      labelColor: "#e5e7eb",
      titleColor: "#e5e7eb",
      labelFontSize: 12,
      titleFontSize: 13,
      tickColor: "#6b7280",
      domainColor: "#6b7280",
    };

    const yAxis = {
      ...axisCommon,
      grid: true,
      gridColor: "#1f2937",
    };

    // Deutsche Monats-Abkuerzungen (Anzeige)
    const monthLabelExprShort =
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
      "'Dez'";

    // Multi-Year: Datum formatieren + englische Abkuerzungen -> deutsch ersetzen
    // (Vega liefert %b standardmaessig englisch, deshalb ersetzen wir gezielt)
    const monthYearExpr =
      "replace(" +
      "replace(" +
      "replace(" +
      "replace(" +
      "replace(timeFormat(datum.value, '%b %Y'), 'Mar', 'Mär')," +
      " 'May', 'Mai')," +
      " 'Oct', 'Okt')," +
      " 'Dec', 'Dez')," +
      " 'Sep', 'Sep')"; // Sep ist gleich, bleibt nur als klare Struktur

    const transform = isSingleYear
      ? []
      : [{ calculate: "toDate(datum.ym + '-01')", as: "date" }];

    const xEncoding = isSingleYear
      ? {
          field: "month",
          type: "ordinal",
          title: "Monat",
          sort: MONTH_ORDER,
          axis: { ...axisCommon, labelExpr: monthLabelExprShort },
        }
      : {
          field: "date",
          type: "temporal",
          timeUnit: "yearmonth",
          title: "Monat",
          axis: {
            ...axisCommon,
            labelAngle: -45,
            labelExpr: monthYearExpr,
          },
        };

    const tooltip = isSingleYear
      ? [
          { field: "month", title: "Monat" },
          { field: "group", title: "Gruppe" },
          { field: "count", title: "Anzahl Personen" },
        ]
      : [
          { field: "ym", title: "Monat" },
          { field: "group", title: "Gruppe" },
          { field: "count", title: "Anzahl Personen" },
        ];

    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: 900,
      height: 340,
      data: { values },
      transform,

      mark: { type: "bar", cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4 },

      encoding: {
        x: xEncoding,
        xOffset: { field: "group" },

        y: {
          field: "count",
          type: "quantitative",
          title: "Anzahl Personen",
          axis: yAxis,
        },

        color: {
          field: "group",
          type: "nominal",
          title: "Gruppe",
          legend: {
            title: "Gruppe",
            orient: "top",
            direction: "horizontal",
            labelColor: "#e5e7eb",
            titleColor: "#e5e7eb",
          },
          scale: {
            domain: ["Erwachsene", "Kinder"],
            range: ["#4C78A8", "#F58518"],
          },
        },

        opacity: {
          condition: { param: "pickGroup", value: 1 },
          value: 0.25,
        },

        tooltip,
      },

      params: [
        {
          name: "pickGroup",
          select: { type: "point", fields: ["group"] },
          bind: "legend",
        },
      ],

      config: {
        background: "transparent",
        view: { stroke: null },

        axis: {
          labelColor: "#e5e7eb",
          titleColor: "#e5e7eb",
          gridColor: "#1f2937",
          domainColor: "#6b7280",
          tickColor: "#6b7280",
        },

        legend: {
          labelColor: "#e5e7eb",
          titleColor: "#e5e7eb",
        },
      },
    };
  }, [values, isSingleYear]);

  if (loading) return <div className="loader">Daten werden geladen...</div>;

  return <VegaEmbed spec={spec} actions={false} />;
}
