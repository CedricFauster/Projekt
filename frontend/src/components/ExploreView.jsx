import { useMemo } from "react";
import { VegaEmbed } from "react-vega";

const MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_MAP = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
};

const LOCATIONS = ["nord", "mitte", "sued", "lintheschergasse"];
const WEATHER = ["nebel", "regen", "sonne", "bewoelkt"];
const GROUPS = ["Kinder", "Erwachsene"];

const YEARS = ["2021", "2022", "2023", "2024"];

// Alle Monate ueber alle Jahre
const YM_LIST = [];
YEARS.forEach((y) => {
  for (let m = 1; m <= 12; m++) YM_LIST.push(`${y}-${String(m).padStart(2, "0")}`);
});

// deterministischer Zufall (immer gleiche Werte)
const pseudoRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Grosser Dummy-Datensatz (stabil)
const RAW = [];
YM_LIST.forEach((ym, idx) => {
  const year = Number(ym.slice(0, 4));
  const monthIndex = (idx % 12); // 0..11

  LOCATIONS.forEach((loc, li) => {
    WEATHER.forEach((wx, wi) => {
      GROUPS.forEach((group, gi) => {
        const yearFactor =
          year === 2021 ? 0.85 :
          year === 2022 ? 0.9 :
          year === 2023 ? 0.95 : 1.0;

        const base =
          group === "Erwachsene"
            ? (400 + monthIndex * 40) * yearFactor
            : (120 + monthIndex * 20) * yearFactor;

        const locFactor =
          loc === "nord" ? 1.2 :
          loc === "mitte" ? 1.0 :
          loc === "sued" ? 0.9 : 0.7;

        const wxFactor =
          wx === "sonne" ? 1.15 :
          wx === "bewoelkt" ? 1.0 :
          wx === "regen" ? 0.9 : 0.8;

        const noise = pseudoRandom(idx + li * 7 + wi * 13 + gi * 17);
        const count = Math.round(base * locFactor * wxFactor * (0.9 + noise * 0.2));

        RAW.push({ ym, location: loc, weather: wx, group, count });
      });
    });
  });
});

export default function ExploreView({ location, dateFrom, dateTo, weather }) {
  const { values, isSingleYear } = useMemo(() => {
    const filtered = RAW.filter((r) => {
      const okLoc = location === "all" || r.location === location;
      const okWx = weather === "all" || r.weather === weather;
      const okTime = (!dateFrom || r.ym >= dateFrom) && (!dateTo || r.ym <= dateTo);
      return okLoc && okWx && okTime;
    });

    const fromY = dateFrom?.slice(0, 4);
    const toY = dateTo?.slice(0, 4);
    const singleYear = !!fromY && !!toY && fromY === toY;

    // Aggregation
    const agg = new Map();
    for (const r of filtered) {
      const keyTime = singleYear ? r.ym.slice(5, 7) : r.ym; // "05" oder "2023-05"
      const key = `${keyTime}|${r.group}`;
      agg.set(key, (agg.get(key) ?? 0) + r.count);
    }

    // Output
    const out = [];
    for (const [key, count] of agg.entries()) {
      const [timeKey, group] = key.split("|");

      if (singleYear) {
        out.push({
          month: MONTH_MAP[timeKey] ?? timeKey, // Jan..Dec (engl. intern)
          monthNum: timeKey,                    // 01..12 fuer Sortierung
          group,
          count
        });
      } else {
        const m = timeKey.slice(5, 7);
        out.push({
          ym: timeKey,                 // YYYY-MM
          month: MONTH_MAP[m] ?? m,    // Jan..Dec (engl. intern)
          group,
          count
        });
      }
    }

    if (singleYear) out.sort((a, b) => a.monthNum.localeCompare(b.monthNum));
    else out.sort((a, b) => a.ym.localeCompare(b.ym));

    return { values: out, isSingleYear: singleYear };
  }, [location, weather, dateFrom, dateTo]);

  const spec = useMemo(() => {
    const axisCommon = {
      labelColor: "#e5e7eb",
      titleColor: "#e5e7eb",
      labelFontSize: 12,
      titleFontSize: 13,
      tickColor: "#6b7280",
      domainColor: "#6b7280"
    };

    const yAxis = {
      ...axisCommon,
      grid: true,
      gridColor: "#1f2937"
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
      " 'Sep', 'Sep')" ; // Sep ist gleich, bleibt nur als klare Struktur

    const transform = isSingleYear
      ? []
      : [{ calculate: "toDate(datum.ym + '-01')", as: "date" }];

    const xEncoding = isSingleYear
      ? {
          field: "month",
          type: "ordinal",
          title: "Monat",
          sort: MONTH_ORDER,
          axis: { ...axisCommon, labelExpr: monthLabelExprShort }
        }
      : {
          field: "date",
          type: "temporal",
          timeUnit: "yearmonth",
          title: "Monat",
          axis: {
            ...axisCommon,
            labelAngle: -45,
            labelExpr: monthYearExpr
          }
        };

    const tooltip = isSingleYear
      ? [
          { field: "month", title: "Monat" },
          { field: "group", title: "Gruppe" },
          { field: "count", title: "Anzahl Personen" }
        ]
      : [
          { field: "ym", title: "Monat" },
          { field: "group", title: "Gruppe" },
          { field: "count", title: "Anzahl Personen" }
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
          axis: yAxis
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
            titleColor: "#e5e7eb"
          },
          scale: {
            domain: ["Erwachsene", "Kinder"],
            range: ["#4C78A8", "#F58518"]
          }
        },

        opacity: {
          condition: { param: "pickGroup", value: 1 },
          value: 0.25
        },

        tooltip
      },

      params: [
        {
          name: "pickGroup",
          select: { type: "point", fields: ["group"] },
          bind: "legend"
        }
      ],

      config: {
        background: "transparent",
        view: { stroke: null },

        axis: {
          labelColor: "#e5e7eb",
          titleColor: "#e5e7eb",
          gridColor: "#1f2937",
          domainColor: "#6b7280",
          tickColor: "#6b7280"
        },

        legend: {
          labelColor: "#e5e7eb",
          titleColor: "#e5e7eb"
        }
      }
    };
  }, [values, isSingleYear]);

  return <VegaEmbed spec={spec} actions={false} />;
}
