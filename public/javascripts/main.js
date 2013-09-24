function AppViewModel() {
  var self = this
  this.publication = ko.observable()
  window.impressions = this.impressions = ko.observableArray([/*d3.range(66).map(next)*/])

  var t = 1297110663, // start time (seconds since epoch)
      v = 70, // start value (subscribers)
      v2 = 10 // start value (subscribers)
      // data = d3.range(66).map(next) // starting dataset

  function next() {
    return {
      time: ++t,
      value: v = ~~Math.max(10, Math.min(90, v + 10 * (Math.random() - .5))),
      value2: v2 = ~~Math.max(10, Math.min(90, v + 10 * (Math.random() - .5)))
    }
  }
  for (var i = 0; i < 80; i++) {
    self.impressions.push(next())
  }

  setInterval(function() {
    self.impressions.shift()
    self.impressions.push(next())
  }, 1500)

  setTimeout(function() {
    var response = {"version":"5.3.9","response":[{"id":"8a1330c93e31b8af013e360d6a2106ea","content":{"message":"Her er den perfekte gave","id":"8a1330c93e31b8af013e360d6a2106ea","network":"facebook","postType":"photo","media":{"fileName":"konfirmationsgave til hende.jpg","url":"http://s3.amazonaws.com/mingler.falcon.scheduled_post_pictures/25c69cba-8881-4147-9fc9-d61a9c2de676"}},"tags":["converstaion","sales"],"status":"draft","channels":[{"name":"Konfirmanden","id":433104606739910}],"scheduled":"2013-08-08T08:00:00.000Z","geo":{"countries":[{"value":"Afghanistan","key":"134"}],"languages":[{"value":"Afrikaans","key":"31"}],"cities":[],"regions":[]}}],"status":"OK","error":""}
    self.publication(response.response[0])
  }, 500)
}


ko.bindingHandlers.reachChart = {
  init: function(element, valueAccessor) {
    var self = this
    var data = valueAccessor()
    console.log('data', data)
    if (!data || !data.length) { return }

    var w = 5,
        h = 80

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

    chart.selectAll("rect")
        .data(data)
      .enter().append("rect")
        .attr("x", function(d, i) { return x(i) - .5 })
        .attr("y", function(d) { return h - y(d.value) - .5 })
        .attr("width", w)
        .attr("height", function(d) { return y(d.value) })

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
    console.log('data', data)

    var self = this
    function redraw() {
      var rect = self.chart.selectAll("rect")
          .data(data, function(d) { return d.time })

      rect.enter().insert("rect", "line")
          .attr("x", function(d, i) { return self.x(i + 1) - .5 })
          .attr("y", function(d) { return h - self.y(d.value) - .5 })
          .attr("width", w)
          .attr("height", function(d) { return self.y(d.value) })
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
