<template>
    <Chart :chart="chartDef"></Chart>
</template>

<script>
import Chart from "./Chart";

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
    periodEnd: function() {
      var endDate = new Date(this.selectedDay);
      endDate.setDate(endDate.getDate() + 1);
      return endDate;
    },
    chartDef: function() {
      return {
        chart: {
          type: "area"
        },
        title: null,
        credits: false,
        xAxis: {
          type: "datetime",
          lineColor: "#F3F3F3",
          softMin: this.selectedDay.getTime(),
          softMax: this.periodEnd.getTime()
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