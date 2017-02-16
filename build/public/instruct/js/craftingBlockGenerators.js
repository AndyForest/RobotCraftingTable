Blockly.JavaScript['select_slot'] = function(block) {
  var dropdown_blockmaterial = block.getFieldValue('blockMaterial');
  // TODO: Assemble JavaScript into code variable.
  var code = 'selectInventorySlotSequence(' + dropdown_blockmaterial + ');\n';
  return code;
};

Blockly.JavaScript['place_crafting_number'] = function(block) {
  var value_craftingslot = Blockly.JavaScript.valueToCode(block, 'CraftingSlot', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'placeCraftingItemSequence(' + value_craftingslot + ');\n';
  return code;
};

Blockly.JavaScript['check_inventory'] = function(block) {
  var dropdown_blockmaterial = block.getFieldValue('blockMaterial');
  // TODO: Assemble JavaScript into code variable.
  // checkInventory(dropdown_blockmaterial);
  var code = 'checkInventory(' + dropdown_blockmaterial + ')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['mine_block'] = function(block) {
  var value_mineblocknum = Blockly.JavaScript.valueToCode(block, 'mineBlockNum', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'mineBlockSequence(' + value_mineblocknum + ');\n';
  // mineBlockSequence(value_mineblocknum);
  return code;
};

Blockly.JavaScript['blocktypeid'] = function(block) {
  var dropdown_blockmaterial = block.getFieldValue('blockMaterial');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_blockmaterial;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['miningtargetblocktypeid'] = function(block) {
  // Check the block type in a specific mining slot
  var value_mining_block = Blockly.JavaScript.valueToCode(block, 'Mining Block', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'checkMiningBlockID(' + value_mining_block + ')';
  //var code = checkMiningBlockID(value_mining_block);
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['number_1to9'] = function(block) {
  var dropdown_whatnumber = block.getFieldValue('whatNumber');
  // TODO: Assemble JavaScript into code variable.
  var code = ' ' + dropdown_whatnumber + ' ';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
