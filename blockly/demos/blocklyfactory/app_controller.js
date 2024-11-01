/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
 * @fileoverview The AppController Class brings together the Block
 * Factory, Block Library, and Block Exporter functionality into a single web
 * app.
 *
 * @author quachtina96 (Tina Quach)
 */
goog.provide('AppController');

goog.require('BlockFactory');
goog.require('FactoryUtils');
goog.require('BlockLibraryController');
goog.require('BlockExporterController');
goog.require('goog.dom.classlist');
goog.require('goog.string');
goog.require('goog.ui.PopupColorPicker');
goog.require('goog.ui.ColorPicker');

/**
 * Controller for the Blockly Factory
 * @constructor
 */
AppController = function() {
  // Initialize Block Library
  this.blockLibraryName = 'blockLibrary';
  this.blockLibraryController =
      new BlockLibraryController(this.blockLibraryName);
  this.blockLibraryController.populateBlockLibrary();

  // Construct Workspace Factory Controller.
  this.workspaceFactoryController = new WorkspaceFactoryController
      ('workspacefactory_toolbox', 'toolbox_blocks', 'preview_blocks');

  // Initialize Block Exporter
  this.exporter =
      new BlockExporterController(this.blockLibraryController.storage);

  // Map of tab type to the div element for the tab.
  this.tabMap = Object.create(null);
  this.tabMap[AppController.BLOCK_FACTORY] =
      goog.dom.getElement('blockFactory_tab');
  this.tabMap[AppController.WORKSPACE_FACTORY] =
      goog.dom.getElement('workspaceFactory_tab');
  this.tabMap[AppController.EXPORTER] =
      goog.dom.getElement('blocklibraryExporter_tab');

  // Last selected tab.
  this.lastSelectedTab = null;
  // Selected tab.
  this.selectedTab = AppController.BLOCK_FACTORY;
};

// Constant values representing the three tabs in the controller.
AppController.BLOCK_FACTORY = 'BLOCK_FACTORY';
AppController.WORKSPACE_FACTORY = 'WORKSPACE_FACTORY';
AppController.EXPORTER = 'EXPORTER';

/**
 * Tied to the 'Import Block Library' button. Imports block library from file to
 * Block Factory. Expects user to upload a single file of JSON mapping each
 * block type to its xml text representation.
 */
AppController.prototype.importBlockLibraryFromFile = function() {
  var self = this;
  var files = document.getElementById('files');
  // If the file list is empty, the user likely canceled in the dialog.
  if (files.files.length > 0) {
    // The input tag doesn't have the "multiple" attribute
    // so the user can only choose 1 file.
    var file = files.files[0];
    var fileReader = new FileReader();

    // Create a map of block type to xml text from the file when it has been
    // read.
    fileReader.addEventListener('load', function(event) {
      var fileContents = event.target.result;
      // Create empty object to hold the read block library information.
      var blockXmlTextMap = Object.create(null);
      try {
        // Parse the file to get map of block type to xml text.
        blockXmlTextMap = self.formatBlockLibraryForImport_(fileContents);
      } catch (e) {
        var message = 'Could not load your block library file.\n'
        window.alert(message + '\nFile Name: ' + file.name);
        return;
      }

      // Create a new block library storage object with inputted block library.
      var blockLibStorage = new BlockLibraryStorage(
          self.blockLibraryName, blockXmlTextMap);

      // Update block library controller with the new block library
      // storage.
      self.blockLibraryController.setBlockLibraryStorage(blockLibStorage);
      // Update the block library dropdown.
      self.blockLibraryController.populateBlockLibrary();
      // Update the exporter's block library storage.
      self.exporter.setBlockLibraryStorage(blockLibStorage);
    });
    // Read the file.
    fileReader.readAsText(file);
  }
};

/**
 * Tied to the 'Export Block Library' button. Exports block library to file that
 * contains JSON mapping each block type to its xml text representation.
 */
AppController.prototype.exportBlockLibraryToFile = function() {
  // Get map of block type to xml.
  var blockLib = this.blockLibraryController.getBlockLibrary();
  // Concatenate the xmls, each separated by a blank line.
  var blockLibText = this.formatBlockLibraryForExport_(blockLib);
  // Get file name.
  var filename = prompt('Enter the file name under which to save your block ' +
      'library.');
  // Download file if all necessary parameters are provided.
  if (filename) {
    FactoryUtils.createAndDownloadFile(blockLibText, filename, 'xml');
  } else {
    alert('Could not export Block Library without file name under which to ' +
      'save library.');
  }
};

