# DevBox IDE

## Latest Updates

Added interactive console that includes the command "help", this will display the console help shown below.

This includes experimental support for running git commands. To use this, git bin needs to be in the environment path on Windows (not tested on Linux yet). The only caveat is that its not interactive, so if git prompts for user inputs, its not going to show up in the console. Git will also run under the IRIS user account, so git push might not work if its prompting for security actions. Main motivation is to do "light" repetative tasks such as add, commit and push so there is little motivation to make it fully interactive at this stage, will consider in the future. Also, it needs to know where the project is, this needs to be set in a global config variable. This does mean only one git project per namespace. This will improve when IRIS Projects is implemented.

```
^DevBox.Config("git-project")="E:\Projects\DevBox"
```

## Roadmap

Development is fast and breaking at the moment. Expect bugs and issues until it gets to a more stable beta version.

The road to Beta...

1. Complete all menu items - Save As, Rename, View Other, Move Left
2. Build an awesome templating solution for File -> New
3. Keep improving the console, adding new features such as custom run commands, command chaining, reactive delogger
4. Auto complete is 50% done, but needs a lot of work now to make it perfect
5. Make projects a first class feature of the IDE.
6. Keep refactoring the code.

Future roadmaps to come.

## Code Assistant

This is a parallel effort at the moment. The roadmap is to keep working and experimenting with prompt engineering to fully understand how and where LLM's can improve ObjectScript developer experience.

To open the code assistant click the icon in top right corner. Using the code assistant requires an OpenAI API token. The assistant will tell you where to put it. 

The solution currently lets you interact with highlighted source code with 4 options...

* Complete this code
* Create comments for this code
* Explain this code
* Review this code

Complete this code can be hit and miss. The more guiding information you put into comments, the better the outcome.

One thought is to work on a One-Shot seeding solution that is able to pre qualify the prompt and embed just the right ObjectScript code examples / meta information to improve results.

## Console Help

Note, the console is a command runner, its not a terminal. All state is lost between commands. All terminal escapes will be filtered out. For a fully featured terminal consider using WebTerminal.

### Function Keys
F1 - within the editor opens the editor help menu

F2 - Compiles the current code

F3 - Find in the current editor

F4 - Opens console and place cursor in input box


### Console Commands for light file operations with the OS (experimental)
ls / dir <directory> - list the contents of the specified directory on the server

download <file> - download the specified file from the server

upload <file> - upload a file to the <file> location, this will open a file dialog to select the file to upload


### Console Commands
help - display this help

clear - clear the console

config - display the devbox configuration for this namespace

history - display the command history

history <number> - show / edit the command at the specified history location

!<number> - run the command at the specified history location

history delete <number> - delete the command at the specified history location

history delete all - delete all history

sql <sql> - run the SQL command on the server

zj / zjson <objectscript> - run the ObjectScript command and returns the output as JSON

<objectscript> - run the ObjectScript command on the server (this has no session context)

git <git command> - run the git command on the server

watch <command-or-objectscript> - run the command when there is a compile event, this is useful for running unit tests

unwatch - stop watching for compile events

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

## ZPM Installation Instructions

Install DevBox via ZPM using

```
zpm devbox
```

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
