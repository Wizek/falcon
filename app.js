
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

  var t = 1297110663, // start time (seconds since epoch)
      v = 0, // start value (subscribers)
      v2 = 0 // start value (subscribers)

  function next() {
    return {
      time: ++t,
      value: v = ~~Math.max(1, Math.min(90, v + 10 * (Math.random() - .5))),
      value2: v2 = ~~Math.max(1, Math.min(90, v2 + 10 * (Math.random() - .5)))
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
