/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Contains the controller code for workspace factory. Depends
 * on the model and view objects (created as internal variables) and interacts
 * with previewWorkspace and toolboxWorkspace (internal references stored to
 * both). Also depends on standard_categories.js for standard Blockly
 * categories. Provides the functionality for the actions the user can initiate:
 * - adding and removing categories
 * - switching between categories
 * - printing and downloading configuration xml
 * - updating the preview workspace
 * - changing a category name
 * - moving the position of a category.
 *
 * @author Emma Dauterman (evd2014)
 */

 goog.require('FactoryUtils');
 goog.require('StandardCategories');

/**
 * Class for a WorkspaceFactoryController
 * @constructor
 *
 * @param {!string} toolboxName Name of workspace toolbox XML.
 * @param {!string} toolboxDiv Name of div to inject toolbox workspace in.
 * @param {!string} previewDiv Name of div to inject preview workspace in.
 */
WorkspaceFactoryController = function(toolboxName, toolboxDiv, previewDiv) {
  // Toolbox XML element for the editing workspace.
  this.toolbox = document.getElementById(toolboxName);

  // Workspace for user to drag blocks in for a certain category.
  this.toolboxWorkspace = Blockly.inject(toolboxDiv,
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
       media: '../../media/',
       toolbox: this.toolbox
     });

  // Workspace for user to preview their changes.
  this.previewWorkspace = Blockly.inject(previewDiv,
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
     media: '../../media/',
     toolbox: '<xml></xml>',
     zoom:
       {controls: true,
        wheel: true}
    });

  // Model to keep track of categories and blocks.
  this.model = new WorkspaceFactoryModel();
  // Updates the category tabs.
  this.view = new WorkspaceFactoryView();
  // Generates XML for categories.
  this.generator = new WorkspaceFactoryGenerator(this.model);
  // Tracks which editing mode the user is in. Toolbox mode on start.
  this.selectedMode = WorkspaceFactoryController.MODE_TOOLBOX;
  // True if key events are enabled, false otherwise.
  this.keyEventsEnabled = true;
};

// Toolbox editing mode. Changes the user makes to the workspace updates the
// toolbox.
WorkspaceFactoryController.MODE_TOOLBOX = 'toolbox';
// Pre-loaded workspace editing mode. Changes the user makes to the workspace
// udpates the pre-loaded blocks.
WorkspaceFactoryController.MODE_PRELOAD = 'preload';

/**
 * Currently prompts the user for a name, checking that it's valid (not used
 * before), and then creates a tab and switches to it.
 */
WorkspaceFactoryController.prototype.addCategory = function() {
  this.allowToTransferFlyoutBlocksToCategory();
  // Check if it's the first category added.
  var isFirstCategory = !this.model.hasElements();
  // Give the option to save blocks if their workspace is not empty and they
  // are creating their first category.
  if (isFirstCategory && this.toolboxWorkspace.getAllBlocks().length > 0) {
    var confirmCreate = confirm('Do you want to save your work in another '
        + 'category? If you don\'t, the blocks in your workspace will be ' +
        'deleted.');

    // Create a new category for current blocks.
    if (confirmCreate) {
      var name = prompt('Enter the name of the category for your ' +
          'current blocks: ');
      if (!name) {  // Exit if cancelled.
        return;
      }

      // Create the new category.
      this.createCategory(name, true);
      // Set the new category as selected.
      var id = this.model.getCategoryIdByName(name);
      this.model.setSelectedById(id);
      this.view.setCategoryTabSelection(id, true);
      // Set default options if switching from single flyout to categories.
      this.view.setCategoryOptions(this.model.hasElements());
      this.generateNewOptions();
      // Update preview here in case exit early.
      this.updatePreview();
    }
  }

  // After possibly creating a category, check again if it's the first category.
  var isFirstCategory = !this.model.hasElements();
  // Get name from user.
  name = this.promptForNewCategoryName('Enter the name of your new category: ');
  if (!name) {  //Exit if cancelled.
    return;
  }
  // Create category.
  this.createCategory(name);
  // Switch to category.
  this.switchElement(this.model.getCategoryIdByName(name));

   // Sets the default options for injecting the workspace
  // when there are categories if adding the first category.
  if (isFirstCategory) {
    this.view.setCategoryOptions(this.model.hasElements());
    this.generateNewOptions();
  }
  // Update preview.
  this.updatePreview();
};

/**
 * Helper method for addCategory. Adds a category to the view given a name, ID,
 * and a boolean for if it's the first category created. Assumes the category
 * has already been created in the model. Does not switch to category.
 *
 * @param {!string} name Name of category being added.
 * @param {!string} id The ID of the category being added.
 */
WorkspaceFactoryController.prototype.createCategory = function(name) {
  // Create empty category
  var category = new ListElement(ListElement.TYPE_CATEGORY, name);
  this.model.addElementToList(category);
  // Create new category.
  var tab = this.view.addCategoryRow(name, category.id);
  this.addClickToSwitch(tab, category.id);
};

/**
 * Given a tab and a ID to be associated to that tab, adds a listener to
 * that tab so that when the user clicks on the tab, it switches to the
 * element associated with that ID.
 *
 * @param {!Element} tab The DOM element to add the listener to.
 * @param {!string} id The ID of the element to switch to when tab is clicked.
 */
WorkspaceFactoryController.prototype.addClickToSwitch = function(tab, id) {
  var self = this;
  var clickFunction = function(id) {  // Keep this in scope for switchElement
    return function() {
      self.switchElement(id);
    };
  };
  this.view.bindClick(tab, clickFunction(id));
};

