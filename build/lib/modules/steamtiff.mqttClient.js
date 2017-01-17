/* eslint-env es6 */
(function () {
  'use strict'
  var mqtt = require('mqtt')

  var MQTTClient = function () {
    var config = require('../config/mqtt.config.json')

    var SteamTIFF

    this.server = null

    this.potentialEvents = {}

    this.init = () => {
      SteamTIFF = module.parent.exports
      SteamTIFF.log.notify('💡  Initializing mqttClient')
    }

    this.connect = () => new Promise((resolve, reject) => {
      this.server = mqtt.connect(config)
      this.server.on('error', this.serverError)
      this.server.on('connect', this.serverConnected)
      this.server.on('message', this.receiveEvent)
      resolve()
    })

    this.setupSubscriptions = (eventName, eventMethod) => {
      this.server.subscribe('#') // NEVER DO THIS! Super bad form…
    }

    this.serverConnected = (serverConnection) => {
      SteamTIFF.log.notify('💡  MQTT Connected to ' + config.host + ':' + config.port)
      this.setupSubscriptions()
    }

    this.receiveEvent = (topic, data) => {
      Object.keys(this.potentialEvents).forEach(event => (new RegExp(event, 'gi').exec(topic)) ? this.potentialEvents[event](data, topic) : null)
    }

    this.serverError = (msg) => {
      SteamTIFF.log.error('💡  mqttClient ' + msg)
      if (msg.toString().indexOf('Connection refused') !== -1) {
        this.server.end()
      }
    }

    this.begin = () => new Promise((resolve, reject) => {
      this.connect()
                .then(() => SteamTIFF.log.notify('💡  Completed mqttClient setup'))
                .then(resolve)
    })

    this.init()
  }

  module.exports = function () {
    return new MQTTClient()
  }
}())
