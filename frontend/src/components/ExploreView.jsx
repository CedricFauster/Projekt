import React, { useEffect, useState, useMemo } from "react";
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

export default function ExploreView({
  location,
  dateFrom,
  dateTo,
  group,
  weatherList,
}) {
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const locationMapping = {
          all: "Alle",
          nord: "Bahnhofstrasse (Nord)",
          mitte: "Bahnhofstrasse (Mitte)",
          sued: "Bahnhofstrasse (Süd)",
          lintheschergasse: "Lintheschergasse",
        };
        const realLocation = locationMapping[location] || location;

        // URL ohne Wetter und Gruppe -> grosses Paket für den Zeitraum
        let url = `http://127.0.0.1:8000/data?location_name=${encodeURIComponent(
          realLocation
        )}`;
        if (dateFrom) url += `&start_time=${dateFrom}`;
        if (dateTo) url += `&end_time=${dateTo}`;

        const response = await fetch(url);
        const result = await response.json();
        const data = typeof result === "string" ? JSON.parse(result) : result;
        setBackendData(data);
      } catch (error) {
        console.error("Fehler beim Laden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location, dateFrom, dateTo]); // Kein weatherList und group mehr hier

  const { values, isSingleYear } = useMemo(() => {
    const monthlyAgg = {};
    const filteredData = backendData.filter((item) => {
      // Wetter-Filter
      const weatherMatch =
        weatherList.length === 0 ||
        weatherList.includes(item.weather_condition);
      return weatherMatch;
    });

    // Aggregation
    filteredData.forEach((item) => {
      const dateObj = new Date(item.timestamp);
      const year = dateObj.getFullYear();
      const monthNum = String(dateObj.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${monthNum}`;

      if (!monthlyAgg[key]) {
        monthlyAgg[key] = {
          ym: key,
          month: MONTH_MAP[monthNum],
          Kinder: 0,
          Erwachsene: 0,
        };
      }

      if (group === "beide" || group === "kinder") {
        monthlyAgg[key].Kinder += item.child_pedestrians_count || 0;
      }
      if (group === "beide" || group === "erwachsene") {
        monthlyAgg[key].Erwachsene += item.adult_pedestrians_count || 0;
      }
    });

    const out = [];
    Object.values(monthlyAgg).forEach((m) => {
      if (group === "beide" || group === "kinder") {
        out.push({
          ym: m.ym,
          month: m.month,
          group: "Kinder",
          count: m.Kinder,
        });
      }
      if (group === "beide" || group === "erwachsene") {
        out.push({
          ym: m.ym,
          month: m.month,
          group: "Erwachsene",
          count: m.Erwachsene,
        });
      }
    });

    const fromY = dateFrom?.slice(0, 4);
    const toY = dateTo?.slice(0, 4);
    const singleYear = fromY === toY;

    out.sort((a, b) => a.ym.localeCompare(b.ym));
    return { values: out, isSingleYear: singleYear };
  }, [backendData, weatherList, group, dateFrom, dateTo]);

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

    const monthYearExpr =
      "replace(" +
      "replace(" +
      "replace(" +
      "replace(" +
      "replace(timeFormat(datum.value, '%b %Y'), 'Mar', 'Mär')," +
      " 'May', 'Mai')," +
      " 'Oct', 'Okt')," +
      " 'Dec', 'Dez')," +
      " 'Sep', 'Sep')";

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
            tickCount: 12,
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

      width: "container",
      height: 340,
      autosize: { type: "fit", contains: "padding" },
      data: { values },
      transform,

      mark: isSingleYear
        ? { type: "bar", cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4 }
        : { type: "line", strokeWidth: 2, point: false },

      encoding: {
        x: xEncoding,
        ...(isSingleYear ? { xOffset: { field: "group" } } : {}),

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