/**
 * Allows the user to transfer blocks in their flyout to a new category if
 * the user is creating their first category and their workspace is not
 * empty. Should be called whenever it is possible to switch from single flyout
 * to categories (not including importing).
 */
WorkspaceFactoryController.prototype.allowToTransferFlyoutBlocksToCategory =
    function() {
  // Give the option to save blocks if their workspace is not empty and they
  // are creating their first category.
  if (!this.model.hasElements() &&
        this.toolboxWorkspace.getAllBlocks().length > 0) {
    var confirmCreate = confirm('Do you want to save your work in another '
        + 'category? If you don\'t, the blocks in your workspace will be ' +
        'deleted.');

    // Create a new category for current blocks.
    if (confirmCreate) {
      var name = prompt('Enter the name of the category for your ' +
          'current blocks: ');
      if (!name) {  // Exit if cancelled.
        return;
      }

      // Create the new category.
      this.createCategory(name, true);
      // Set the new category as selected.
      var id = this.model.getCategoryIdByName(name);
      this.model.setSelectedById(id);
      this.view.setCategoryTabSelection(id, true);
      // Allow user to use the default options for injecting with categories.
      this.allowToSetDefaultOptions();
      // Update preview here in case exit early.
      this.updatePreview();
    }
  }
};

/**
 * Attached to "-" button. Checks if the user wants to delete
 * the current element.  Removes the element and switches to another element.
 * When the last element is removed, it switches to a single flyout mode.
 *
 */
WorkspaceFactoryController.prototype.removeElement = function() {
  // Check that there is a currently selected category to remove.
  if (!this.model.getSelected()) {
    return;
  }

  // Check if user wants to remove current category.
  var check = confirm('Are you sure you want to delete the currently selected '
        + this.model.getSelected().type + '?');
  if (!check) { // If cancelled, exit.
    return;
  }

  var selectedId = this.model.getSelectedId();
  var selectedIndex = this.model.getIndexByElementId(selectedId);
  // Delete element visually.
  this.view.deleteElementRow(selectedId, selectedIndex);
  // Delete element in model.
  this.model.deleteElementFromList(selectedIndex);

  // Find next logical element to switch to.
  var next = this.model.getElementByIndex(selectedIndex);
  if (!next && this.model.hasElements()) {
    next = this.model.getElementByIndex(selectedIndex - 1);
  }
  var nextId = next ? next.id : null;

  // Open next element.
  this.clearAndLoadElement(nextId);

  // If no element to switch to, display message, clear the workspace, and
  // set a default selected element not in toolbox list in the model.
  if (!nextId) {
    alert('You currently have no categories or separators. All your blocks' +
        ' will be displayed in a single flyout.');
    this.toolboxWorkspace.clear();
    this.toolboxWorkspace.clearUndo();
    this.model.createDefaultSelectedIfEmpty();
  }
  // Update preview.
  this.updatePreview();
};

/**
 * Gets a valid name for a new category from the user.
 *
 * @param {!string} promptString Prompt for the user to enter a name.
 * @return {string} Valid name for a new category, or null if cancelled.
 */
WorkspaceFactoryController.prototype.promptForNewCategoryName =
    function(promptString) {
  do {
    var name = prompt(promptString);
    if (!name) {  // If cancelled.
      return null;
    }
  } while (this.model.hasCategoryByName(name));
  return name;
}

/**
 * Switches to a new tab for the element given by ID. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new element.
 *
 * @param {!string} id ID of tab to be opened, must be valid element ID.
 */
WorkspaceFactoryController.prototype.switchElement = function(id) {
  // Disables events while switching so that Blockly delete and create events
  // don't update the preview repeatedly.
  Blockly.Events.disable();
  // Caches information to reload or generate xml if switching to/from element.
  // Only saves if a category is selected.
  if (this.model.getSelectedId() != null && id != null) {
    this.model.getSelected().saveFromWorkspace(this.toolboxWorkspace);
  }
  // Load element.
  this.clearAndLoadElement(id);
  // Enable Blockly events again.
  Blockly.Events.enable();
};

/**
 * Switches to a new tab for the element by ID. Helper for switchElement.
 * Updates selected, clears the workspace and clears undo, loads a new element.
 *
 * @param {!string} id ID of category to load
 */
WorkspaceFactoryController.prototype.clearAndLoadElement = function(id) {
  // Unselect current tab if switching to and from an element.
  if (this.model.getSelectedId() != null && id != null) {
    this.view.setCategoryTabSelection(this.model.getSelectedId(), false);
  }

  // If switching to another category, set category selection in the model and
  // view.
  if (id != null) {
    // Set next category.
    this.model.setSelectedById(id);

    // Clears workspace and loads next category.
    this.clearAndLoadXml_(this.model.getSelectedXml());

    // Selects the next tab.
    this.view.setCategoryTabSelection(id, true);

    // Order blocks as shown in flyout.
    this.toolboxWorkspace.cleanUp();

    // Update category editing buttons.
    this.view.updateState(this.model.getIndexByElementId
        (this.model.getSelectedId()), this.model.getSelected());
  } else {
    // Update category editing buttons for no categories.
    this.view.updateState(-1, null);
  }
};

/**
 * Tied to "Export" button. Gets a file name from the user and downloads
 * the corresponding configuration xml to that file.
 *
 * @param {!string} exportMode The type of file to export
 *    (WorkspaceFactoryController.MODE_TOOLBOX for the toolbox configuration,
 *    and WorkspaceFactoryController.MODE_PRELOAD for the pre-loaded workspace
 *    configuration)
 */
