Blockly.Blocks['place_crafting'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Place in crafting table slot")
        .appendField(new Blockly.FieldDropdown([["1","1"], ["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"], ["8","8"], ["9","9"]]), "CraftingSlot");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(15);
    this.setTooltip('Place the selected block on the crafting table in the specified slot');
    this.setHelpUrl('');
  }
};

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

Blockly.Blocks['select_slot_number'] = {
  init: function() {
    this.appendValueInput("blockMaterial")
        .setCheck("Number")
        .appendField("Select inventory slot number:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Select an item from your inventory');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['place_crafting_number'] = {
  init: function() {
    this.appendValueInput("CraftingSlot")
        .setCheck("Number")
        .appendField("Place in crafting table position number");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(15);
    this.setTooltip('Place the selected block on the crafting table in the specified slot');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['mine_blocks'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Mine blocks");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['check_inventory'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Inventory count of:")
        .appendField(new Blockly.FieldDropdown([["Planks","1"], ["Cobblestone","2"], ["Sticks","3"], ["Sand","4"], ["Gunpowder","5"], ["Redstone","6"], ["Iron","8"], ["Diamond","9"]]), "blockMaterial");
    this.setOutput(true, "Number");
    this.setColour(330);
    this.setTooltip('Check your inventory level of the selected block type');
    this.setHelpUrl('');
  }
};