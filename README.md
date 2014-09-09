# Node4Progress

## Introduction:

With node being the ascendant and "hot" technology of the day, the need
arose to provide access to the business logic written in the PROGRESS
4GL from node. Node4Progress is bridge that allows business logic
procedures hosted on a PROGRESS appserver to be called directly from
node.

## Features:

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

## Installation and configuration

### Requirements:

To use the Node4Progress bridge the following components are required:

-   -   Node version 10.28 and up

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

## Objective

## Usage

## Developing

Created with [Nodeclipse v0.4][] ([Eclipse Marketplace][], [site][])

  []: ConfigScreenshot.png
  [Nodeclipse v0.4]: https://github.com/Nodeclipse/nodeclipse-1
  [Eclipse Marketplace]: http://marketplace.eclipse.org/content/nodeclipse
  [site]: http://www.nodeclipse.org
