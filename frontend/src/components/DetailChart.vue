<template>
    <Chart :chart="chartDef"></Chart>
</template>

<script>
import Chart from "./Chart";
import endOfDay from "date-fns/end_of_day";

export default {
  props: {
    serieData: {
      type: Array,
      required: true
    },
    selectedDay: {
      type: Date,
      required: true
    }
  },
  components: {
    Chart
  },
  computed: {
    periodEnd() {
      return endOfDay(this.selectedDay);
    },
    chartDef() {
      return {
        chart: {
          type: "area"
        },
        title: null,
        credits: false,
        xAxis: {
          type: "datetime",
          lineColor: "#F3F3F3",
          min: this.selectedDay.getTime(),
          max: this.periodEnd.getTime() + 1
        },
        tooltip: {
          headerFormat: null,
          pointFormat: "<b>{point.y}</b> bikes at <b>{point.x:%H:%M}</b>"
        },
        yAxis: {
          visible: false,
          title: {
            text: "Cyle Count"
          }
        },
        legend: {
          enabled: false
        },
        series: this.serieData,
        plotOptions: {
          series: {
            animation: false,
            color: "#E4E4E4"
          }
        }
      };
    }
  }
};
</script>