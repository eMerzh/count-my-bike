$(function() {
  $.get("data.json", function(data) {
    initChart(data.ts);
    console.log("ss", data.day.counter);
    $(".day-counter .nbr").text(data.day.counter);
    $(".hour-counter .nbr").text(data.hour.counter);
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
          color: "#edc330"
        }
      },
      series: [
        {
          type: "column",
          name: "Cycles",
          data: serie_data
        }
      ]
    });
  }
});
