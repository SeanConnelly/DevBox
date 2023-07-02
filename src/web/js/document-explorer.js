import {EventController} from './lib/event-controller.js';
import {CompletionItemDictionary} from './servers/iris/CompletionItemDictionary.js';
import {Document} from './servers/iris/Document.js'

const $div = (...cl) => { let div = document.createElement('div'); if (cl) div.classList.add(...cl); return div}

export class DocumentExplorer {

    constructor() {
        this.bindExplorerTreeEvents()
    }

    //=================================================================================================
    // DocumentExplorer Tree Events
    bindExplorerTreeEvents() {
        EventController.bindInnerTextToEvent('namespace', 'Model.NameSpace');
        this.codeTreeEl = document.getElementById('explorer-tree');
        this.codeTreeEl.addEventListener('dblclick', ev => this.onUserInteractsWithTreeItem(ev));
        this.codeTreeEl.addEventListener('touchstart', ev => this.onUserInteractsWithTreeItem(ev));
        this.codeTreeEl.addEventListener('contextmenu', ev => this.showUserExplorerTreeContextMenu(ev));
    }

    //show context menu for the document explorer tree
    showUserExplorerTreeContextMenu(ev) {
        let menu = this.getContextMenuForExplorerTreeItem();
        let group = ev.target.closest('[data-group]').dataset.group;
        let el = ev.target.closest('[data-name]');
        let name = el.dataset.name;
        if (name === undefined) return;
        if (el.classList.contains('explorer-tree-node') && (group === 'Classes')) {
            menu.innerHTML = `<div class="flex-row flex-center-items h24" onclick="DevBoxEventController.publishEvent('FindInPackageByName','${name}',false,true);">
                                <div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-search grey"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
                                <div class="flex-1 pad-left-sm pad-right-1em">Find in Package '${name}'</div>
                              </div>
                              <div class="menu-divide"></div>
                              <div class="flex-row flex-center-items h24" onclick="DevBoxEventController.publishEvent('CompilePackageByName','${name}',false,true);">
                                <div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-cpu grey"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg></div>
                                <div class="flex-1 pad-left-sm pad-right-1em">Compile Package '${name}'</div>
                              </div>
                              <div class="flex-row flex-center-items h24" onclick="DevBoxEventController.publishEvent('ExportPackageByName','${name}',false,true);">
                                <div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-download grey"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div>
                                <div class="flex-1 pad-left-sm pad-right-1em">Export Package '${name}'</div>
                              </div>`
        }
        if (el.classList.contains('explorer-tree-leaf') && (group === 'Classes')) {
            menu.innerHTML = `<div onclick="DevBoxEventController.publishMultiItemEvent('Model.DocumentsOpenForEdit','${name}',true,true)" id="">Open Class '${name}'</div>
                              <div class="menu-divide"></div>
                              <div onclick="DevBoxEventController.publishEvent('CompileClassByName','${name}',false,true)" id="">Compile Class '${name}'</div>
                              <div onclick="DevBoxEventController.publishEvent('ExportClassByName','${name}',false,true)" id="">Export Class '${name}'</div>`
                              //TODO: built prompt box, enable these and fetch the new name, server side is done
                              //<div class="menu-divide"></div>
                              //<div onclick="DevBoxEventController.publishEvent('CopyClassByName','${name}',false,true)" id="">Copy Class '${name}'</div>
                              //<div onclick="DevBoxEventController.publishEvent('RenameClassByName','${name}',false,true)" id="">Rename Class '${name}'</div>`
        }
        if (el.classList.contains('explorer-tree-node') && (group === 'Routines')) {
            menu.innerHTML = `<div onclick="DevBoxEventController.publishEvent('FindInRoutinePackageByName','${name}',false,true);" id="">Find in Package '${name}</div>
                              <div onclick="DevBoxEventController.publishEvent('CompileRoutinePackageByName','${name}',false,true);" id="">Compile Package '${name}'</div>
                              <div onclick="DevBoxEventController.publishEvent('ExportRoutinePackageByName','${name}',false,true)" id="">Export Package '${name}'</div>`
        }
        if (el.classList.contains('explorer-tree-leaf') && (group === 'Routines')) {
            menu.innerHTML = `<div onclick="DevBoxEventController.publishEvent('CompileRoutineByName','${name}',false,true)" id="">Compile Routines '${name}'</div>
                              <div onclick="DevBoxEventController.publishEvent('ExportRoutineByName','${name}',false,true)" id="">Export Routine '${name}'</div>`
        }
        if (el.classList.contains('explorer-tree-node') && (group === 'Web')) {
            menu.innerHTML = `<div onclick="DevBoxEventController.publishEvent('ExportWebFolderByName','${name}',false,true)" id="">Export Web Folder '${name}'</div>`
        }
        if (el.classList.contains('explorer-tree-leaf') && (group === 'Web')) {
            menu.innerHTML = `<div onclick="DevBoxEventController.publishEvent('ExportWebFileByName','${name}',false,true)" id="">Export Web File '${name}'</div>`
        }
        if (el.classList.contains('explorer-tree-node') && (group === 'Other')) {
            return;
        }
        if (el.classList.contains('explorer-tree-leaf') && (group === 'Other')) {
            return;
        }
        menu.style.left = ev.clientX + 'px';
        menu.style.top = ev.clientY + 'px';
        menu.style.width = 'fit-content';
        //if menu overflows bottom of screen, move menu up so its top is exactly the screen height minus the menu height
        if ((ev.clientY + menu.offsetHeight) > window.innerHeight) {
            menu.style.top = (window.innerHeight - menu.offsetHeight) + 'px';
        }
        menu.style.display = 'block';
    }

