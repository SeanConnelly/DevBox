import {App} from './app.js';
import {TabLayout} from "./ui/layout-tab.js";
import {Document} from "./servers/iris/Document.js";
import {EventController} from "./lib/event-controller.js";
import {EditManager} from "./edit-manager.js";
import {DialogBox} from "./ui/dialog.js"
import {DocumentTemplates} from "./servers/iris/document-templates.js";
import {System} from "./servers/iris/System.js";

//TODO: Split this class into smaller classes, in particular move UI widgets to ui folder

//tiny dom helper
const $div = (...cl) => { let div = document.createElement('div'); if (cl) div.classList.add(...cl); return div}

export class DocumentManager {

    constructor() {
        this.el = $div('fit');              //root element of the edit space
        this.tabLayoutInFocus = undefined;      //track the most recent tab layout in focus
        this.tabLayouts = {};                   //maintain a handle on all tab layouts in edit space using tab uid's
    }

    mount(el) {
        this.parentEl = el;
        this.parentEl.innerHTML = '';
        this.parentEl.append(this.el);

        let colRowRef = this.appendNewColumnAndRow()
        this.addTabLayoutToColumnRow(colRowRef)

        //editor loses focus after compile, so refocus
        EventController.on('AfterCompileOK', () => {
            window.setTimeout(() => {
                this.getTabLayoutInFocus().getTabItemInFocus().editor.focus();
            },100)
        });

    }

    //=========================================================================
    // DOCUMENT ACTIONS
    //=========================================================================
    openDocumentForEdit(docName) {
        if (this.isDocumentOpen(docName)) {
            this.giveDocumentFocus(docName);
        } else {
            let ns = EventController.get('Model.NameSpace');
            Document.open(ns,docName).then(doc => {
                let editor = new EditManager(doc);
                let tabLayoutInFocus = this.getTabLayoutInFocus();
                this.addDocumentEditorToTabLayout(tabLayoutInFocus,docName,editor)
            })
        }
    }

    saveDocumentInFocus() {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus();
        editor.save();
    }

    saveAllDocuments() {
        this.eachEditor( editor => {
            editor.save();
        })
    }

    compileDocumentInFocus() {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus();
        editor.compile();
    }

    copyDocumentInFocus() {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus();
        editor.copyDocument()
    }

    renameDocumentInFocus() {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus();
        editor.renameDocument()
    }

    compileAllOpenDocuments() {
        this.eachEditor( editor => {
            editor.compile();
        })
    }

    hasUnsavedChanges() {
        let hasChanged=false
        this.eachEditor( editor => {
            if (editor.hasChanged) hasChanged=true;
        })
        return hasChanged;
    }

    promptUserForNewDocumentName(docType) {
        let text=newItemPromptText[docType].Text;
        let extension=newItemPromptText[docType].Type
        this.promptBox = new DialogBox(`Enter New ${text} Name`,extension,docType)
    }

    makeNewDocument(docNameType) {
        let fullDocName = docNameType.name + '.' + docNameType.type.toLowerCase();
        let src = DocumentTemplates.GetTemplate(docNameType.docType,docNameType.name);
        let doc = new Document(EventController.get('Model.NameSpace'),fullDocName,src);
        let editor = new EditManager(doc);
        this.addDocumentEditorToTabLayout(this.getTabLayoutInFocus(),fullDocName,editor);
        editor.editor.focus();
        editor.save(true);
        //add to open documents list
        EventController.addMultiItemEvent('Model.DocumentsOpenForEdit',fullDocName);
    }

    closeDocument(docName) {
        this.eachEditor( (editor,tabLayout) => {
            if (docName === editor.doc.name) {
                if (editor.hasChanged) {
                    //TODO, check document is different and prompt user to save first
                    //console.log('document has changed, prompt user before removing');
                    document.activeElement.blur();
                    window.alert('Save documents before closing');
                    EventController.publishEvent('Message.Console','Unsaved change are preventing closure',false);
                } else {
                    tabLayout.deleteTab(docName);
                    EventController.removeMultiItemEvent('Model.DocumentsOpenForEdit',docName);
                    this.removeEmptyTabLayouts();
                }
            }
        })
    }

    isDocumentOpen(docName) {
        let isOpen=false;
        this.eachEditor( editor => {
            if (docName === editor.doc.name) isOpen=true;
        })
        return isOpen;
    }

