import {App} from "./app.js";
import {EventController} from "./lib/event-controller.js";
import {Store} from "./lib/store.js";
import {Watcher} from "./watcher.js";

export class Console {

    historyPointer = 0;

    mousedownTime;

    constructor() {

        if (this.mousedownTime === undefined) {
            document.querySelector('#consoleOutput').addEventListener('mousedown', (e) => {
                this.mousedownTime = new Date().getTime();
            });
            document.querySelector('#consoleOutput').addEventListener('mouseup', (e) => {
                const mouseupTime = new Date().getTime();
                if (mouseupTime - this.mousedownTime > 200) {
                    //user trying to select text
                } else {
                    //user clicked
                    this.giveConsoleFocus();
                }
            });
            this.mousedownTime = 0;
        }
    }

    runCommandInConsole(code) {
        App.app.editManager.toggleStatusWindow(true);
        let input = document.getElementById('console-input');
        input.value = code;
        //trigger enter key event on input box
        let ev = new KeyboardEvent('keydown',{'key':'Enter'});
        input.dispatchEvent(ev);
    }

    giveConsoleFocus() {
        App.app.editManager.toggleStatusWindow(true);
        document.getElementById('console-input').focus();
    }

    placeCursorAtEnd(inputElement) {
        let valueLength = inputElement.value.length;
        inputElement.focus();
        inputElement.setSelectionRange(valueLength, valueLength);
    }

    onConsoleInputKey(ev) {
        ev.preventDefault();
        if (ev.key === 'Enter') {
            this.onConsoleInputEnter(ev);
        }
        if (ev.key === 'ArrowUp') {
            this.onConsoleArrowUp(ev);
        }
        if (ev.key === 'ArrowDown') {
            this.onConsoleArrowDown(ev);
        }
    }

    //increment historyPointer
    //get the command at historyPointer and write it to the input field at ev target
    onConsoleArrowUp(ev) {
        if (this.historyPointer < this.getHistoryStoreLength()) this.historyPointer++;
        ev.target.value = this.getHistoryItemByLocation(this.historyPointer);
        this.placeCursorAtEnd(ev.target);
    }

    //decrement historyPointer
    //get the command at historyPointer and write it to the input field at ev target
    onConsoleArrowDown(ev) {
        if (this.historyPointer > 0) this.historyPointer--;
        ev.target.value = this.getHistoryItemByLocation(this.historyPointer);
        this.placeCursorAtEnd(ev.target);
    }

    displayHelp() {
        //help is defined at the bottom of this file
        EventController.publishEvent('Message.Console',help,false);
    }

