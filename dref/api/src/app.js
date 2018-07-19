import express from 'express'
import createError from 'http-errors'
import path from 'path'
import logger from 'morgan'
import mongoose from 'mongoose'
import YAML from 'yamljs'
import cors from 'cors'

/**
 * Mongo
 */
mongoose.connect('mongodb://mongo:27017/dref')
mongoose.set('debug', true)

/**
 * Models
 */
import ARecord from './models/ARecord'
import Log from './models/Log'
import Target from './models/Target'

/**
 * Process dref-config.yml and set up targets
 */
global.config = YAML.load('/tmp/dref-config.yml')

for (let i = 0; i < global.config.targets.length; i++) {
  if (!global.config.targets[i].hasOwnProperty('target') || !global.config.targets[i].hasOwnProperty('script')) {
    console.log('dref: Missing properties id and/or script for payload in dref-config.yml')
  }

  let doc = {
    target: global.config.targets[i].target,
    script: global.config.targets[i].script,
    hang: global.config.targets[i].hang,
    args: global.config.targets[i].args
  }

  Target.update({target: global.config.targets[i].target}, doc, {upsert: true}, function () {
    console.log('dref: Configured target\n' + JSON.stringify(doc, null, 4))
  })
}

/**
 * Import routes
 */
import indexRouter from './routes/index'
import logsRouter from './routes/logs'
import scriptsRouter from './routes/scripts'
import aRecordsRouter from './routes/arecords'
import targetsRouter from './routes/targets'
import checkpointRouter from './routes/checkpoint'
import hangRouter from './routes/hang'

/**
 * Set up app
 */
var app = express()

app.disable('x-powered-by')
app.set('etag', false)

app.options('/logs', cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// routes
app.use('/', indexRouter)
app.use('/logs', logsRouter)
app.use('/scripts', scriptsRouter)
app.use('/arecords', aRecordsRouter)
app.use('/targets', targetsRouter)
app.use('/checkpoint', checkpointRouter)
app.use('/hang', hangRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

/**
 * Error handler
 */
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