/**
 * Converts an object mapping block type to xml to text file for output.
 * @private
 *
 * @param {!Object} blockXmlMap - Object mapping block type to xml.
 * @return {string} Xml text containing the block xmls.
 */
AppController.prototype.formatBlockLibraryForExport_ = function(blockXmlMap) {
  // Create DOM for XML.
  var xmlDom = goog.dom.createDom('xml', {
    'xmlns':"http://www.w3.org/1999/xhtml"
  });

  // Append each block node to xml dom.
  for (var blockType in blockXmlMap) {
    var blockXmlDom = Blockly.Xml.textToDom(blockXmlMap[blockType]);
    var blockNode = blockXmlDom.firstElementChild;
    xmlDom.appendChild(blockNode);
  }

  // Return the xml text.
  return Blockly.Xml.domToText(xmlDom);
};

/**
 * Converts imported block library to an object mapping block type to block xml.
 * @private
 *
 * @param {string} xmlText - String representation of an xml with each block as
 *    a child node.
 * @return {!Object} object mapping block type to xml text.
 */
AppController.prototype.formatBlockLibraryForImport_ = function(xmlText) {
  var xmlDom = Blockly.Xml.textToDom(xmlText);

  // Get array of xmls. Use an asterisk (*) instead of a tag name for the XPath
  // selector, to match all elements at that level and get all factory_base
  // blocks.
  var blockNodes = goog.dom.xml.selectNodes(xmlDom, '*');

  // Create empty map. The line below creates a  truly empy object. It doesn't
  // have built-in attributes/functions such as length or toString.
  var blockXmlTextMap = Object.create(null);

  // Populate map.
  for (var i = 0, blockNode; blockNode = blockNodes[i]; i++) {

    // Add outer xml tag to the block for proper injection in to the
    // main workspace.
    // Create DOM for XML.
    var xmlDom = goog.dom.createDom('xml', {
      'xmlns':"http://www.w3.org/1999/xhtml"
    });
    xmlDom.appendChild(blockNode);

    var xmlText = Blockly.Xml.domToText(xmlDom);
    // All block types should be lowercase.
    var blockType = this.getBlockTypeFromXml_(xmlText).toLowerCase();

    blockXmlTextMap[blockType] = xmlText;
  }

  return blockXmlTextMap;
};

/**
 * Extracts out block type from xml text, the kind that is saved in block
 * library storage.
 * @private
 *
 * @param {!string} xmlText - A block's xml text.
 * @return {string} The block type that corresponds to the provided xml text.
 */
AppController.prototype.getBlockTypeFromXml_ = function(xmlText) {
  var xmlDom = Blockly.Xml.textToDom(xmlText);
  // Find factory base block.
  var factoryBaseBlockXml = xmlDom.getElementsByTagName('block')[0];
  // Get field elements from factory base.
  var fields = factoryBaseBlockXml.getElementsByTagName('field');
  for (var i = 0; i < fields.length; i++) {
    // The field whose name is 'NAME' holds the block type as its value.
    if (fields[i].getAttribute('name') == 'NAME') {
      return fields[i].childNodes[0].nodeValue;
    }
  }
};

/**
 * Updates the Block Factory tab to show selected block when user selects a
 * different block in the block library dropdown. Tied to block library dropdown
 * in index.html.
 *
 * @param {!Element} blockLibraryDropdown - HTML select element from which the
 *    user selects a block to work on.
 */
AppController.prototype.onSelectedBlockChanged
    = function(blockLibraryDropdown) {
  // Get selected block type.
  var blockType = this.blockLibraryController.getSelectedBlockType(
      blockLibraryDropdown);
  // Update Block Factory page by showing the selected block.
  this.blockLibraryController.openBlock(blockType);
};

/**
 * Add click handlers to each tab to allow switching between the Block Factory,
 * Workspace Factory, and Block Exporter tab.
 *
 * @param {!Object} tabMap - Map of tab name to div element that is the tab.
 */
AppController.prototype.addTabHandlers = function(tabMap) {
  var self = this;
  for (var tabName in tabMap) {
    var tab = tabMap[tabName];
    // Use an additional closure to correctly assign the tab callback.
    tab.addEventListener('click', self.makeTabClickHandler_(tabName));
  }
};

/**
 * Set the selected tab.
 * @private
 *
 * @param {string} tabName AppController.BLOCK_FACTORY,
 *    AppController.WORKSPACE_FACTORY, or AppController.EXPORTER
 */
AppController.prototype.setSelected_ = function(tabName) {
  this.lastSelectedTab = this.selectedTab;
  this.selectedTab = tabName;
};