    giveDocumentFocus(docName) {
        this.eachEditor( (editor,tabLayout) => {
            if (docName === editor.doc.name) {
                tabLayout.setTabItemInFocusByName(docName)
                tabLayout.moveTabToStart(docName)
            }
        })
    }

    //=========================================================================
    // TAB LAYOUTS - TODO: Move into a UI tab class
    //=========================================================================
    addTabLayoutToColumnRow(colRowRef) {
        let tabLayout = new TabLayout({
            position: 'top',
            overflow: true,
            group: 'editors',
            uid : App.getAppItemUid(),
            parentInfo : {'colRowRef':colRowRef}  //TODO: review this
        })
        this.tabLayouts[tabLayout.uid] = tabLayout
        tabLayout.mount(colRowRef.rowEl);
        this.tabLayoutInFocus = {'uid': tabLayout.uid, 'colRowRef': colRowRef};
        return tabLayout;
    }

    addDocumentEditorToTabLayout(tabLayout,docName,documentEditor) {
        tabLayout.addNewTabToLayout(docName,documentEditor,this.getTabContextMenuFragmentForDocument(docName));
    }

    getTabContextMenuFragmentForDocument(docName) {

        //------ VIEW INT CODE ------
        //TODO: Move into IrisDocument class <<<<<<<<<<<<<<<<<<<<<<<<
        let intMenuItems = '';
        if (docName.indexOf('.cls') > -1 ) {

            //TODO: Temp solution, replace with call to fetch full list <<<<<<<<<<<<<<<<<<<<
            let intDocName = docName.replace('.cls','.1.int');

            intMenuItems = intMenuItems + `<div onclick="DevBoxEventController.publishMultiItemEvent('Model.DocumentsOpenForEdit','${intDocName}',true,true);">View .int Code !</div>`
        }

        //------ VIEW CLS CODE (e.g. from DTL)
        //TODO: If document is a DTL, then add option to view the cls code
        if (docName.indexOf('.dtl') > -1 ) {
            let intDocName = docName.replace('.dtl','.cls');
            intMenuItems = intMenuItems + `<div onclick="DevBoxEventController.publishMultiItemEvent('Model.DocumentsOpenForEdit','${intDocName}',true,true);">View .cls Code</div>`
        }



        //------ VIEW PAGE IN BROWSER
        console.log(this.getEditorInFocus())
        //let classExtendsList = this.getEditorInFocus().doc.getClassExtendsList();
        //console.log('classExtendsList',classExtendsList);
        if (docName.indexOf('Extends %CSP.Page') > -1 ) {
            //TODO: Temp solution, replace with call to fetch full list

            intMenuItems = intMenuItems + intMenuItem + `<div onclick="DevBoxEventController.publishMultiItemEvent('Model.OpenWebPageInBrowser','${docName}',true,true);">View CSP Page in Browser</div>`
        }

        return `<div class="menu-divide"></div>${intMenuItems}`

    }

    setTabLayoutInFocusByTabInfo(tabInfo) {
        let tabLayout = this.tabLayouts[tabInfo.tabLayoutUid];
        this.tabLayoutInFocus = {'uid': tabInfo.tabLayoutUid, 'colRowRef': tabLayout.parentInfo.colRowRef};
    }

    editorDidGetFocus(ev) {
        let tabLayout = this.tabLayouts[ev.tabLayout.id];
        this.tabLayoutInFocus = {'uid': ev.tabLayout.id, 'colRowRef': tabLayout.parentInfo.colRowRef};
    }

    tabLayoutGotFocus(tabLayout) {
        this.tabLayoutInFocus = {'uid': tabLayout.el.id, 'colRowRef': tabLayout.parentInfo.colRowRef};
    }

    //=========================================================================
    // MANAGE OUTER ELEMENTS FOR EDIT SPACE (COLUMNS AND ROWS FOR TABS) - TODO: Move into a UI layout class
    //=========================================================================
    appendNewColumnAndRow() {

        //append new column
        let colEl = $div('column')
        colEl.id = App.getAppItemUid();
        this.el.append(colEl)

        //append new row (only one row for now)
        let rowEl = $div('row')
        rowEl.id = App.getAppItemUid();
        colEl.append(rowEl);

        this.calculateColumnWidths();

        return {"colEl":colEl,"rowEl":rowEl}

    }

    calculateColumnWidths() {
        let colCount = this.el.childElementCount;
        for (let i=0; i<colCount; i++) {
            let col = this.el.childNodes[i];
            col.style.width = (100/colCount) + '%';
        }
    }

