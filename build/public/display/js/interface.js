var myID;
var myQueue;

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

    // console.log(queue)

    /*
    console.log(data.data.message)
    document.getElementById('demoMessage').innerHTML = data.data.message
    setTimeout(clearScreen, parseInt(data.data.duration) * 1000)
    */
  }

  var updateQueue = () => {
    myQueue = queue;

    if (active !== undefined) {
      $('#queue1').removeClass('Off');
      $('#queue1').html('<h3>Now:</h3><img src="./images/iPad' + active + '.png"/>')
      $('#robotPlayerTitle').html('<img src="images/user.png"/>Robot executing player ' + active + '\'s code');
      $('#robotPlayerTitle').removeClass('Off');
      $('#robotInventoryTitle').html('Player ' + myID + ' inventory:')
      clearTimeout(robotIdleTimeout);
    }

    if (queue.length >= 1) {
      $('#queue2').html('<h3>Next:</h3><img src="images/iPad' + queue[0] + '.png"/>')
    } else {
      $('#queue2').html('');
    }

    if (queue.length >= 2) {
      $('#queue3').html('<h3>Next:</h3><img src="images/iPad' + queue[1] + '.png"/>')
    } else {
      $('#queue3').html('');
    }

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
  // document.getElementById('demoMessage').innerHTML = messageData + ' ' + messageParameter

  var messageArr = messageData.split(',')

  if (messageArr[0] == 'checkMiningBlock') {
    // Hilight a mining target block that is being checked
    // eg: "checkMiningBlock,1"
    var blockNum = parseInt(messageArr[1])
    console.log('blockNum: ' + blockNum)
    selectMiningBlock(blockNum)
  } else if (messageArr[0] === 'myID') {
    // Initialize display
    $('#craftingMessage').addClass('Off');
    myID = messageArr[1];

  } else if (messageArr[0] === 'miningTargets') {
    // Set the mining target blocks displayed on the screen
    // eg: "miningTargets,800900000"
    for (var i = 1; i <= 9; i++) {
      // console.log('miningTargets setting: ' + i)
      var miningtargetblocktypeid = messageArr[1].charAt(i - 1)
      if (miningtargetblocktypeid === '0') {
        $('#mining' + i).html('<h1>1</h1>')
      } else if (miningtargetblocktypeid === '2') {
        $('#mining' + i).html('<h1>' + i + '</h1>')
      } else {
        $('#mining' + i).html('<h1>' + i + '</h1>' + '<img src="images/mining' + miningtargetblocktypeid + '.png" />')
      }
    }
  } else if (messageArr[0] === 'mineBlock') {
    // mineBlock,2,4
    // Display the mining of the block on screen
    var minedBlockID = parseInt(messageArr[1])
    var miningLocationID = parseInt(messageArr[2])

    $('#inventory' + minedBlockID).removeClass('animated bounceIn')
    $('#mining' + miningLocationID).removeClass('animated bounceIn')

    setTimeout(function () {
      $('#inventory' + minedBlockID).addClass('animated bounceIn')
      $('#mining' + miningLocationID).addClass('animated bounceIn')
    }, 100)

    showSuccessMessage('You have mined some ' + itemCodeLookup[minedBlockID][0]);

  } else if (messageArr[0] === 'recipeComplete') {
    // recipeComplete,32
    console.log('recipeComplete');
    $('#success3').html($('#success2').html())
    $('#success2').html($('#success1').html())

    $('#success1').removeClass('animated zoomInUp')
    $('#success1').html('');

    setTimeout(function () {
      $('#success1').html('<img src="images/recipeSuccess/' + messageArr[1] + '.png"/><img src="./images/iPad' + myID + '.png"/>')
      $('#success1').addClass('animated zoomInUp')
    }, 100)
  } else if (messageArr[0] === 'queue') {
    console.log('message: ' + messageArr[1].charAt(0))
    $('#queue1').html('<h3>Now:</h3><img src="./images/iPad' + messageArr[1].charAt(0) + '.png"/>')
    $('#queue2').html('<h3>Next:</h3><img src="images/iPad' + messageArr[1].charAt(1) + '.png"/>')
    $('#queue3').html('<h3>Next:</h3><img src="images/iPad' + messageArr[1].charAt(2) + '.png"/>')
  } else if (messageArr[0] === 'inventoryCount') {
    
    clearTimeout(robotIdleTimeout);

    // Update the inventory counts
    for (var i=1;i<=9;i++) {
      $('#inventory' + i).html('<p>' + messageArr[i] + '</p>');
    }


  } else if (messageArr[0] == 'userLevel') {
    userLevel = parseInt(messageArr[1]);


    if (userLevel < 3) {
      // Hide Mining area
      // $('#middle12').addClass('Off');
      $('#middleMessage').removeClass('Off');
    } else {
      // $('#middle12').removeClass('Off');
      $('#middleMessage').addClass('Off');
    }


    if (messageArr[2] == "true") {
      // Announce the successful level increase

      if (userLevel == 2) {
        showSuccessMessage('You have crafted some sticks, unlocking more recipes. Craft a wooden pickaxe to unlock the next level');
      } else if (userLevel == 3) {
        showSuccessMessage('You have crafted a wooden pickaxe, unlocking mining. Mine some cobblestone and craft a stone pickaxe to unlock the next level.');
      } else if (userLevel == 4) {
        showSuccessMessage('You have crafted a stone pickaxe, unlocking iron mining. Craft an iron pickaxe to unlock the next level.');
      } else if (userLevel == 5) {
        showSuccessMessage('You have crafted an iron pickaxe, unlocking iron mining. Craft a diamond pickaxe to unlock the next level.');
      } else if (userLevel == 6) {
        showSuccessMessage('You have crafted a diamond pickaxe, unlocking all materials! All recipes are now available to you.');
      }


    }
  } else if (messageArr[0] == 'robotSequenceDone') {
    robotIdle();
  }
}

function showSuccessMessage (whatMessage, whatTitle) {
  if (whatTitle == null) {
    whatTitle = "Success!";
  }

  $('#craftingMessage').html('');
  $('#craftingMessage').removeClass('animated zoomInUp Off');

  setTimeout(function () {
    $('#craftingMessage').html('<h2>' + whatTitle + '</h3><p>' + whatMessage + '</p>');
    $('#craftingMessage').addClass('animated zoomInUp');
  }, 100)
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

var robotIdleTimeout
function robotIdle() {
  // Called when nothing is executing in the queue
  clearTimeout(robotIdleTimeout);
  robotIdleTimeout = setTimeout(function () {
    // Check if the queue is empty
    if(myQueue.length < 1) {
      // Don't show the queue item 1
      $('#queue1').addClass('Off');

      // Reset to basic inventory
      var inventoryCount = [0, 8, 0, 0, 4, 5, 1, 0, 0, 0];
      for (var i=1;i<=9;i++) {
        $('#inventory' + i).html('<p>' + inventoryCount[i] + '</p>');
      }

      $('#craftingMessage').addClass('Off');
      selectMiningBlock (0);
      $('#middleMessage').html('Complete Level 1+2 to access mining');
      $('#middleMessage').removeClass('Off');

      // Hide the player executing title
      $('#robotPlayerTitle').addClass('Off');

      // Hide the inventory label
      $('#robotInventoryTitle').html('');
    }
  }, 10000)
}
