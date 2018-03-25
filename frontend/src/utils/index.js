import format from "date-fns/format";
import startOfDay from "date-fns/start_of_day";
import compareAsc from "date-fns/compare_asc";

/**
 * Format data with daily Average and drilldowns by day
 *
 * @param {Array} allSerieData Array of tupple (int timestamp, value)
 */
export function prepareData(allSerieData) {
  var byDayData = [];
  var drilldowns = {};

  allSerieData.map(item => {
    const [timestamp, itemValue] = item;
    var itemDateTime = new Date(timestamp);
    var truncatedDateTime = startOfDay(itemDateTime);

    const referenceDateIdx = format(itemDateTime, "YYYY-M-D");
    drilldowns[referenceDateIdx] = drilldowns[referenceDateIdx] || [];

    var itemsDayAndHour = byDayData.find(
      i => compareAsc(i.date, truncatedDateTime) === 0
    );

    // if Found in dataByDay, add it to drilldown and data
    if (itemsDayAndHour) {
      itemsDayAndHour.value += itemValue;
      drilldowns[referenceDateIdx].push({
        x: itemDateTime,
        y: itemValue
      });

      return;
    }
    byDayData.push({ date: truncatedDateTime, value: itemValue });
  });

  byDayData = byDayData.map(item => ({
    x: item.date,
    name: format(item.date, "YYYY-M-D"),
    y: item.value,
    drilldown: format(item.date, "YYYY-M-D")
  }));

  const drilldownSeries = Object.entries(drilldowns).map(item => ({
    name: item[0],
    id: item[0],
    data: item[1].sort((a, b) => a.x - b.x),
    type: "spline"
  }));

  return {
    main: byDayData,
    drilldowns: drilldownSeries
  };
}