/**
 * Creates the tab click handler specific to the tab specified.
 * @private
 *
 * @param {string} tabName AppController.BLOCK_FACTORY,
 *    AppController.WORKSPACE_FACTORY, or AppController.EXPORTER
 * @return {Function} The tab click handler.
 */
AppController.prototype.makeTabClickHandler_ = function(tabName) {
  var self = this;
  return function() {
    self.setSelected_(tabName);
    self.onTab();
  };
};

/**
 * Called on each tab click. Hides and shows specific content based on which tab
 * (Block Factory, Workspace Factory, or Exporter) is selected.
 */
AppController.prototype.onTab = function() {
  // Get tab div elements.
  var blockFactoryTab = this.tabMap[AppController.BLOCK_FACTORY];
  var exporterTab = this.tabMap[AppController.EXPORTER];
  var workspaceFactoryTab = this.tabMap[AppController.WORKSPACE_FACTORY];

  // Warn user if they have unsaved changes when leaving Block Factory.
  if (this.lastSelectedTab == AppController.BLOCK_FACTORY &&
      this.selectedTab != AppController.BLOCK_FACTORY) {
    if (!BlockFactory.isStarterBlock() && !this.savedBlockChanges()) {
      if (!confirm('You have unsaved changes in Block Factory.')) {
        // If the user doesn't want to switch tabs with unsaved changes,
        // stay on Block Factory Tab.
        this.setSelected_(AppController.BLOCK_FACTORY);
        this.lastSelectedTab == AppController.BLOCK_FACTORY;
        return;
      }
    }
  }

  // Only enable key events in workspace factory if workspace factory tab is
  // selected.
  this.workspaceFactoryController.keyEventsEnabled =
      this.selectedTab == AppController.WORKSPACE_FACTORY;

  // Turn selected tab on and other tabs off.
  this.styleTabs_();

  if (this.selectedTab == AppController.EXPORTER) {
    // Hide other tabs.
    FactoryUtils.hide('workspaceFactoryContent');
    FactoryUtils.hide('blockFactoryContent');
    // Show exporter tab.
    FactoryUtils.show('blockLibraryExporter');

    // Need accurate state in order to know which blocks are used in workspace
    // factory.
    this.workspaceFactoryController.saveStateFromWorkspace();

    // Update exporter's list of the types of blocks used in workspace factory.
    var usedBlockTypes = this.workspaceFactoryController.getAllUsedBlockTypes();
    this.exporter.setUsedBlockTypes(usedBlockTypes);

    // Update exporter's block selector to reflect current block library.
    this.exporter.updateSelector();

    // Update the exporter's preview to reflect any changes made to the blocks.
    this.exporter.updatePreview();

  } else if (this.selectedTab ==  AppController.BLOCK_FACTORY) {
    // Hide other tabs.
    FactoryUtils.hide('blockLibraryExporter');
    FactoryUtils.hide('workspaceFactoryContent');
    // Show Block Factory.
    FactoryUtils.show('blockFactoryContent');

  } else if (this.selectedTab == AppController.WORKSPACE_FACTORY) {
    // Hide other tabs.
    FactoryUtils.hide('blockLibraryExporter');
    FactoryUtils.hide('blockFactoryContent');
    // Show workspace factory container.
    FactoryUtils.show('workspaceFactoryContent');
    // Update block library category.
    var categoryXml = this.exporter.getBlockLibraryCategory();
    var blockTypes = this.blockLibraryController.getStoredBlockTypes();
    this.workspaceFactoryController.setBlockLibCategory(categoryXml,
        blockTypes);
  }

  // Resize to render workspaces' toolboxes correctly for all tabs.
  window.dispatchEvent(new Event('resize'));
};

/**
 * Called on each tab click. Styles the tabs to reflect which tab is selected.
 * @private
 */
AppController.prototype.styleTabs_ = function() {
  for (var tabName in this.tabMap) {
    if (this.selectedTab == tabName) {
      goog.dom.classlist.addRemove(this.tabMap[tabName], 'taboff', 'tabon');
    } else {
      goog.dom.classlist.addRemove(this.tabMap[tabName], 'tabon', 'taboff');
    }
  }
};

/**
 * Assign button click handlers for the exporter.
 */
