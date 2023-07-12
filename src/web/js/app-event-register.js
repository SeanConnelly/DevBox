import {EventController} from "./lib/event-controller.js";
import {DocumentSearch} from "./document-search.js";

export function appEventRegister(app)  {

    // ----- APP EVENTS -----
    EventController.on('ExportCode', () => app.ImportExportCode());
    EventController.on('ImportCode', () => app.ImportExportCode());
    EventController.on('ReloadPage', () => window.location.reload());
    EventController.on('ResetPage', () => {localStorage.clear();window.location.reload()});
    EventController.on('ToggleFullScreen', () => (!document.fullscreenElement) ? document.body.requestFullscreen() : document.exitFullscreen() );
    EventController.on('SwapNamespace', (ns) => window.location = `${window.location.href.split('?')[0]}?ns=${ns}` );
    EventController.on('Model.AccentColor', color => $cssVar('appPrimaryColor', 'var(--' + color + ')'));
    EventController.on('FindInFiles', () => new DocumentSearch('',''));

    // ----- EDITING EVENTS -----  //TODO: Refactor events that do not belong to editManager, make this one file great and the rest of the app follows suit
    EventController.on('ShowLineNumbers', toggle => app.editManager.toggleLineNumbers());
    EventController.on('ShowMiniMap', toggle => app.editManager.toggleMiniMap());
    EventController.on('StatusWindow', (content) => app.editManager.toggleStatusWindow(content));
    EventController.on('Save', () => app.editManager.saveDocumentInFocus());
    EventController.on('SaveAll', () => app.editManager.saveAllDocuments());
    EventController.on('Compile', () => app.editManager.compileDocumentInFocus());
    EventController.on('CompileAllOpen', () => app.editManager.compileAllOpenDocuments());
    EventController.on('FoldLevel', (level) => app.editManager.foldLevel(level));
    EventController.on('FoldAll', () => app.editManager.foldAll());
    EventController.on('UnfoldAll', () => app.editManager.unfoldAll());
    EventController.on('SetTabItemInFocusByName', (tabInfo) => app.editManager.setTabLayoutInFocusByTabInfo(tabInfo));
    EventController.on('Prompt User For New Document', (docType) => app.editManager.promptUserForNewDocumentName(docType));
    EventController.on('MakeNew', (docNameType) => app.editManager.makeNewDocument(docNameType));
    EventController.on('OverflowItemSelected', (item) => app.editManager.overflowItemSelected(item.dataset.name) );
    EventController.on('TabLayoutGotFocus', (tl) => app.editManager.tabLayoutGotFocus(tl));
    EventController.on('ViewOtherCode', () => app.editManager.viewOtherCode());
    EventController.on('LaunchUtility', (utilName) => app.editManager.launchUtility(utilName));
    EventController.on('LaunchHelp', (helpName) => app.editManager.launchHelp(helpName));
    EventController.on('TextSize', (size) => app.editManager.setTextSize(size));
    EventController.on('MinimiseExplorer', () => app.editManager.minimiseExplorer());
    EventController.on('MinimiseTools', (state) => app.editManager.toggleOpenCloseStateOfToolsPanel(state));
    EventController.on('ExplorerDragbar', () => app.editManager.explorerDragbarStart());
    EventController.on('ToolsDragbar', () => app.editManager.toolsDragbarStart());
    EventController.on('OutputDragbar', () => app.editManager.outputDragbarStart());
    EventController.on('SelectAll', () => app.editManager.selectAll());
    EventController.on('Undu', () => app.editManager.undo());
    EventController.on('Redo', () => app.editManager.redo());
    EventController.on('Cut', () => app.editManager.cut());
    EventController.on('Copy', () => app.editManager.copy());
    EventController.on('Paste', () => app.editManager.paste());
    EventController.on('Delete', () => app.editManager.delete());
    EventController.on('Find', () => app.editManager.find());
    EventController.on('Replace', () => app.editManager.replace());
    EventController.on('ViewCSPPage', () => app.editManager.ViewCSPPage());
    EventController.on('WatchCSPPage', () => app.editManager.WatchCSPPage(prompt));
    EventController.on('GotoCode', (data) => app.editManager.gotoCode(data));
    EventController.on('PreviewCode', (data) => app.editManager.previewCode(data));
    EventController.on('Model.DocumentsOpenForEdit', docName => app.editManager.openDocumentForEdit(docName) );
    EventController.on('Message.EditorDidGetFocus', (ev) => app.editManager.editorDidGetFocus(ev));
    EventController.on('Model.Appearance', themeName => app.editManager.setTheme(themeName));
    EventController.on('Message.Console', (data) => app.editManager.outputToConsole(data));
    EventController.bindInnerTextToEvent('CursorPosition',"Message.CursorPosition", data => `${data.lineNumber || 0}:${data.column || 0}` );

    //TODO: Refactor app...
    EventController.on('Actions.EditorTabContextMenu', data => {
        if (data.action === 'Close') app.editManager.closeDocument(data.name);
        if (data.action === 'Move Right') app.editManager.moveRight(data.name);
        if (data.action === 'Move Left') app.editManager.moveLeft(data.name);
    })

    // ----- EXPLORER EVENTS -----
    EventController.on('Model.NameSpace', (ns) => app.explorer.swapNamespace(ns) );
    EventController.on('ExpandAll', () => app.explorer.expandAllExplorerTreeFolders());
    EventController.on('CollapseAll', () => app.explorer.collapseAllExplorerTreeFolders());
    EventController.on('MakeNew', (docNameType) => app.explorer.insertNewItemIntoTree(docNameType));

    EventController.on('CompilePackageByName', (name) => app.CompilePackageByName(name));
    EventController.on('CompileClassByName', (name) => app.CompileClassByName(name));
    EventController.on('CompileRoutinePackageByName', (name) => app.CompileRoutinePackageByName(name));
    EventController.on('CompileRoutineByName', (name) => app.CompileRoutineByName(name));

    EventController.on('ExportPackageByName', (packageName) => app.ExportPackageByName(app.namespace,packageName));
    EventController.on('ExportClassByName', (name) => app.ExportClassByName(app.namespace,name));
    EventController.on('ExportRoutinePackageByName', (name) => app.ExportRoutinePackageByName(name));
    EventController.on('ExportRoutineByName', (name) => app.ExportRoutineByName(name));
    EventController.on('ExportWebFolderByName', (name) => app.ExportWebFolderByName(name));
    EventController.on('ExportWebFileByName', (name) => app.ExportWebFileByName(name));

    EventController.on('ImportCodeLocal', (file) => app.ImportCodeLocal(app.namespace,file));

    EventController.on('CopyClass', (name) => app.CopyClass(name));
    EventController.on('RenameClass', (name) => app.RenameClass(name));

    EventController.on('FindInPackageByName', (name) => app.FindInPackageByName(name));
    EventController.on('FindInRoutinePackageByName', (name) => app.FindInRoutinePackageByName(name));
    EventController.on('DocumentSearchResult', (results) => app.editManager.outputToConsole(results));

    // ----- TOOLS EVENTS -----
    EventController.on('ToolsGPTEnter', (e) => app.tools.onEnter(e));
    EventController.on('GptPrompt.GetCompletion', (prompt) => app.tools.onContextPrompt(prompt));
    EventController.on('ToolsGPTClear', (prompt) => app.tools.clearResponses(prompt));

}

// TODO: Refactor events, make this one file great and the rest of the app follows suit
// TODO: check these
// "request : toggle line numbers in all open editors"
// "toggle mini map in all open editors"
// "reload the entire application page"
// "reset and reload the entire application page"
// "toggle full screen"
// "show status window"