    prependNewColumnAndRow() {

    }

    isColumnInFocusTheLastColumn() {
        let tabLayoutInFocus = this.getTabLayoutInFocus();
        let focusedColumn = tabLayoutInFocus.parentInfo.colRowRef.colEl
        let lastColumn = this.el.lastElementChild;
        return (lastColumn === focusedColumn);
    }

    isColumnInFocusTheFirstColumn() {

    }

    //Edit space can have more than one tab layout, return the layout that's in focus, or was most recently in focus
    getTabLayoutInFocus() {
        let tabLayout = this.tabLayouts[this.tabLayoutInFocus.uid];
        if (tabLayout === undefined) {
            tabLayout = this.tabLayouts[Object.keys(this.tabLayouts)[0]]
            this.tabLayoutGotFocus(tabLayout);
        }
        return tabLayout;
    }

    //TODO
    getEditorInFocus() {
        return this.getTabLayoutInFocus().getTabItemInFocus();
    }

    //TODO
    gotoCode(data) {
        console.log('GOTO CODE',data)
    }

    //TODO
    previewCode(data) {
        console.log('GOTO CODE',data)
    }

    //=========================================================================
    // HANDLE TAB MOVE ACTIONS - TODO: Move into the UI layout class
    //=========================================================================
    moveRight(docName) {
        let currentTabLayout = this.getTabLayoutInFocus();
        let nextTabLayout = undefined;
        if (this.isColumnInFocusTheLastColumn()) {
            let colRowRef = this.appendNewColumnAndRow()
            nextTabLayout = this.addTabLayoutToColumnRow(colRowRef)
        } else {
            let currentColumn = currentTabLayout.parentInfo.colRowRef.colEl;
            let nextColumn = currentColumn.nextElementSibling
            let layoutId = nextColumn.firstElementChild.firstElementChild.id;
            nextTabLayout = this.tabLayouts[layoutId];
        }
        let view = currentTabLayout.children[docName];
        this.addDocumentEditorToTabLayout(nextTabLayout,docName,view)
        currentTabLayout.remove(docName);
        this.removeEmptyTabLayouts();
        this.tabLayoutInFocus = nextTabLayout;
    }

    removeEmptyTabLayouts(keepOne = true) {
        this.eachTabLayout(tabLayout => {
            if (tabLayout.isEmpty() && (this.isOnlyTabLayout() === false)) {
                tabLayout.parentInfo.colRowRef.colEl.remove();
                delete this.tabLayouts[tabLayout.uid];
                this.calculateColumnWidths();
            }
        })
    }

    moveLeft(name) {
        //TODO
    }

    //=========================================================================
    // ACTIONS FOR CONTROLLING MONACO EDITOR
    //=========================================================================
    toggleMiniMap() {
        let isEnabled = EventController.toggleBooleanItemEvent('Model.MiniMap');
        this.eachEditor( editor => {
            if (editor.type === 'monaco') editor.showMiniMap(isEnabled)
        })
    }

    toggleLineNumbers() {
        let isOnOrOff = EventController.toggleBooleanItemEvent('Model.LineNumbers');
        this.eachEditor( editor => {
            if (editor.type === 'monaco') editor.showLineNumbers(isOnOrOff)
        })
    }

    setTheme(themeName) {
        if (themeName === 'light') {
            document.documentElement.setAttribute('light-theme', 'on');
            this.eachEditor( editor => {
                if (editor.type === 'monaco') editor.setThemeLight()
            });
        } else {
            document.documentElement.setAttribute('light-theme', 'off');
            this.eachEditor( editor => {
                if (editor.type === 'monaco') editor.setThemeDark()
            });
        }
    }

    foldAll() {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus().editor;
        editor.trigger('fold','editor.foldAll')
    }

    foldLevel(level) {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus().editor;
        editor.trigger('fold','editor.foldLevel' + level)
    }

    unfoldAll() {
        let editor = this.getTabLayoutInFocus().getTabItemInFocus().editor;
        editor.trigger('unfold','editor.unfoldAll')
    }

    setTextSize(size) {
        console.log('size',size)
        if (size === 'Small') document.body.style.fontSize = '10px';
        if (size === 'Normal') document.body.style.fontSize = '12px';
        if (size === 'Large') document.body.style.fontSize = '14px';
        if (size === 'ExtraLarge') document.body.style.fontSize = '16px';
    }