WorkspaceFactoryController.prototype.exportXmlFile = function(exportMode) {
  // Generate XML.
  if (exportMode == WorkspaceFactoryController.MODE_TOOLBOX) {
    // Export the toolbox XML.

    var configXml = Blockly.Xml.domToPrettyText
        (this.generator.generateToolboxXml());
  } else if (exportMode == WorkspaceFactoryController.MODE_PRELOAD) {
    // Export the pre-loaded block XML.

    var configXml = Blockly.Xml.domToPrettyText
        (this.generator.generateWorkspaceXml());
  } else {
    // Unknown mode. Throw error.
    throw new Error ("Unknown export mode: " + exportMode);
  }

  // Get file name.
  var fileName = prompt('File Name for ' + (exportMode ==
      WorkspaceFactoryController.MODE_TOOLBOX ? 'toolbox XML: ' :
      'pre-loaded workspace XML: '));
  if (!fileName) { // If cancelled
    return;
  }
  // Download file.
  var data = new Blob([configXml], {type: 'text/xml'});
  this.view.createAndDownloadFile(fileName, data);
 };

/**
 * Export the options object to be used for the Blockly inject call. Gets a
 * file name from the user and downloads the options object to that file.
 */
WorkspaceFactoryController.prototype.exportOptionsFile = function() {
  var fileName = prompt('File Name for options object for injecting: ');
  if (!fileName) {  // If cancelled.
    return;
  }
  // Generate new options to remove toolbox XML from options object (if
  // necessary).
  this.generateNewOptions();
  var printableOptions = this.generator.generateOptionsString()
  var data = new Blob([printableOptions], {type: 'text/javascript'});
  this.view.createAndDownloadFile(fileName, data);
};

/**
 * Tied to "Print" button. Mainly used for debugging purposes. Prints
 * the configuration XML to the console.
 */
WorkspaceFactoryController.prototype.printConfig = function() {
  // Capture any changes made by user before generating XML.
  this.saveStateFromWorkspace();
  // Print XML.
  window.console.log(Blockly.Xml.domToPrettyText
      (this.generator.generateToolboxXml()));
};

/**
 * Updates the preview workspace based on the toolbox workspace. If switching
 * from no categories to categories or categories to no categories, reinjects
 * Blockly with reinjectPreview, otherwise just updates without reinjecting.
 * Called whenever a list element is created, removed, or modified and when
 * Blockly move and delete events are fired. Do not call on create events
 * or disabling will cause the user to "drop" their current blocks. Make sure
 * that no changes have been made to the workspace since updating the model
 * (if this might be the case, call saveStateFromWorkspace).
 */
WorkspaceFactoryController.prototype.updatePreview = function() {
  // Disable events to stop updatePreview from recursively calling itself
  // through event handlers.
  Blockly.Events.disable();

  // Only update the toolbox if not in read only mode.
  if (!this.model.options['readOnly']) {
    // Get toolbox XML.
    var tree = Blockly.Options.parseToolboxTree
        (this.generator.generateToolboxXml());

    // No categories, creates a simple flyout.
    if (tree.getElementsByTagName('category').length == 0) {
      // No categories, creates a simple flyout.
      if (this.previewWorkspace.toolbox_) {
        this.reinjectPreview(tree); // Switch to simple flyout, expensive.
      } else {
        this.previewWorkspace.updateToolbox(tree);
      }
    } else {
      // Uses categories, creates a toolbox.
      if (!this.previewWorkspace.toolbox_) {
        this.reinjectPreview(tree); // Create a toolbox, expensive.
      } else {
        // Close the toolbox before updating it so that the user has to reopen
        // the flyout and see their updated toolbox (open flyout doesn't update)
        this.previewWorkspace.toolbox_.clearSelection();
        this.previewWorkspace.updateToolbox(tree);
      }
    }
  }

  // Update pre-loaded blocks in the preview workspace.
  this.previewWorkspace.clear();
  Blockly.Xml.domToWorkspace(this.generator.generateWorkspaceXml(),
      this.previewWorkspace);

  // Reenable events.
  Blockly.Events.enable();
};

/**
 * Saves the state from the workspace depending on the current mode. Should
 * be called after making changes to the workspace.
 */
WorkspaceFactoryController.prototype.saveStateFromWorkspace = function() {
  if (this.selectedMode == WorkspaceFactoryController.MODE_TOOLBOX) {
    // If currently editing the toolbox.
    this.model.getSelected().saveFromWorkspace(this.toolboxWorkspace);
  } else if (this.selectedMode == WorkspaceFactoryController.MODE_PRELOAD) {
    // If currently editing the pre-loaded workspace.
    this.model.savePreloadXml
        (Blockly.Xml.workspaceToDom(this.toolboxWorkspace));
  }
};

/**
 * Used to completely reinject the preview workspace. This should be used only
 * when switching from simple flyout to categories, or categories to simple
 * flyout. More expensive than simply updating the flyout or toolbox.
 *
 * @param {!Element} tree of xml elements
 * @package
 */
WorkspaceFactoryController.prototype.reinjectPreview = function(tree) {
  this.previewWorkspace.dispose();
  var injectOptions = this.readOptions_();
  injectOptions['toolbox'] = Blockly.Xml.domToPrettyText(tree);
  this.previewWorkspace = Blockly.inject('preview_blocks', injectOptions);
  Blockly.Xml.domToWorkspace(this.generator.generateWorkspaceXml(),
      this.previewWorkspace);
};

/**
 * Tied to "change name" button. Changes the name of the selected category.
 * Continues prompting the user until they input a category name that is not
 * currently in use, exits if user presses cancel.
 */