AppController.prototype.assignExporterClickHandlers = function() {
  var self = this;
  document.getElementById('button_setBlocks').addEventListener('click',
      function() {
        document.getElementById('dropdownDiv_setBlocks').classList.toggle("show");
      });

  document.getElementById('dropdown_addAllUsed').addEventListener('click',
      function() {
        self.exporter.selectUsedBlocks();
        self.exporter.updatePreview();
        document.getElementById('dropdownDiv_setBlocks').classList.remove("show");
      });

  document.getElementById('dropdown_clearSelected').addEventListener('click',
      function() {
        self.exporter.clearSelectedBlocks();
        self.exporter.updatePreview();
        document.getElementById('dropdownDiv_setBlocks').classList.remove("show");
      });

  document.getElementById('dropdown_addAllFromLib').addEventListener('click',
      function() {
        self.exporter.selectAllBlocks();
        self.exporter.updatePreview();
        document.getElementById('dropdownDiv_setBlocks').classList.remove("show");
      });

  // Export blocks when the user submits the export settings.
  document.getElementById('exporterSubmitButton').addEventListener('click',
      function() {
        self.exporter.export();
      });
};

/**
 * Assign change listeners for the exporter. These allow for the dynamic update
 * of the exporter preview.
 */
AppController.prototype.assignExporterChangeListeners = function() {
  var self = this;

  var blockDefCheck = document.getElementById('blockDefCheck');
  var genStubCheck = document.getElementById('genStubCheck');

  var blockDefs = document.getElementById('blockDefs');
  var blockDefSettings = document.getElementById('blockDefSettings');
  var blockDefElements = [blockDefs, blockDefSettings];

  var genStubs = document.getElementById('genStubs');
  var genStubSettings = document.getElementById('genStubSettings');
  var genStubElements = [genStubs, genStubSettings];

  // Select the block definitions and generator stubs on default.
  blockDefCheck.checked = true;
  genStubCheck.checked = true;

  // Checking the block definitions checkbox displays preview of code to export.
  document.getElementById('blockDefCheck').addEventListener('change',
      function(e) {
        self.ifCheckedDisplay(blockDefCheck, blockDefElements);
      });

  // Preview updates when user selects different block definition format.
  document.getElementById('exportFormat').addEventListener('change',
      function(e) {
        self.exporter.updatePreview();
      });

  // Checking the generator stub checkbox displays preview of code to export.
  document.getElementById('genStubCheck').addEventListener('change',
      function(e) {
        self.ifCheckedDisplay(genStubCheck, genStubElements);
      });

  // Preview updates when user selects different generator stub language.
  document.getElementById('exportLanguage').addEventListener('change',
      function(e) {
        self.exporter.updatePreview();
      });
};

/**
 * If given checkbox is checked, display given elements. Otherwise, hide.
 *
 * @param {!Element} checkbox - Input element of type checkbox.
 * @param {!Array.<!Element>} elementArray - Array of elements to show when
 *    block is checked.
 */
AppController.prototype.ifCheckedDisplay = function(checkbox, elementArray) {
  for (var i = 0, element; element = elementArray[i]; i++) {
    element.style.display = checkbox.checked ? 'block' : 'none';
  }
};

/**
 * Returns whether or not a block's changes has been saved to the Block Library.
 *
 * @return {boolean} True if all changes made to the block have been saved to
 *    the Block Library.
 */
AppController.prototype.savedBlockChanges = function() {
  var blockType = this.blockLibraryController.getCurrentBlockType();
  var currentXml = Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace);

  if (this.blockLibraryController.has(blockType)) {
    // Block is saved in block library.
    var savedXml = this.blockLibraryController.getBlockXml(blockType);
    return FactoryUtils.sameBlockXml(savedXml, currentXml);
  }
  return false;
};

/**
 * Assign button click handlers for the block library.
 */
AppController.prototype.assignLibraryClickHandlers = function() {
  var self = this;
  // Assign button click handlers for Block Library.
  document.getElementById('saveToBlockLibraryButton').addEventListener('click',
      function() {
        self.blockLibraryController.saveToBlockLibrary();
      });

  document.getElementById('removeBlockFromLibraryButton').addEventListener(
    'click',
      function() {
        self.blockLibraryController.removeFromBlockLibrary();
      });

  document.getElementById('clearBlockLibraryButton').addEventListener('click',
      function() {
        self.blockLibraryController.clearBlockLibrary();
      });

  var dropdown = document.getElementById('blockLibraryDropdown');
  dropdown.addEventListener('change',
      function() {
        self.onSelectedBlockChanged(dropdown);
      });
};

/**
 * Assign button click handlers for the block factory.
 */
