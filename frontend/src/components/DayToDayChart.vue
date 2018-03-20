<template>
    <Chart :chart="dayChartData"></Chart>
</template>

<script>
import Chart from "./Chart";
import { getTruncatedStr } from "../utils";
export default {
  props: {
    serieData: {
      type: Object,
      required: true
    },
    selectedDay: {
      required: true
    }
  },
  components: {
    Chart
  },
  computed: {
    dayChartData: function() {
      var vm = this;
      if (vm.selectedDay) {
        // Hightlight selected day in chart
        var selectDateStr = getTruncatedStr(vm.selectedDay);
        var dayRow = vm.serieData["main"].filter(function(a) {
          return a.name == selectDateStr;
        });
        vm.serieData["main"].forEach(function(item) {
          item.selected = false;
        });

        if (dayRow[0]) {
          dayRow[0].selected = true;
        }
      }
      return {
        title: null,
        credits: false,
        xAxis: {
          type: "datetime",
          lineColor: "#F3F3F3"
          // lineWidth: 0
        },
        tooltip: {
          headerFormat: null,
          pointFormat:
            "<b>{point.y}</b> bikes <br /> on the <b>{point.x:%d-%m-%Y}</b>"
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
        plotOptions: {
          series: {
            color: "#E4E4E4",
            animation: false, //  for refresh of selected
            point: {
              events: {
                select: function() {
                  vm.$emit("select", { day: this.name, x: this.x });
                }
              }
            },
            states: {
              hover: {
                color: "#E5B363"
              },
              select: {
                color: "#E5B363"
              }
            },
            allowPointSelect: true
          }
        },
        series: [
          {
            name: "Bikes Per Day",
            type: "column",
            data: vm.serieData["main"]
          }
        ]
      };
    }
  }
};
</script>