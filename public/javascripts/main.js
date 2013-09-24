var socket = io.connect('http://localhost')

function AppViewModel() {
  var self = this

  this.publication = ko.observable()
  this.impressions = ko.observableArray()

  socket.on('new_impression', function (data) {
    console.log(data)
    self.impressions.shift()
    self.impressions.push(data)
  })

  // TODO: Remove this unnecessary init line after making the chart handle different data lengths
  self.impressions(d3.range(100).map(function() {return {time:0, value: 0}}))

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
      c.value2 = 33
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
      c.post_impressions = c.value
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

    // TODO Refactor with d3 stacked layout
    chart.selectAll("rect.post_impressions")
        .data(data)
      .append("rect")
        .attr("class", "post_impressions")

    chart.selectAll("rect.post_impressions_organic")
        .data(data)
      .append("rect")
        .attr("class", "post_impressions_organic")

    // chart.append("line")
    //     .attr("x1", 0)
    //     .attr("x2", w * data.length)
    //     .attr("y1", h - .5)
    //     .attr("y2", h - .5)
    //     .style("stroke", "#000")

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
      // plain
      // organic
      // viral
      // paid
      var allrect = self.chart.selectAll("rect")
          .data(data, function(d) { return d.time })
      var rect = self.chart.selectAll("rect.post_impressions")
          .data(data, function(d) { return d.time })
      var rect_organic = self.chart.selectAll("rect.post_impressions_organic")
          .data(data, function(d) { return d.time })

      rect.enter().insert("rect")
          .attr("x", function(d, i) { return self.x(i + 1) - .5 })
          .attr("y", function(d) { return self.h - self.y(d.value) - .5 })
          .attr("width", self.w)
          .attr("height", function(d) { return self.y(d.value) })
          .attr("class", "post_impressions")
        .transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i) - .5 })

      rect_organic.enter().insert("rect")
          .attr("x", function(d, i) { return self.x(i + 1) - .5 })
          .attr("y", function(d) { return self.h - self.y(d.value2) - self.y(d.value) - .5 })
          .attr("width", self.w)
          .attr("height", function(d) { return self.y(d.value2) })
          .attr("class", "post_impressions_organic")
        .transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i) - .5 })

      rect.transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i) - .5 })

      rect_organic.transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i) - .5 })

      rect.exit().transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i - 1) - .5 })
          .remove()
      rect_organic.exit().transition()
          .duration(1000)
          .attr("x", function(d, i) { return self.x(i - 1) - .5 })
          .remove()
    }
    redraw()
  }
};

// Activate knockout.js
ko.applyBindings(new AppViewModel())
