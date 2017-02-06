/* eslint-env es6 */
(function () {
  'use strict'

  var XCarve = function () {
    // var SerialPort = require('serialport')
    const config = require('../config/xcarve.config.json')
    const aStar = require('a-star')

    // let currentPosition = [10, 3]

    // even rows
    //
    // 4 = travellable space
    // 2 = space height
    // 0 = block height
    //
    // odd rows are full (5 cm)
    // even rows are smaller (35/8 cm)
    // odd cols are smaller (35/8 cm)
    // even cols are full (5 cm)
    //

    let commandQueue = []
    let lastCommandSource = undefined
    let busy = false

    const OBJECT_WIDTH = 5
    const USABLE_WIDTH = 80

    const halfActiveRowWidth = OBJECT_WIDTH / 0.5
    const passiveRowHeight = (USABLE_WIDTH - (11 * OBJECT_WIDTH)) / 11
    const passiveRowWidth = (USABLE_WIDTH - (9 * OBJECT_WIDTH)) / 8
    // const passiveRowWidth = 35 / 8
    // const passiveRowHeight = 20 / 8

    // const Y_EXTREME = 750

    /*
    const row1 = 240 // 1 cm too far up
    const row2 = 400
    const row3 = 560 // 1 cm too far down

    const col1 = 752
    const col2 = 592
    const col3 = 432
    */

    const row1 = 230
    const row2 = 400
    const row3 = 570

    const col1 = 752
    const col2 = 592
    const col3 = 432

    var positions = [
      [ row1, col1 ],
      [ row2, col1 ],
      [ row3, col1 ],
      [ row1, col2 ],
      [ row2, col2 ],
      [ row3, col2 ],
      [ row1, col3 ],
      [ row2, col3 ],
      [ row3, col3 ]
    ]

    // spiral offsets
    /*
    var spiralOffsets = [
      [1,0],
      [1,1],
      [0,1],
      [-1,1],
      [-1,0],
      [-1,-1],
      [0,-1],
      [1,-1],

      [3,0],
      [3,3],
      [0,3],
      [-3,3],
      [-3,0],
      [-3,-3],
      [0,-3],
      [3,-3],

      [0,0]
    ];
    */
    var spiralOffsets = [
      [1,0],
      [1,1],
      [0,1],
      [-1,1],
      [-1,0],
      [-1,-1],
      [0,-1],
      [1,-1]
    ];

//
// spacing = 92 horizontally
//           72 vertically
//     30, 122, 214, 306
//     30, 102, 174, 246, 318
//

    let lastCommand = []
    let currentIdentifier = 0

    //var inventory = [9, 9, 5, 5, 5, 5, 5, 9, 9]
    var inventory = [8, 8, 4, 4, 5, 1, 0, 8, 8]
    // var board = [0, 0, 0, 0, 0, 0, 0, 0, 0]

    let SteamTIFF = null

    this.init = () => {
      SteamTIFF = module.parent.exports

      SteamTIFF.log.notify('⚡  Initializing XCarve module')
    }

    this.begin = () => new Promise((resolve, reject) => {
      SteamTIFF.log.notify(config)

      this.sendGCode(this.unlockMachine(false))
      setTimeout(() => { this.initCommands() }, 5000)
      // this.initCommands();
      // this.sendGCode('G21')

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

    this.initCommands = (direct) => {
      SteamTIFF.log.notify('⚡  init commands, must be run from homed machine')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        this.sendGCode({ gcode: this.homeMachine(false) })
        this.sendGCode({ gcode: 'G10 P0 L20 X0 Y0 Z0' })
        this.sendGCode({ gcode: 'G21' })
        // SteamTIFF.serialPort.send('G10 P0 L20 X0 Y0 Z0\nG21\n')
        // resolve()
      } else {
        return 'G10 P0 L20 X0 Y0 Z0'
      }
    }

    this.processCommands = (data) => new Promise((resolve, reject) => {
      SteamTIFF.log.notify('process command')
      console.log(data[0])
      let identifier = undefined
      if (data[0].identifier) {
        identifier = data.shift()
        SteamTIFF.socketServer.io.emit('global', { evt: 'addedToQueue', data: identifier.identifier })
        // currentIdentifier = identifier.identifier
      } else {
        return SteamTIFF.log.error("cannot find identifier")
      }

      // gcode += 'G21\n' // millimeters
      lastCommand = data



      for (var item in data) {
        if (data[item].pickup) {
          // figure out which block to pick up
          var startRow = data[item].pickup - 1
          var startCol = inventory[startRow] - 1

          // move to
          inventory[startRow] -- // adjust inventory

          var absPos = this.getAbsolutePosition(startRow, startCol)
          // move to position

          this.sendGCode({ source: identifier, gcode: this.disengageMagnet(false) }) // 'G90 Z-5\n'    // raise
          this.sendGCode({ source: identifier, gcode: this.raiseMagnet(false) }) // 'G90 Z-5\n'    // raise
          this.sendGCode({ source: identifier, gcode: this.moveTo(absPos[0], absPos[1], false) }) // 'G90 X' + (absPos[0] * 10) + ' Y' + (absPos[1] * 10) + '\n'  // move to position
          this.sendGCode({ source: identifier, gcode: this.lowerMagnet(false) }) // 'G90 Z-15\n'   // lower
          this.sendGCode({ source: identifier, gcode: this.engageMagnet(false) }) // 'M7\n'         // turn on
          this.sendGCode({ source: identifier, gcode: this.dwell(1, false) }) // 'G04 P1\n'     // pause

          // TODO: Hunt for the block in case it shifted
          var moveCoords = [absPos[0], absPos[1]];
          for (var spiralNum = 0; spiralNum < spiralOffsets.length; spiralNum++) {
            this.sendGCode({ source: identifier, gcode: this.moveTo(moveCoords[0] +  spiralOffsets[spiralNum][0], moveCoords[1] +  spiralOffsets[spiralNum][1], false) })
          }

          this.sendGCode({ source: identifier, gcode: this.raiseMagnet(false) }) // 'G90 Z-5\n'    // raise
          this.sendGCode({ source: identifier, gcode: this.moveTo(positions[data[item].drop - 1][0], positions[data[item].drop - 1][1], false) })
          this.sendGCode({ source: identifier, gcode: this.lowerMagnet(false) }) // 'G90 Z-15\n'   // lower
          this.sendGCode({ source: identifier, gcode: this.disengageMagnet(false) }) // 'M7\n'         // turn on
          this.sendGCode({ source: identifier, gcode: this.dwell(1, false) }) // 'G04 P1\n'     // pause

          // var targetRow = positions[data[item].drop - 1][0]
          // var targetCol = positions[data[item].drop - 1][1]
          //
          // var absTarget = this.getAbsolutePosition(targetRow, targetCol)
          // console.log('ABS TARGET', absTarget)
          // move to drop zone
          // gcode += 'G90 '

          // let destination = (data[item].drop - 1) * 2
        } else {
          // console.log('ASDASD', data, data.delay)
          // this.dwell(data[item].delay)
          // gcode += 'G04 P' + data[item].delay + '\n'

          this.sendGCode({ source: identifier, gcode: this.dwell(data[item].delay, false), message: data[item] })
        }
      }
      // gcode += 'G90 G0 X0 Y0 Z-10'
      this.sendGCode({ source: identifier, gcode: 'G90 G0 X0 Y0 Z-20' })
      // console.log('GCODE', gcode)
      this.sendGCode({ source: identifier, gcode: this.dwell(10, false) }) // 'G04 P1\n'     // pause
      this.reverseData()

      // SteamTIFF.serialPort.send(gcode)
      resolve()
    })

    this.reverseData = () => {

      for (var item in lastCommand) {
        if (lastCommand[item].pickup) {
          var startRow = lastCommand[item].pickup - 1
          var startCol = inventory[startRow]

          // move to
          inventory[startRow] ++ // adjust inventory

          var absPos = this.getAbsolutePosition(startRow, startCol)
          // move to position
          this.sendGCode({ gcode: this.disengageMagnet(false) }) // 'G90 Z-5\n'    // raise
          this.sendGCode({ gcode: this.raiseMagnet(false) }) // 'G90 Z-5\n'    // raise
          this.sendGCode({ gcode: this.moveTo(positions[lastCommand[item].drop - 1][0], positions[lastCommand[item].drop - 1][1], false) })
          this.sendGCode({ gcode: this.lowerMagnet(false) }) // 'G90 Z-15\n'   // lower
          this.sendGCode({ gcode: this.engageMagnet(false) }) // 'M7\n'         // turn on
          this.sendGCode({ gcode: this.dwell(1, false) }) // 'G04 P1\n'     // pause

          // TODO: Hunt for the block in case it shifted
          var moveCoords = [positions[lastCommand[item].drop - 1][0], positions[lastCommand[item].drop - 1][1]];
          for (var spiralNum = 0; spiralNum < spiralOffsets.length; spiralNum++) {
            // this.sendGCode({ source: identifier, gcode: this.moveTo(moveCoords[0] +  spiralOffsets[spiralNum][0], moveCoords[1] +  spiralOffsets[spiralNum][1], false) })
            this.sendGCode({ gcode: this.moveTo(moveCoords[0] +  spiralOffsets[spiralNum][0], moveCoords[1] +  spiralOffsets[spiralNum][1], false) })
          }

          this.sendGCode({ gcode: this.raiseMagnet(false) }) // 'G90 Z-5\n'    // raise
          this.sendGCode({ gcode: this.moveTo(absPos[0], absPos[1], false) }) // 'G90 X' + (absPos[0] * 10) + ' Y' + (absPos[1] * 10) + '\n'  // move to position
          this.sendGCode({ gcode: this.lowerMagnet(false) }) // 'G90 Z-15\n'   // lower
          this.sendGCode({ gcode: this.disengageMagnet(false) }) // 'M7\n'         // turn on
          this.sendGCode({ gcode: this.dwell(1, false) }) // 'G04 P1\n'     // pause
        }
      }

      // console.log("INVENTORY", inventory)

      this.initCommands()
    }

    this.getAbsolutePosition = (x, y) => {
      // Turn a col and row into an absolute position for the cnc gcode

      // let absoluteX = 30 + (92 * x) // ((OBJECT_WIDTH + passiveRowWidth) * x) + halfActiveRowWidth
      // let absoluteY = 30 + (72 * y) // ((OBJECT_WIDTH + passiveRowHeight) * y) + halfActiveRowWidth

      let absoluteX = 25 + (92 * x)
      let absoluteY = 43 + (72 * y)

      console.log(x, y, absoluteX, absoluteY)
      return [absoluteX, absoluteY]
    }

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

    this.moveToYExtreme = (direct) => {
      SteamTIFF.log.notify(`⚡  moving the machine to the Y extreme`)
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send(`G90 Y750`)
        // resolve()
      } else {
        return `G90 G0 Y750`
      }
    }

    this.moveTo = (x, y, direct) => {
      SteamTIFF.log.notify(`⚡  moving the machine to {x}, {y}`)
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send(`G90 G0 X{x} Y{y}`)
        // resolve()
      } else {
        return `G90 G0 X` + x + ` Y` + y
      }
    }

    this.resetPosition = () => new Promise((resolve, reject) => {
      resolve()
    })

    this.homeMachine = (direct) => {
      SteamTIFF.log.notify('⚡  sending the machine home')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send('$H')
        // resolve()
      } else {
        return '$H'
      }
    }

    this.unlockMachine = (direct) => {
      SteamTIFF.log.notify('⚡  unlocking the machine')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send('$X')
        // resolve()
      } else {
        return '$X'
      }
    }

    this.engageMagnet = (direct) => {
      SteamTIFF.log.notify('⚡  engage the magnet')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send('M8\nM4 P1\n')
        // resolve()
      } else {
        return 'M8'
      }
    }

    this.disengageMagnet = (direct) => {
      SteamTIFF.log.notify('⚡  disengage the magnet')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send('M9\nM4 P1\n')
        // resolve()
      } else {
        return 'M9'
      }
    }

    this.lowerMagnet = (direct) => {
      SteamTIFF.log.notify('⚡  lower the magnet')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        // Lower by 25 mm:
        // SteamTIFF.serialPort.send('G90 G0 Z-25')

        // lower by 86 mm height instead:
        SteamTIFF.serialPort.send('G90 G0 Z-84')

        // resolve()
      } else {
        // return 'G90 G0 Z-35'
        // lower by 86 mm height instead:
        return 'G90 G0 Z-84'
      }
    }

    this.raiseMagnet = (direct) => {
      SteamTIFF.log.notify('⚡  raise the magnet')
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send('G90 G0 Z0')
        // resolve()
      } else {
        return 'G90 Z-20'
      }
    }

    this.dwell = (duration, direct) => {
      SteamTIFF.log.notify('⚡  pause the machine')
      // console.log(duration)
      direct = (direct !== undefined) ? direct : true
      if (direct) {
        SteamTIFF.serialPort.send('G04 P' + duration)
      } else {
        return 'G4 P' + duration
      }
    }

    this.sendGCode = (command) => {
      if (busy) return commandQueue.push(command)

      // SteamTIFF.log.notify()
      // commandQueue.push(command)
      // if (commandQueue.length > 0){
        // SteamTIFF.serialPort.send(commandQueue.shift())
      // }  else {
      if (command.message) SteamTIFF.socketServer.io.emit('global', { evt: 'message', data: command.message })
      if (command.source && command.source !== lastCommandSource) SteamTIFF.socketServer.io.emit('global', { evt: 'changeSource', data: command.source })
      SteamTIFF.serialPort.send(command.gcode)
      // }

      lastCommandSource = command.source || undefined
      busy = true
    }

    this.gotSerialData = (message) => {
      if (message.indexOf('ok') !== -1) {
        // console.log('XCARVE got serial data', message, commandQueue)
        busy = false
        if (commandQueue.length > 0) this.sendGCode(commandQueue.shift())
      }
    }

    this.init()
  }

  // util.inherits(XCarve, EventEmitter)

  module.exports = function () {
    return new XCarve()
  }
}())
