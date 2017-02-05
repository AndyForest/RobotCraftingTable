(function () {
  'use strict'
  var queue = []
  var active = undefined
  var server
  var init = () => new Promise((resolve, reject) => {
    server = window.io()
    resolve()
  })

  var displayMessage = (data) => {
    console.log("GOT DATA", data)
    if (data.evt === 'message') {
        parseMessage(data.data.message.toString(), data.data.delay * 1000)
    } else if (data.evt === 'changeSource') {
      console.log("change source", data.data.identifier)
      // active = data.data.// IDEA:
      active = queue.shift()
      updateQueue()
    } else if (data.evt === 'addedToQueue'){
      queue.push(data.data)

      updateQueue();
    }

    console.log(queue)

    /*
    console.log(data.data.message)
    document.getElementById('demoMessage').innerHTML = data.data.message
    setTimeout(clearScreen, parseInt(data.data.duration) * 1000)
    */
  }

  var updateQueue = () {
    if (active !== undefined) {
      $('#queue1').html('<h3>Now:</h3><img src="./images/iPad' + active + '.png"/>')
    }

    if (queue.length >= 1) $('#queue2').html('<h3>Next:</h3><img src="images/iPad' + queue[0] + '.png"/>')
    if (queue.length >= 2) $('#queue3').html('<h3>Next:</h3><img src="images/iPad' + queue[1] + '.png"/>')
    // $('#queue3').html('<h3>Next:</h3><img src="images/iPad' + messageArr[1].charAt(2) + '.png"/>')
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

function parseMessage (messageData, messageParameter) {
  // Display message for debugging
  console.log(messageData + ' ' + messageParameter)
  document.getElementById('demoMessage').innerHTML = messageData + ' ' + messageParameter

  var messageArr = messageData.split(',')

  if (messageArr[0] === 'checkMiningBlock') {
    // Hilight a mining target block that is being checked
    // eg: "checkMiningBlock,1"
    var blockNum = parseInt(messageParameter)
    console.log('blockNum: ' + blockNum)
    selectMiningBlock(messageArr[1])
  } else if (messageArr[0] === 'miningTargets') {
    // Set the mining target blocks displayed on the screen
    // eg: "miningTargets,800900000"
    for (var i = 1; i <= 9; i++) {
      console.log('miningTargets setting: ' + i)
      var miningtargetblocktypeid = messageArr[1].charAt(i - 1)
      if (miningtargetblocktypeid === '0') {
        $('#mining' + i).html('')
      } else {
        $('#mining' + i).html('<img src="images/mining' + miningtargetblocktypeid + '.png"/>')
      }
    }
  } else if (messageArr[0] === 'mineBlock') {
    // mineBlock,2
    // TODO: display the mining of the block on screen

  } else if (messageArr[0] === 'recipeComplete') {
    // recipeComplete,32
    $('#success3').html($('#success2').html())
    $('#success2').html($('#success1').html())

    $('#success1').removeClass('animated zoomInUp')

    setTimeout(function () {
      $('#success1').html('<img src="images/recipeSuccess/' + messageArr[1] + '.png"/>')
      $('#success1').addClass('animated zoomInUp')
    }, 100)
  } else if (messageArr[0] === 'queue') {
    console.log('message: ' + messageArr[1].charAt(0))
    $('#queue1').html('<h3>Now:</h3><img src="./images/iPad' + messageArr[1].charAt(0) + '.png"/>')
    $('#queue2').html('<h3>Next:</h3><img src="images/iPad' + messageArr[1].charAt(1) + '.png"/>')
    $('#queue3').html('<h3>Next:</h3><img src="images/iPad' + messageArr[1].charAt(2) + '.png"/>')
  }
}

function selectMiningBlock (blockNum) {
  for (var i = 1; i <= 9; i++) {
    if (i === blockNum) {
      $('#mining' + i).addClass('selectedbox')
    } else {
      $('#mining' + i).removeClass('selectedbox')
    }
  }
}