    getContextMenuForExplorerTreeItem() {
        if (document.getElementById('explorer-tree-context-menu')) return document.getElementById('explorer-tree-context-menu');
        let menu = $div('sub-menu','menu-below-right');
        menu.id = 'explorer-tree-context-menu';
        menu.style.position = 'absolute';
        menu.style.display = 'none';
        menu.style.width = '150px';
        document.body.appendChild(menu);
        menu.addEventListener('mouseleave', ev => {menu.style.display = 'none'});
        menu.addEventListener('click', ev => {menu.style.display = 'none'});
        return menu;
    }

    insertNewItemIntoTree(item) {

        //get the type name of the item type
        let type = (item.type === 'CLS') ? 'Classes' : (item.type === 'RTN') ? 'Routines' : (item.type === 'WEB') ? 'Web' : 'Other';

        //make sure that each of the items parent folders are open
        let parts = item.name.split('.');
        let name = parts[0];
        EventController.publishMultiItemEvent('explorer-folders-that-are-open',type,true);
        EventController.publishMultiItemEvent('explorer-folders-that-are-open',type + '.' + name,true);
        for (let i=1; i<(parts.length-1); i++) {
            name = name + '.' + parts[i];
            EventController.publishMultiItemEvent('explorer-folders-that-are-open',type + '.' + name,true);
        }

        //add item to tree and rebuild the HTML, TODO: Optimise this to only rebuild the HTML for the item's parent
        item.name = item.name + '.' + item.type.toLowerCase();
        this.addTreeItem(this.codeTree[type],item);
        let treeHTML = this.walkTreeMakeHTML(this.codeTree[type],type)
        document.getElementById('explorer-node-' + type).innerHTML = treeHTML;


    }

    onUserInteractsWithTreeItem(ev) {
        let el = ev.target.closest('[data-name]');
        if (el.classList.contains('explorer-tree-node-top')) this.toggleTreeFoldersOpenCloseState(el,ev);
        if (el.classList.contains('explorer-tree-node')) this.toggleTreeFoldersOpenCloseState(el,ev);
        if (el.classList.contains('explorer-tree-leaf')) EventController.publishMultiItemEvent('Model.DocumentsOpenForEdit',el.dataset.name,true);
    }