WorkspaceFactoryController.prototype.changeCategoryName = function() {
  // Return if a category is not selected.
  if (this.model.getSelected().type != ListElement.TYPE_CATEGORY) {
    return;
  }
  // Get new name from user.
  var newName = this.promptForNewCategoryName('What do you want to change this'
    + ' category\'s name to?');
  if (!newName) { // If cancelled.
    return;
  }
  // Change category name.
  this.model.getSelected().changeName(newName);
  this.view.updateCategoryName(newName, this.model.getSelectedId());
  // Update preview.
  this.updatePreview();
};

/**
 * Tied to arrow up and arrow down buttons. Swaps with the element above or
 * below the currently selected element (offset categories away from the
 * current element). Updates state to enable the correct element editing
 * buttons.
 *
 * @param {int} offset The index offset from the currently selected element
 * to swap with. Positive if the element to be swapped with is below, negative
 * if the element to be swapped with is above.
 */
WorkspaceFactoryController.prototype.moveElement = function(offset) {
  var curr = this.model.getSelected();
  if (!curr) {  // Return if no selected element.
    return;
  }
  var currIndex = this.model.getIndexByElementId(curr.id);
  var swapIndex = this.model.getIndexByElementId(curr.id) + offset;
  var swap = this.model.getElementByIndex(swapIndex);
  if (!swap) {  // Return if cannot swap in that direction.
    return;
  }
  // Move currently selected element to index of other element.
  // Indexes must be valid because confirmed that curr and swap exist.
  this.moveElementToIndex(curr, swapIndex, currIndex);
  // Update element editing buttons.
  this.view.updateState(swapIndex, this.model.getSelected());
  // Update preview.
  this.updatePreview();
};

/**
 * Moves a element to a specified index and updates the model and view
 * accordingly. Helper functions throw an error if indexes are out of bounds.
 *
 * @param {!Element} element The element to move.
 * @param {int} newIndex The index to insert the element at.
 * @param {int} oldIndex The index the element is currently at.
 */
WorkspaceFactoryController.prototype.moveElementToIndex = function(element,
    newIndex, oldIndex) {
  this.model.moveElementToIndex(element, newIndex, oldIndex);
  this.view.moveTabToIndex(element.id, newIndex, oldIndex);
};

/**
 * Changes the color of the selected category. Return if selected element is
 * a separator.
 *
 * @param {!string} color The color to change the selected category. Must be
 * a valid CSS string.
 */
WorkspaceFactoryController.prototype.changeSelectedCategoryColor =
    function(color) {
  // Return if category is not selected.
  if (this.model.getSelected().type != ListElement.TYPE_CATEGORY) {
    return;
  }
  // Change color of selected category.
  this.model.getSelected().changeColor(color);
  this.view.setBorderColor(this.model.getSelectedId(), color);
  this.updatePreview();
};

/**
 * Tied to the "Standard Category" dropdown option, this function prompts
 * the user for a name of a standard Blockly category (case insensitive) and
 * loads it as a new category and switches to it. Leverages StandardCategories.
 */
WorkspaceFactoryController.prototype.loadCategory = function() {
  // Prompt user for the name of the standard category to load.
  do {
    var name = prompt('Enter the name of the category you would like to import '
        + '(Logic, Loops, Math, Text, Lists, Colour, Variables, or Functions)');
    if (!name) {
      return;   // Exit if cancelled.
    }
  } while (!this.isStandardCategoryName(name));

  // Load category.
  this.loadCategoryByName(name);
};

/**
 * Loads a Standard Category by name and switches to it. Leverages
 * StandardCategories. Returns if cannot load standard category.
 *
 * @param {string} name Name of the standard category to load.
 */
WorkspaceFactoryController.prototype.loadCategoryByName = function(name) {
  // Check if the user can load that standard category.
  if (!this.isStandardCategoryName(name)) {
    return;
  }
  if (this.model.hasVariables() && name.toLowerCase() == 'variables') {
    alert('A Variables category already exists. You cannot create multiple' +
        ' variables categories.');
    return;
  }
  if (this.model.hasProcedures() && name.toLowerCase() == 'functions') {
    alert('A Functions category already exists. You cannot create multiple' +
        ' functions categories.');
    return;
  }
  // Check if the user can create a category with that name.
  var standardCategory = StandardCategories.categoryMap[name.toLowerCase()]
  if (this.model.hasCategoryByName(standardCategory.name)) {
    alert('You already have a category with the name ' + standardCategory.name
        + '. Rename your category and try again.');
    return;
  }
  // Allow user to transfer current flyout blocks to a category.
  this.allowToTransferFlyoutBlocksToCategory();

  var isFirstCategory = !this.model.hasElements();
  // Copy the standard category in the model.
  var copy = standardCategory.copy();

  // Add it to the model.
  this.model.addElementToList(copy);

  // Update the copy in the view.
  var tab = this.view.addCategoryRow(copy.name, copy.id);
  this.addClickToSwitch(tab, copy.id);
  // Color the category tab in the view.
  if (copy.color) {
    this.view.setBorderColor(copy.id, copy.color);
  }
  // Switch to loaded category.
  this.switchElement(copy.id);
  // Convert actual shadow blocks to user-generated shadow blocks.
  this.convertShadowBlocks();
  // Save state from workspace before updating preview.
  this.saveStateFromWorkspace();
  if (isFirstCategory) {
    // Allow the user to use the default options for injecting the workspace
    // when there are categories.
    this.view.setCategoryOptions(this.model.hasElements());
    this.generateNewOptions();
  }
  // Update preview.
  this.updatePreview();
};

