function AppViewModel() {
  var self = this
  this.publication = ko.observable()
  window.impressions = this.impressions = ko.observableArray()

  var t = 1297110663, // start time (seconds since epoch)
      v = 0, // start value (subscribers)
      v2 = 0 // start value (subscribers)

  function next() {
    return {
      time: ++t,
      value: v = ~~Math.max(10, Math.min(90, v + 10 * (Math.random() - .5))),
      value2: v2 = ~~Math.max(10, Math.min(90, v2 + 10 * (Math.random() - .5)))
    }
  }
  self.impressions(d3.range(100).map(function() {return {time:++t, value: 0}}))

  // setInterval(function() {
  //   self.impressions.shift()
  //   self.impressions.push(next())
  // }, 1500)

  $.get('/api/publishing').then(function(res) {
    self.publication(res.response[0])
  })
  $.get('/api/impressions').then(function(res) {
    // self.impressions(d3.range(100).map(next))
    res = res.response
    res = res.filter(function(d) {
      return d.post_impressions
    })
    var fix = []
    var lastTime = new Date(res[res.length-1].post_impressions[0].timestamp).valueOf()
    var resolution = 60*1000
    var count = 100
    var startTime = lastTime - count * resolution
    for (var i = startTime; i < lastTime; i += resolution) {
      var c = {}
      fix.push(c)
      c.time = i
      c.value = res.reduce(function(acc, x) {
        var time = new Date(x.post_impressions[0].timestamp).valueOf()
        if (inRange()) {
          return acc + (parseInt(x.post_impressions[0].value) / 30000)
        } else {
          return acc
        }
        function inRange () {
          return time > i && time < i + resolution
          return Math.random() > 0.9
        }
      }, 0)

    }
    // res.forEach(function(d) {
    //   d.time = next().time
    //   d.value = d.post_impressions[0].value / 1000
    // })
    console.log(fix)
    self.impressions(fix)
  })
}


ko.bindingHandlers.reachChart = {
  init: function(element, valueAccessor) {
    var self = this
    var data = valueAccessor()
    // console.log('data', data)
    if (!data || !data.length) { return }

    var w = 6,
        h = 400

    var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, w])

    var y = d3.scale.linear()
        .domain([0, 100])
        .rangeRound([0, h])

    console.log(w * data.length - 1)
    var chart = d3.select("body").append("svg")
        .attr("class", "chart")
        .attr("width", w * data.length - 1)
        .attr("height", h)

    chart.selectAll("rect.post_impressions")
        .data(data)
      .append("rect")
        .attr("x", function(d, i) { return x(i) - .5 })
        .attr("y", function(d) { return h - y(d.value) - .5 })
        .attr("width", w)
        .attr("height", function(d) { return y(d.value) })
        .attr("class", "post_impressions")

    chart.append("line")
        .attr("x1", 0)
        .attr("x2", w * data.length)
        .attr("y1", h - .5)
        .attr("y2", h - .5)
        .style("stroke", "#000")

    self.w = w
    self.h = h
    self.x = x
    self.y = y
    self.chart = chart
  },
  update: function(element, valueAccessor) {
    var data = valueAccessor()
    // console.log('data', data)

    var self = this
    function redraw() {
      // return
      var rect = self.chart.selectAll("rect.post_impressions")
          .data(data, function(d) { return d.time })

      rect.enter().insert("rect", "line")
          .attr("x", function(d, i) { return self.x(i + 1) - .5 })
          .attr("y", function(d) { return self.h - self.y(d.value) - .5 })
          .attr("width", self.w)
          .attr("height", function(d) { return self.y(d.value) })
          .attr("class", "post_impressions")
        .transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i) - .5 })

      rect.transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i) - .5 })

      rect.exit().transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i - 1) - .5 })
          .remove()
    }
    redraw()
  }
};

// Activate knockout.js
ko.applyBindings(new AppViewModel())
