import format from "date-fns/format";
import parse from "date-fns/parse";

/**
 * Format data with daily Average and drilldowns by day
 *
 * @param {Array} allSerieData Array of tupple (int timestamp, value)
 */
export function prepareData(allSerieData) {
  // Group data by day ({key: [[min, val],[min,val]] } )
  const drilldowns = allSerieData.reduce((previousVal, currentVal) => {
    const timestamp = new Date(currentVal[0]);
    const referenceDateIdx = format(timestamp, "YYYY-M-D");
    (previousVal[referenceDateIdx] = previousVal[referenceDateIdx] || []).push({
      x: timestamp,
      y: currentVal[1]
    });
    return previousVal;
  }, {});

  const drilldownSeries = Object.entries(drilldowns).map(item => ({
    name: item[0],
    id: item[0],
    data: item[1].sort((a, b) => a.x - b.x),
    type: "spline"
  }));

  // get summary for all days
  const byDayData = drilldownSeries.map(i => ({
    x: parse(i.name),
    name: i.name,
    y: i.data.reduce((a, b) => a + b.y, 0),
    drilldown: i.name
  }));

  return {
    main: byDayData,
    drilldowns: drilldownSeries
  };
}
