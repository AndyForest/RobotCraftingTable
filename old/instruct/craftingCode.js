// URL of the NodeJS server that receives the robot commands
var robotServerURL = "http://192.168.12.12";

// Inventory levels of each of the crafting materials
// First item is always 0 because the slots are numbered 1 - 9
var inventoryCount

// Instructions to send to the robot
var robotInstructionSequence

// Item ID that the robot is currently holding
var robotHolding
// Item ID lookup table
var itemCodeLookup = [["Blank","0"], ["Planks","1"], ["Cobblestone","2"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"], ["Empty", "7"], ["Iron", "8"], ["Diamond","9"]];
// Items currently on the crafting table. First item is always 0 because the slots are numbered 1 - 9
var craftingTableItems
// If this is changed from 0 to anything else, there has been an error, stop processing the sequence
var sequenceError

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

  craftingTableItems = [0,0,0,0,0,0,0,0,0];
  robotInstructionSequence = new Array();
  robotHolding = 0;
  sequenceError = 0;
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
    // TODO: Send the sequence to the robot
    // It is contained in the variable: robotInstructionSequence
    // Send to robotServerURL
    
    console.log(JSON.stringify(robotInstructionSequence));

  }
}

function alertMessage(alertMessage){
  window.alert(alertMessage);
}
