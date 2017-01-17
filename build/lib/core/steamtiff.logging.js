/* eslint-env es6 */
(function () {
  'use strict'

  var log = require('oh-my-log')('⚗ ')
  var chalk = require('chalk')

  var Logging = function (message, colour) {
    this.notify = (message) => new Promise(function (resolve, reject) {
      if (arguments.length > 1) {
        // var argies = Array.prototype.slice.call(arguments)

        message = chalk.bgCyan.black(` ${message} `)
      }
      message = chalk.bgCyan.black(' ' + message + ' ')
      log(message)
      resolve()
    })

    this.error = (message) => new Promise(function (resolve, reject) {
      message = chalk.bgRed.white(' ' + message + ' ')
      log(message)
      resolve()
    })
  }

  Logging = new Logging()

  module.exports = Logging
}())
