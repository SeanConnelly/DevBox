# DevBox IDE

## Overview

Introducing DevBox, the evolution of the prototype IDE previously called CloudStudio. This new version represents a substantial refactor, packed with an array of innovative features currently in alpha.

Watch this video and let me know what you think...

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/3pao-TwPHkc/0.jpg)](https://www.youtube.com/watch?v=3pao-TwPHkc)

Features of DevBox include:

- Enhanced syntax highlighting for ObjectScript classes
- Autocomplete functionality
- Dynamic code explorer
- Import and export support
- Code search across multiple files
- Integrated Code runners
- Integrated Code runners upon compilation with support for continuous unit testing
- A built in Code Assistant that leverages on GPT
- Live CSP preview solution

The primary goal of DevBox is to offer a lightweight, efficient IDE that functions effortlessly behind firewalls, within deeply nested RDP enclaves, and on secured servers.

Our secondary objective is to optimize DevBox for fast-paced development, continual testing, simplified version control, and to facilitate controlled deployments of ObjectScript solutions.

We also have immediate plans to introduce a secondary "connection manager" project, designed to simplify the process of installing and managing DevBox across a multitude of servers.

## Manual Installation Instructions

Step 1 - Download the DevBox installation files to your IRIS server

1. Using these two links,
   [DevBox Class Files](https://raw.githubusercontent.com/SeanConnelly/DevBox/main/build/DevBox.xml)
   and
   [DevBox Web Files](https://raw.githubusercontent.com/SeanConnelly/DevBox/main/build/DevBoxWebFiles.zip)
   , right click and use "Save Link As" to download and save these files to a temporary location.

Step 2 - Install the DevBox class files

1. Decide which namespace you want to install DevBox into.
2. Import "DevBox.xml" into that namespace.

Step 3 - Configure the DevBox web application

1. Select a folder location where you want to host the DevBox web files from
2. Unzip "DevBoxWebFiles.zip" into that folder
3. Open a terminal and switch to the install namespace
4. In terminal run the following command, passing in the path to that folder.

```
namespace> do ##class(DevBox.Util.DevBoxInstaller).Install("C:\apps\devbox")
```

Step 4 - Test the application

1. Open a browser and enter the following URL, making sure you replace the host and port to match the host and port of IRIS. You should now have a working DebBox IDE!

```
http://host:port/devbox/DevBox.Index.cls
```

Additional Installation Notes

1. DevBox can be installed into any namespace.  You should avoid using system namespaces, so choose one that you have previously created. Optionally you could create a new namespace just for DevBox, but this is not strictly required.
2. There are no restrictions on where you install the web files. You could for instance create a new folder in the base CSP folder of your InterSystems IRIS installation, or just select a location of your choice. The only important aspect is that you accurately pass in the path to this folder into the Install method.
3. Make sure you unzip the web files directly into your selected folder. Unzipping files can sometimes create a new child folder, if this happens just move the files directly back into the correct location.
4. The install method will create two web applications "/devbox" and "/devboxapi" . The "/devbox" application will be configured to point directly to the web files location that you created.

## Where can I find the documentation?

The complete documentation for DevBox is currently in development and will be made available soon.
