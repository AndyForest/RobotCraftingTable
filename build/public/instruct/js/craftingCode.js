// URL of the NodeJS server that receives the robot commands
// var robotServerURL = "http://192.168.13.13:8080";

// Inventory levels of each of the crafting materials
// First item is always 0 because the slots are numbered 1 - 9
var inventoryCount

// Instructions to send to the robot
var robotInstructionSequence

/*
{ pickup: 1, drop: 4}
{ message: “Some message to send to LCD”, delay: 2}
*/

// Item ID that the robot is currently holding
var robotHolding

// Items currently on the crafting table. First item is always 0 because the slots are numbered 1 - 9
var craftingTableItems
// If this is changed from 0 to anything else, there has been an error, stop processing the sequence
var sequenceError
// The array of the currenty displayed mining materials on the screen
var miningTargets
var miningTargetsString

var myID;

var refreshAfterSend = false;

// example.com?param1=name&param2=&id=6
// $.urlParam('param1'); // name
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

if (  $.urlParam('myID') != null) {
  myID = $.urlParam('myID');
  window.localStorage['selector'] = JSON.stringify({ identifier: myID })
}

$( document ).ready(function() {
  setSelectableInventory();
  showHelp();
});

function setSelectableInventory() {
  // console.log('regenerating select_slot block');

  if (userLevel == 1) {
    // Basic unlocked
    Blockly.Blocks['select_slot'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Select inventory:")
            .appendField(new Blockly.FieldDropdown([["Planks","1"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"]]), "blockMaterial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('Select an item from your inventory');
        this.setHelpUrl('');
      }
    };
  } else if (userLevel == 2) {
    // Basic unlocked
    Blockly.Blocks['select_slot'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Select inventory:")
            .appendField(new Blockly.FieldDropdown([["Planks","1"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"]]), "blockMaterial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('Select an item from your inventory');
        this.setHelpUrl('');
      }
    };
  } else if (userLevel == 3) {
    // Basic unlocked
    Blockly.Blocks['select_slot'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Select inventory:")
            .appendField(new Blockly.FieldDropdown([["Planks","1"], ["Cobblestone","2"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"]]), "blockMaterial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('Select an item from your inventory');
        this.setHelpUrl('');
      }
    };
  } else if (userLevel == 4) {
    // Basic unlocked
    Blockly.Blocks['select_slot'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Select inventory:")
            .appendField(new Blockly.FieldDropdown([["Planks","1"], ["Cobblestone","2"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"], ["Iron","8"]]), "blockMaterial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('Select an item from your inventory');
        this.setHelpUrl('');
      }
    };
  } else if (userLevel >= 5) {
    // Basic unlocked
    Blockly.Blocks['select_slot'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Select inventory:")
            .appendField(new Blockly.FieldDropdown([["Planks","1"], ["Cobblestone","2"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"], ["Iron","8"], ["Diamond","9"]]), "blockMaterial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('Select an item from your inventory');
        this.setHelpUrl('');
      }
    };
  }
}

function initCraftingSequence(userLevelOverride) {

  if ( userLevelOverride == null) {
    // nothing
  } else {
    userLevel = userLevelOverride;
  }

  // Starting inventory levels
  if (userLevel == 1) {
    // Basic unlocked
    inventoryCount = [0, 8, 0, 0, 4, 5, 1, 0, 0, 0];
  } else if (userLevel == 2) {
    // Sticks unlocked
    inventoryCount = [0, 8, 0, 4, 4, 5, 1, 0, 0, 0];
  } else if (userLevel == 3) {
    // Sticks unlocked
    inventoryCount = [0, 8, 0, 4, 4, 5, 1, 0, 0, 0];
  } else if (userLevel == 4) {
    // Cobblestone unlocked
    inventoryCount = [0, 8, 8, 4, 4, 5, 1, 0, 0, 0];
  } else if (userLevel == 5) {
    // Iron unlocked
    inventoryCount = [0, 8, 8, 4, 4, 5, 1, 0, 8, 0];
  } else if (userLevel == 6) {
    // Everything unlocked
    inventoryCount = [0, 8, 8, 4, 4, 5, 1, 0, 8, 8];
  }

  // starts at 1, not 0
  craftingTableItems = [0,0,0,0,0,0,0,0,0,0];
  robotInstructionSequence = new Array();

  // Add this iPad's ID number to the sequence



  // Send the iPad's ID to the display screen
  sendMyID();

  sendInventoryLevels();

  // Initialize the sequence with some mining materials on screen
  generateMiningTargets();

  // Initialize the user's level
  sendSetUserLevel();

  robotHolding = 0;
  sequenceError = 0;
}

function sendSetUserLevel(annouce) {
  // annouce = true to announce the new level on the display screen

  var messageToSend = "userLevel," + userLevel;
  var timingDelay = 0;

  if ( annouce == true ) {
    messageToSend = messageToSend + ",true";
    timingDelay = 3;
  } else {
    messageToSend = messageToSend + ",false";
  }

  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: timingDelay};

}

function sendMyID() {
  var messageToSend = "myID," + myID;
  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 0};
}

function robotSequenceDone() {
  var messageToSend = "robotSequenceDone," + myID;
  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 0};
}

function generateMiningTargets() {

  // starts at 1, not 0
  miningTargets = [0, 8, 2, 2, 2, 2, 2, 2, 2, 2];

  var diamondPosition = getRandomInt(3,8);
  miningTargets[diamondPosition] = 9;
  miningTargetsString = "miningTargets,";
  for (var i=1; i<=9; i++) {
    miningTargetsString = miningTargetsString + miningTargets[i].toString();
  }

  robotInstructionSequence[robotInstructionSequence.length] = {message: miningTargetsString, delay: 0};
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function checkMiningBlockID(blockNum) {
  var messageToSend = "checkMiningBlock," + blockNum;
  // Hilight the block being checked on the display screen for user feedback

  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 0.5};

  return miningTargets[blockNum];
}


function mineBlockSequence(blockNum) {

  // Update inventory level
  var blockMinedID = miningTargets[blockNum];
  var mineCount = 1;
  if (blockMinedID == 2) {
    // Mine 1 cobblestone to get 8 cobblestone
    mineCount = 8;
  }
  inventoryCount[blockMinedID] = inventoryCount[blockMinedID] +mineCount;
  if (inventoryCount[blockMinedID] > 64 ) {
    inventoryCount[blockMinedID] = 64;
  }
  sendInventoryLevels();

  var messageToSend = "mineBlock," + blockMinedID + "," + blockNum;
  // Hilight the block being checked on the display screen for user feedback
  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 1};


  // Create new mining targets
  generateMiningTargets();
}

function checkInventory(itemCode) {
  return inventoryCount[itemCode];
}

function selectInventorySlotSequence(inventorySlotNum) {
  // Pick up an item from an inventory slot
  if (checkForSequenceError(true) == 0) {
    if (robotHolding != 0) {
      setSequenceError("You tried to make the robot pick up " + itemCodeLookup[inventorySlotNum][0] + " when it was already carrying " + itemCodeLookup[robotHolding][0]);

    } else if (inventoryCount[inventorySlotNum] <= 0){
      setSequenceError("You tried to make the robot pick up " + itemCodeLookup[inventorySlotNum][0] + " but you do not have enough in your inventory. Try mining for more.");

    } else {
      robotHolding = inventorySlotNum;
      inventoryCount[inventorySlotNum] = inventoryCount[inventorySlotNum] -1;

      sendInventoryLevels();

    }
  }
}

function sendInventoryLevels() {
  // Send the current inventory counts
  var messageToSend = "inventoryCount"
  for (var i=1;i<=9;i++) {
    messageToSend = messageToSend + "," + inventoryCount[i]
  }
  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 0};
}

function placeCraftingItemSequence(craftingTableSlotNum) {
  if (checkForSequenceError(true) == 0) {
    if (robotHolding == 0) {
      setSequenceError("You tried to place an item on the crafting table in position " + craftingTableSlotNum + " but the robot is not carrying anything.");

    } else if (craftingTableItems[craftingTableSlotNum] != 0) {
      setSequenceError("You tried to place " + itemCodeLookup[robotHolding][0] + " on the crafting table in position " + craftingTableSlotNum + " but there is already " + itemCodeLookup[craftingTableItems[craftingTableSlotNum]][0] + " in that position.");

    } else {
      craftingTableItems[craftingTableSlotNum] = robotHolding;
      robotInstructionSequence[robotInstructionSequence.length] = {pickup: robotHolding, drop: craftingTableSlotNum};
      robotHolding = 0;

      // Check if we have completed a recipe

      var recipeComplete = false;
      var recipeCompleteID = 0;
      for (var i = 0, len = craftingRecipesArr.length; i < len; i++) {
        // Check the next recipe
        var singleRecipeBlank = true;
        var singleRecipeComplete = true;
        for (var h=1; h<=9; h++) {
          // Check the items in the recipe
          var singleRecipeItem = craftingRecipesArr[i][h.toString()];
          if (singleRecipeItem != 0) {
            singleRecipeBlank = false;
          }

          if (craftingTableItems[h] != singleRecipeItem) {
            // Not a match
            singleRecipeComplete = false;
          }
        }

        if (singleRecipeBlank == false && singleRecipeComplete == true) {
          // Recipe is complete!

          // Search for other completed recipes in the queue and remove them
          // eg: {"message":"recipeComplete,49","delay":3}

          for (var g=0; g<robotInstructionSequence.length; g++) {
            var thisMessage = robotInstructionSequence[g]["message"];
            // console.log("thisMessage " + thisMessage);
            if (typeof thisMessage === "undefined") {
              // Leave it alone
            } else if(thisMessage.indexOf("recipeComplete,") > -1) {
              robotInstructionSequence[g] = {message: "deleted", delay: 0};
            }
          }


          // Notify the display screen about the completed recipe
          recipeCompleteID = craftingRecipesArr[i]["ID"];
          var messageToSend = "recipeComplete," + recipeCompleteID;
          robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 3};

          // Check if completing this recipe unlocks the next user level part
          var newLevel = 0;
          if (recipeCompleteID == 14) {
            // "Stick"
            newLevel = 2;
          } else if (recipeCompleteID == 1) {
            // "Wooden Pickaxe"
            newLevel = 3;
          } else if (recipeCompleteID == 6) {
            // "Stone Pickaxe"
            newLevel = 4;
          } else if (recipeCompleteID == 18) {
            // "Iron Pickaxe"
            newLevel = 5;
          } else if (recipeCompleteID == 24) {
            // "Diamond Pickaxe"
            newLevel = 6;
          }

          if (newLevel > userLevel) {
            // User has acheived a higher level, announce on the display screen
            userLevel = newLevel;
            refreshAfterSend = true;
            sendSetUserLevel(true);
          }

        }
      }


    }
  }
}

function setSequenceError(sequenceErrorMessage, hideAlert) {
  sequenceError = sequenceErrorMessage;
  if (hideAlert != true) alertMessage(sequenceError);
}

function checkForSequenceError(hideAlert) {
  if (sequenceError != 0) {
    if (hideAlert != true) alertMessage(sequenceError);
    return 1;
  } else {
    return 0;
  }
}

function sendRobotInstructionSequence() {
  if (checkForSequenceError() == 0) {
    // Send the sequence to the robot
    // It is contained in the variable: robotInstructionSequence
    // Send to robotServerURL

    // console.log(robotInstructionSequence)
    robotInstructionSequence.unshift(JSON.parse(localStorage['selector']))

    console.log(JSON.stringify(robotInstructionSequence));
    // evt.preventDefault()
    server = window.io();
    //console.log(robotInstructionSequence)

    server.emit('instructCommand',
      robotInstructionSequence
    )

    setTimeout(function(){
      alertMessage('Your instructions have been sent to the robot!');
      if (refreshAfterSend) {
        gotoUserLevel(userLevel);
      }
    }, 2000);

  }
}


function reset() {
  gotoUserLevel(1);
}

function gotoUserLevel(whatlevel) {
  if (whatlevel == null) {
    whatlevel = 1;
  }
  window.location="/instruct/?userLevel=" + whatlevel;
}

// Check if the iPad has been idle and reset if it has
var idleTime = 0;
$(document).ready(function () {
    //check for idle time
    var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });
});

function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > 20) { // reset after 20 minutes
      reset();
    }
}

function alertMessage(alertMessage){
  window.alert(alertMessage);
}

function closeHelp(noAnimation){
  if (noAnimation == true) {
    $('#helpDisplay').addClass('Off');
  } else {
    $('#helpDisplay').removeClass('animated zoomIn');
    setTimeout(function () {
      $('#helpDisplay').addClass('animated zoomOut');
    }, 100)
    setTimeout(function () {
      $('#helpDisplay').addClass('Off');
    }, 500)
  }
}

function showHelp(helpLevel){
  var helpHTML = '';
  if (helpLevel == null) helpLevel = 1;
  $('#helpDisplay').removeClass('helpDisplay3');
  $('#helpDisplay').removeClass('helpDisplay5');

  if (userLevel == 1) {
    if (helpLevel == 1) {
      helpHTML = '<h2 onclick="closeHelp()">There are coding blocks in the “Crafting” section on the left. Use the “Select Inventory” block to select an inventory item. Then use the “Place in crafting table” block to position it for the recipe you want to complete. Craft some sticks to progress to the next level with more recipes available!</h2>';
    } else {
      helpHTML = '<h2 onclick="closeHelp()">Here’s the recipe to progress to the next level:</h2>\n';
      helpHTML = helpHTML + '<p onclick="closeHelp()"><img src="images/userLevel1_challenge.png" width="60%"> <img src="images/Recipe_14_Complete.png"></p>\n'
    }
  } else if (userLevel == 2) {
    // Level 2 help
    if (helpLevel == 1) {
      helpHTML = '<h2 onclick="closeHelp()">Now that you have some sticks, use them to craft a wooden pickaxe to unlock the next level!</h2>';
    } else {
      helpHTML = '<h2 onclick="closeHelp()">Here’s the recipe to progress to the next level:</h2>\n';
      helpHTML = helpHTML + '<p onclick="closeHelp()"><img src="images/userLevel2_challenge.png" width="50%"> <img src="images/Recipe_1_Complete.png"></p>\n'
    }
  } else if (userLevel == 3) {

    $('#helpDisplay').addClass('helpDisplay3');
    //$('#helpDisplay').css( "left", "150" );
    // Level 3 help
    if (helpLevel == 1) {
      helpHTML = '<h2 onclick="closeHelp()">Mine some cobblestone with your new wooden pickaxe. Use the new blocks in the "Basic Mining" section on the left. Cobblestone can always be found in block number 2, and mining one block will give you 8 in your inventory to craft with. Watch the display screen as your code is executed. Use the cobblestone to craft a stone pickaxe and unlock the next level!</h2>';
    } else {
      helpHTML = '<h2 onclick="closeHelp()">Here’s the recipe to progress to the next level:</h2>\n';
      helpHTML = helpHTML + '<p onclick="closeHelp()"><img src="images/userLevel3_challenge.png" width="50%"> <img src="images/Recipe_6_Complete.png"></p>\n'
    }
  } else if (userLevel == 4) {
    // Level 4 help
    $('#helpDisplay').addClass('helpDisplay3');
    if (helpLevel == 1) {
      helpHTML = '<h2 onclick="closeHelp()">Mine some iron with your new stone pickaxe. Iron can sometimes be found in block number 1, but mining one block will only give you 1 in your inventory, so you will need to mine more. Watch the display screen as your code is executed. Use the iron to craft an iron pickaxe and unlock the next level!</h2>';
    } else {
      helpHTML = '<h2 onclick="closeHelp()">Here’s the recipe to progress to the next level:</h2>\n';
      helpHTML = helpHTML + '<p onclick="closeHelp()"><img src="images/userLevel4_challenge.png" width="50%"> <img src="images/Recipe_18_Complete.png"></p>\n'
    }
  } else if (userLevel == 5) {
    // Level 5 help
    $('#helpDisplay').addClass('helpDisplay5');
    if (helpLevel == 1) {
      helpHTML = '<h2 onclick="closeHelp()">Mine some diamond with your new iron pickaxe. Diamond is randomly placed in any mining location, so you will need to use the new blocks to write some code to search for the right block. Craft a diamond pickaxe and unlock the next level!</h2>';
    } else {
      helpHTML = '<h2 onclick="closeHelp()">Here’s the recipe to progress to the next level:</h2>\n';
      helpHTML = helpHTML + '<p onclick="closeHelp()"><img src="images/userLevel5_challenge.png" width="50%"> <img src="images/Recipe_24_Complete.png"></p>\n'
    }
  } else if (userLevel == 6) {
    // Level 6 help
    $('#helpDisplay').addClass('helpDisplay5');
    if (helpLevel == 1) {
      helpHTML = '<h2 onclick="closeHelp()">Congratulations! You have completed the final challenge! All materials are unlocked in your inventory to craft anything you like. SECRET TIP: Press the upper right corner of the screen at any time to jump to level 6 instantly!</h2>';
    } else {
      helpHTML = '<h2 onclick="closeHelp()">Craft anything you like!</h2>';
    }
}

  if (helpLevel == 1) {
    helpHTML = helpHTML + '<button onclick="showHelp(2)">More Help</button>\n';
  } else if (helpLevel == 2) {
    helpHTML = helpHTML + '<button onclick="showHelp(1)">More Help</button>\n';
  } else if (helpLevel == 9000) {
    // Secret menu
    helpHTML = '<h2 onclick="closeHelp()"><ul>\n'
    helpHTML = helpHTML + '<li><button onclick="gotoUserLevel(1)">Level 1</button></li>\n';
    helpHTML = helpHTML + '<li><button onclick="gotoUserLevel(2)">Level 2</button></li>\n';
    helpHTML = helpHTML + '<li><button onclick="gotoUserLevel(3)">Level 3</button></li>\n';
    helpHTML = helpHTML + '<li><button onclick="gotoUserLevel(4)">Level 4</button></li>\n';
    helpHTML = helpHTML + '<li><button onclick="gotoUserLevel(5)">Level 5</button></li>\n';
    helpHTML = helpHTML + '<li><button onclick="gotoUserLevel(6)">Level 6</button></li>\n';
    helpHTML = helpHTML + '</ul></h2>\n'
  }

  helpHTML = helpHTML + '<button onclick="closeHelp()">Close Help</button>\n';

  $('#helpDisplay').addClass('Off');
  $('#helpDisplay').removeClass('animated zoomIn zoomOut');
  $('#helpDisplay').html('');

  setTimeout(function () {
    $('#helpDisplay').html(helpHTML);
    $('#helpDisplay').addClass('animated zoomIn');
    $('#helpDisplay').removeClass('Off');
  }, 100)
}
