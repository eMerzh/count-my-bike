export function getTruncatedStr(date) {
  if (!date) {
    return "";
  }
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
}

export function prepareData(serie_data) {
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
