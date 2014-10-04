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

6.  Using

7.  The node4progress dataset object

    1.  Object structure of the node4progress dataset object

    2.  Installing and running the node4progress dataset examples

8.  Troubleshooting

# 1. Introduction:

With node being the ascendant and "hot" technology of the day, the need
arose to provide access to the business logic written in the PROGRESS
4GL from node. Node4Progress is the bridge that allows business logic
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

-   Make sure that your login account has the necesary credentials to
    install node4progress

    -   Preferably run the installation as root or as administrator

### Installation steps:

By the time you are reading this you have probably already figured out
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
        "WinstoneSvrPort": 8087,
        "DateFormat":"mm/dd"
        } 

    -   Configure the Appserver url, user name, password and session
        model to the correct parameters for you appserver

        -   The appserver url must be in the following format

            -   For an appserver connection routed through the name
                server

                -   Appserver://[Host-name/Ip-address]:[NS-Port\#]/AppserverNm

                -   e.g. Appserver://localhost:5162/Sports

            -   For a direct appserver connection

                -   APPSERVERDC://[Host-name/Ip-address]:[Port-number]

                -   e.g. APPSERVERDC://localhost:4090"

    -   The WinstoneSrverPort needs to an available port on your local
        machine

        -   Most likely you can leave this parameter alone

    -   The DateFormat parameter controls how dates are going to be
        formatted

        -   Use "mm/dd" for the American format

        -   use "dd/mm" for the European format

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

## *4.1 Using the handler approach*

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

        -   Program name of the appserver procedure)

    2.  InternalProcName

        -   Internal procedure name to call for a persistent appserver
            procedure

    3.  IsPersistent

        -   True when calling a persistent appserver procedure,
            otherwise false

    4.  IncludeMetaSchema

        -   If you want to use the node4progress dataset functionality
            pass true otherwise false

2.  Defining each parameter using the setParameter method which takes
    the following input parameters

    1.  ParName

        -   Parameter name (controls how this parameter will be
            represented in the Json output)

    2.  ParDataType

        -   Datatype of parameter (character, integer, decimal, date,
            datatime, datetime-tz, dataset-handle, table-handle,
            longchar)

    3.  ParIoMode

        -   Input, output, input-output

    4.  ParValue

        -   For an input or input-output parameter you can pass the
            input value here. For a dataset-handle or a table-handle the
            input must be provided in write-json format

    5.  SchemaProvider

        -   When passing a dataset-handle or table-handle as input or
            input-output you must provide the name of a schema provider
            program. What a schema provider is will be explained below
            in a separate section

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

# 7. The node4progress dataset object

If data needs to be passed as input to an appserver procedure that
expects either a dataset or a temp-table as input then it is essential
that the data is presented to the appserver in exactly to correct
format. For this reason node4progress provides a dataset object. If you
interact with the data through the methods provided with the dataset
object then the data will be maintained in exactly the correct format.

## 7.1 Object structure of the node4progress dataset object

Node4progress comes with a dataset object that is modelled after the
PROGRESS prodataset object.

The node4progress dataset architecture comes with the following objects,
attributes and methods.

