<template>
    <Chart :chart="dayChartData"></Chart>
</template>

<script>
import Chart from "./Chart";
import format from "date-fns/format";

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
    dayChartData() {
      if (this.selectedDay) {
        // Hightlight selected day in chart
        var selectDateStr = format(this.selectedDay, "YYYY-M-D");
        var dayRow = this.serieData["main"].find(a => a.name === selectDateStr);
        // reset selection state for all
        this.serieData["main"].forEach(item => {
          item.selected = false;
        });
        if (dayRow) {
          dayRow.selected = true;
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
                select: event => {
                  this.$emit("select", {
                    day: event.target.name,
                    x: event.target.x
                  });
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
            data: this.serieData["main"]
          }
        ]
      };
    }
  }
};
</script>