AppController.prototype.assignBlockFactoryClickHandlers = function() {
  var self = this;
  // Assign button event handlers for Block Factory.
  document.getElementById('localSaveButton')
      .addEventListener('click', function() {
        self.exportBlockLibraryToFile();
      });

  document.getElementById('helpButton').addEventListener('click',
      function() {
        open('https://developers.google.com/blockly/custom-blocks/block-factory',
             'BlockFactoryHelp');
      });

  document.getElementById('files').addEventListener('change',
      function() {
        // Warn user.
        var replace = confirm('This imported block library will ' +
            'replace your current block library.');
        if (replace) {
          self.importBlockLibraryFromFile();
          // Clear this so that the change event still fires even if the
          // same file is chosen again. If the user re-imports a file, we
          // want to reload the workspace with its contents.
          this.value = null;
        }
      });

  document.getElementById('createNewBlockButton')
    .addEventListener('click', function() {
      // If there are unsaved changes to the block in open in Block Factory,
      // warn user that proceeding to create a new block will cause them to lose
      // their changes if they don't save.
      if (!self.savedBlockChanges()) {
        if(!confirm('You have unsaved changes. By proceeding without saving ' +
          ' your block first, you will lose these changes.')) {
          return;
        }
      }
        BlockFactory.showStarterBlock();
        BlockLibraryView.selectDefaultOption('blockLibraryDropdown');
      });
};

/**
 * Add event listeners for the block factory.
 */
AppController.prototype.addBlockFactoryEventListeners = function() {
  BlockFactory.mainWorkspace.addChangeListener(BlockFactory.updateLanguage);
  BlockFactory.mainWorkspace.addChangeListener(Blockly.Events.disableOrphans);
  document.getElementById('direction')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('keyup', BlockFactory.updatePreview);
  document.getElementById('format')
      .addEventListener('change', BlockFactory.formatChange);
  document.getElementById('language')
      .addEventListener('change', BlockFactory.updatePreview);
};

/**
 * Handle Blockly Storage with App Engine.
 */
AppController.prototype.initializeBlocklyStorage = function() {
  BlocklyStorage.HTTPREQUEST_ERROR =
      'There was a problem with the request.\n';
  BlocklyStorage.LINK_ALERT =
      'Share your blocks with this link:\n\n%1';
  BlocklyStorage.HASH_ERROR =
      'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
  BlocklyStorage.XML_ERROR = 'Could not load your saved file.\n' +
      'Perhaps it was created with a different version of Blockly?';
  var linkButton = document.getElementById('linkButton');
  linkButton.style.display = 'inline-block';
  linkButton.addEventListener('click',
      function() {
          BlocklyStorage.link(BlockFactory.mainWorkspace);});
  BlockFactory.disableEnableLink();
};

/**
 * Handle resizing of elements.
 */
AppController.prototype.onresize = function(event) {
  if (this.selectedTab == AppController.BLOCK_FACTORY) {
    // Handle resizing of Block Factory elements.
    var expandList = [
      document.getElementById('blocklyPreviewContainer'),
      document.getElementById('blockly'),
      document.getElementById('blocklyMask'),
      document.getElementById('preview'),
      document.getElementById('languagePre'),
      document.getElementById('languageTA'),
      document.getElementById('generatorPre'),
    ];
    for (var i = 0, expand; expand = expandList[i]; i++) {
      expand.style.width = (expand.parentNode.offsetWidth - 2) + 'px';
      expand.style.height = (expand.parentNode.offsetHeight - 2) + 'px';
    }
  } else if (this.selectedTab == AppController.EXPORTER) {
    // Handle resize of Exporter block options.
    this.exporter.view.centerPreviewBlocks();
  }
};

/**
 * Initialize Blockly and layout.  Called on page load.
 */
AppController.prototype.init = function() {
  // Handle Blockly Storage with App Engine
  if ('BlocklyStorage' in window) {
    this.initializeBlocklyStorage();
  }

  // Assign click handlers.
  this.assignExporterClickHandlers();
  this.assignLibraryClickHandlers();
  this.assignBlockFactoryClickHandlers();

  this.onresize();
  self = this;
  window.addEventListener('resize', function() {
    self.onresize();
  });

  // Inject Block Factory Main Workspace.
  var toolbox = document.getElementById('blockfactory_toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});

  // Add tab handlers for switching between Block Factory and Block Exporter.
  this.addTabHandlers(this.tabMap);

  // Assign exporter change listeners.
  this.assignExporterChangeListeners();

  // Create the root block on Block Factory main workspace.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               BlockFactory.mainWorkspace);
  } else {
    BlockFactory.showStarterBlock();
  }
  BlockFactory.mainWorkspace.clearUndo();

  // Add Block Factory event listeners.
  this.addBlockFactoryEventListeners();

  // Workspace Factory init.
  WorkspaceFactoryInit.initWorkspaceFactory(this.workspaceFactoryController);
};


