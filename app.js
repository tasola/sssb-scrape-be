let isProd = true
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  isProd = false
}

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const sassMiddleware = require('node-sass-middleware')
const enforce = require('express-sslify')
const rateLimit = require('express-rate-limit')

const indexRouter = require('./controllers/endpoints')

const app = express()
const limiter = rateLimit({ windowMs: 20 * 60 * 1000, max: 10 })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
  })
)
app.use(express.static(path.join(__dirname, 'public')))
app.use(limiter)

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

if (isProd) {
  app.use(enforce.HTTPS({ trustProtoHeader: true }))
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
