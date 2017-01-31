/* eslint-env es6 */

(function () {
  'use strict'

    /***
    * Very basic framework for creating ad-hoc web applications.
    * It’s a tool that I’ve been building out on a regular basis where
    * I can use it as a foundation for other modules and widgets.
    *
    * While some of the modules are not really relevant to all projects,
    * having using it’s foundation has been a big help in getting things
    * up and running quickly but with a solid base. Most of the code
    * is written in as basic of JavaScript as can be but there are a few
    * helper classes to assist in debugging as well as just organizing.
    *
    * You’ll also note that all of the SteamTIFF code complies to the JSLint
    * standard of coding meaning that things like “i++” are swapped for
    * “i += 1” and all variables are declared at the beginning of a method
    * using a comma seperated method rather than repetative var statements
    */

  var EventEmitter = require('events')
  var util = require('util')

  var SteamTIFF = function () {
    this.debug = false

        /***
        * Standard SteamTIFF modules
        */
    this.log = null
    this.webServer = null
    this.socketServer = null

        /***
        * Additional modules added for this project
        */
    this.webSockets = null
    this.mqttClient = null
    this.serialPort = null

    this.init = () => new Promise((resolve, reject) => {
//             // Introduction
      console.log('\r\n\r\n███████╗████████╗███████╗ █████╗ ███╗   ███╗')
      console.log('██╔════╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║')
      console.log('███████╗   ██║   █████╗  ███████║██╔████╔██║')
      console.log('╚════██║   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║')
      console.log('███████║   ██║   ███████╗██║  ██║██║ ╚═╝ ██║')
      console.log('╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝')

      console.log('\r\n\r\n          ⚗  Welcome to SteamTIFF ⚗')
      console.log('––––––––––––––––––––––––––––––––––––––––––———')
      console.log('Various icons within the console stream')
      console.log('represent the various areas of the web app.')
      console.log('They provide a means for easier debugging')
      console.log('and locating of problems as they are paired')
      console.log('with a timestamp.')
      console.log('  ⚗  = SteamTIFF Global Application')
      console.log('  💼  = SteamTIFF.delegate')
      console.log('  🌐  = SteamTIFF.webServer')
      console.log('  🔌  = SteamTIFF.socketServer')
      console.log(' \r\nOptional Modules')
      console.log('  👀  = SteamTIFF.webSockets')
      console.log('  💡  = SteamTIFF.mqttClient')
      console.log('  ⚡  = SteamTIFF.serialPort')
      console.log('  Lines written with a blue background are')
      console.log('  simply notifications but any that are red')
      console.log('  are server errors and should be seen to')
      console.log('  right away.')
      console.log('––––––––––––––––––––––––––––––––––––––––––———')

            /***
            * Using the initial load under the try ensures that any concerns during
            * this phases are caught and described.
            */
      try {
                // Load the logging module first as it’s used even before we start anything else
        this.log = require('./lib/core/steamtiff.logging')
        this.log.notify('⚗  Beginning SteamTIFF setup')

                // Load any databases or data files before doing loading as they may be needed for other services
                /* No DB or datasource required for this project */

                // Load in the standard SteamTIFF modules and project the global object to them to reference as a parent.
                // This is done since module.exports.parent does not always provide the proper object
        this.delegate = require('./lib/core/steamtiff.delegator')()
        this.webServer = require('./lib/core/steamtiff.webServer')()
        this.socketServer = require('./lib/core/steamtiff.socketServer')()

                // Load in the added modules specific to this project using the same method of parent as variable
        this.webSockets = require('./lib/modules/steamtiff.webSockets')()
        this.mqttClient = require('./lib/modules/steamtiff.mqttClient')()
        this.serialPort = require('./lib/modules/SteamTIFF.serialport')()
        this.xcarve = require('./lib/modules/steamtiff.xcarve')()

                // Now that all the modules are loaded, we can initiate them as asynchronous steps to avoid
                // clashing as well as reliant data.
        this.begin()
          .then(this.webServer.begin)
          .then(this.socketServer.begin)
          .then(this.serialPort.begin)
          .then(this.initialize)
          .then(resolve)

                // Additional methods can be placed here that will run outside of the asynchronous queue above.
                // This is prime locations for listeners to added modules or the socket server
      } catch (e) {
        console.log(e)
      }
    })

    this.begin = () => new Promise((resolve, reject) => {
      this.serialPort.on('ready', () => {
          // The connect method uses the configuration’s "com" property to connect to the matching com port
          // or the connection
        this.serialPort.connect()
      })

      this.serialPort.on('connected', () => {
        console.log('Connected to connection:', this.serialPort.connection.path)
        setTimeout(this.xcarve.begin, 1500)
      })

      this.serialPort.on('disconnected', () => console.log('disconnected'))
      // Erroring (not working as expected… try not to error)
      this.serialPort.on('error', (err) => console.log('Oops, I errored', err))
      // The raw data as it is coming in. Note that this is a buffer so it needs to be converted to a string
      this.serialPort.on('data', (rawBufferData) => this.xcarve.gotSerialData(rawBufferData.toString()))
      // Any complete message that contains the terminator string (default: \r\n)
      this.serialPort.on('message', (message) => console.log('Incoming from serialport:', message))

      this.socketServer.potentialEvents.hello = (data, connection) => {
        connection.emit('welcome', 'Good day to you to: ' + connection.id)
      }

      this.socketServer.potentialEvents.unlock = (data, connection) => {
        this.xcarve.unlockMachine()
      }

      this.socketServer.potentialEvents.home = (data, connection) => {
        this.xcarve.homeMachine()
      }

      this.socketServer.potentialEvents.engageMagnet = (data, connection) => {
        this.xcarve.engageMagnet()
      }

      this.socketServer.potentialEvents.disengageMagnet = (data, connection) => {
        this.xcarve.disengageMagnet()
      }

      this.socketServer.potentialEvents.raiseMagnet = (data, connection) => {
        this.xcarve.raiseMagnet()
      }

      this.socketServer.potentialEvents.lowerMagnet = (data, connection) => {
        this.xcarve.lowerMagnet()
      }

      this.socketServer.potentialEvents.goToPosition = (data, connection) => {
        this.xcarve.goToPosition(data)
      }

      this.socketServer.potentialEvents.moveFromTo = (data, connection) => {
        this.xcarve.goToPosition(data)
      }

      this.socketServer.potentialEvents.sendMessage = (data, connection) => {
        this.socketServer.io.emit('global', { evt: 'message', data: data })
        this.xcarve.dwell(data.duration)
      }

      this.socketServer.potentialEvents.instructCommand = (data, connection) => {
        this.xcarve.processCommands(data)
      }

      resolve()
    })

    this.loadModules = this.loadModule = (moduleName) => new Promise((resolve, reject) => {
      moduleName = [].concat(moduleName)
      Object.keys(this).forEach(key => {
        moduleName.forEach(module => {
          if (key.toLowerCase() === module.toLowerCase()) {
            if (this[key] !== null) {
              resolve()
            } else {
              this[key] = require('./modules/SteamTIFF.' + key)()
              if (this[key].begin) {
                this[key].begin()
              }
            }
          }
        })
        resolve()
      })
    })

    this.event = (message) => new Promise((resolve, reject) => {
      try {
        if (message) {
          message.broadcast = (message.broadcast !== false)
          if (message.broadcast === true) {
            this.emit(message.evt, message.data)
            if (this.socketServer.io) { this.socketServer.io.emit(message.evt, message.data) }
            if (message.evt.indexOf('.') !== -1) {
              this.emit(message.evt.split('.')[0], message.data)
              if (this.socketServer.io) { this.socketServer.io.emit(message.evt.split('.')[0], message.data) }
            }
            this.emit('*', message)
          }
        }
      } catch (e) {
        SteamTIFF.log.error(e)
      }
      resolve(message)
    })

    this.ready = () => new Promise((resolve, reject) => {
      this.emit('ready')
      resolve()
    })
  }

    // Provide SteamTIFF with the ability to emit
  util.inherits(SteamTIFF, EventEmitter)

  SteamTIFF = new SteamTIFF()

  module.exports = SteamTIFF

    // Run the initialization upon being created
  SteamTIFF.init()
        .then(SteamTIFF.ready)
}())
