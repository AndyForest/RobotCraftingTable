(function () {
  'use strict'
  var server
  var init = () => new Promise((resolve, reject) => {
    server = window.io()
    resolve()
  })

  var addListeners = () => {
    document.getElementById('unlock').addEventListener('click', unlock)
    document.getElementById('home').addEventListener('click', home)
    document.getElementById('engageMagnet').addEventListener('click', engageMagnet)
    document.getElementById('disengageMagnet').addEventListener('click', disengageMagnet)
    document.getElementById('raiseMagnet').addEventListener('click', raiseMagnet)
    document.getElementById('lowerMagnet').addEventListener('click', lowerMagnet)
    document.getElementById('goToPosition').addEventListener('click', goToPosition)
    document.getElementById('moveFromTo').addEventListener('click', moveFromTo)
    document.getElementById('sendMessage').addEventListener('click', sendMessage)

    server.on('welcome', (msg) => console.log(msg))
  }

  var unlock = (evt) => {
    evt.preventDefault()
    console.log('unlock')
    server.emit('unlock')
  }
  var home = (evt) => {
    evt.preventDefault()
    console.log('home')
    server.emit('home')
  }
  var engageMagnet = (evt) => {
    evt.preventDefault()
    console.log('engageMagnet')
    server.emit('engageMagnet')
  }
  var disengageMagnet = (evt) => {
    evt.preventDefault()
    console.log('disengageMagnet')
    server.emit('disengageMagnet')
  }
  var raiseMagnet = (evt) => {
    evt.preventDefault()
    console.log('raiseMagnet')
    server.emit('raiseMagnet')
  }
  var lowerMagnet = (evt) => {
    evt.preventDefault()
    console.log('lowerMagnet')
    server.emit('lowerMagnet')
  }

  var goToPosition = (evt) => {
    evt.preventDefault()
    console.log('goToPosition')
    server.emit('goToPosition', { x: 5, y: 5 })
  }

  var moveFromTo = (evt) => {
    evt.preventDefault()
    console.log('moveFromTo')
    let from = document.getElementById('moveFromCol').value
    let to = document.getElementById('moveToArea').value

    server.emit('moveFromTo', { from, to })
  }

  var sendMessage = (evt) => {
    evt.preventDefault()
    console.log('send message')
    let message = document.getElementById('messageText').value
    let duration = document.getElementById('messageDuration').value

    server.emit('sendMessage', { message, duration })
  }

  init()
    .then(addListeners)
    .then(() => server.emit('register', 'xcarve'))
    .catch(err => console.log(err))
}())