    toggleTreeFoldersOpenCloseState(el) {
        let fullName = (el.getAttribute('data-group')) ? el.getAttribute('data-group') : el.closest('[data-group]').getAttribute('data-group') + '.' + el.dataset.name;
        let icons = el.querySelector('[data-state]')
        let state = icons.dataset.state
        if (state === 'open') {
            EventController.removeMultiItemEvent('explorer-folders-that-are-open', fullName,true);
            icons.dataset.state = 'closed';
            el.lastElementChild.classList.add('explorer-tree-hidden');
            let lastChild = icons.lastElementChild;
            icons.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-chevron-right grey"><polyline points="9 18 15 12 9 6"></polyline></svg>`
            icons.appendChild(lastChild);
        } else if (state === 'closed') {
            EventController.publishMultiItemEvent('explorer-folders-that-are-open',fullName,true);
            icons.dataset.state = 'open';
            el.lastElementChild.classList.remove('explorer-tree-hidden');
            let lastChild = icons.lastElementChild;
            icons.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-chevron-down grey"><polyline points="6 9 12 15 18 9"></polyline></svg>`
            icons.appendChild(lastChild);
        }
    }

    expandAllExplorerTreeFolders() {
        let nodes = this.codeTreeEl.querySelectorAll('.explorer-tree-node');
        for (let i=0; i< nodes.length; i++) {
            let el = nodes[i];
            el.lastElementChild.classList.remove('explorer-tree-hidden');
            //el.firstElementChild.classList.remove('fa-folder');
            //el.firstElementChild.classList.add('fa-folder-open');
        }
    }

    collapseAllExplorerTreeFolders() {
        let nodes = this.codeTreeEl.querySelectorAll('.explorer-tree-node');
        for (let i=0; i< nodes.length; i++) {
            let el = nodes[i];
            el.lastElementChild.classList.add('explorer-tree-hidden');
            //el.firstElementChild.classList.add('fa-folder');
            //el.firstElementChild.classList.remove('fa-folder-open');
        }
    }

    //=================================================================================================

    swapNamespace(ns) {
        this.codeTreeEl.innerHTML = this.makeTopLevelFolder('Classes') + this.makeTopLevelFolder('Routines') + this.makeTopLevelFolder('Web') + this.makeTopLevelFolder('Other');
        document.activeElement.blur();
        this.codeTree = {Classes:{},Routines:{},Web:{},Other:{}};
        this.loadClasses(ns);
        this.loadRoutines(ns);
        this.loadWeb(ns);
        this.loadOther(ns);
    }

    makeTopLevelFolder(name) {

        let icons = {
            Classes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-box blue"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
            Routines: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-file-text green"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            Web: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-layout blue"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            Other: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-grid green"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
        }

        if (EventController.multiItemEventContains('explorer-folders-that-are-open',name)) {
            return `<div class="explorer-tree-node-top" data-group="${name}" data-name="top-level-group">
                        
                        <div class="flex-row flex-center-items">
                            <div class="pad-right-sm" data-state="open">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-chevron-down grey"><polyline points="6 9 12 15 18 9"></polyline></svg>${icons[name]}
                            </div> 
                            <div class="no-wrap">${name}</div>
                        </div>
                        
                        <div class="explorer-tree-node-reset" id="explorer-node-${name}">
                            <span class="pad-left-1em">
                                Loading...
                            </span>
                        </div>
                        
                    </div>`
        } else {
            return `<div class="explorer-tree-node-top" data-group="${name}" data-name="top-level-group">
                        
                        <div class="flex-row flex-center-items">
                            <div class="pad-right-sm" data-state="closed">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-chevron-right grey"><polyline points="9 18 15 12 9 6"></polyline></svg>${icons[name]}
                            </div> 
                            <div class="no-wrap">${name}</div>
                        </div>
                    
                        <div class="explorer-tree-node-reset explorer-tree-hidden" id="explorer-node-${name}">
                            <span class="pad-left-1em">
                                Loading...
                            </span>
                        </div>
                        
                    </div>`
        }
    }

    loadClasses(ns) {
        Document.listAllByType(ns,'CLS').then( data => {
            data.result.content.map(item =>  {
                if ((item.db.indexOf('IRIS') === 0) && (ns !== '%SYS')) return;
                if (item.db.indexOf('IRIS') === 0) CompletionItemDictionary.addClassItem(item.name);
                this.addTreeItem(this.codeTree.Classes,item);
                CompletionItemDictionary.addClassItem(item.name);
            })
            document.getElementById('explorer-node-Classes').innerHTML = this.walkTreeMakeHTML(this.codeTree.Classes,'Classes');
        })
    }