    onConsoleInputEnter(ev) {
        let input = ev.target.value.trim();

        if (input === 'help') {
            this.displayHelp();
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input === 'config') {
            input = 'zwrite ^DevBox.Config';
        }

        //TODO: need to make sure you can only ZN into a namespace that exists
        //if (input.toLowerCase().startsWith('zn')) {
        //    let namespace = input.substring(3).trim();
        //    EventController.publishEvent('SwapNamespace',namespace,false);
        //    ev.target.value = '';
        //    this.placeCursorAtEnd(ev.target);
        //    return;
        //}

        if (input === 'history') {
            this.displayHistory();
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input === 'history delete all') {
            this.deleteHistory();
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input.toLowerCase().startsWith('history delete')) {
            let historyDeleteLocation = Number(input.split(' ')[2]);
            //check if historyDeleteLocation is a number
            if (isNaN(historyDeleteLocation)) {
                EventController.publishEvent('Message.Console','history delete command requires a number',false);
                ev.target.value = '';
                this.placeCursorAtEnd(ev.target);
                return;
            }
            input = this.deleteHistoryItemByLocation(historyDeleteLocation);
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            this.displayHistory();
            return
        }

        if (input.toLowerCase().startsWith('history')) {
            let historyLocation = Number(input.split(' ')[1]);
            if (isNaN(historyLocation)) {
                EventController.publishEvent(`Message.Console','history command requires a number (${historyLocation})`,false);
                ev.target.value = '';
                this.placeCursorAtEnd(ev.target);
                return;
            }
            ev.target.value = this.getHistoryItemByLocation(historyLocation);
            this.placeCursorAtEnd(ev.target);
            this.displayHistory();
            return
        }

        if (input.toLowerCase().startsWith('!')) {
            let historyLocation = Number(input.substring(1));
            if (isNaN(historyLocation)) {
                EventController.publishEvent(`Message.Console','history command requires a number (${historyLocation})`,false);
                ev.target.value = '';
                this.placeCursorAtEnd(ev.target);
                return;
            }
            input = this.getHistoryItemByLocation(historyLocation);
        }

        if (input === 'clear') {
            this.clearConsole();
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input.toLowerCase().startsWith('watch')) {
            Watcher.watch(input.substring(6));
            ev.target.value = '';
            EventController.publishEvent('Message.Console',"Watching",false);
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input === 'unwatch') {
            Watcher.unwatch();
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input.toLowerCase().startsWith('download')) {
            let filePath = btoa(input.substring(9));
            let url = `/devboxapi/${encodeURIComponent(App.app.namespace)}/download/${filePath}`;
            this.downloadFile(url);
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        if (input.toLowerCase().startsWith('git')) {
            this.runGitCommand(ev,input);
            return;
        }

        if (input.toLowerCase().startsWith('upload')) {
            let filePath = input.substring(7);
            let uploadFileElement = document.createElement('div');
            let text = document.createElement('div');
            text.innerText = `Request to upload file to server at location: e:\Temp . Use the following input to select and upload your file(s)`;
            uploadFileElement.appendChild(text);
            let fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.style.width = '100%';
            fileInput.style.marginTop = '1em';
            fileInput.onchange = (ev) => {
                //remove file input element
                uploadFileElement.innerText = 'Uploading files...'
                //post each file individually to the server at /devboxapi/{namespace}/upload/:filename, posting the file in the body of the request
                for (let i = 0; i < ev.target.files.length; i++) {
                    let file = ev.target.files[i];
                    let url = `/devboxapi/${encodeURIComponent(App.app.namespace)}/upload/${btoa(filePath)}/${btoa(file.name)}`;
                    fetch(url,{
                        method : 'POST',
                        body : file
                    }).then(response => {
                        return response.text();
                    }).then(outputText => {
                        EventController.publishEvent('Message.Console',outputText,false);
                    }).catch(err => {
                        EventController.publishEvent('Message.Console',"Failed to upload " + file.name,false);
                    });

                }
            }
            uploadFileElement.appendChild(fileInput);
            let msg = {
                type : "element",
                data : uploadFileElement
            }
            EventController.publishEvent('Message.Console',msg,false);
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
            return;
        }

        this.runConsoleCommand(ev,input);
    }

    downloadFile(url) {
        let link = document.createElement('a');
        link.href = url;
        link.download = 'filename.ext';
        link.click();
    }

    runGitCommand(ev, code) {
        let gitCommand = btoa(code);
        let url = `/devboxapi/${encodeURIComponent(App.app.namespace)}/git/${gitCommand}`;
        fetch(url).then(response => {
            return response.text();
        }).then(outputText => {
            EventController.publishEvent('Message.Console',outputText,false);
            ev.target.value = '';
            this.placeCursorAtEnd(ev.target);
        })
    }

    runConsoleCommand(ev, code) {
        if (code==="") {
            EventController.publishEvent('Message.Console'," ",false);
            this.placeCursorAtEnd(ev.target);
            return;
        }
        this.historyPointer = 0;
        this.addInputToHistoryStore(code);
        let url = `/devboxapi/${encodeURIComponent(App.app.namespace)}/console/`;
        EventController.publishEvent('Message.Console',App.app.namespace + '> ' + code,false);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: code
        })
            .then(response => {
                const contentType = response.headers.get("content-type");
                return response.text()
            })
            .then(outputText => {
                ev.target.value = '';
                ev.target.focus();
                let msg = { data: outputText, type: 'text'};
                //if the first three characters of code is 'sql' then set the type to 'html'
                if (code.trim().toLowerCase().startsWith('sql')) msg.type = 'html';
                if (code.trim().toLowerCase().startsWith('zj')) msg.type = 'json';
                if (code.trim().toLowerCase().startsWith('zw')) msg.type = 'zwrite';
                EventController.publishEvent('Message.Console',msg,false);
            })
            .catch(err => {
                ev.target.value = '';
                this.placeCursorAtEnd(ev.target);
            });
    }

    addInputToHistoryStore(input) {
        let inputs  = Store.getItemAsArray('console.inputs');
        inputs.unshift(input);
        if (inputs.length > 500) inputs.pop();
        Store.setItem('console.inputs',inputs);
        this.deduplicateHistoryStore();
    }

    //from zero to last, check for duplicate entries, remove them if
    //1. the entry is adjacent to the previous entry
    //2. the entry appears more then three times
    deduplicateHistoryStore() {
        let inputs  = Store.getItemAsArray('console.inputs');
        let previousInput = '';
        let countTracker = {}
        let newInputs = [];
        inputs.forEach( input => {
            countTracker[input] = countTracker[input] || 0;
            if (input === previousInput) {
                //do nothing
            } else {
                countTracker[input]++;
                if (countTracker[input] < 4) {
                    newInputs.push(input);
                }
            }
            previousInput = input;
        })
        Store.setItem('console.inputs',newInputs);
    }

    displayHistory() {
        let inputs  = Store.getItemAsArray('console.inputs');
        inputs.reverse();
        let history = '';
        inputs.forEach( (input,i) => {
            history += (inputs.length - i) + '. ' + input + '\n';
        })
        EventController.publishEvent('Message.Console',history,false);
    }


    getHistoryItemByLocation(location) {
        let inputs  = Store.getItemAsArray('console.inputs');
        return inputs[location-1] || '';
    }

    getHistoryStoreLength() {
        let inputs  = Store.getItemAsArray('console.inputs');
        return inputs.length;
    }

    deleteHistoryItemByLocation(location) {
        let inputs  = Store.getItemAsArray('console.inputs');
        inputs.splice(location-1,1);
        Store.setItem('console.inputs',inputs);
        return '';
    }

    clearConsole() {
        let outputWindow = document.getElementById('consoleOutput');
        outputWindow.innerHTML = '';
    }

    deleteHistory() {
        Store.setItem('console.inputs',[]);
    }

    outputToConsole(msg) {

        //console.log(msg);
        let outputWindow = document.getElementById('consoleOutput');
        //DevBoxEventController.publishEvent('StatusWindow','output',false,true)

        //output non objects directly to console, this is for simple strings and maybe numbers
        if (typeof msg !== 'object') this.outputTextToConsole(msg,outputWindow);

        //if it's an object, check if it's a message object, this will have a type and data property
        //currently there are three messages types, text, html and json
        //if it's a plain object, then output it as a json string
        //if it's an array, then dump the array directly to HTML
        if (typeof msg === 'object') {
            //calculate type
            let type = msg.type || 'object';
            if (type === 'object' && Array.isArray(msg)) type = 'array';
            //direct to correct output function
            if (type === 'text') this.outputTextToConsole(msg.data,outputWindow);
            if (type === 'html') this.outputHtmlToConsole(msg.data,outputWindow);
            if (type === 'element') this.outputElementToConsole(msg.data,outputWindow);
            if (type === 'json') this.outputJSONToConsole(msg.data,outputWindow);
            if (type === 'object') this.outputObjectToConsole(msg,outputWindow);
            if (type === 'array') this.outputArrayToConsole(msg,outputWindow);
            if (type === 'zwrite') this.outputZWriteToConsole(msg.data,outputWindow);
            if (type === 'console') this.outputArrayToConsole(msg.data,outputWindow);
        }

        //make sure the bottom of the console is always visible
        outputWindow.scrollTop = outputWindow.scrollHeight
    }

    outputTextToConsole(data,outputWindow) {
        let pre = document.createElement('pre');
        //pre.innerText = data;
        //strip out terminal commands, experimental, not sure if this is a good idea, but let's see how it goes
        //TODO: Make the console resilient to different types, spaces and so on
        pre.innerText = data.replace(/\x1B\[\d+m/g, '')
        //pre.innerHTML = data.replace(/\x1B\[\d+m/g, '')
        pre.classList.add('pad-top-1em');
        outputWindow.appendChild(pre);
    }

    outputObjectToConsole(data,outputWindow) {
        let pre = document.createElement('pre');
        pre.innerText = JSON.stringify(data,null,2);
        pre.classList.add('pad-top-1em');
        outputWindow.appendChild(pre);
    }

    outputHtmlToConsole(data,outputWindow) {
        let div = document.createElement('div');
        div.innerHTML = data;
        div.classList.add('pad-top-1em');
        outputWindow.appendChild(div);
    }

    outputArrayToConsole(data,outputWindow) {
        let html = '<br>';
        data.forEach( item => {
            html = html + item + '<br>';
        })
        let div = document.createElement('div');
        div.innerHTML = html
        div.classList.add('pad-top-1em');
        outputWindow.appendChild(div)
    }

    outputJSONToConsole(data,outputWindow) {
        let pre = document.createElement('pre');
        //convert data to an object if it's a string
        if (typeof data === 'string') data = JSON.parse(data);
        pre.innerText = JSON.stringify(data,null,2);
        pre.classList.add('pad-top-1em');
        outputWindow.appendChild(pre);
    }

    outputZWriteToConsole(data,outputWindow) {
        let pre = document.createElement('pre');
        pre.innerText = data;
        pre.classList.add('pad-top-1em');
        outputWindow.appendChild(pre);
    }

    outputElementToConsole(element,outputWindow) {
        let div = document.createElement('div');
        div.appendChild(element);
        div.classList.add('pad-top-1em');
        outputWindow.appendChild(div);
    }

}

const help = `
Function Keys
-------------
F1 - within the editor opens the editor help menu
F2 - Compiles the current code
F3 - Find in the current editor
F4 - Opens console and place cursor in input box

Console Commands for light file operations with the OS (experimental)
---------------------------------------------------------------------
ls / dir <directory> - list the contents of the specified directory on the server
download <file> - download the specified file from the server
upload <file> - upload a file to the <file> location, this will open a file dialog to select the file to upload

Console Commands
----------------
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
`