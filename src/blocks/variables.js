/**
 * @license
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
 * @fileoverview SPARQL Variable blocks for Blockly.
 * @author fraser@google.com (Neil Fraser), miguel.ceriani@gmail.com (Miguel Ceriani)
 */
'use strict';

var _ = require('underscore'),
    Blockly = require('blockly'),
    Types = require('../core/types.js'),
    Blocks = require('../core/blocks.js'),
    Msg = require('../core/msg.js'),
    MyVariable = require('../core/myvariables.js');

var HUE = '#A3C2DC';

var VAR_TYPE_TO_HUE = {
    SOFTWARE_VAR: 300,
    SOFTVERSION_VAR: 50,
    VULN_VAR: 150,
    VULNTYPE_VAR: 200,
    HARDVERSION_VAR: 250
}

Blocks.block('sparql_variable', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour(HUE);
        this.appendDummyInput()
            .appendField(" ")
            .appendField(new Blockly.CustomFieldVariable(), "VAR");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
    onchange: function (event) {
        if (!(this.inputList[0] && this.inputList[0].fieldRow[1])) {
            return
        }

        var name = this.inputList[0].fieldRow[1].getValue()
        if (!name) return;
        var type = MyVariable.getVariableType(name)
        if (!type) return;

        this.setColour(VAR_TYPE_TO_HUE[type])
        this.inputList[0].fieldRow[0].setValue(MyVariable.getVariableTypeName(name))
    }
});

Blocks.block('sparql_type_software_version', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Software Version");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});


Blocks.block('sparql_type_organization', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour(100);
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Organization");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});


Blocks.block('sparql_type_person', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour(100);
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Person");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blocks.block('sparql_type_hardware_version', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Hardware Version");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blocks.block('sparql_type_hardware', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Hardware");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blocks.block('sparql_type_vulnerability', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Vulnerability");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});
Blocks.block('sparql_type_vulnerability_type', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Vulnerability Type");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blocks.block('sparql_type_software', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Software");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blocks.block('sparql_type_hardware', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("Hardware");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blocks.block('sparql_type_license', {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        // this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour('#E6B58D');
        this.appendDummyInput()
            .appendField(" ")
            .appendField("License");
        this.setOutput(true, "Var");
        this.setTooltip('');
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        //     .appendField(new Blockly.FieldVariable(
        //     Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        //     .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        // this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        // this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        // this.contextMenuType_ = 'variables_set';

    },
});

Blockly.Blocks.variables_get = Blockly.Blocks.sparql_variable;
Blockly.Blocks.variables_set = null;
