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
 * @fileoverview Generating Sparql for bgps.
 * @author miguel.ceriani@gmail.com (Miguel Ceriani)
 */
'use strict';

var Sparql = require('../sparql.js');
var prefix = "ns:"
var schema = "schema:"

Sparql.sparql_isa = function(block) {
  var value_type =
      Sparql.valueToCode(
          block,
          'TYPE',
          Sparql.ORDER_ATOMIC);
  var code =
      value_type ?
        ( 'a ' + value_type +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_affects_object = function(block) {
  // var value_verb = Sparql.valueToCode(block, 'VERB', Sparql.ORDER_ATOMIC);
  var value_verb = prefix+"vulnerableTo"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( prefix+"vulnerableTo" + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_has_a_version_called_object = function(block) {
  // var value_verb = Sparql.valueToCode(block, 'VERB', Sparql.ORDER_ATOMIC);
  var value_verb = prefix+"has-a-software-version-called"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( prefix+"hasSoftwareVersion" + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_has_a_hardware_version_object = function(block) {
  // var value_verb = Sparql.valueToCode(block, 'VERB', Sparql.ORDER_ATOMIC);
  var value_verb = prefix+"has-a-hardware-version-called"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( prefix+"hasHardwareVersion" + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_verb_object = function(block) {
  var value_verb = prefix+"has-a-software-version-called"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( prefix+"hasSoftwareVersion" + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
}

Sparql.sparql_operate_on_object = function(block) {
  var value_verb = prefix+'operatesOn'
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( value_verb + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_is_a_object = function(block) {
  var value_verb = prefix+"is-a"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( value_verb + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_vulnerable_to_object = function(block) {
  var value_verb = prefix+"vulnerableTo"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( value_verb + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
}


Sparql.sparql_depends_on_object = function(block) {
  var value_verb = prefix+"dependsOn"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( value_verb + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
}

Sparql.sparql_is_called_object = function(block) {
  var value_verb = schema+"is-called"
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( schema+"name" + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
}

Sparql.sparql_any_verb_object = function(block) {
  var code = '<>|!<> []' + Sparql.STMNT_BRK;
  return code;
};

Sparql.sparql_reversePath_object = function(block) {
  var value_verb = Sparql.valueToCode(block, 'VERB', Sparql.ORDER_ATOMIC);
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      value_verb ?
        ( '^' + value_verb + ' ' +
          (value_object ? value_object : '[]') +
          Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_closurePath_object = function(block) {
  var value_verb = Sparql.valueToCode(block, 'VERB', Sparql.ORDER_ATOMIC);
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      (value_verb && value_object) ?
        ( value_verb + '* ' + value_object + Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_reverseClosurePath_object = function(block) {
  var value_verb = Sparql.valueToCode(block, 'VERB', Sparql.ORDER_ATOMIC);
  var value_object = Sparql.valueToCode(block, 'OBJECT', Sparql.ORDER_ATOMIC);
  var code =
      (value_verb && value_object) ?
        ( '^' + value_verb + '* ' + value_object + Sparql.STMNT_BRK ) :
        '';
  return code;
};

Sparql.sparql_typedsubject_propertylist = function(block) {
  var value_subject =
      Sparql.valueToCode(
          block,
          'SUBJECT',
          Sparql.ORDER_ATOMIC);// || '[]';
  var value_type = Sparql.blockToCode(block.getInputTargetBlock('TYPE'))
      
  var statements_property_list =
      Sparql.stmJoin(
          Sparql.statementToCode(block, 'PROPERTY_LIST'),
          ';\n');
  var code =
      (value_type || statements_property_list !== '') ?
          ( (value_subject ? value_subject : '[]') +
            (value_type ?
                ' a ' + value_type + (statements_property_list !== '' ? ';' : '') :
                '' ) +
            (statements_property_list !== '' ?
                '\n' + statements_property_list :
                '' ) +
            Sparql.STMNT_BRK) :
          '';
  return code;
};

Sparql.sparql_type_hardware_version = function(block){
  var code = prefix+'HardwareVersion'
  return code
}

Sparql.sparql_type_software_version = function(block){
  var code = prefix+'SoftwareVersion'
  return code
}
Sparql.sparql_type_software = function(block){
  var code = prefix+'Software'
  return code
}
Sparql.sparql_type_hardware = function(block){
  var code = prefix+'Hardware'
  return code
}
Sparql.sparql_type_vulnerability = function(block){
  var code = prefix+'Vulnerability'
  return code
}
Sparql.sparql_type_vulnerability_type = function(block){
  var code = prefix+'VulnerabilityType'
  return code
}
Sparql.sparql_type_license = function(block){
  var code = prefix+'License'
  return code
}
Sparql.sparql_type_organization = function(block){
  var code =  schema+'Organization'
  return code
}

Sparql.sparql_type_person = function(block){
  var code =  schema+'Person'
  return code
}


Sparql.sparql_subject_propertylist = function(block) {
  var value_subject =
      Sparql.valueToCode(
          block,
          'SUBJECT',
          Sparql.ORDER_ATOMIC);// || '[]';
  var statements_property_list =
      Sparql.stmJoin(
          Sparql.statementToCode(block, 'PROPERTY_LIST'),
          ';\n');
  var code =
      (statements_property_list !== '') ?
          ( (value_subject ? value_subject : '[]') +
            (statements_property_list !== '' ?
                '\n' + statements_property_list :
                '' ) +
            Sparql.STMNT_BRK) :
          '';
  return code;
};

var generateAnonSubject = function(value_type, statements_property_list) {
  var code =
      (value_type || statements_property_list !== '') ?
          '[\n' +
          (value_type ?
                ' a ' + value_type + (statements_property_list !== '' ? ';\n' : '') :
                '' ) +
          (statements_property_list !== '' ?
                statements_property_list :
                '' ) +
          '\n]' :
          '[]';
  return [code, Sparql.ORDER_ATOMIC];
};

Sparql.sparql_anontypedsubject_propertylist = function(block) {
  var value_type =
      Sparql.valueToCode(
          block,
          'TYPE',
          Sparql.ORDER_ATOMIC);
  var statements_property_list =
      Sparql.stmJoin(
          Sparql.statementToCode(block, 'PROPERTY_LIST'),
          ';\n');
  return generateAnonSubject(value_type, statements_property_list);
};

Sparql.sparql_anonsubject_propertylist = function(block) {
  var statements_property_list =
      Sparql.stmJoin(
          Sparql.statementToCode(block, 'PROPERTY_LIST'),
          ';\n');
  return generateAnonSubject(null, statements_property_list);
};