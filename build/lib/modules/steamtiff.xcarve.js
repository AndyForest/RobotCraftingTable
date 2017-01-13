/* eslint-env es6 */
(function () {
  'use strict'

  var XCarve = function () {
    // var SerialPort = require('serialport')
    const config = require('../config/xcarve.config.json')
    const aStar = require('a-star')

    let currentPosition = [10, 3]

    let layout = [
      '################',
      '#00000000000000#',
      '#00000000000000#',
      '################',
      '################',
      '################',
      '################',
      '################',
      '################',
      '################',
      '################',
      '################',
      '################',
      '#00000000000000#',
      '#00000000000000#',
      '################'
    ]

    let SteamTIFF = null

    this.init = () => {
      SteamTIFF = module.parent.exports

      SteamTIFF.log.notify('⚡  Initializing XCarve module')
    }

    this.begin = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify(config)
      resolve()
                .catch(err => {
                  SteamTIFF.log.error(`⚡ XCarve Error: ${JSON.stringify(err, true, 2)}`)
                  reject(err)
                })
    })

    this.attachListeners = () => new Promise((resolve, reject) => {
      SteamTIFF.socketServer.io.on('home', this.homeMachine)
      resolve()
    })

    this.processCommands = (data) => new Promise((resolve, reject) => {
      console.log('process command', data)
      resolve()
    })

    this.goToPosition = (x, y) => new Promise((resolve, reject) => {
      this.moveTo(x, y)
        // .then(this.lowerMagnet)
        // .then(this.engageMagnet)
        .then(resolve)
        .catch(err => {
          SteamTIFF.log.error(`⚡ xcarve Error: ${JSON.stringify(err, true, 2)}`)
          reject(err)
        })
    })

    this.moveTo = (data) => new Promise((resolve, reject) => {
      SteamTIFF.log.notify(`⚡  moving the machine to {data.x}, {data.y}`)
      this.unlockMachine()
        .then(this.raiseMagnet)
        .then(() => this.getPathToPosition(currentPosition, [data.x, data.y]))
        .then((results) => {
          for (const key in results) {
            // console.log(key + '->' + results[key]) // '0->foo', '1->bar', 'oups->baz'
            let x = results[key][0] - currentPosition[0]
            let y = results[key][1] - currentPosition[1]

            SteamTIFF.serialPort.send('G21 G91 G0 X' + x + ' Y' + y)

            currentPosition = results[key]
            //
          }
          // SteamTIFF.serialPort.send(`G0 X{x} Y{y}`)
          resolve()
        })
        .then(this.lowerMagnet)
        .resolve()
    })

    this.resetPosition = () => new Promise((resolve, reject) => {
      resolve()
    })

    this.homeMachine = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  sending the machine home')
      SteamTIFF.serialPort.send('$H')
    })

    this.unlockMachine = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  unlocking the machine')
      SteamTIFF.serialPort.send('$X')
    })

    this.engageMagnet = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  engage the magnet')
      SteamTIFF.serialPort.send('M8;M4 P1;')
      resolve()
    })

    this.disengageMagnet = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  disengage the magnet')
      SteamTIFF.serialPort.send('M9;M4 P1;')
      resolve()
    })

    this.lowerMagnet = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  lower the magnet')
      SteamTIFF.serialPort.send('G21 G91 G0 Z-1')
      resolve()
    })

    this.raiseMagnet = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  raise the magnet')
      SteamTIFF.serialPort.send('G21 G91 G0 Z1')
      resolve()
    })

    this.dwell = (duration) => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('⚡  pause the machine')
      SteamTIFF.serialPort.send('M3 P' + duration)
      resolve()
    })

    this.getPathToPosition = (start, end) => new Promise((resolve, reject) => {
      try {
        // console.log(start, end)
        let that = this
        let results = aStar({
          start: start,
          isEnd: function (n) {
            return n[0] === end[0] && n[1] === end[1]
          },
          neighbor: function (xy) {
            return that.planarNeighbors(xy).filter(function (xy) {
            // cell is walkable if it's not a "#" sign
              // console.log(layout, xy, xy[1], layout[xy[1]], xy[0])
              return layout[xy[1]].charAt(xy[0]) !== '0'
            })
          },
          distance: this.euclideanDistance,
          heuristic: function (xy) {
            return that.euclideanDistance(xy, end)
          }
        })

        SteamTIFF.log.notify(results.success)
        resolve(results.path)
      } catch (e) {
        SteamTIFF.log.error(e)
        reject(e)
      }
    })

    this.planarNeighbors = (xy) => {
      let x = xy[0]
      let y = xy[1]
      return [
        [x - 1, y - 1],
        [x - 1, y + 0],
        [x - 1, y + 1],
        [x + 0, y - 1],

        [x + 0, y + 1],
        [x + 1, y - 1],
        [x + 1, y + 0],
        [x + 1, y + 1]
      ]
    }
    this.euclideanDistance = (a, b) => {
      let dx = b[0] - a[0]
      let dy = b[1] - a[1]
      return Math.sqrt(dx * dx + dy * dy)
    }

    this.rectilinearDistance = (a, b) => {
      let dx = b[0] - a[0]
      let dy = b[1] - a[1]
      return Math.abs(dx) + Math.abs(dy)
    }

    this.init()
  }

  // util.inherits(XCarve, EventEmitter)

  module.exports = function () {
    return new XCarve()
  }
}())
