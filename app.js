
/**
 * Module dependencies.
 */

var express = require('express')
var http = require('http')
var path = require('path')
var app = express()

// all environments
app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

app.get('/', function(req, res) {
  res.render('index', { title: 'Falcon App' })
})

app.get('/api/publishing', function(req, res) {
  res.send(require('./mockData/publishing.json'))
})

app.get('/api/impressions', function(req, res) {
  res.send(require('./mockData/impressions.json'))
})

var httpServer = http.createServer(app)

httpServer.listen(app.get('port'), function(){
  console.log('Falcon server listening on port ' + app.get('port'))
})

var io = require('socket.io').listen(httpServer)

io.sockets.on('connection', function (socket) {

  var t = 1297110663
  var v1 = 10
  var v2 = 10
  var v3 = 10
  var v4 = 10

  function next() {
    function e (seed) {
      return ~~Math.max(3, Math.min(25, seed + 10 * (Math.random() - .5)))
    }
    return {
      time: ++t,
      post_impressions: v1 = e(v1),
      post_impressions_organic: v2 = e(v2),
      post_impressions_viral: v3 = e(v3),
      post_impressions_paid: v4 = e(v4)
    }
  }

  // TODO: stop interval when client disconnects
  setInterval(function() {
    socket.emit('new_impression', next())
  }, 2000)
})

// Adds better loadr support for jade
require('jade').filters.loadr = function(content, filename) {
  var middle = content.replace(/[\s\n,]/g, ',')
  var full = ''
    + '<script src="http://loadr.aws.af.cm/load?packages='
    + middle
    + '"></script>'
  return full
}
