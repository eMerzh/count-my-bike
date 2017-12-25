$(function() {
  var yearlyInfographicData = [
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
  ];
  var detailDate;
  var serieData;
  $.get("data.json", function(data) {
    var chartData = prepareData(data.ts);
    initChart(chartData);

    $(".day-counter .nbr").text(data.day.counter);
    $(".trends-day").text(data.day.trend + "%");
    $(".week-counter .nbr").text(data.week.counter);
    $(".month-counter .nbr").text(data.month.counter);
    // $(".hour-counter .trend").text(data.hour.trend + "%");
    initYearChart();
  });

  function initYearChart() {
    var dt = yearlyInfographicData.map(function(r) {
      return [r.year, r.cyclists];
    });

    Highcharts.chart("year-chart", {
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
          data: dt,
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
    });
  }
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
    serieData = serie_data;
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });

    Highcharts.chart("chart01", {
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
          point: {
            events: {
              select: function() {
                var pointName = this.name;
                var data = serieData["drilldowns"].filter(function(value) {
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

    $(".btn-detail-prev").on("click", setPreviousDetails);
    $(".btn-detail-next").on("click", setNextDetails);
  }

  function setPreviousDetails() {
    detailDate.setDate(detailDate.getDate() - 1);
    var endDate = new Date(detailDate.getTime());
    endDate.setDate(endDate.getDate() + 1);
    var pointName = getTruncatedStr(detailDate);
    var data = serieData["drilldowns"].filter(function(value) {
      return value.name == pointName;
    });

    var refDate = getTruncatedStr(detailDate);
    // Make sure to select day
    var daily_row = $("#chart01")
      .highcharts()
      .series[0].data.filter(function(a) {
        return a.name == refDate;
      });
    if (daily_row[0] && !daily_row[0].selected) {
      daily_row[0].select();
    }
    detailChart(data, detailDate.getTime(), endDate.getTime());
  }

  function setNextDetails() {
    detailDate.setDate(detailDate.getDate() + 1);
    var endDate = new Date(detailDate.getTime());
    endDate.setDate(endDate.getDate() + 1);
    var pointName = getTruncatedStr(detailDate);
    var data = serieData["drilldowns"].filter(function(value) {
      return value.name == pointName;
    });

    var refDate = getTruncatedStr(detailDate);
    // Make sure to select day
    var daily_row = $("#chart01")
      .highcharts()
      .series[0].data.filter(function(a) {
        return a.name == refDate;
      });
    if (daily_row[0] && !daily_row[0].selected) {
      daily_row[0].select();
    }

    detailChart(data, detailDate.getTime(), endDate.getTime());
  }

  function detailChart(series, min, max) {
    detailDate = new Date(min);
    var refDate = getTruncatedStr(detailDate);
    $(".chart-02 .btn-action").show();
    $(".chart-02 h2").text("Details of " + refDate);
    if (series.length === 0) {
      $("#chart02").hide();
      $(".chart-02 .no-data").show();
      return;
    }

    $("#chart02").show();
    $(".chart-02 .no-data").hide();

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
      series: series,
      plotOptions: {
        series: {
          animation: false,
          color: "#E4E4E4"
        }
      }
    });
  }
});
