# **Node4Progress**

# Table of contents:

This documentations contains of the following sections:

1.  Introduction

2.  Features

3.  Installation and configuration

4.  Usage

    1.  Using the handler approach

    2.  Using the dynamic call approach

5.  Code samples

# 1. Introduction:

With node being the ascendant and "hot" technology of the day, the need
arose to provide access to the business logic written in the PROGRESS
4GL from node. Node4Progress is bridge that allows business logic
procedures hosted on a PROGRESS appserver to be called directly from
node.

# 2. Features:

Node4Progress provides 2 ways to access the appserver and 2 ways to
consume the data.

-   Ways of calling and appserver procedure

    1.  Handler call

        -   A handler program is an appserver procedure that implements
            a specific input-output parameter signature

    2.  Dynamic call

        -   Using this approach you can call any appserver procedure
            with any input-output parameter signature

-   Ways of consuming the data

    1.  As a JSON object

    2.  As a dataset and/or temp-table object

        -   Using this approach the data is consumed in javascript
            objects that have similar attributes, methods and features
            as the PROGRESS prodataset and temp-table objects

All the features mentioned above will be covered in detail in the
section "how to use"

# 3. Installation and configuration

### Requirements:

To use the Node4Progress bridge the following components are required:

-   Node version 10.28 and up

    -   Java version 1.6 and up

    -   appserver installation Progress version 10.2B and up

### Installation steps:

By the time you are reading this you have probably alrewady figured out
that node4progress is installed by executing one of the following
statements from the command line.

-   npm install node4progress -g

    -   for a global install

-   npm install node4progress

    -   for an install in the local directory

After the install execute the following steps:

1.  If you are using a global install for node4progress set to
    NODE\_PATH environment variable to where node4progress is installed

    -   On UNIX, LINUX and MAC this would most likely be

        -   /usr/local/lib/node\_modules

            -   The command therefore would be

                -   export NODE\_PATH=/usr/local/lib/node\_modules

2.  Copy the files in the 4GlCode/BaseCode in the propath of your
    appserver

    -   These programs must be accesible directly without having to
        specify a sub-directory

3.  If you want to use the provided javascript examples

    1.  Copy the 4GlCode/Examples directory into the propath of your
        appserver

        -   They must be accessible as Examples/[program-name.p]

    2.  Configure your appserver to connect to the sports database (not
        the sports2000 database)

    3.  Create a directory node4progressTest and copy the javascript
        examples in the Examples directory to this directory

        1.  If you are using a local install then copy the node4progress
            directory into the node4progressTest directory

### Configuration steps:

Execute the following steps:

1.  Copy the config.json file into your node4progressTest directory

    -   The contents of this file look as follows:

    <!-- -->

        {
        "AppserverUrl":"APPSERVERDC://192.168.56.101:4090",
        "AppserverUserName": "",
        "AppserverUserPassword": "",
        "AppserverSessionModel": "State-less",
        "WinstoneSvrPort": 8087
        } 

    -   Configure the Appserver url, user name, password and session
        model to the correct parameters for you appserver

    -   The WinstoneSrverPort needs to an available port on your local
        machine

        -   Most likely you can leave this parameter alone

### Testing the configuration:

From the command line in the node4progressTest directory type in the
following command:

-   node configTest.js

Open up a browser and point to the following url:

-   <http://localhost:8085/TurboNode>

If this results in a web page that looks like this then yoiur
configuration is correct:

![][]

# 4. Usage

The node4progress module provides the following 2 ways calling business
logic on the appserver:

1.  Handler call

    -   A handler is an appserver procedure that adheres to a specific
        input/output paremeter signature

2.  Dynamic appsrever call

    -   Using the dynamic appserver call approach you any appserver
        procedure with any input/output signature can be called

## *4.1 Using the handler approach *

A handler is an appserver procedure with an input/output signature that
looks as follows:

    {dsOrder.i}

    DEFINE INPUT  PARAMETER iInputPars  AS LONGCHAR   NO-UNDO. 
    DEFINE OUTPUT PARAMETER oOutputPars AS LONGCHAR   NO-UNDO. 
    DEFINE OUTPUT PARAMETER DATASET FOR dsOrder. 
    DEFINE OUTPUT PARAMETER oErrMsg     AS CHARACTER  NO-UNDO.

-   The suggested use for the 1st parameter (iInputPars) is to pass a
    set of input parameters as name value pairs

-   The suggested use for the 2nd parameter is to pass a set of output
    parameters as name/value pairs

-   The 3rd dataset parameter can be any valid dataset.

-   The suggested use of the 4th parameter is pass an error message if
    the handler logic failed

The output parameters of the handler procedure are translated into a
JSON structure passed as a string:

    {
       "OutputPars": "...",   
       "ErrMsg": "...",
       "[DatasetNm]" : {...} 
    }

In node the code for invoking a handler looks like this:

    var conf = require("./config/config.json");
    var node4progress = require("node4progressHttp")(null);
    var handler="handlers/CustomerHandler.p";
    var inputPars = 'NumCustomersToPull=2';
    node4progress.callHandler(handler,inputPars,true,function(err,result){
         console.log("CUSTOMER HANDLER RESULT");
         console.log(result);
         jsonObj=JSON.parse(result);
    }); 

## *4.2 Using the dynamic call approach:*

