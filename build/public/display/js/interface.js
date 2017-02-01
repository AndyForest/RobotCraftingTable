(function () {
  'use strict'
  var server
  var init = () => new Promise((resolve, reject) => {
    server = window.io()
    resolve()
  })

  var displayMessage = (data) => {
    console.log(data.data.message)
    document.getElementById('demoMessage').innerHTML = data.data.message
    setTimeout(clearScreen, parseInt(data.data.duration) * 1000)
  }

  var clearScreen = () => {
    document.getElementById('demoMessage').innerHTML = ''
  }
  var addListeners = () => {
    server.on('global', displayMessage)
  }
  init()
    .then(addListeners)
    .then(() => server.emit('register', 'display'))
    .catch(err => console.log(err))
}())
