<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns="http://www.w3.org/1999/xhtml">
  <xsl:import href="toolboxCommon.xslt"/>
  <xsl:template name="toolbox-demo">
    <xml id="toolboxDemo" style="display: none">
      <category name="&#xf106; Query" colour="#DCBDD8">
        <block type="sparql_no_execution_endpoint_query_fake">
          <!-- <field name="ENDPOINT">http://dbpedia.org/sparql</field> -->
          <field name="LIMIT">5</field>
          <value name="WHERE">
            <shadow type="sparql_subject_propertylist">
              <value name="SUBJECT">
                <shadow type="variables_get">
                  <field name="VAR">subj</field>
                </shadow>
              </value>
              <statement name="PROPERTY_LIST">
                <shadow type="sparql_is_called_object">
                  <value name="VERB">
                    <shadow type="variables_get">
                      <field name="VAR">pred</field>
                    </shadow>
                  </value>
                  <value name="OBJECT">
                    <shadow type="variables_get">
                      <field name="VAR">obj</field>
                    </shadow>
                  </value>
                </shadow>
              </statement>
            </shadow>
          </value>
        </block>
        <block type="sparql_no_execution_endpoint_query_fake">
          <!-- <field name="ENDPOINT">http://dbpedia.org/sparql</field> -->
          <field name="LIMIT">5</field>
          <value name="WHERE">
            <block type="sparql_subject_propertylist">
              <value name="SUBJECT">
                <block type="variables_get">
                  <field name="VAR">lib</field>
                </block>
              </value>
              <statement name="PROPERTY_LIST">
                <block type="sparql_is_called_object">
                  <value name="OBJECT">
                    <block type="sparql_text">
                      <field name="TEXT">ffmpeg</field>
                    </block>
                  </value>
                </block>
              </statement>
            </block>
          </value>
          <value name="WHERE">
            <block type="sparql_subject_propertylist">
              <value name="SUBJECT">
                <block type="variables_get">
                  <field name="VAR">lib</field>
                </block>
              </value>
              <statement name="PROPERTY_LIST">
                <block type="sparql_has_a_version_called_object">
                  <value name="OBJECT">
                    <block type="variables_get">
                      <field name="VAR">version</field>
                    </block>
                  </value>
                </block>
              </statement>
            </block>
          </value>
           <value name="WHERE">
              <block type="sparql_typedsubject_propertylist">
                <value name="SUBJECT">
                  <block type="variables_get">
                    <field name="VAR">version</field>
                  </block>
                </value>
                <value name="TYPE">
                  <block type="sparql_type_software_version">
                  </block>
                </value>
              </block>
          </value>
           <value name="WHERE">
            <block type="sparql_subject_propertylist">
              <value name="SUBJECT">
                <block type="variables_get">
                  <field name="VAR">version</field>
                </block>
              </value>
              <statement name="PROPERTY_LIST">
                <block type="sparql_affects_object">
                  <value name="OBJECT">
                    <block type="variables_get">
                      <field name="VAR">cve</field>
                    </block>
                  </value>
                </block>
              </statement>
            </block>
          </value>
        </block>
      </category>
      <xsl:call-template name="toolbox-common"/>
    </xml>
  </xsl:template>
</xsl:stylesheet>