/**
 * Given the name of a category, determines if it's the name of a standard
 * category (case insensitive).
 *
 * @param {string} name The name of the category that should be checked if it's
 * in StandardCategories categoryMap
 * @return {boolean} True if name is a standard category name, false otherwise.
 */
WorkspaceFactoryController.prototype.isStandardCategoryName = function(name) {
  for (var category in StandardCategories.categoryMap) {
    if (name.toLowerCase() == category) {
      return true;
    }
  }
  return false;
};

/**
 * Connected to the "add separator" dropdown option. If categories already
 * exist, adds a separator to the model and view. Does not switch to select
 * the separator, and updates the preview.
 */
WorkspaceFactoryController.prototype.addSeparator = function() {
  // If adding the first element in the toolbox, allow the user to transfer
  // their flyout blocks to a category.
  this.allowToTransferFlyoutBlocksToCategory();
  // Create the separator in the model.
  var separator = new ListElement(ListElement.TYPE_SEPARATOR);
  this.model.addElementToList(separator);
  // Create the separator in the view.
  var tab = this.view.addSeparatorTab(separator.id);
  this.addClickToSwitch(tab, separator.id);
  // Switch to the separator and update the preview.
  this.switchElement(separator.id);
  this.updatePreview();
};

/**
 * Connected to the import button. Given the file path inputted by the user
 * from file input, if the import mode is for the toolbox, this function loads
 * that toolbox XML to the workspace, creating category and separator tabs as
 * necessary. If the import mode is for pre-loaded blocks in the workspace,
 * this function loads that XML to the workspace to be edited further. This
 * function switches mode to whatever the import mode is. Catches errors from
 * file reading and prints an error message alerting the user.
 *
 * @param {string} file The path for the file to be imported into the workspace.
 * Should contain valid toolbox XML.
 * @param {!string} importMode The mode corresponding to the type of file the
 *    user is importing (WorkspaceFactoryController.MODE_TOOLBOX or
 *    WorkspaceFactoryController.MODE_PRELOAD).
 */
WorkspaceFactoryController.prototype.importFile = function(file, importMode) {
  // Exit if cancelled.
  if (!file) {
    return;
  }

  Blockly.Events.disable();
  var controller = this;
  var reader = new FileReader();

  // To be executed when the reader has read the file.
  reader.onload = function() {
    // Try to parse XML from file and load it into toolbox editing area.
    // Print error message if fail.
    try {
      var tree = Blockly.Xml.textToDom(reader.result);
      if (importMode == WorkspaceFactoryController.MODE_TOOLBOX) {
        // Switch mode and import toolbox XML.
        controller.setMode(WorkspaceFactoryController.MODE_TOOLBOX);
        controller.importToolboxFromTree_(tree);
      } else if (importMode == WorkspaceFactoryController.MODE_PRELOAD) {
        // Switch mode and import pre-loaded workspace XML.
        controller.setMode(WorkspaceFactoryController.MODE_PRELOAD);
        controller.importPreloadFromTree_(tree);
      } else {
        // Throw error if invalid mode.
        throw new Error("Unknown import mode: " + importMode);
      }
      } catch(e) {
        alert('Cannot load XML from file.');
        console.log(e);
     } finally {
      Blockly.Events.enable();
     }
  }

  // Read the file asynchronously.
  reader.readAsText(file);
};

/**
 * Given a XML DOM tree, loads it into the toolbox editing area so that the
 * user can continue editing their work. Assumes that tree is in valid toolbox
 * XML format. Assumes that the mode is MODE_TOOLBOX.
 * @private
 *
 * @param {!Element} tree XML tree to be loaded to toolbox editing area.
 */
WorkspaceFactoryController.prototype.importToolboxFromTree_ = function(tree) {
  // Clear current editing area.
  this.model.clearToolboxList();
  this.view.clearToolboxTabs();

  if (tree.getElementsByTagName('category').length == 0) {
    // No categories present.
    // Load all the blocks into a single category evenly spaced.
    Blockly.Xml.domToWorkspace(tree, this.toolboxWorkspace);
    this.toolboxWorkspace.cleanUp();

    // Convert actual shadow blocks to user-generated shadow blocks.
    this.convertShadowBlocks();

    // Add message to denote empty category.
    this.view.addEmptyCategoryMessage();

  } else {
    // Categories/separators present.
    for (var i = 0, item; item = tree.children[i]; i++) {

      if (item.tagName == 'category') {
        // If the element is a category, create a new category and switch to it.
        this.createCategory(item.getAttribute('name'), false);
        var category = this.model.getElementByIndex(i);
        this.switchElement(category.id);

        // Load all blocks in that category to the workspace to be evenly
        // spaced and saved to that category.
        for (var j = 0, blockXml; blockXml = item.children[j]; j++) {
          Blockly.Xml.domToBlock(blockXml, this.toolboxWorkspace);
        }

        // Evenly space the blocks.
        this.toolboxWorkspace.cleanUp();

        // Convert actual shadow blocks to user-generated shadow blocks.
        this.convertShadowBlocks();

        // Set category color.
        if (item.getAttribute('colour')) {
          category.changeColor(item.getAttribute('colour'));
          this.view.setBorderColor(category.id, category.color);
        }
        // Set any custom tags.
        if (item.getAttribute('custom')) {
          this.model.addCustomTag(category, item.getAttribute('custom'));
        }
      } else {
        // If the element is a separator, add the separator and switch to it.
        this.addSeparator();
        this.switchElement(this.model.getElementByIndex(i).id);
      }
    }
  }
  this.view.updateState(this.model.getIndexByElementId
      (this.model.getSelectedId()), this.model.getSelected());

  this.saveStateFromWorkspace();

  // Set default configuration options for a single flyout or multiple
  // categories.
  this.view.setCategoryOptions(this.model.hasElements());
  this.generateNewOptions();

  this.updatePreview();
};

