$(function() {
  $.get("data.json", function(data) {
    var chartData = prepareData(data.ts);
    initChart(chartData);

    $(".day-counter .nbr").text(data.day.counter);
    // $(".day-counter .trend").text(data.day.trend + "%");
    $(".week-counter .nbr").text(data.week.counter);
    $(".month-counter .nbr").text(data.month.counter);
    // $(".hour-counter .trend").text(data.hour.trend + "%");
  });

  function getTruncatedStr(date) {
    return (
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    );
  }

  function prepareData(serie_data) {
    var heatData = [];
    var drilldowns = {};
    serie_data.map(function(item) {
      var itemDateTime = new Date(item[0]);
      // var itemDay = itemDateTime.getDay();
      // var itemHour = itemDateTime.getHours();
      var truncatedDateTime = new Date(
        itemDateTime.getFullYear(),
        itemDateTime.getMonth(),
        itemDateTime.getDate()
        // itemDateTime.getHours()
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

  function initChart(serie_data) {
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    detailChart([]);

    Highcharts.chart("chart01", {
      title: null,
      credits: false,
      xAxis: {
        type: "datetime",
        lineColor: "#F3F3F3"
        // lineWidth: 0
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
          point: {
            events: {
              select: function() {
                var pointName = this.name;
                var data = serie_data["drilldowns"].filter(function(value) {
                  return value.name == pointName;
                });
                var endDate = new Date(this.x);
                endDate.setDate(endDate.getDate() + 1);
                detailChart(data, this.x.getTime(), endDate.getTime());
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
          data: serie_data["main"]
        }
      ]
    });
  }

  function detailChart(series, min, max) {
    Highcharts.chart("chart02", {
      chart: {
        type: "area"
      },
      title: null,
      credits: false,
      xAxis: {
        type: "datetime",
        lineColor: "#F3F3F3",
        softMin: min,
        softMax: max
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
      series: series,
      plotOptions: {
        series: {
          color: "#E4E4E4"
        }
      }
    });
  }
});
