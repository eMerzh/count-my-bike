<template>
    <div></div>
</template>

<script>
import Highcharts from "highcharts";

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

export default {
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
};
</script>