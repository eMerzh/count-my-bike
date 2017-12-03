$(function() {
  $.get("data.json", function(data) {
    var chartData = prepareData(data.ts);
    initChart(chartData);

    $(".day-counter .nbr").text(data.day.counter);
    // $(".day-counter .trend").text(data.day.trend + "%");
    $(".week-counter .nbr").text(data.hour.counter);
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

    Highcharts.chart("chart01", {
      chart: {
        // zoomType: "x",
        backgroundColor: ""
      },
      title: null,
      credits: false,
      xAxis: {
        type: "datetime"
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
          // borderWidth: 0,
          // borderColor: "#a7e1b9",
          color: "#CACACA"
        }
      },
      series: [
        {
          name: "Bikes Per Day",
          type: "column",
          data: serie_data["main"]
        }
      ],
      drilldown: {
        series: serie_data["drilldowns"]
      }
    });
  }
});