    loadRoutines(ns) {
        Document.listAllByType(ns,'RTN').then( data => {
            data.result.content.map(item => this.addTreeItem(this.codeTree.Routines,item))
            document.getElementById('explorer-node-Routines').innerHTML = this.walkTreeMakeHTML(this.codeTree.Routines,'Routines');
        })
    }

    loadWeb(ns) {
        Document.listAllByType(ns,'CSP').then( data => {
            data.result.content.map(item => this.addCspTreeItem(this.codeTree.Web,item))
            document.getElementById('explorer-node-Web').innerHTML = this.walkTreeMakeHTML(this.codeTree.Web,'Web');
        })
    }

    loadOther(ns) {
        Document.listAllByType(ns,'OTH').then( data => {
            data.result.content.map(item => this.addOtherItem(this.codeTree.Other,item))
            document.getElementById('explorer-node-Other').innerHTML = this.walkTreeMakeHTML(this.codeTree.Other,'Other');
        })
    }

    //=================================================================================================

    addTreeItem(root,item) {
        let nodes = item.name.split('.');
        let type = nodes.pop();
        nodes.push(nodes.pop() + '.' + type)
        this.addItemToTree(root,nodes,item.name);
    }

    addCspTreeItem(root,item) {
        let nodes = item.name.split('/');
        nodes.shift(); //remove first folder part as its always blank
        this.addItemToTree(root,nodes,item.name);
    }

    addOtherItem(root,item) {
        let nodes = item.name.split('.');
        let type = nodes.pop().toUpperCase();
        if (type === 'HL7') nodes = [nodes.join('.')]
        nodes.unshift(type);
        nodes.push(nodes.pop() + '.' + type)
        this.addItemToTree(root,nodes,item.name);
    }

    addItemToTree(root,nodes,fullName) {
        let name = nodes.pop();
        let folderName = '';
        let dot= '';
        nodes.map( node => {
            folderName = folderName + dot + node;
            dot = '.'
            if (root[folderName] === undefined) root[folderName] = {};
            root = root[folderName];
        })
        root['|'+name] = {"name":name,"fullName":fullName}; //add pipe prefix to separate nodes from leaves with same name
    }

    walkTreeMakeHTML(parentFolder,group) {
        let foldersHtml = '';
        let filesHtml = '';
        Object.getOwnPropertyNames(parentFolder).map( folderName => {
            let child = parentFolder[folderName];
            if (folderName.indexOf('|') !== 0) {
                foldersHtml += this.makeFolderHtmlNode(folderName,this.walkTreeMakeHTML(child,group),group);
            } else {
                filesHtml += this.makeFileHtmlNode(child.fullName,child.name);
            }
        })
        return foldersHtml + filesHtml;
    }

    makeFolderHtmlNode(folderName,subFolders,group) {
        let shortName = folderName.split('.').pop();
        let fullName = group + '.' + folderName;
        if (EventController.multiItemEventContains('explorer-folders-that-are-open',fullName)) {
            return `<div class="explorer-tree-node" data-name="${folderName}">
                  <div class="flex-row flex-center-items">
                      <div class="pad-right-sm" data-state="open">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-chevron-down grey"><polyline points="6 9 12 15 18 9"></polyline></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-folder yellow"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      </div> 
                      <div class="no-wrap">${shortName}</div>
                  </div>
                  <div class="">${subFolders}</div>
                </div>`
        } else {
            return `<div class="explorer-tree-node" data-name="${folderName}">
                  <div class="flex-row flex-center-items">
                      <div class="pad-right-sm" data-state="closed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-chevron-right grey"><polyline points="9 18 15 12 9 6"></polyline></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-folder yellow"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      </div> 
                      <div class="no-wrap">${shortName}</div>
                  </div>
                  <div class="explorer-tree-hidden">${subFolders}</div>
                </div>`
        }
    }

    makeFileHtmlNode(fileName,displayName) {
        return `<div class="explorer-tree-leaf" data-name="${fileName}">
                  <div class="flex-row flex-center-items">
                      <div class="pad-right-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-small feather-file grey"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      </div> 
                      <div class="no-wrap">${displayName}</div>
                  </div>
                </div>`
    }

    //=================================================================================================

}

