/* eslint-env es6 */
(function () {
  'use strict'
  var express = require('express')
  var http = require('http')
  var bodyParser = require('body-parser')
  var fs = require('fs')
  var path = require('path')
    /***
    * One of the foundation modules for SteamTIFF, allows for
    * quick setup of routing as well as a directory path
    * for flat static directory loading
    */
  var WebServer = function () {
    var config = require('../config/webServer.config.json')
    var SteamTIFF

        // Due to the way that Express and Socket.io work, we setup an HTTP server here and
        // reference it for both of those services.
    this.server = null
    this.app = null

        // This path is the automatic routing directory where you can create
        // routing methods quickly and bundle them up in single files
        // There is currently an example route setup that has details on
        // how to access parameters as well as query string variables
    this.options = {
      routes: path.join(__dirname, config.routes),
      flatFiles: path.join(__dirname, config.base)
    }

        // Standard SteamTIFF initializer and notification of starting the service
    this.init = () => new Promise((resolve, reject) => {
      SteamTIFF = module.parent.exports
      SteamTIFF.log.notify('🌐  Initializing WebServer')
            // Passing in custom options to the begin allows for a more
            // fine tuned applications but it is not required

            // Begin the ExpressJS application and assign it to the server
      this.app = express()
      this.server = http.Server(this.app)

            // Ensure to use any parameter capturing inbetween tools
      this.app.use(bodyParser.json())
      this.app.use(bodyParser.urlencoded({ extended: true }))

            // This small addition logs any requests if the server is
            // currently in development but does not block the route
            // from other methods. It’s setup first to ensure that it
            // is the first thing run on any request
      if (SteamTIFF.debug) {
        this.app.use('/*', function (req, res, next) {
          SteamTIFF.log.notify('🌐  :' + req.originalUrl)
          next()
        })
      }

            // Small simple apps sometimes only require static files and not
            // complex routing paths. This allows for a directory to be setup
            // to perform this action.
      if (this.options.flatFiles) { this.app.use(express['static'](this.options.flatFiles)) }
      resolve()
    })

        // Because we want to wait until all the services required are loaded, we let the global
        // object run the begin command as a promise to ensure things can be daisy chained and
        // asynchronously loaded
    this.begin = () => new Promise((resolve, reject) => {
      this.server.listen(config.port)
      SteamTIFF.log.notify('🌐  Web server running on port: ' + config.port)
      resolve()
    })

        // Instead of having all the routing in this file, a default router
        // folder can contain files that have either single routes or an
        // array of routes that will automatically be loaded in upon boot.
    this.loadRoutes = () => new Promise((resolve, reject) => {
      fs.readdir(this.options.routes, (err, files) => {
        if (err) throw err

        var route = null

        files.forEach(file => {
          if (file.indexOf('.js') !== -1) {
            route = require(this.options.routes + file)

            if (route.constructor.name === 'Array') {
              route.forEach(r => this.setupRouteModule(r))
            } else if (route.constructor.name === 'Object') {
              this.setupRouteModule(route)
            }
          }
        })
        resolve()
      })
    })

        // When a route object is found, add the route to the ExpressJS
        // application using the method it’s defined or GET if non specified
    this.setupRouteModule = (route) => {
      route.method = route.method || 'all'
      if (['post', 'get', 'put', 'delete', 'all'].indexOf(route.method.toLowerCase()) !== -1) {
        SteamTIFF.log.notify('🌐  ' + route.method.toUpperCase() + ' Route: ' + route.path)
        this.app[route.method.toLowerCase()](route.path, route.handler)
      }
    }

    this.init()
            .then(this.loadRoutes)
            .then(() => SteamTIFF.log.notify('🌐  Completed WebServer setup'))
  }

  module.exports = function () {
    return new WebServer()
  }
}())
