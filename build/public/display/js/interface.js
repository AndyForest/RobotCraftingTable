(function () {
  'use strict'
  var server
  var init = () => new Promise((resolve, reject) => {
    server = window.io()
    resolve()
  })

  var addListeners = () => {
    server.on('global', displayMessage)
  }

  var displayMessage = (data) => {
    document.getElementById('demoMessage').innerHTML = data.data.message
    setTimeout(clearScreen, parseInt(data.data.duration))
  }

  var clearScreen = () => {
    document.getElementById('demoMessage').innerHTML = ''
  }

  init()
    .then(addListeners)
    .then(() => server.emit('register', 'display'))
    .catch(err => console.log(err))
}())
