
/* eslint-env es6 */
(function () {
  'use strict'

  var EventEmitter = require('events')
  var util = require('util')

    /***
    * SteamTIFF module for websocket direct connection
    */
  var WebSockets = function () {
    var ws = require('nodejs-websocket')

    // var config = require('../config/webSockets.config.json')
    var SteamTIFF

    this.server = null
    this.connections = {}

    this.init = function () {
      SteamTIFF = module.parent.exports
      SteamTIFF.log.notify('👀  WebSockets Initializing')
    }

    this.begin = () => new Promise((resolve, reject) => {
      this.createServer()
                .then(this.setupListeners)
                .then(this.startListening)
                .then(resolve)
                .catch(this.errored)
    })

    this.createServer = () => new Promise((resolve, reject) => {
      this.connections = ws.createServer()
      resolve()
    })

    this.setupListeners = () => new Promise((resolve, reject) => {
      this.connections.on('connection', this.initializeConnection)
      this.connections.on('error', this.errored)
      resolve()
    })

    this.initializeConnection = (connection) => {
      connection.on('text', (data) => {
        this.confirmConnection(data, connection)
                    .then(this.processMessage)
                    .then(this.sendConfirmation)
                    .catch((err) => this.rejectMessage(err, connection))
      })

      SteamTIFF.log.notify('👀  New WebSocket connected')

      connection.on('close', () => this.removeSocket(connection))
      connection.on('error', this.errored)
    }

    this.sendConfirmation = (message) => new Promise((resolve, reject) => {
      if (this.connections[message.id]) {
        this.connections[message.id].send(JSON.stringify({status: 200}))
      }
      resolve()
    })

    this.processMessage = (message) => new Promise((resolve, reject) => {
      if (message) {
        message.trackable = message.trackable || true
        message.broadcast = message.broadcast || true
        if (message.broadcast === true) {
          SteamTIFF.emit(message.evt, message.data)
        }
        if (message.trackable === true) {
          SteamTIFF.analytics.track(message.evt, message.data, 'websocket')
        }
      }
      resolve()
    })

    this.rejectMessage = function (err, connection) {
      connection.send(JSON.stringify({status: 400, message: err}))
      SteamTIFF.log.error('👀  Invalid WebSockets connection: ' + err)
    }

    this.confirmConnection = (message, connection) => new Promise((resolve, reject) => {
      message = JSON.parse(message.toString()) || {}
      message.id = (message.hasOwnProperty('id')) ? message.id : false
      message.evt = (message.hasOwnProperty('evt')) ? message.evt : false
      if (!message.id) {
        reject('Valid id not provided')
      } else if (message.evt === 'introduction' || message.evt === 'intro') {
        this.connections[message.id] = connection
        resolve(message)
      } else if (this.connections[message.id] && message.evt === 'ping') {
        connection.send(JSON.stringify({pong: (new Date().valueOf())}))
        resolve(false)
      } else if (this.connections[message.id]) {
        resolve(message.data)
      } else {
        reject('Invalid id provided, introduction required')
      }
    })

    this.errored = (err) => {
      SteamTIFF.log.error('👀  WebSocket Error: ' + JSON.stringify(err))
    }

    this.startListening = new Promise((resolve, reject) => {
      // this.connections.listen(config.port)
      // SteamTIFF.log.notify('👀  Listening for WebSockets on port ' + config.port)
      resolve()
    })

    this.removeSocket = (connection) => {

    }

    this.init()
  }

  util.inherits(WebSockets, EventEmitter)

  module.exports = function () {
    return new WebSockets()
  }
}())