/**
 * Given a XML DOM tree, loads it into the pre-loaded workspace editing area.
 * Assumes that tree is in valid XML format and that the selected mode is
 * MODE_PRELOAD.
 *
 * @param {!Element} tree XML tree to be loaded to pre-loaded block editing
 *    area.
 */
WorkspaceFactoryController.prototype.importPreloadFromTree_ = function(tree) {
  this.clearAndLoadXml_(tree);
  this.model.savePreloadXml(tree);
  this.updatePreview();
}

/**
 * Given a XML DOM tree, loads it into the pre-loaded workspace editing area.
 * Assumes that tree is in valid XML format and that the selected mode is
 * MODE_PRELOAD.
 *
 * @param {!Element} tree XML tree to be loaded to pre-loaded block editing
 *    area.
 */
WorkspaceFactoryController.prototype.importPreloadFromTree_ = function(tree) {
  this.clearAndLoadXml_(tree);
  this.model.savePreloadXml(tree);
  this.saveStateFromWorkspace();
  this.updatePreview();
}

/**
 * Given a XML DOM tree, loads it into the pre-loaded workspace editing area.
 * Assumes that tree is in valid XML format and that the selected mode is
 * MODE_PRELOAD.
 *
 * @param {!Element} tree XML tree to be loaded to pre-loaded block editing
 *    area.
 */
WorkspaceFactoryController.prototype.importPreloadFromTree_ = function(tree) {
  this.clearAndLoadXml_(tree);
  this.model.savePreloadXml(tree);
  this.saveStateFromWorkspace();
  this.updatePreview();
}

/**
 * Clears the editing area completely, deleting all categories and all
 * blocks in the model and view and all pre-loaded blocks. Tied to the
 * "Clear" button.
 */
WorkspaceFactoryController.prototype.clearAll = function() {
  var hasCategories = this.model.hasElements();
  this.model.clearToolboxList();
  this.view.clearToolboxTabs();
  this.model.savePreloadXml(Blockly.Xml.textToDom('<xml></xml>'));
  this.view.addEmptyCategoryMessage();
  this.view.updateState(-1, null);
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  this.saveStateFromWorkspace();
  this.view.setCategoryOptions(this.model.hasElements());
  this.generateNewOptions();
  this.updatePreview();
};

/*
 * Makes the currently selected block a user-generated shadow block. These
 * blocks are not made into real shadow blocks, but recorded in the model
 * and visually marked as shadow blocks, allowing the user to move and edit
 * them (which would be impossible with actual shadow blocks). Updates the
 * preview when done.
 *
 */
WorkspaceFactoryController.prototype.addShadow = function() {
  // No block selected to make a shadow block.
  if (!Blockly.selected) {
    return;
  }
  // Clear any previous warnings on the block (would only have warnings on
  // a non-shadow block if it was nested inside another shadow block).
  Blockly.selected.setWarningText(null);
  // Set selected block and all children as shadow blocks.
  this.addShadowForBlockAndChildren_(Blockly.selected);

  // Save and update the preview.
  this.saveStateFromWorkspace();
  this.updatePreview();
};

/**
 * Sets a block and all of its children to be user-generated shadow blocks,
 * both in the model and view.
 * @private
 *
 * @param {!Blockly.Block} block The block to be converted to a user-generated
 *    shadow block.
 */
WorkspaceFactoryController.prototype.addShadowForBlockAndChildren_ =
    function(block) {
  // Convert to shadow block.
  this.view.markShadowBlock(block);
  this.model.addShadowBlock(block.id);

  if (FactoryUtils.hasVariableField(block)) {
    block.setWarningText('Cannot make variable blocks shadow blocks.');
  }

  // Convert all children to shadow blocks recursively.
  var children = block.getChildren();
  for (var i = 0; i < children.length; i++) {
    this.addShadowForBlockAndChildren_(children[i]);
  }
};

/**
 * If the currently selected block is a user-generated shadow block, this
 * function makes it a normal block again, removing it from the list of
 * shadow blocks and loading the workspace again. Updates the preview again.
 *
 */
WorkspaceFactoryController.prototype.removeShadow = function() {
  // No block selected to modify.
  if (!Blockly.selected) {
    return;
  }
  this.model.removeShadowBlock(Blockly.selected.id);
  this.view.unmarkShadowBlock(Blockly.selected);

  // If turning invalid shadow block back to normal block, remove warning.
  Blockly.selected.setWarningText(null);

  this.saveStateFromWorkspace();
  this.updatePreview();
};

/**
 * Given a unique block ID, uses the model to determine if a block is a
 * user-generated shadow block.
 *
 * @param {!string} blockId The unique ID of the block to examine.
 * @return {boolean} True if the block is a user-generated shadow block, false
 *    otherwise.
 */
WorkspaceFactoryController.prototype.isUserGenShadowBlock = function(blockId) {
  return this.model.isShadowBlock(blockId);
}

/**
 * Call when importing XML containing real shadow blocks. This function turns
 * all real shadow blocks loaded in the workspace into user-generated shadow
 * blocks, meaning they are marked as shadow blocks by the model and appear as
 * shadow blocks in the view but are still editable and movable.
 */
WorkspaceFactoryController.prototype.convertShadowBlocks = function() {
  var blocks = this.toolboxWorkspace.getAllBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.isShadow()) {
      block.setShadow(false);
      // Delete the shadow DOM attached to the block so that the shadow block
      // does not respawn. Dependent on implementation details.
      var parentConnection = block.outputConnection ?
          block.outputConnection.targetConnection :
          block.previousConnection.targetConnection;
      if (parentConnection) {
        parentConnection.setShadowDom(null);
      }
      this.model.addShadowBlock(block.id);
      this.view.markShadowBlock(block);
    }
  }
};

