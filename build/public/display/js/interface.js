(function () {
  'use strict'
  var server
  var init = () => new Promise((resolve, reject) => {
    server = window.io()
    resolve()
  })

  var displayMessage = (data) => {
    parseMessage(data.data.message.toString(), data.data.duration);
    /*
    console.log(data.data.message)
    document.getElementById('demoMessage').innerHTML = data.data.message
    setTimeout(clearScreen, parseInt(data.data.duration) * 1000)
    */
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

function parseMessage(messageData, messageParameter) {
  // Display message for debugging
  console.log(messageData + " " + messageParameter);
  document.getElementById('demoMessage').innerHTML = messageData + " " + messageParameter;

  var messageArr = messageData.split(",")

  if (messageArr[0] == "checkMiningBlock") {
    var blockNum = parseInt(messageParameter);
    console.log("blockNum: " + blockNum);
    selectMiningBlock (messageArr[1]);
  } else if (messageArr[0] == "miningTargets") {

    // Set the mining target blocks displayed on the screen
    // eg: "miningTargets,800900000"
    for (var i=1;i<=9;i++) {
      console.log("miningTargets setting: " + i);
      var miningtargetblocktypeid = messageArr[1].charAt(i-1);
      if (miningtargetblocktypeid == "0") {
        $("#mining" + i).html('');
      } else {
        $("#mining" + i).html('<img src="images/mining' + miningtargetblocktypeid + '.png"/>');
      }
    }
  }

}

function selectMiningBlock (blockNum) {

  for (var i=1;i<=9;i++) {
    if (i==blockNum) {
      $("#mining" + i).addClass("selectedbox");
    } else {
      $("#mining" + i).removeClass("selectedbox");
    }
  }

}
