<template>
    <Chart :chart="cycleData"></Chart>
</template>

<script>
import Chart from "./Chart";

export default {
  components: {
    Chart
  },
  data: function() {
    return {
      yearlyInfographicData: [
        {
          year: 1999,
          cyclists: 1200
        },
        {
          year: 2000,
          cyclists: 1400
        },
        {
          year: 2001,
          cyclists: 1600
        },
        {
          year: 2002,
          cyclists: 1800
        },
        {
          year: 2003,
          cyclists: 2400
        },
        {
          year: 2004,
          cyclists: 2700
        },
        {
          year: 2005,
          cyclists: 3100
        },
        {
          year: 2006,
          cyclists: 3150
        },
        {
          year: 2007,
          cyclists: 3500
        },
        {
          year: 2008,
          cyclists: 4350
        },
        {
          year: 2009,
          cyclists: 4900
        },
        {
          year: 2010,
          cyclists: 5500
        },
        {
          year: 2011,
          cyclists: 6200
        },
        {
          year: 2012,
          cyclists: 6300
        },
        {
          year: 2013,
          cyclists: 6300
        },
        {
          year: 2014,
          cyclists: 7600
        },
        {
          year: 2015,
          cyclists: 7900
        },
        {
          year: 2017,
          cyclists: 16000
        },
        {
          year: 2020,
          cyclists: 20000
        }
      ]
    };
  },
  computed: {
    cycleData: function() {
      return {
        chart: {
          type: "line",
          backgroundColor: null
        },
        title: null,
        credits: false,
        xAxis: {
          lineColor: "#F3F3F3",
          labels: {
            style: {
              color: "white"
            }
          }
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
        series: [
          {
            name: "Bike",
            data: this.yearlyInfographicData.map(function(r) {
              return [r.year, r.cyclists];
            }),
            color: "#E5B363",
            borderWidth: 0,
            marker: {
              enabled: false
            },
            zoneAxis: "x",
            zones: [
              {
                value: new Date().getFullYear(),
                dashStyle: "Solid"
              },
              {
                // value: 2020,
                color: "lightgray",
                dashStyle: "ShortDot"
              }
            ],
            dataLabels: {
              enabled: true,
              rotation: -90,
              color: "#FFFFFF",
              align: "right",
              format: "{point.y}", // one decimal
              y: 15, // 10 pixels down from the top
              style: {
                fontSize: "10px"
              }
            }
          }
        ]
      };
    }
  }
};
</script>