/**
 * Sets the currently selected mode that determines what the toolbox workspace
 * is being used to edit. Updates the view and then saves and loads XML
 * to and from the toolbox and updates the help text.
 *
 * @param {!string} tab The type of tab being switched to
 *    (WorkspaceFactoryController.MODE_TOOLBOX or
 *    WorkspaceFactoryController.MODE_PRELOAD).
 */
WorkspaceFactoryController.prototype.setMode = function(mode) {
  // No work to change mode that's currently set.
  if (this.selectedMode == mode) {
    return;
  }

  // No work to change mode that's currently set.
  if (this.selectedMode == mode) {
    return;
  }

  // Set tab selection and display appropriate tab.
  this.view.setModeSelection(mode);

  // Update selected tab.
  this.selectedMode = mode;

  // Update help text above workspace.
  this.view.updateHelpText(mode);

  if (mode == WorkspaceFactoryController.MODE_TOOLBOX) {
    // Open the toolbox editing space.
    this.model.savePreloadXml
        (Blockly.Xml.workspaceToDom(this.toolboxWorkspace));
    this.clearAndLoadXml_(this.model.getSelectedXml());
    this.view.disableWorkspace(this.view.shouldDisableWorkspace
        (this.model.getSelected()));
  } else {
    // Open the pre-loaded workspace editing space.
    if (this.model.getSelected()) {
      this.model.getSelected().saveFromWorkspace(this.toolboxWorkspace);
    }
    this.clearAndLoadXml_(this.model.getPreloadXml());
    this.view.disableWorkspace(false);
  }
};

/**
 * Clears the toolbox workspace and loads XML to it, marking shadow blocks
 * as necessary.
 * @private
 *
 * @param {!Element} xml The XML to be loaded to the workspace.
 */
WorkspaceFactoryController.prototype.clearAndLoadXml_ = function(xml) {
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  Blockly.Xml.domToWorkspace(xml, this.toolboxWorkspace);
  this.view.markShadowBlocks(this.model.getShadowBlocksInWorkspace
      (this.toolboxWorkspace.getAllBlocks()));
  this.warnForUndefinedBlocks_();
};

/**
 * Sets the standard default options for the options object and updates
 * the preview workspace. The default values depends on if categories are
 * present.
 */
WorkspaceFactoryController.prototype.setStandardOptionsAndUpdate = function() {
  this.view.setBaseOptions();
  this.view.setCategoryOptions(this.model.hasElements());
  this.generateNewOptions();
 };

/**
 * Generates a new options object for injecting a Blockly workspace based
 * on user input. Should be called every time a change has been made to
 * an input field. Updates the model and reinjects the preview workspace.
 */
WorkspaceFactoryController.prototype.generateNewOptions = function() {
  this.model.setOptions(this.readOptions_());

  this.reinjectPreview(Blockly.Options.parseToolboxTree
      (this.generator.generateToolboxXml()));
};

/**
 * Generates a new options object for injecting a Blockly workspace based on
 * user input.
 * @private
 *
 * @return {!Object} Blockly injection options object.
 */
WorkspaceFactoryController.prototype.readOptions_ = function() {
  var optionsObj = Object.create(null);

  // Add all standard options to the options object.
  // Use parse int to get numbers from value inputs.
  optionsObj['collapse'] =
      document.getElementById('option_collapse_checkbox').checked;
  optionsObj['comments'] =
      document.getElementById('option_comments_checkbox').checked;
  optionsObj['css'] = document.getElementById('option_css_checkbox').checked;
  optionsObj['disable'] =
      document.getElementById('option_disable_checkbox').checked;
  if (document.getElementById('option_infiniteBlocks_checkbox').checked) {
    optionsObj['maxBlocks'] = Infinity;
  } else {
    var maxBlocksValue =
        document.getElementById('option_maxBlocks_number').value;
    optionsObj['maxBlocks'] = typeof maxBlocksValue == 'string' ?
        parseInt(maxBlocksValue) : maxBlocksValue;
  }
  optionsObj['media'] = document.getElementById('option_media_text').value;
  optionsObj['readOnly'] =
      document.getElementById('option_readOnly_checkbox').checked;
  optionsObj['rtl'] = document.getElementById('option_rtl_checkbox').checked;
  optionsObj['scrollbars'] =
      document.getElementById('option_scrollbars_checkbox').checked;
  optionsObj['sounds'] =
      document.getElementById('option_sounds_checkbox').checked;
  if (!optionsObj['readOnly']) {
    optionsObj['trashcan'] =
        document.getElementById('option_trashcan_checkbox').checked;
  }

  // If using a grid, add all grid options.
  if (document.getElementById('option_grid_checkbox').checked) {
    var grid = Object.create(null);
    var spacingValue =
        document.getElementById('gridOption_spacing_number').value;
    grid['spacing'] = typeof spacingValue == 'string' ?
        parseInt(spacingValue) : spacingValue;
    var lengthValue = document.getElementById('gridOption_length_number').value;
    grid['length'] = typeof lengthValue == 'string' ?
        parseInt(lengthValue) : lengthValue;
    grid['colour'] = document.getElementById('gridOption_colour_text').value;
    grid['snap'] = document.getElementById('gridOption_snap_checkbox').checked;
    optionsObj['grid'] = grid;
  }

  // If using zoom, add all zoom options.
  if (document.getElementById('option_zoom_checkbox').checked) {
    var zoom = Object.create(null);
    zoom['controls'] =
        document.getElementById('zoomOption_controls_checkbox').checked;
    zoom['wheel'] =
        document.getElementById('zoomOption_wheel_checkbox').checked;
    var startScaleValue =
        document.getElementById('zoomOption_startScale_number').value;
    zoom['startScale'] = typeof startScaleValue == 'string' ?
        parseFloat(startScaleValue) : startScaleValue;
    var maxScaleValue =
        document.getElementById('zoomOption_maxScale_number').value;
    zoom['maxcale'] = typeof maxScaleValue == 'string' ?
        parseFloat(maxScaleValue) : maxScaleValue;
    var minScaleValue =
        document.getElementById('zoomOption_minScale_number').value;
    zoom['minScale'] = typeof minScaleValue == 'string' ?
        parseFloat(minScaleValue) : minScaleValue;
    var scaleSpeedValue =
        document.getElementById('zoomOption_scaleSpeed_number').value;
    zoom['startScale'] = typeof startScaleValue == 'string' ?
        parseFloat(scaleSpeedValue) : scaleSpeedValue;
    optionsObj['zoom'] = zoom;
  }

  return optionsObj;
};

