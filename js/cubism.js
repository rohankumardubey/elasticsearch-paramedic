var App = App || Em.Application.create({});

App.Cubism = Ember.Object.create({

  // ElasticSearch extension instance
  elasticsearch: {},

  // Cubism.js context
  context: cubism.context()
             .serverDelay(0)
             .clientDelay(0)
             .step(1000)
             .size($("#chart").width()),

  // Chart canvas
  chart: d3.select("#chart").append("div").attr("id", "chart-inner"),

  // Function to add new horizon chart
  add_chart: function(metrics, options) {
    var options = options || {colors: 'Greens'}

    this.chart.selectAll(".horizon")
        .data(metrics, function(d) { return d.toString(); })
      .enter().append("div")
        .attr("class", "horizon")
        .call(this.context.horizon()
          .height(25)
          .colors(function() { return colorbrewer[options['colors']][8] })
        )
    return this.chart;
  },

  // Setup the whole chart
  setup: function() {
    var self = this

    // Top axis
    self.chart.append("div")
      .attr("class", "axis top")
      .call(self.context.axis().orient("top"));

    // Rule
    self.chart.append("div")
          .attr("class", "rule")
          .call(self.context.rule());

    // Move the rule with mouse
    self.context.on("focus", function(i) { d3.selectAll(".value").style("right", i == null ? null : self.context.size() - i + "px"); })

    self.__draw()

    return self
    },

  // Remove the chart and re-draw it
  reset: function() {
    var self = this

    d3.select("#chart-inner").remove()
    self.chart = d3.select("#chart").append("div").attr("id", "chart-inner")

    self.__draw()
    return self
  },

  // Draw the metrics
  __draw: function() {
    var self = this

    self.elasticsearch = cubism.elasticsearch(self.context, {host: App.elasticsearch_url}, function() {
    [
      { metrics: this.metrics("os.cpu.user"),                    colors: 'Greens'   },
      { metrics: this.metrics("process.cpu.percent"),            colors: 'Greens'   },
      { metrics: this.metrics("jvm.mem.heap_used_in_bytes"),     colors: 'Blues'    },
      { metrics: this.metrics("http.current_open"),              colors: 'Oranges'  },
      { metrics: this.metrics("indices.indexing.index_current"), colors: 'Spectral' },
      { metrics: this.metrics("indices.search.query_current"),   colors: 'YlOrRd'   }
    ].forEach(
        function(group) { self.add_chart(group.metrics, {colors: group.colors}) }
    );

    return self
  });
  }

});

