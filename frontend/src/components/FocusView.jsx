import { VegaEmbed } from "react-vega";

export default function FocusView() {
  const data = [
    { month: "Jan", group: "Kinder", share: 0.18 },
    { month: "Jan", group: "Erwachsene", share: 0.82 },
    { month: "Feb", group: "Kinder", share: 0.20 },
    { month: "Feb", group: "Erwachsene", share: 0.80 },
    { month: "Mar", group: "Kinder", share: 0.22 },
    { month: "Mar", group: "Erwachsene", share: 0.78 },
    { month: "Apr", group: "Kinder", share: 0.17 },
    { month: "Apr", group: "Erwachsene", share: 0.83 },
    { month: "May", group: "Kinder", share: 0.19 },
    { month: "May", group: "Erwachsene", share: 0.81 },
    { month: "Jun", group: "Kinder", share: 0.23 },
    { month: "Jun", group: "Erwachsene", share: 0.77 },
    { month: "Jul", group: "Kinder", share: 0.26 },
    { month: "Jul", group: "Erwachsene", share: 0.74 },
    { month: "Aug", group: "Kinder", share: 0.24 },
    { month: "Aug", group: "Erwachsene", share: 0.76 },
    { month: "Sep", group: "Kinder", share: 0.21 },
    { month: "Sep", group: "Erwachsene", share: 0.79 },
    { month: "Oct", group: "Kinder", share: 0.19 },
    { month: "Oct", group: "Erwachsene", share: 0.81 },
    { month: "Nov", group: "Kinder", share: 0.16 },
    { month: "Nov", group: "Erwachsene", share: 0.84 },
    { month: "Dec", group: "Kinder", share: 0.14 },
    { month: "Dec", group: "Erwachsene", share: 0.86 }
  ];

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
        sort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
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
            "'Dez'"
        }
      },

      y: {
        field: "share",
        type: "quantitative",
        title: "Anteil",
        stack: "normalize",
        scale: { domain: [0, 1] },
        axis: { format: ".0%", grid: true, tickCount: 5, titlePadding: 10 }
      },

      color: {
        field: "group",
        type: "nominal",
        legend: {
            title: "Gruppe",
            orient: "top",
            direction: "horizontal"
        },
        scale: {
            domain: ["Erwachsene", "Kinder"],
            range: ["#4C78A8", "#F58518"]
        }
      },

      tooltip: [
        { field: "month", type: "ordinal", title: "Monat" },
        { field: "group", type: "nominal", title: "Gruppe" },
        { field: "share", type: "quantitative", title: "Anteil", format: ".1%" }
      ]
    },

    config: {
      background: "transparent",
      view: { stroke: null },

      axis: {
        labelColor: "#e5e7eb",
        titleColor: "#e5e7eb",
        gridColor: "rgba(255,255,255,0.12)",
        domainColor: "rgba(255,255,255,0.22)",
        tickColor: "rgba(255,255,255,0.22)"
      },

      legend: {
        labelColor: "#e5e7eb",
        titleColor: "#e5e7eb"
      }
    }
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <VegaEmbed spec={spec} actions={false} />
    </div>
  );
}
