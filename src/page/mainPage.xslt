<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns="http://www.w3.org/1999/xhtml">
  <xsl:import href="toolboxDemo.xslt"/>
  <xsl:import href="toolboxTest.xslt"/>
  <xsl:import href="toolboxGuide.xslt"/>
  <xsl:import href="dialogsForGuide.xslt"/>

  <xsl:param name="bundledLibs" select="false"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <title>SparqlBlocks Demo</title>

        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css" />

        <link rel="stylesheet" type="text/css" href="css/style.css"/>
        <xsl:if test="not($bundledLibs)">   
          <script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>

        </xsl:if>
        <style>
        .blocklyToolboxDiv{
          background-color: white !important;
          border: #ccc solid 1px;
          border-radius: 0 0 8px 0;
          overflow: hidden !important;
        }
        .keywords{
          color: #770097;
        }
        .variable{
          color:#2260C4;
        }
        .string{
          color:#00521C;
        }
        .prefix{
          color:#FF9842;
        }
        .url{
          color:#42916B;
        }
        .play-button{
          width: 40px;
          height:40px;
          box-sizing: border-box;
          color: #1a73e8;
          cursor: pointer;
          display: inline-block;
          font: 500 14px / 36px var(--font-family);
          padding: 0 16px;
          position: absolute;
          right: 60px;
          bottom: 40px;
        }
        #blocklyDiv{
          float: left !important;
          height: 100% !important;
          width: 130% !important;
        }
        .blocklyFlyoutBackground {
            fill: #39272e38 !important;
        }
        .operate{
          height:60%;
          width:100%;
          display:flex;
          position:relative;
        }
        .main{
          height:100%;
          width:100%;
        }
        #code{
          height:100%;
          width:40%;
          font-family: serif;
          padding:30px 20px;
          font-size:16x;
        }
        #result{
          width:100%;
          height:40%;
        }
        #table{
          width:100%;
          font-family:"Roboto";
          height:100%;
        }
        .tableHead{
          display:flex; height: 40px; background-color: #f1f1f1; font-weight:bold; width: 100%;
          align-items:center;
          font-size:15px;
        }
        .tableRow{
          display:flex; height: 40px; width: 100%;
          align-items:center;
          border-bottom:solid 1px rgba(224,224,224,1);
        }
        .td{
          padding-left:10px;
          line-height: 1.43;
          letter-spacing: 0.01071em;
        }
        .title{
          width:100%;
          height:35px;
          background-color:#93AFC4;
          font-size: 18px;
          font-weight: 600;
          display:flex;
          align-items:center;
          color:white;
          padding:5px;
        }
        </style>

      </head>
      <body>
      <div class="main">
        <div class="operate">
          <div id="execute" class="play-button"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="50" width="50" version="1.1" y="0px" x="0px" viewBox="0 0 72.900002 81.900002" aria-hidden="true"><path id="queryIcon" d="m69.6 35.2-60.3-34.3c-2.2-1.2-4.4-1.2-6.4 0s-2.9 3.4-2.9 5.6v68.8c0 2.2 1.2 4.4 2.9 5.6 1 0.5 2.2 1 3.4 1s2.2-0.5 2.9-1l60.3-34.3c2.2-1.2 3.4-3.4 3.4-5.6s-1.1-4.3-3.3-5.8z"></path><path id="loadingIcon" d="m61.184 36.167-48.73-27.719c-1.7779-0.96976-3.5558-0.96976-5.172 0-1.6163 0.96976-2.3436 2.7476-2.3436 4.5255v55.599c0 1.7779 0.96976 3.5558 2.3436 4.5255 0.80813 0.40407 1.7779 0.80813 2.7476 0.80813 0.96975 0 1.7779-0.40406 2.3436-0.80813l48.73-27.719c1.7779-0.96976 2.7476-2.7476 2.7476-4.5255s-0.88894-3.475-2.6668-4.6872z" fill="none"></path></svg></div>
          <div id="blocklyDiv"></div>
          <div type="text" id='code' style="
              overflow:scroll;
              background-color:white;
              
          ">

          </div>
        </div>
        <div id="result">
          <div class="title">Query Result</div>
          <div id="table" style="
              background-color: white;
              overflow-x:scroll;
              display: block;
          ">
        
        </div>
        </div>
      </div>
        
        <xsl:call-template name="toolbox-demo"/>
        <xsl:call-template name="toolbox-test"/>
        <xsl:call-template name="toolbox-guide"/>

        <div id="dialogShadow" class="dialogAnimate"></div>
        <div id="dialogBorder"></div>
        <div id="dialog"></div>

        <div id="flash-messages" class="flash-messages"></div>

        <xsl:call-template name="dialogs-for-guide"/>
        
        <script src="js/sparqlblocks.min.js"></script>
      </body>
    </html>
  </xsl:template>

  <xsl:output method="html" encoding="utf-8" indent="yes"/>

</xsl:stylesheet>