+-----------------------+-----------------------+-----------------------+-----------------------+
| **Object**            | \*\*Methods/Attribute | **Purpose**           | **Input Parameters**  |
|                       | s                     |                       |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
| Dataset               | \$                    | Returns a temp-table  | -\>TableName          |
|                       |                       | object: Example:      |                       |
|                       |                       | Tt=dataset.\$(TtName) |                       |
|                       |                       | ;                     |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | copyDataset           | Returns a copy of the | -\>isEmpty (when true |
|                       |                       | dataset (optionally   | an empty copy of the  |
|                       |                       | empty)                | dataset is returned   |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | emptyDataset          | Removes all records   | No input parameters   |
|                       |                       | from the dataset      |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | writeJson             | Returns contents of   | No input parameters   |
|                       |                       | the dataset as a JSON |                       |
|                       |                       | string                |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
| TempTable             | available             | returns true if a     | No input parameters   |
|                       |                       | record in the         |                       |
|                       |                       | temp-table currently  |                       |
|                       |                       | has focus             |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | bufferCreate          | Creates a record in   | No input parameters   |
|                       |                       | the temp-table and    |                       |
|                       |                       | returns a buffer      |                       |
|                       |                       | object with the newly |                       |
|                       |                       | created record        |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | bufferCopy            | Copies the values of  | -\>CopySource         |
|                       |                       | a JSON object or a    | --\>Either a JSON     |
|                       |                       | buffer object passed  | object or a buffer    |
|                       |                       | to the currently      | object                |
|                       |                       | selected record       |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | bufferDelete          | Deletes the currently | No parameters         |
|                       |                       | selected record from  |                       |
|                       |                       | the temp-table        |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | copyTempTable         | Returns a copy of the | -\>isEmpty (when true |
|                       |                       | temp-table object     | an empty copy of the  |
|                       |                       | (optionally an empty  | temp-table is         |
|                       |                       | copy)                 | returned              |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | emptyTempTable        | Removes all records   | No parameters         |
|                       |                       | from the temp-table   |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | forEach               | Loops through the     | -\>callback (call     |
|                       |                       | records in the        | back function that    |
|                       |                       | temp-table            | will receive a buffer |
|                       |                       |                       | object as input)      |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | findFirst             | retrieves the first   | No input parameters   |
|                       |                       | record in the         |                       |
|                       |                       | temp-table and        |                       |
|                       |                       | returns a buffer      |                       |
|                       |                       | object with that      |                       |
|                       |                       | record                |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | findLast              | retrieves the first   | No input parameters   |
|                       |                       | record in the         |                       |
|                       |                       | temp-table and        |                       |
|                       |                       | returns a buffer      |                       |
|                       |                       | object with that      |                       |
|                       |                       | record                |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | writeJson             | Returns a JSON string | No input parameters   |
|                       |                       | with the contents of  |                       |
|                       |                       | the temp-table        |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
| Buffer                | \$                    | Returns a bufferField | -\>FieldNm (Field     |
|                       |                       | object                | name of the buffer    |
|                       |                       | bufField=buffer.\$(fi | field to retrieve)    |
|                       |                       | eldNm);               |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | display               | Returns a formmated   | -\>ListOfFields (a    |
|                       |                       | string with a number  | list of fields to     |
|                       |                       | of fields that are    | include in the string |
|                       |                       | formatted as dictated | to formatted string   |
|                       |                       | by the format         | to be returned)       |
|                       |                       | attributes in the     |                       |
|                       |                       | individual fields     |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | writeJson             | Returns the contents  | No input parameters   |
|                       |                       | of the currently      |                       |
|                       |                       | selected record as a  |                       |
|                       |                       | JSON string           |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
| BufferField           | \$                    | Returns the value of  | -\>AttributeNm (Name  |
|                       |                       | the requested         | of the attribute to   |
|                       |                       | BufferField attribute | retrieve)             |
|                       |                       | (valid attributes are |                       |
|                       |                       | buffer-value, value,  |                       |
|                       |                       | format, initial,      |                       |
|                       |                       | label & screenValue)  |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | bufferValue           | Changes the           | -\>bufferValue (the   |
|                       |                       | BufferField value of  | bufferField value to  |
|                       |                       | the currently         | assign to this field) |
|                       |                       | selected field        |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+
|                       | setAttr               | sets the value of a   | -\>AttrName (Name of  |
|                       |                       | BufferField attribute | the attribute to set) |
|                       |                       | (valid attributes are | -\>AttrValue (value   |
|                       |                       | buffer-value, value,  | to set this attribute |
|                       |                       | format, initial,      | to)                   |
|                       |                       | label & screenValue)  |                       |
+-----------------------+-----------------------+-----------------------+-----------------------+

## 7.2 Installing and running the node4progress dataset examples

A set of examples is provided that show how to use the node4progress
dataset object.

Node4Progress comes with configuration that allows for these examples to
be run against an appserver running on an Amazon clould computer.

-   How to navigate the data in a dataset object

    -   testDatasetCustomer.js, testDatasetOrder.js, testDatasetInvoice

-   Using the CallHandler approach

    -   testCallHandler.js

-   How to do a set of basic add, update, delete operations with a
    dataset

    -   custAddDs.js, custUpdDs.js & custDeleteDs.js

-   How to do a set of basic add, update, delete operations with a
    temp-table

    -   custAddTt.js, custUpdTt.js & custDeleteTt.js

Each example lists in the header which dataset methods it uses and
contains comments what each statement accomplishes.

To run this examples execute the following steps:

-   Make sure that that you that you have installed and configured
    node4progress as explained in paragraph 3 "Installation and
    configuration"

-   Optionally create an appserver that connects to the sports database
    (not the sports2000 database)

    -   The examples are coded against the sports database and will not
        works against the sports2000 database

-   Alternativlely you can run the examples against an appserver in the
    cloud on IP address

    -   The connection parameters are defined in the
        ./config/config.json file

-   Open up a DOS or a UNIX shell and type in the following command

    -   export NODE\_PATH=[node\_modules directory where node4progress
        is installed]

        -   For example if you have installed node4progress locally in
            the /var/tmp directory

            -   export NODE\_PATH=/var/tmp/node\_modules

-   Edit the following configuration file

    -   node\_modules/node4progress/Examples/config/config.json

        -   Configure the following parameters to point to your
            appserver

            -   AppserverUrl

            -   AppserverUserName

            -   AppserverUserPassword

            -   AppserverSessionModel

                -   For more details see paragraph 3

-   Change directory to the examples directory

    -   Again assuming that you have installed node4progress in the
        /var/tmp directory

        -   cd /var/tmp/node\_modules/node4progress/Examples

-   Now you can execute the examples from the command line as follows

    -   To execute testDatasetCustomer.js

        -   node testDatasetCustomer.js

            -   In order to exit out of the example press CTRL-C

    -   To execute custAddDs.js

        -   node custAddDs.js

# 8. Troubleshooting

The following are known issues that are currently being addressed:

-   On exiting a program that uses node4progress it sometimes takes a
    while for the winstone port to be released

    -   This may result in the following error when you start up the
        program

            Exception: Error: connect ECONNREFUSED 
            Error: connect ECONNREFUSED 
                at errnoException (net.js:904:11) 
                at Object.afterConnect [as oncomplete] (net.js:895:19) 
            Exception: Error: socket hang up Error: socket hang up 
                at createHangUpError (http.js:1472:15) 
                at Socket.socketCloseListener (http.js:1522:23) 
                at Socket.EventEmitter.emit (events.js:117:20) 
                at TCP.close (net.js:465:12) 

        -   This error resolves itself

            -   When you run the program again the error will disappear

  []: ConfigScreenshot.png
