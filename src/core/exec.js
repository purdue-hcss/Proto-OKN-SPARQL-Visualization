/**
 * @license
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
 * @fileoverview Executing SPARQL queries
 * @author miguel.ceriani@gmail.com (Miguel Ceriani)
 */
'use strict';

var SparqlGen = require('../generators/sparql.js'),
    Blockly = require('blockly'),
    WorkspaceActions = require('./workspaceActions.js'),
    msg = require('./msg.js'),
    FieldTable = require('./field_table.js'),
    $ = require('jquery'),
    MessageDisplay = require('./messageDisplay.js'),
    URL = require('url-parse');

var endpointUri_txt = 'http://localhost:3030/kg'
// var corsProxy = "https://cors-anywhere.herokuapp.com/";

var sparqlExec_ = function(endpointUrl, query, callback) {
  var parsedUrl = new URL(endpointUrl);
  parsedUrl.set(
    'query',
    (parsedUrl.query ? parsedUrl.query + '&' : '?') +
    "query=" + encodeURIComponent(query));
  return $.ajax({
      headers: {Accept: "application/sparql-results+json"},
      dataType: "json",
      method: "GET",
      url: parsedUrl.href})
    .done(function(data) {
      callback(null,data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log("Error: " + textStatus + " " + errorThrown);
      callback({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
    });
};

var sparqlExecAndAlert_ = function(endpointUrl, query) {
  return sparqlExec_(endpointUrl, query, function(err, data) {
    if (err) {
      MessageDisplay.alert("Error: " + err);
    } else {
      MessageDisplay.alert("Results:\n" + JSON.stringify(data));
    }
  });
};

var sparqlExecAndBlock_ = function(endpointUrl, query, workspace, callback) {
};

var connect_ = function(connection, block) {
  var targetBlock = connection.targetBlock();
  if (targetBlock) {
    targetBlock.dispose();
  }
  connection.connect(block.previousConnection);
  block.render();
};

var unconnect_ = function(connection) {
  var targetBlock = connection.targetBlock();
  if (targetBlock) {
    targetBlock.dispose();
  }
};

var DESCR_LENGTH = 40;

var setResult_ = function(resultsInput, resultField) {
  WorkspaceActions.execute(function() {
    resultsInput.removeField("RESULTS_CONTAINER");
    resultsInput.appendField(resultField, "RESULTS_CONTAINER");
  });
};

var sparqlExecAndPublish_ = function(endpointUrl, query, workspace, resultsInput, extraColumns, callback) {

  setResult_(resultsInput, msg.EXECUTION_IN_PROGRESS);

  return sparqlExec_(endpointUrl, query, function(err, data) {
    var resultField = null;
    if (err) {
      var errorDescr = err.jqXHR.responseText;
      if (errorDescr) {
        var errorDescrShort = null;
        if (errorDescr.length > DESCR_LENGTH) {
          errorDescrShort = errorDescr.substr(0, DESCR_LENGTH - 3) + '...';
        } else {
          errorDescrShort = errorDescr;
        }
        resultField = new Blockly.FieldTextInput(errorDescrShort);
        // resultField.setEditable(false);
        resultField.setTooltip(errorDescr);
      } else {
        resultField = msg.EXECUTION_CONNECTION_ERROR;
      }
    } else if(data.results.bindings.length == 0) {
      resultField = msg.EXECUTION_NO_RESULTS;
    }
      else {
        console.log("data", data);
        const head = data.head.vars;
        const rows = data.results.bindings;
        const headLength = head.length;
        const per = 100/headLength;
        var thString = ''
        thString += "<div style='display:flex; height: 30px; background-color: #f1f1f1; font-weight: bold; width: 100%'>"
        for (var i = 0; i < head.length; i++) {
          thString += "<div class='td' style='width:"+per+"%; overflow:hidden; text-overflow:ellipsis; white-space: nowrap;'>"+head[i]+"</div>"
        }
        thString += "</div>"
        var rowString = ''
        for (var i = 0; i < rows.length; i++) {
          rowString += "<div style='display:flex; height: 30px; width: 100%;'>"
          for (var j = 0; j < head.length; j++) {
            rowString += "<div class='td' style='width:"+per+"%; overflow:hidden; text-overflow:ellipsis; white-space: nowrap;'>"+rows[i][head[j]].value+"</div>"
          }

          rowString += "</div>"
        }
        var cells = document.getElementsByClassName('.td');

        for (var i = 0; i < cells.length; i++) {
          cells[i].addEventListener('click', function(event) {
            event.stopPropagation();

            for (var j = 0; j < cells.length; j++) {
              cells[j].style.overflow = 'hidden';
              cells[j].style.whiteSpace = 'nowrap';
              cells[j].style.backgroundColor = 'transparent';
            }

            this.style.overflow = 'visible';
            this.style.whiteSpace = 'normal';
            this.style.backgroundColor = '#f1f1f1';
          });
        }

        document.addEventListener('click', function() {
          for (var i = 0; i < cells.length; i++) {
            cells[i].style.overflow = 'hidden';
            cells[i].style.whiteSpace = 'nowrap';
            cells[i].style.backgroundColor = 'transparent';
          }
        });
        const resultTable = document.querySelector('#table');
      
        resultTable.innerHTML = thString + rowString;
        
        resultField = msg.EXECUTION_DONE;
      // resultField = new FieldTable(data, extraColumns);
    }
    setResult_(resultsInput, resultField);
    callback(data);
  });
};

var blockExecQuery_ = function(block, queryStr, extraColumns, resultsHolder) {
  if (!resultsHolder) {
    resultsHolder = block.getInput('RESULTS');
  }
  if (!resultsHolder) return;
  var endpointUri = endpointUri_txt ? encodeURI(endpointUri_txt) : null;
  if (endpointUri != block.endpointUri || queryStr != block.sparqlQueryStr) {
    block.endpointUri = endpointUri;
    block.sparqlQueryStr = queryStr;
    if (block.queryReq) {
      block.queryReq.abort();
    }
    if (queryStr && endpointUri) {
      block.resultsData = null;
      block.queryReq = sparqlExecAndPublish_(
          endpointUri, queryStr,
          block.workspace,
          resultsHolder,
          extraColumns,
          function(data) {
            block.queryReq = null;
            block.resultsData = data;
          } );
    } else {
      block.resultsData = null;
      setResult_(resultsHolder, msg.EXECUTION_PLACEHOLDER);
      block.queryReq = null;
    }

  }

};

var blockExec_ = function(block, extraColumns, queryBlock, resultsHolder, isQuery) {
  if (!queryBlock) {
    queryBlock = block.getInputTargetBlock('QUERY');
  }
  var queryStr = SparqlGen.sparqlQuery(queryBlock);
  console.log("queryStr", queryStr);
  const displayBlock = document.querySelector('#code');
  displayBlock.innerHTML = queryStr;
  if(isQuery) {
    blockExecQuery_(block, queryStr, extraColumns, resultsHolder);
  }
};

module.exports = {
  sparqlExecAndPublish: sparqlExecAndPublish_,
  sparqlExecAndAlert: sparqlExecAndAlert_,
  sparqlExec: sparqlExec_,
  blockExec: blockExec_,
  blockExecQuery: blockExecQuery_
};
