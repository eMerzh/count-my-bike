Vue.prototype.$http = axios;
Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

var app = new Vue({
  el: "#app",
  data: {
    apiResponse: { day: {}, week: {}, month: {} },
    statByDay: {},
    statByMinute: {},
    selectedDay: null
  },
  computed: {
    chartData: function() {
      return this.apiResponse.ts ? prepareData(this.apiResponse.ts) : {};
    },
    selectedDayString: function() {
      return getTruncatedStr(this.selectedDay);
    },
    detailDayData: function() {
      if (!this.selectedDay) return null;

      var dayStr =
        this.selectedDay.getFullYear() +
        "-" +
        (parseInt(this.selectedDay.getMonth()) + 1) +
        "-" +
        this.selectedDay.getDate();

      return this.chartData["drilldowns"].filter(function(value) {
        return value.name == dayStr;
      });
    },
    todayCount: function() {
      return this.apiResponse.day.counter;
    },
    weekCount: function() {
      return this.apiResponse.week.counter;
    },
    monthCount: function() {
      return this.apiResponse.month.counter;
    },
    trendsDay: function() {
      return this.apiResponse.day.trend;
    }
  },
  methods: {
    selectDateDetail: function(data) {
      var parts = data.day.split("-");
      this.selectedDay = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
    },
    selectPrevious: function() {
      var newDate = new Date(this.selectedDay);
      newDate.setDate(newDate.getDate() - 1);
      this.selectedDay = newDate;
    },
    selectNext: function() {
      var newDate = new Date(this.selectedDay);
      newDate.setDate(newDate.getDate() + 1);
      this.selectedDay = newDate;
    }
  },
  created() {
    var vm = this;
    this.$http.get("data.json").then(function(response) {
      vm.apiResponse = response.data;
    });
  }
});

function getTruncatedStr(date) {
  if (!date) {
    return "";
  }
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
}

function prepareData(serie_data) {
  var heatData = [];
  var drilldowns = {};
  serie_data.map(function(item) {
    var itemDateTime = new Date(item[0]);
    var truncatedDateTime = new Date(
      itemDateTime.getFullYear(),
      itemDateTime.getMonth(),
      itemDateTime.getDate()
    );
    var itemValue = item[1];
    var itemsDayAndHour = heatData.find(function(x) {
      return x.date.getTime() == truncatedDateTime.getTime();
    });
    if (itemsDayAndHour) {
      itemsDayAndHour.value += itemValue;
      drilldowns[getTruncatedStr(itemDateTime)] =
        drilldowns[getTruncatedStr(itemDateTime)] || [];
      drilldowns[getTruncatedStr(itemDateTime)].push({
        x: itemDateTime,
        y: itemValue
      });
      return;
    }
    heatData.push({ date: truncatedDateTime, value: itemValue });
  });

  heatData = heatData.map(function(item) {
    return {
      x: item.date,
      name: getTruncatedStr(item.date),
      y: item.value,
      drilldown: getTruncatedStr(item.date)
    };
  });

  var drilldowns_series = [];
  for (var key in drilldowns) {
    drilldowns[key].sort(function(a, b) {
      return a.x - b.x;
    });
    drilldowns_series.push({
      name: key,
      id: key,
      data: drilldowns[key],
      type: "spline"
    });
  }
  return {
    main: heatData,
    drilldowns: drilldowns_series
  };
}

Vue.component("Chart", {
  props: {
    chart: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      target: undefined
    };
  },
  template: "<div></div>",
  mounted: function() {
    this.target = Highcharts.chart(this.$el, this.chart);
  },
  watch: {
    chart: function() {
      this.target = Highcharts.chart(this.$el, this.chart);
    }
  },
  beforeDestroy: function() {
    this.target.destroy();
  }
});

Vue.component("yearly-chart", {
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
  },
  template: '<Chart :chart="cycleData"></Chart>'
});

Vue.component("day-to-day-chart", {
  props: {
    serieData: {
      type: Object,
      required: true
    },
    selectedDay: {
      required: true
    }
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
  },
  template: '<Chart :chart="dayChartData"></Chart>'
});

Vue.component("detail-chart", {
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
  },
  template: '<Chart :chart="chartDef"></Chart>'
});