/**
 * Imports blocks from a file, generating a category in the toolbox workspace
 * to allow the user to use imported blocks in the toolbox and in pre-loaded
 * blocks.
 *
 * @param {!File} file File object for the blocks to import.
 * @param {!string} format The format of the file to import, either 'JSON' or
 *    'JavaScript'.
 */
WorkspaceFactoryController.prototype.importBlocks =
    function(file, format) {
  // Generate category name from file name.
  var categoryName = file.name + ' blocks';

  var controller = this;
  var reader = new FileReader();

  // To be executed when the reader has read the file.
  reader.onload = function() {
    try {
      // Define blocks using block types from file.
      var blockTypes = FactoryUtils.defineAndGetBlockTypes(reader.result,
          format);
      var blocks = controller.generator.getDefinedBlocks(blockTypes);

      // Generate category XML and append to toolbox.
      var categoryXml = FactoryUtils.generateCategoryXml(blocks, categoryName);
      // Get random color for category between 0 and 360. Gives each imported
      // category a different color.
      var randomColor = Math.floor(Math.random() * 360);
      categoryXml.setAttribute('colour', randomColor);
      controller.toolbox.appendChild(categoryXml);
      controller.toolboxWorkspace.updateToolbox(controller.toolbox);
      // Update imported block types.
      this.model.addImportedBlocks(blockTypes);
      // Reload current category to possibly reflect any newly defined blocks.
      this.clearAndLoadXml_(Blockly.Xml.workspaceToDom(this.toolboxWorkspace));
    } catch (e) {
      alert('Cannot read blocks from file.');
      window.console.log(e);
    }
  }

  // Read the file asynchronously.
  reader.readAsText(file);
};

/*
 * Updates the block library category in the toolbox workspace toolbox.
 *
 * @param {!Element} categoryXml XML for the block library category.
 * @param {!Array<!string>} libBlockTypes Array of block types from the block
 *    library.
 */
WorkspaceFactoryController.prototype.setBlockLibCategory =
    function(categoryXml, libBlockTypes) {
  var blockLibCategory = document.getElementById('blockLibCategory');

  // Set category id so that it can be easily replaced, and set a standard,
  // arbitrary block library color.
  categoryXml.setAttribute('id', 'blockLibCategory');
  categoryXml.setAttribute('colour', 260);

  // Update the toolbox and toolboxWorkspace.
  this.toolbox.replaceChild(categoryXml, blockLibCategory);
  this.toolboxWorkspace.updateToolbox(this.toolbox);

  // Update the block library types.
  this.model.updateLibBlockTypes(libBlockTypes);

  // Reload XML on page to account for blocks now defined or undefined in block
  // library.
  this.clearAndLoadXml_(Blockly.Xml.workspaceToDom(this.toolboxWorkspace));
};

/**
 * Return the block types used in the custom toolbox and pre-loaded workspace.
 *
 * @return {!Array.<!string>} Block types used in the custom toolbox and
 *    pre-loaded workspace.
 */
WorkspaceFactoryController.prototype.getAllUsedBlockTypes = function() {
  return this.model.getAllUsedBlockTypes();
};

/**
 * Determines if a block loaded in the workspace has a definition (if it
 * is a standard block, is defined in the block library, or has a definition
 * imported).
 *
 * @param {!Blockly.Block} block The block to examine.
 */
WorkspaceFactoryController.prototype.isDefinedBlock = function(block) {
  return this.model.isDefinedBlockType(block.type);
};

/**
 * Sets a warning on blocks loaded to the workspace that are not defined.
 * @private
 */
WorkspaceFactoryController.prototype.warnForUndefinedBlocks_ = function() {
  var blocks = this.toolboxWorkspace.getAllBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!this.isDefinedBlock(block)) {
      block.setWarningText(block.type + ' is not defined (it is not a standard '
          + 'block, \nin your block library, or an imported block)');
    }
  }
};

/*
 * Determines if a standard variable category is in the custom toolbox.
 *
 * @return {boolean} True if a variables category is in use, false otherwise.
 */
WorkspaceFactoryController.prototype.hasVariablesCategory = function() {
  return this.model.hasVariables();
};

/**
 * Determines if a standard procedures category is in the custom toolbox.
 *
 * @return {boolean} True if a procedures category is in use, false otherwise.
 */
WorkspaceFactoryController.prototype.hasProceduresCategory = function() {
  return this.model.hasProcedures();
};
