import {EventController} from './lib/event-controller.js';
import {DocumentExplorer} from './document-explorer.js';
import {DocumentManager} from './document-manager.js';
import {TopMenu} from './top-menu.js';
import {Tools} from './tools.js';
import {appEventRegister} from './app-event-register.js';
import {Store} from './lib/store.js';
import {DocumentSearch} from './document-search.js';

//Import Monaco registrations
import {} from './servers/iris/Language.js';
import {} from './servers/iris/CompletionItemProvider.js';
import {System} from "./servers/iris/System.js";

//TODO: Should this go into its own DOM.js file?
const $cssVar = (key,val) => document.documentElement.style.setProperty('--' + key, val);

export class App {

    static app;

    static appItemUidCounter = 0;

    static getAppItemUid() {
        App.appItemUidCounter++;
        return 'UID#' + App.appItemUidCounter;
    }

    namespace;

    constructor() {

        App.app = this;

        //set namespace
        let namespaceFromURL = new URLSearchParams(window.location.search).get('ns');
        this.namespace = (namespaceFromURL || EventController.get('Model.NameSpace') || CloudStudioAppDefault.NS || '<%=namespace%>')
        Store.setNamespace(window.location.host + ':' + this.namespace);
        EventController.ifKeyDoesNotExistCreateIt('Model.NameSpace',this.namespace,true)

        //set app title
        document.title = "DevBox : " + EventController.get('Model.NameSpace');

        //restore state
        EventController.restoreAllStoredEventData();

        //elements
        this.editSpaceEl = document.getElementById('editSpaceContainer')

        //views
        this.explorer = new DocumentExplorer();
        this.editManager = new DocumentManager();
        this.topmenu = new TopMenu();  //NB: needed to initialise menu
        this.tools = new Tools();

        //mounts
        this.editManager.mount(this.editSpaceEl)

        //add shim to prevent dragbar events from leaking into editor events
        let editShim = document.createElement('div');
        editShim.classList.add('edit-shim');
        editShim.id="edit-shim"
        this.editSpaceEl.appendChild(editShim);

        //register handlers
        this.registerEvents()
        this.registerFunctionKeys()
        this.registerMouseRightClick();

        //republish app data
        EventController.republishAllStoredEventData();

        //prevent browser from closing if there are unsaved changes
        window.addEventListener('beforeunload', (e) => {
            let hasUnsavedChanges = this.editManager.hasUnsavedChanges()
            if (hasUnsavedChanges) {
                //browsers no longer support custom pop up messages, but we can still set a message
                //and the browser will display it in the pop up
                e.returnValue = '';
                e.preventDefault();
            }
        });

    }

    registerEvents() {
        appEventRegister(this);
    }

    // === CONTEXT MENU EVENT HANDLER ===
    // Generic listener for context menu (mouse right click). If the target element of the event
    // has [ data-event="contextmenu" ] then forward the event to the AppData controller and
    // prevent the default. AppData will delegate the event to its registered handler(s).
    registerMouseRightClick() {
        window.addEventListener('contextmenu', ev => {
            if (ev.target.dataset.event === 'contextmenu') {
                EventController.publishEvent('ContextMenu',ev);
            }
            //disable it by default, this is an app not a browser session
            ev.preventDefault();
        })
    }

    registerFunctionKeys() {
        window.onkeydown = e => {
            if (e.key === 'F2') EventController.publishEvent("Compile");
        };
    }

    ImportExportCode() {
        window.open('/csp/sys/exp/%25CSP.UI.Portal.ClassList.zen?$NAMESPACE=%25SYS', '_blank').focus();
        console.log(this);
    }

    CompilePackageByName(packageName) {
        System.compileArrayOfItems(this.namespace,[packageName + '.*.cls'],'ck').then( res => {
            EventController.publishEvent('Message.Console',res.console,false);
        })
    }

    CompileClassByName(name) {
        System.compileArrayOfItems(this.namespace,[name],'ck').then( res => {
            EventController.publishEvent('Message.Console',res.console,false);
        })
    }

    CompileRoutinePackageByName(packageName) {
        System.compileArrayOfItems(this.namespace,[packageName + '.*.mac',packageName + '.*.int'],'ck').then( res => {
            EventController.publishEvent('Message.Console',res.console,false);
        })
    }

    CompileRoutineByName(name) {
        System.compileArrayOfItems(this.namespace,[name],'ck').then( res => {
            EventController.publishEvent('Message.Console',res.console,false);
        })
    }

    FindInPackageByName(name) {
        new DocumentSearch('',name + '.*.cls');
    }

    FindInRoutinePackageByName(name) {
        new DocumentSearch('',name + '.*.mac' + ',' + name + '.*.int' + ',' + name + '.*.inc');
    }

    ExportPackageByName(namespace,packageName) {
        let url = `/devbox/${namespace}/action/export/package/${packageName}`
        window.open(url,'_blank');
    }

    ExportClassByName(namespace,className) {
        let url = `/devbox/${namespace}/action/export/class/${className}`
        window.open(url,'_blank');
    }

    ExportRoutinePackageByName(name) {
    }

    ExportRoutineByName(name) {
    }

    ExportWebFolderByName(name) {
    }

    ExportWebFileByName(name) {
    }

    ImportCodeLocal(namespace,fileInput) {
        fetch(`/devbox/${namespace}/action/import`, {
            method: 'POST',
            body: fileInput.files[0],
        })
            .then(response => response.text())
            .then(data => EventController.publishEvent('Message.Console',data,false))
            .catch(error => console.error(error));
    }

    CopyClassByName(namespace,fromClassName,toClassName) {
        fetch(`/devbox/${namespace}/action/copy/class/${fromClassName}/${toClassName}`, {
            method: 'GET'
        })
            .then(response => response.text())
            .then(data => EventController.publishEvent('Message.Console',data,false))
            .catch(error => console.error(error));
    }

    RenameClassByName(namespace,fromClassName,toClassName) {
        fetch(`/devbox/${namespace}/action/rename/class/${fromClassName}/${toClassName}`, {
            method: 'GET'
        })
            .then(response => response.text())
            .then(data => EventController.publishEvent('Message.Console',data,false))
            .catch(error => console.error(error));
    }

}

//TODO: Move this code into a new home...
let GPTInputTextBox = document.getElementById("tools-gpt-input-textbox")
GPTInputTextBox.addEventListener("focus", function() {
    this.removeAttribute("placeholder");
});
GPTInputTextBox.addEventListener("blur", function() {
    if (!this.value) {
        this.setAttribute("placeholder", "ask a question");
    }
});

//keep session alive, TODO: make it stop if there is no activity for a while
window.setInterval( () => {
    let url = '/devbox/ping';
    fetch(url, {
        method: 'GET'
    })
},30000)