    selectAll() {
        this.getTabLayoutInFocus().getTabItemInFocus().selectAll();
    }

    undo() {
        this.getTabLayoutInFocus().getTabItemInFocus().undo();
    }

    redo() {
        this.getTabLayoutInFocus().getTabItemInFocus().redo();
    }

    cut() {
        this.getTabLayoutInFocus().getTabItemInFocus().cut();
    }

    copy() {
        this.getTabLayoutInFocus().getTabItemInFocus().copy();
    }

    paste() {
        this.getTabLayoutInFocus().getTabItemInFocus().paste();
    }

    delete() {
        this.getTabLayoutInFocus().getTabItemInFocus().delete();
    }

    find() {
        this.getTabLayoutInFocus().getTabItemInFocus().find();
    }

    replace() {
        this.getTabLayoutInFocus().getTabItemInFocus().replace();
    }

    //=========================================================================
    // UTILS
    //=========================================================================
    eachEditor(cb) {
        for (const uid in this.tabLayouts) {
            let tabLayout = this.tabLayouts[uid];
            for (let key in tabLayout.children) cb(tabLayout.children[key],tabLayout);
        }
    }

    eachTabLayout(cb) {
        for (const uid in this.tabLayouts) {
            let tabLayout = this.tabLayouts[uid];
            cb(tabLayout);
        }
    }

    isOnlyTabLayout() {
        let len = Object.keys(this.tabLayouts).length;
        return (len === 1);
    }

    //=========================================================================
    // STATUS BAR / CONSOLE WINDOW
    //=========================================================================
    toggleStatusWindow(forceOpen = false) {
        let statusWindow = document.getElementById('statusWindow');
        let statusWindowState = statusWindow.dataset.state;
        if (forceOpen === true && statusWindowState === 'open') return;
        let editSpace = document.getElementById('editSpaceContainer');
        if (forceOpen === true) statusWindow.dataset.state = 'closed';
        if (statusWindowState === 'open') {
            editSpace.style.bottom = '24px';
            statusWindow.style.height = '22px';
            statusWindow.dataset.state = 'closed'
        } else {
            editSpace.style.bottom = '142px';
            statusWindow.style.height = '140px';
            statusWindow.dataset.state = 'open'
        }
    }



    overflowItemSelected(name) {
        this.getTabLayoutInFocus().moveTabToStart(name);
        this.getTabLayoutInFocus().setTabItemInFocusByName(name);
    }

    viewOtherCode() {
        let tab = this.getTabLayoutInFocus().getTabItemInFocus();
        console.log(tab);
    }

    launchUtility(utilName) {
        let ns = EventController.get('Model.NameSpace');
        if (utilName === 'Management Portal') window.open(`/csp/sys/%25CSP.Portal.Home.zen?$NAMESPACE=${ns}`);
        if (utilName === 'SQL DocumentExplorer') window.open(`/csp/sys/exp/%25CSP.UI.Portal.SQL.Home.zen?$NAMESPACE=${ns}`);
        if (utilName === 'Class Reference') window.open(`/csp/documatic/%25CSP.Documatic.cls?LIBRARY=${ns}`);
        if (utilName === 'Production Configuration') window.open(`/csp/healthshare/${ns}/EnsPortal.ProductionConfig.zen?$NAMESPACE=${ns}`);
        if (utilName === 'Production Monitor') window.open(`/csp/healthshare/za/EnsPortal.ProductionMonitor.zen?$NAMESPACE=${ns}`);
        if (utilName === 'System Monitor') window.open(`/csp/sys/%25CSP.UI.Portal.EnsembleMonitor.zen?$NAMESPACE=${ns}`);
        if (utilName === 'Message Viewer') window.open(`/csp/healthshare/${ns}/EnsPortal.MessageViewer.zen?$NAMESPACE=${ns}`);
        if (utilName === 'Web Terminal') window.open(`/terminal/?NS=${ns}`);
    }

    launchHelp(helpName) {
        if (helpName === 'InterSystems Documentation') window.open(`https://docs.intersystems.com/`);
        if (helpName === 'InterSystems Community') window.open(`https://community.intersystems.com/`);
        if (helpName === 'InterSystems Discord') window.open(`https://discord.com/channels/698987699406766170/707503143092486145`);
        if (helpName === 'CloudStudio GitHub') window.open(`https://github.com/SeanConnelly/CloudStudio`);
        if (helpName === 'CloudStudio Discord') window.open(`https://discord.com/channels/985944773078683649/985944773078683652`);
    }