Invoking any appserver call with any parameter structure is a 3 step
process:

1.  Defining the appsever procedure to call using the setAppsvrProc
    method which takes the following input parameters

    1.  ProcName

        -   -   Program name of the appserver procedure)

    2.  InternalProcName

        -   -   Internal procedure name to call for a persistent
                appserver procedure

    3.  IsPersistent

        -   -   True when calling a persistent appserver procedure,
                otherwise falls

    4.  IncludeMetaSchema

        -   -   If you want to use the node4progress dataset
                functionality pass true otherwise false

2.  Defining each parameter using the setParameter method which takes
    the following input parameters

    1.  ParName

        -   -   Parameter name (controls how this parameter will be
                represented in the Json output)

    2.  ParDataType

        -   -   Datatype of parameter (character, integer, decimal,
                date, datatime, datetime-tz, dataset-handle,
                table-handle, longchar)

    3.  ParIoMode

        -   -   Input, output, input-output

    4.  ParValue

        -   -   For an input or input-output parameter you can pass the
                input value here. For a dataset-handle or a table-handle
                the input must be provided in write-json format

    5.  SchemaProvider

        -   -   When passing a dataset-handle or table-handle as input
                or input-output you must provide the name of a schema
                provider program. What a schema provider is will be
                explained below in a separate section

3.  Executing the appserver procedure using the invoke method

    1.  The only input parameter that the invoke method takes is the
        callback procedure which should have the following input
        parameters

        1.  Error

            -   If the appserver fails to execute, for instance because
                of a connection problem, then an error message
                explaining the problem will be passed in this parameter

        2.  Result

            -   The out parameters of the appserver procedure translated
                into a JSON string will be returned in this parameter

                -   What this JSON structure looks like is explained
                    below

### *Translating the output parameters of a dynamic appserver call into a JSON structure*

The output of a dynamic appserver procedure looks as follows:

    {
     "output" : {
                  "CharOutputParameter"         : "...",
                  "IntOutputParameter"          : 100,
                  "DecOutputParameter"          : 210.50,
                  "tableHandleOutputParameter"  : {...},
                  "DatasetHandleOutputParameter": {...} 
                },
     "error"  : "...."
    }

The important things to understand about this JSON structure are:

-   At the root level of the JSON structure there are 2 nodes

    -   "output"

        -   Contains the contents of input-output and output parameters
            of the appserver procedure

            -   In the order they are defined in the parameter signature

            -   Table-handle and dataset-handle parameters are passed in
                write-json format

    -   "error"

        -   If an error occured while executing the appserver procedure
            (e.g. a appserver connection eror) then this parameter will
            contain error information

### *Using schemaproviders when passing a dataset-handle of table-handle as input*

When passing temp-table data or dataset data as input in write-json
format to an appserver procedure the table-handle or dataset-handle
needs to have a metaschema structure before the appserver procedure is
invoked. This as opposed to calling an appserver procedure that passes
the data as output only where the metaschema structure can be inherited
from the program that is called.

So in order to call an appserver procedure that takes a temp-table of a
dataset as input or input-output you need to create a schema provider
procedure. A schema provider is a program that does nothing other than
pass the structure of the dataset/temp-table as output.

Below is an example of a schema provider for a temp-table:

    /*------------------------------------------------------------------------
     File        : CustUpdTt-SchemaProvider.p Purpose     :
     ------------------------------------------------------------------------*/
    / ************************  Definitions  *********************** / {Examples/CustUpdTt.i}
    DEFINE OUTPUT PARAMETER TABLE FOR ttCustomer.

Below is an example of a schema provider for a dataset:

    /*------------------------------------------------------------------------
     File        : CustUpdDs-SchemaProvider.p Purpose     :
     ------------------------------------------------------------------------*/
    / ************************  Definitions  *********************** / {Examples/CustUpdDs.i}
    DEFINE OUTPUT PARAMETER DATASET FOR dsCustomer.  

# 5. Code Samples:

## Code sample for calling a handler program:

    var conf = require("./config/config.json");
    var node4progress = require("node4progressHttp")(conf);
    var handler="handlers/CustomerHandler.p";
    var inputPars = 'NumCustomersToPull=2';

    node4progress.callHandler(handler,inputPars,true,function(err,result){
        console.log("CUSTOMER HANDLER RESULT");
        console.log(result);
    });

## Code sample for a dynamic appserver call:

    var conf = require("./config/config.json");
    var node4progress = require("node4progressHttp")(conf);
    node4progress.setAppsvrProc("Examples/CustUpdDs.p","",false,true);

    node4progress.setParameter(
                  "Imode",
                  "character",
                  "input",
                  "GetCustomer",
                  "");
    node4progress.setParameter(
                  "iInputParameters",
                  "character",
                  "input",
                  "mode=FromTo|cust-num-from=1100|cust-num-to=9999","");
    node4progress.setParameter(
                  "dsCustomer",
                  "dataset-handle",
                  "input-output",
                  "",
                  "examples/CustUpdDs-SchemaProvider.p");
    node4progress.setParameter(
                  "oOutputPars",
                  "character",
                  "output",
                  "",
                  "");
    node4progress.setParameter(
                  "ErrMsg",
                  "character",
                  "output",
                  "",
                  "");
    node4progress.invoke(function(err,result){
        console.log(result);
    };

  []: ConfigScreenshot.png
