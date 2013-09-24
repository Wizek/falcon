
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
  res.send({a:1})
})
app.get('/api/reach', function(req, res) {
  res.send({a:1})
})


http.createServer(app).listen(app.get('port'), function(){
  console.log('Falcon server listening on port ' + app.get('port'))
})

require('jade').filters.loadr = function(content, filename) {
  var middle = content.replace(/[\s\n,]/g, ',')
  var full = ''
    + '<script src="http://loadr.aws.af.cm/load?packages='
    + middle
    + '"></script>'
  return full
}
