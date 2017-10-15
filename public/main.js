$(function() {
  $.get("data.json", function(data) {
    initChart(data.ts);

    $(".day-counter .nbr").text(data.day.counter);
    $(".day-counter .trend").text(data.day.trend + "%");
    $(".hour-counter .nbr").text(data.hour.counter);
    $(".hour-counter .trend").text(data.hour.trend + "%");
  });

  var buckets = 9;
  var colors = [
    "#ffffd9",
    "#edf8b1",
    "#c7e9b4",
    "#7fcdbb",
    "#41b6c4",
    "#1d91c0",
    "#225ea8",
    "#253494",
    "#081d58"
  ]; // alternatively colorbrewer.YlGnBu[9]
  var days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  var times = [
    "0h",
    "1h",
    "2h",
    "3h",
    "4h",
    "5h",
    "6h",
    "7h",
    "8h",
    "9h",
    "10h",
    "11h",
    "12h",
    "13h",
    "14h",
    "15h",
    "16h",
    "17h",
    "18h",
    "19h",
    "20h",
    "21h",
    "22h",
    "23h"
  ];

  function heatmapChart(data) {
    var margin = { top: 50, right: 0, bottom: 100, left: 30 };
    var containerWidth = 960;
    var containerHeight = 430;
    var width = containerWidth - margin.left - margin.right;
    var height = containerHeight - margin.top - margin.bottom;
    var gridSize = Math.floor(width / 24);

    var svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svg
      .selectAll(".dayLabel")
      .data(days)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("x", 0)
      .attr("y", function(d, i) {
        return i * gridSize;
      })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function(d, i) {
        return i >= 0 && i <= 4
          ? "dayLabel mono axis axis-workweek"
          : "dayLabel mono axis";
      });

    var timeLabels = svg
      .selectAll(".timeLabel")
      .data(times)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("x", function(d, i) {
        return i * gridSize;
      })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) {
        return i >= 7 && i <= 16
          ? "timeLabel mono axis axis-worktime"
          : "timeLabel mono axis";
      });

    var colorScale = d3.scale
      .quantile()
      .domain([
        0,
        buckets - 1,
        d3.max(data, function(d) {
          return d.value;
        })
      ])
      .range(colors);

    var cards = svg.selectAll(".hour").data(data, function(d) {
      return d.day + ":" + d.hour;
    });

    cards.append("title");

    cards
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return (d.hour - 1) * gridSize;
      })
      .attr("y", function(d) {
        return (d.day - 1) * gridSize;
      })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "hour bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0]);

    cards
      .transition()
      .duration(1000)
      .style("fill", function(d) {
        return colorScale(d.value);
      });

    cards.select("title").text(function(d) {
      return d.value;
    });

    cards.exit().remove();

    buildLegend(svg, colorScale, gridSize, height);
  }

  function buildLegend(svg, colorScale, gridSize, height) {
    var legendElementWidth = gridSize * 2;

    var legend = svg
      .selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function(d) {
        return d;
      });

    legend
      .enter()
      .append("g")
      .attr("class", "legend");

    legend
      .append("rect")
      .attr("x", function(d, i) {
        return legendElementWidth * i;
      })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .style("fill", function(d, i) {
        return colors[i];
      });

    legend
      .append("text")
      .attr("class", "mono")
      .text(function(d) {
        return "≥ " + Math.round(d);
      })
      .attr("x", function(d, i) {
        return legendElementWidth * i;
      })
      .attr("y", height + gridSize);

    legend.exit().remove();
  }

  function initChart(serie_data) {
    var heatData = [];
    serie_data.map(function(item) {
      var itemDateTime = new Date(item[0]);
      var sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (itemDateTime < sevenDaysAgo) {
        // skip older days
        return;
      }

      var itemDay = itemDateTime.getDay();
      var itemHour = itemDateTime.getHours();
      var itemValue = item[1];
      var itemsDayAndHour = heatData.find(function(x) {
        return x.date == itemDay && x.hour == itemHour;
      });
      if (itemsDayAndHour) {
        itemsDayAndHour.value += itemValue;
        return;
      }
      heatData.push({ date: itemDay, hour: itemHour, value: itemValue });
    });
    heatData = heatData.map(function(item) {
      return {
        day: item.date == 0 ? 7 : item.date,
        hour: item.hour + 1,
        value: item.value
      };
    });

    heatmapChart(heatData);
  }
});