    minimiseExplorer() {
        let explorerPanel=document.getElementById('explorerPanel');
        let editSpaceContainer=document.getElementById('editSpaceContainer');
        let statusWindow=document.getElementById('statusWindow');
        if (explorerPanel.dataset.state === 'closed') {
            let width = explorerPanel.style.width;
            if (width === '') width = '220px';
            explorerPanel.style.left = '0';
            editSpaceContainer.style.left = (parseInt(width,10) + 2) + 'px';
            statusWindow.style.left = (parseInt(width,10) + 2) + 'px';
            explorerPanel.dataset.state = 'open'
        } else {
            explorerPanel.style.left = '-1000px';
            editSpaceContainer.style.left = '0';
            statusWindow.style.left = '0'
            explorerPanel.dataset.state = 'closed';
        }
    }

    toggleOpenCloseStateOfToolsPanel(state) {
        let toolsPanel=document.getElementById('toolsPanel');
        let toolsDragBar=document.getElementById('toolsDragbar');
        let editSpaceContainer=document.getElementById('editSpaceContainer');
        let statusWindow=document.getElementById('statusWindow');
        if (state === 'open') {
            let width = toolsPanel.dataset.width || '220px';
            console.log('width = ' + width);
            toolsPanel.style.width = width;
            toolsDragBar.style.right = (parseInt(width,10) + 2) + 'px';
            editSpaceContainer.style.right = (parseInt(width,10) + 2) + 'px';
            statusWindow.style.right = (parseInt(width,10) + 2) + 'px';
            toolsPanel.dataset.state = 'open';  //TODO: placeholders to move style logic to CSS
        } else {
            toolsPanel.dataset.width = toolsPanel.style.width;
            toolsPanel.style.width = 0;
            editSpaceContainer.style.right = '0';
            statusWindow.style.right = '0';
            toolsPanel.dataset.state = 'closed'; //TODO: placeholders to move style logic to CSS
        }
    }

    explorerDragbarStart() {
        //large tree causes repaint jank, shift explorer hard right and then recalc at last second to prevent jank
        document.getElementById('edit-shim').style.visibility='visible';
        let explorerPanel=document.getElementById('explorerPanel');
        explorerPanel.style.width = '497px';
        document.addEventListener("mousemove", DocumentManager.explorerDragbarMove);
        document.addEventListener("mouseup", DocumentManager.explorerDragbarDone)
        document.addEventListener("mouseleave", DocumentManager.explorerDragbarDone)
    }

    static explorerDragbarDone(ev) {
        document.getElementById('edit-shim').style.visibility='hidden';
        let explorerPanel=document.getElementById('explorerPanel');
        DocumentManager.explorerDragbarMove(ev)
        explorerPanel.style.width = explorerPanel.dataset.movewidth;
        document.removeEventListener("mousemove",DocumentManager.explorerDragbarMove);
        document.removeEventListener("mouseup",DocumentManager.explorerDragbarDone);
        document.removeEventListener("mouseleave",DocumentManager.explorerDragbarDone);
    }

    static explorerDragbarMove(ev) {
        let explorerPanel=document.getElementById('explorerPanel');
        let editSpaceContainer=document.getElementById('editSpaceContainer');
        let statusWindow=document.getElementById('statusWindow');
        let explorerDragbar=document.getElementById('explorerDragbar');
        if ((ev.clientX>160) && (ev.clientX<500)) {
            explorerPanel.dataset.movewidth = (ev.clientX - 1) + 'px';
            editSpaceContainer.style.left = (ev.clientX + 1) + 'px';
            statusWindow.style.left = (ev.clientX + 1) + 'px';
            explorerDragbar.style.left = (ev.clientX - 3) + 'px';
        }
    }

    outputDragbarStart() {
        document.getElementById('edit-shim').style.visibility='visible';
        let statusWindow=document.getElementById('statusWindow');
        if (statusWindow.dataset.state === 'closed') return;
        document.addEventListener("mousemove", DocumentManager.outputDragbarMove);
        document.addEventListener("mouseup", DocumentManager.outputDragbarDone);
        document.addEventListener("mouseleave", DocumentManager.outputDragbarDone);
    }

