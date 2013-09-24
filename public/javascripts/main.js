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
      function extract (name) {
        return res.reduce(function(acc, x) {
          if (!x[name]) { return acc }
          var time = new Date(x[name][0].timestamp).valueOf()
          if (inRange()) {
            return acc + (parseInt(x[name][0].value) / 30000)
          } else {
            return acc
          }
          function inRange () {
            return time > i && time < i + resolution
            return Math.random() > 0.9
          }
        }, 0)
      }
      c.post_impressions = extract('post_impressions')
      c.post_impressions_organic = extract('post_impressions_organic')
      c.post_impressions_viral = extract('post_impressions_viral')
      c.post_impressions_paid = extract('post_impressionic_paid')
    }
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
    // chart.selectAll("rect.post_impressions")
    //     .data(data)
    //   .append("rect")
    //     .attr("class", "post_impressions")

    // chart.selectAll("rect.post_impressions_organic")
    //     .data(data)
    //   .append("rect")
    //     .attr("class", "post_impressions_organic")

    // chart.selectAll("rect.post_impressions_viral")
    //     .data(data)
    //   .append("rect")
    //     .attr("class", "post_impressions_viral")

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

      function extract (suffix, yFn) {
        var rect = self.chart.selectAll("rect.post_impressions" + suffix)
          .data(data, function(d) { return d.time })

        rect.enter().insert("rect")
            .attr("x", function(d, i) { return self.x(i + 1) - .5 })
            .attr("y", yFn)
            .attr("width", self.w)
            .attr("height", function(d) { return self.y(d['post_impressions' + suffix]) })
            .attr("class", "post_impressions" + suffix)
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

      extract('', function(d) { return self.h - self.y(d.post_impressions) - .5 })
      extract('_organic', function(d) { return self.h - self.y(d.post_impressions) - self.y(d.post_impressions_organic) - .5 })
      extract('_viral', function(d) { return self.h - self.y(d.post_impressions) - self.y(d.post_impressions_organic) - self.y(d.post_impressions_viral) - .5 })
      extract('_paid', function(d) { return self.h - self.y(d.post_impressions) - self.y(d.post_impressions_organic) - self.y(d.post_impressions_viral) - self.y(d.post_impressions_paid) - .5 })
    }
    redraw()
  }
};

// Activate knockout.js
ko.applyBindings(new AppViewModel())
