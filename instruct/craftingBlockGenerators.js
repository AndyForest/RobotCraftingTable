Blockly.JavaScript['place_crafting'] = function(block) {
  var dropdown_craftingslot = block.getFieldValue('CraftingSlot');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['select_slot'] = function(block) {
  var dropdown_blockmaterial = block.getFieldValue('blockMaterial');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['select_slot_number'] = function(block) {
  var value_blockmaterial = Blockly.JavaScript.valueToCode(block, 'blockMaterial', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['place_crafting_number'] = function(block) {
  var value_craftingslot = Blockly.JavaScript.valueToCode(block, 'CraftingSlot', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['mine_blocks'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['check_inventory'] = function(block) {
  var dropdown_blockmaterial = block.getFieldValue('blockMaterial');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};