    static outputDragbarMove(ev) {
        let editSpaceContainer=document.getElementById('editSpaceContainer');
        let statusWindow=document.getElementById('statusWindow');
        if ((ev.clientY<(window.innerHeight-100)) && (ev.clientY>(window.innerHeight/3))) {
            editSpaceContainer.style.bottom = `calc(100vh - ${(ev.clientY - 1)}px`;
            statusWindow.style.height = `calc(100vh - ${(ev.clientY + 1)}px`;
        }
    }

    static outputDragbarDone(ev) {
        document.getElementById('edit-shim').style.visibility='hidden';
        document.removeEventListener("mousemove",DocumentManager.outputDragbarMove);
        document.removeEventListener("mouseup",DocumentManager.outputDragbarDone);
        document.removeEventListener("mouseleave",DocumentManager.outputDragbarDone);
    }


    toolsDragbarStart() {
        document.getElementById('edit-shim').style.visibility='visible';
        document.addEventListener("mousemove", DocumentManager.toolsDragbarMove);
        document.addEventListener("mouseup", DocumentManager.toolsDragbarDone)
        document.addEventListener("mouseleave", DocumentManager.toolsDragbarDone)
    }

    static toolsDragbarDone(ev) {
        console.log('done')
        document.getElementById('edit-shim').style.visibility='hidden';
        let toolsPanel=document.getElementById('toolsPanel');
        DocumentManager.toolsDragbarMove(ev)
        //toolsPanel.style.width = toolsPanel.dataset.movewidth;
        document.removeEventListener("mousemove",DocumentManager.toolsDragbarMove);
        document.removeEventListener("mouseup",DocumentManager.toolsDragbarDone);
        document.removeEventListener("mouseleave",DocumentManager.toolsDragbarDone);
    }

    static toolsDragbarMove(ev) {
        console.log('move')
        let toolsPanel=document.getElementById('toolsPanel');
        let editSpaceContainer=document.getElementById('editSpaceContainer');
        let statusWindow=document.getElementById('statusWindow');
        let toolsDragbar=document.getElementById('toolsDragbar');
        let offsetWidth=document.getElementById("viewport").offsetWidth - ev.clientX;
        if ((offsetWidth>160) && (offsetWidth<500000)) {
            //toolsPanel.dataset.movewidth = (offsetWidth - 1) + 'px';
            toolsPanel.style.width = (offsetWidth - 1) + 'px';
            editSpaceContainer.style.right = (offsetWidth + 1) + 'px';
            statusWindow.style.right = (offsetWidth + 1) + 'px';
            toolsDragbar.style.right = (offsetWidth - 3) + 'px';
        }
    }

    ViewCSPPage(prompt) {
        //get name of open document
        let docName = this.getTabLayoutInFocus().getTabItemInFocus().doc.name;
        let namespace = EventController.get('Model.NameSpace');
        System.GetNameSpaceDefaultUrlPath(namespace).then( (url) => {
            window.open(url + '/' + docName, '_blank').focus();
        });
    }

    WatchCSPPage(prompt) {
        //get name of open document
        let docName = this.getTabLayoutInFocus().getTabItemInFocus().doc.name;
        let namespace = EventController.get('Model.NameSpace');
        System.GetNameSpaceDefaultUrlPath(namespace).then( (url) => {
            let fullURL = 'DevBox.Pages.ViewCspWatchPage.cls?urlToPage=' + url + '/' + docName;
            //encode url
            fullURL = encodeURI(fullURL);
            window.open(fullURL, '_blank').focus();
        });
    }

}

let newItemPromptText = {
    "Registered": {Text:"Registered Class",Type:"CLS"},
    "Persistent": {Text:"Persistent Class",Type:"CLS"},
    "Registered XML": {Text:"Registered Class",Type:"CLS"},
    "Persistent XML": {Text:"Persistent Class",Type:"CLS"},
    "Serial": {Text:"Serial Class",Type:"CLS"},
    "Abstract": {Text:"Serial Abstract",Type:"CLS"},
    "CSP": {Text:"CSP Class",Type:"CLS"},
    "Routine": {Text:"ObjectScript Routine",Type:"MAC"},
    "Macro": {Text:"Macro File",Type:"INC"},
    "Intermediary": {Text:"Intermediary Routine",Type:"INT"}
}










/*

Developer Notes
===============

App
 ↪ DocumentManager
    ↪ ColumnLayout
       ↪ Column (collection)
          ↪ RowLayout
             ↪ Row (collection)
                ↪ TabLayout
                   ↪ Tab (collection)
                      ↪ EditManager
*/
