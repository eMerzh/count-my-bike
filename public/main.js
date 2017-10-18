$(function() {
  $.get("data.json", function(data) {
    initChart(data.ts);

    $(".day-counter .nbr").text(data.day.counter);
    $(".day-counter .trend").text(data.day.trend + "%");
    $(".hour-counter .nbr").text(data.hour.counter);
    $(".hour-counter .trend").text(data.hour.trend + "%");
  });

  function initChart(serie_data) {
    Highcharts.chart("chart", {
      chart: {
        zoomType: "x",
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
          borderWidth: 0,
          color: "#95d0a7"
        }
      },
      series: [
        {
          type: "column",
          name: "Bike",
          data: serie_data
        }
      ]
    });
  }
});
