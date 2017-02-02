// URL of the NodeJS server that receives the robot commands
var robotServerURL = "http://192.168.12.12";

// Inventory levels of each of the crafting materials
// First item is always 0 because the slots are numbered 1 - 9
var inventoryCount

// Instructions to send to the robot
var robotInstructionSequence

/*
{ pickup: 1, drop: 4}
{ message: “Some message to send to LCD”, delay: 1000}
*/

// Item ID that the robot is currently holding
var robotHolding
// Item ID lookup table
var itemCodeLookup = [["Blank","0"], ["Planks","1"], ["Cobblestone","2"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"], ["Empty", "7"], ["Iron", "8"], ["Diamond","9"]];
// Items currently on the crafting table. First item is always 0 because the slots are numbered 1 - 9
var craftingTableItems
// If this is changed from 0 to anything else, there has been an error, stop processing the sequence
var sequenceError
// The array of the currenty displayed mining materials on the screen
var miningTargets
var miningTargetsString

function initCraftingSequence(userLevel) {
  // Starting inventory levels
  if (userLevel == 2) {
    // Everything unlocked
    inventoryCount = [0,9,9,5,5,5,5,0,9,9];
  } else if (userLevel == 1) {
    // Iron unlocked
    inventoryCount = [0,9,9,5,5,5,5,0,9,0];
  } else {
    // Basic items unlocked
    inventoryCount = [0,9,9,5,5,5,5,0,0,0];
  }

  // starts at 1, not 0
  craftingTableItems = [0,0,0,0,0,0,0,0,0,0];
  robotInstructionSequence = new Array();

  // Add this iPad's ID number to the sequence
  var myID = $.urlParam('myID')
  var messageToSend = "myID," + myID;
  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 0};

  // Initialize the sequence with some mining materials on screen
  generateMiningTargets();

  robotHolding = 0;
  sequenceError = 0;
}

function generateMiningTargets() {

  // starts at 1, not 0
  miningTargets = [0, 8, 0, 0, 0, 0, 0, 0, 0, 0];

  var diamondPosition = getRandomInt(2,9);
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

function checkMiningBlockID(blockNum) {
  var messageToSend = "checkMiningBlock," + blockNum;
  // Hilight the block being checked on the display screen for user feedback

  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 500};

  return miningTargets[blockNum];
}


function mineBlockSequence(blockNum) {
  var messageToSend = "mineBlock," + blockNum;
  // Hilight the block being checked on the display screen for user feedback

  robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 1000};

  // Update inventory level
  inventoryCount[miningTargets[blockNum]] = inventoryCount[miningTargets[blockNum]] +1;

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

    }
  }
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
          var messageToSend = "recipeComplete," + i;
          robotInstructionSequence[robotInstructionSequence.length] = {message: messageToSend, delay: 3000};

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

    console.log(JSON.stringify(robotInstructionSequence));

    // evt.preventDefault()
    server = window.io();
    server.emit('instructCommand',
      robotInstructionSequence
    )
  }
}



function alertMessage(alertMessage){
  window.alert(alertMessage);
}
