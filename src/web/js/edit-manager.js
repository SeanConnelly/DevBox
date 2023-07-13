import {EventController} from "./lib/event-controller.js";
import {Document} from "./servers/iris/Document.js";
import {App} from "./app.js";
import {System} from "./servers/iris/System.js";

const $div = (...cl) => { let div = document.createElement('div'); if (cl) div.classList.add(...cl); return div}

//Make this an AbstractEditor and Interface different editors -
// Monaco: General Code
// DTL: Iris Transforms
// BPL: Iris Business Processing

export class EditManager {

    constructor(doc) {
        this.hasChanged = false;
        this.doc = doc;
        this.mounted = false;
        this.el = $div('editor');
        this.type = undefined;
        if (doc.isDTL) {
            //todo: simple POC to load DTL into editor, replace with a dual loading solution
            this.createDTLEditor(doc);
        } else {
            this.createMonacoEditor(doc);
        }

    }

    createMonacoEditor(doc) {
        let themeName = (EventController.get('Model.Appearance') === 'light' ? 'vs' : 'vs-dark')
        this.editor = monaco.editor.create(this.el,{
            value: doc.content,
            language: doc.language,
            theme: themeName,
            automaticLayout: true,
            minimap: {'enabled' : EventController.get('Model.MiniMap') },
            lineNumbers: EventController.get('Model.LineNumbers')
        })
        this.type='monaco';
        this.editor.getModel().setEOL(0);
        this.editor.getModel().onDidChangeContent( ev => {this.hasChanged = true; } )
        this.editor.onDidChangeCursorPosition( ev => EventController.publishEvent("Message.CursorPosition", ev.position, false, false) );
        this.editor.onDidFocusEditorText( ev => EventController.publishEvent("Message.EditorDidGetFocus", {"ev":ev,"tabLayout":this.el.parentElement.parentElement}, false, false));  //make grand-parent a named prop of this

        this.addGPTExplainPrompt();
        this.addGPTCreateCommentPrompt();
        this.addGPTCompleteCodePrompt();
        this.addGPTReviewThisCodePrompt();

        this.addGotoCode();
        this.addPreviewCode();
        this.addExecuteCode();
        this.addWatchCode();
        this.addDisableWatchCode();

    }

    addWatchCode() {
        this.editor.addAction({
            id: 'gpt-prompt-watch-execute-code',
            label: 'On Compile Run Code',
            contextMenuGroupId: 'execution',
            contextMenuOrder: 1.5,
            run: (editor)=> {
                let selection = editor.getSelection();
                let selectedText = editor.getModel().getValueInRange(selection);
                if (this.watcher !== undefined) this.watcher.off();
                this.watcher = EventController.on('AfterCompileOK', () => {
                    EventController.publishMultiItemEvent("GptPrompt.GetCompletion",selectedText,false)
                });
            }
        })
    }

    addDisableWatchCode() {
        this.editor.addAction({
            id: 'gpt-prompt-disable-execute-code',
            label: 'Disable On Compile Run Code',
            contextMenuGroupId: 'execution',
            contextMenuOrder: 1.5,
            run: (editor) => {
                this.watcher.off();
            }
        })
    }

    addExecuteCode() {
        this.editor.addAction({
            id: 'gpt-prompt-execute-code',
            label: 'Run Highlighted Code',
            contextMenuGroupId: 'execution',
            contextMenuOrder: 1.5,
            run: function(editor) {
                let selection = editor.getSelection();
                let selectedText = editor.getModel().getValueInRange(selection);
                EventController.publishMultiItemEvent("GptPrompt.GetCompletion",selectedText,false)
            }
        })
    }

    addGotoCode() {
        this.editor.addAction({
            id: 'gpt-prompt-goto-code',
            label: 'Goto Code',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: function(editor) {
                let data = {
                    data: editor.getPosition().column,
                    code: editor.getModel().getLineContent(editor.getPosition().lineNumber)
                };
                EventController.publishMultiItemEvent("GotoCode",data,false)
            }
        })
    }

    addPreviewCode() {
        this.editor.addAction({
            id: 'gpt-prompt-preview-code',
            label: 'Preview Code',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: function(editor) {
                let data = {
                    data: editor.getPosition().column,
                    code: editor.getModel().getLineContent(editor.getPosition().lineNumber)
                };
                EventController.publishMultiItemEvent("PreviewCode",data,false)
            }
        })
    }

    addGPTExplainPrompt() {
        this.editor.addAction({
            id: 'gpt-prompt-review',
            label: 'GPT Review This Code',
            contextMenuGroupId: 'gpt',
            contextMenuOrder: 1.5,
            run: function(ed) {
                let selection = ed.getSelection();
                let model = ed.getModel();
                let selectedText = model.getValueInRange(selection);
                let prompt = 'You are an experienced InterSystems IRIS and Caché ObjectScript developer who often reviews other developers code. You have read many books on this subject such as Code Complete by Steve McConnell and Clean Code by Robert C. Martin. Using your deep experience, review the following ObjectScript code: \n```' + selectedText + '```';
                EventController.publishMultiItemEvent("GptPrompt.GetCompletion",prompt,false)
                console.log(prompt)
            }
        })
    }

    addGPTReviewThisCodePrompt() {
        this.editor.addAction({
            id: 'gpt-prompt-explain',
            label: 'GPT Explain This Code',
            contextMenuGroupId: 'gpt',
            contextMenuOrder: 1.5,
            run: function(ed) {
                let selection = ed.getSelection();
                let model = ed.getModel();
                let selectedText = model.getValueInRange(selection);
                let prompt = 'Explain this InterSystems IRIS ObjectScript code: \n```' + selectedText + '```';
                EventController.publishMultiItemEvent("GptPrompt.GetCompletion",prompt,false)
                console.log(prompt)
            }
        })
    }

    addGPTCompleteCodePrompt() {
        this.editor.addAction({
            id: 'gpt-prompt-complete-code',
            label: 'GPT Complete This Code',
            contextMenuGroupId: 'gpt',
            contextMenuOrder: 1.5,
            run: function(ed) {
                let selection = ed.getSelection();
                let model = ed.getModel();
                let selectedText = '```' + model.getValueInRange(selection) + '```';
                let prompt = `An InterSystems Community discussion on InterSystems IRIS, Caché and ObjectScript. 
                The following ObjectScript code has one or more comments that describe sections of code that need completing. 
                Using your understanding and examples of ObjectScript, complete the following code. 
                Remember that ObjectScript has left to right operator precedence, so use extra brackets, for instance a*2+b*3 would need to be (a*2)+(b*3).
                Wrap any code in triple backticks: \n${selectedText}`;
                EventController.publishMultiItemEvent("GptPrompt.GetCompletion",prompt,false)
                console.log(prompt)
            }
        })
    }

    addGPTCreateCommentPrompt() {
        this.editor.addAction({
            id: 'gpt-prompt-create-comment',
            label: 'GPT Create Comment',
            contextMenuGroupId: 'gpt',
            contextMenuOrder: 1.5,
            run: function(ed) {
                let selection = ed.getSelection();
                let model = ed.getModel();
                let selectedText = model.getValueInRange(selection);
                let prompt = 'Create a single comment for this InterSystems IRIS ObjectScript code. Each line should be no greater than 80 characters. Each line should start with three forward slashes.```' + selectedText + '```';
                EventController.publishMultiItemEvent("GptPrompt.GetCompletion",prompt,false)
                console.log(prompt)
            }
        })
    }

    createDTLEditor(doc) {
        System.GetNameSpaceDefaultUrlPath(App.app.namespace).then( (url) => {
            //if last char of url is not a slash, then add one
            if (url.charAt(url.length-1) !== '/') url+='/';
            let nameParts=doc.name.split('.')
            nameParts.pop();
            nameParts.push('dtl');
            let name=nameParts.join('.');
            let cookies = document.cookie;
            let iframe = `<iframe style="width:100%;height:100%;overflow:hidden;" src="${url}EnsPortal.DTLEditor.zen?DT=${name}&STUDIO=1&${cookies}"></iframe>`
            console.log(iframe);
            this.el.innerHTML = iframe;
            //this.el.children[0].style.zoom = '0.75';
            window.setTimeout( () => { this.enhanceDTLEditorStyle(); },1000)
        });
    }

    enhanceDTLEditorStyle() {
        //remove inner overflow to clean up scrollbar real estate
        let iframeBody=this.el.children[0].contentWindow.document.body;
        let innerSVG=iframeBody.getElementsByTagName('embed')[0].getSVGDocument().firstChild;

        iframeBody.style.overflow = 'hidden';

        //reduce size of images
        let imgs = iframeBody.querySelectorAll('img');
        for (let i=0; i<imgs.length; i++) {
            let img = imgs[i];
            img.style.maxWidth = '16px';
            img.style.maxHeight = '16px';
        }

        //reduce size of ribbon
        let ribbon = iframeBody.querySelector('.toolRibbon');
        ribbon.style.height = '26px';
        ribbon.firstElementChild.style.height = '26px';

        //force resize
        this.el.children[0].contentWindow.window.dispatchEvent(new Event('resize'));

        //inject css to highlight active and hidden lines
        let styleElement = document.createElement('style')
        styleElement.innerHTML = `
            .DTLActionSelected {
                stroke: rgb(5,205,235) !important;
            }
        `
        innerSVG.insertBefore(styleElement,innerSVG.firstChild);

    }

    reload() {
        this.doc.reload().then( () => {
            this.editor.getModel().setValue(this.doc.content);
        })
    }

    reloadWithPreservedEdits() {
        return this.doc.reload().then( () => {
            this.editor.executeEdits('',[{
                range: this.editor.getModel().getFullModelRange(),
                text: this.doc.content
            }])
        })
    }

    save(forceSave = false) {
        //SAVE DTL
        if (this.doc.isDTL) {
            //hijack the basic alert function, capture its text and display to the output window (applied to compile as well)
            this.el.children[0].contentWindow.window.alert = function(text) {
                EventController.publishEvent('Message.Console',{
                    title: 'save',
                    state: 'info',
                    text: text
                },false);
            }
            this.el.children[0].contentWindow.window.zenPage.studioMode=false;
            this.el.children[0].contentWindow.window.zenPage.saveDT(false);
        } else {
            if ((this.hasChanged === false) && (forceSave === false)) {
                EventController.publishEvent('Message.Console',{
                    title: 'save',
                    state: 'info',
                    text: 'no changes'
                },false);
            } else {
                this.doc.content = this.editor.getModel().getValue();
                return this.doc.save()
                    .then( res => res.json())
                    .then( data => {
                        EventController.publishEvent('Message.Console',{
                            title: 'save',
                            state: 'info',
                            text: this.doc.name + ' saved'
                        },false);
                        this.hasChanged = false;
                    })
                    .catch( err => { EventController.publishEvent('Message.Console',err,false) });
            }
        }
    }

    compile() {
        if (this.doc.isDTL) {
            this.save(true);
            window.setTimeout( () => {
                this.compileDTL()
            })
        } else {
            this.save(true)
                .then( () => this.doc.compile())
                .then( res => res.json())
                .then( data => {
                    let msg = data.console.join('<br>')
                        .replace('ERROR','<span style="color:red;">ERROR</span>')
                        .replace('Compilation finished successfully','<span style="color:green;">Compilation finished successfully</span>')
                    EventController.publishEvent('Message.Console',{html:msg},false);
                    EventController.publishEvent('AfterCompileOK',"",false)
                    this.reloadWithPreservedEdits().then( () => {
                        this.hasChanged = false;
                    });
                    let docRef = this.doc.name + ':' + new Date().getTime();
                    localStorage.setItem('cspWatchPage',docRef);
                    console.log('cspWatchPage',docRef);
                })
                .catch( err => EventController.publishEvent('Message.Console',{html:err},false) );
        }
    }

    compileDTL() {
        this.save(true);
        this.doc.compile()
            .then( res => res.json())
            .then( data => {
                let msg = data.console.join('<br>')
                    .replace('ERROR','<span style="color:red;">ERROR</span>')
                    .replace('Compilation finished successfully','<span style="color:green;">Compilation finished successfully</span>')
                EventController.publishEvent('Message.Console', {
                    html: msg
                },false);
                //launch DTL test window
                this.el.children[0].contentWindow.window.document.querySelector('input[value="Test"]').click();
                //wait for DTL test window to fully render
                window.setTimeout( () => {
                    //trigger the DTL test button
                    this.el.children[0].contentWindow.window.document.getElementsByTagName('iframe')[0].contentDocument.querySelector('input[value="Test"]').click();
                    //wait for the DTL test to execute and return the result
                    window.setTimeout( () => {
                        //extract the results from the test window
                        let spans = this.el.children[0].contentWindow.window.document.getElementsByTagName('iframe')[0].contentDocument.getElementsByTagName('span');
                        let span = spans[spans.length-1];
                        let tr = span.closest('tr').cloneNode(true);
                        tr.style.color = 'var(--appTextColorFive)';
                        let pre = tr.querySelector('pre');
                        if (pre !== null) {
                            let html = pre.innerHTML;
                            let text = pre.innerText;
                            //if its XML then lets add some formatting to make the XML values pop
                            if (text.charAt(0) === '<') {
                                tr.querySelector('pre').innerHTML = html.replaceAll(/(&gt;)(.*)(&lt;\/)/g,"$1<span class='primary-color''>$2</span>$3")
                            }
                        }
                        //send a clone of the results to the message console
                        EventController.publishEvent('Message.Console',{
                            title: 'save',
                            state: 'info',
                            dtlResult: tr
                        },false);
                        //now close the DTL test window
                        this.el.children[0].contentWindow.window.document.getElementsByTagName('iframe')[0].contentDocument.querySelector('input[value="Close"]').click();
                    },1000)
                },1000)

            })
            .catch( err => EventController.publishEvent('Message.Console',err,false) );
    }

    updateOptions(options) {
        this.editor.updateOptions(options)
    }

    showLineNumbers(isOnOrOff) {
        this.editor.updateOptions({lineNumbers: isOnOrOff})
    }

    showMiniMap(isEnabled) {
        this.editor.updateOptions({minimap: {'enabled' : isEnabled}});
    }

    setTheme(themeName) {
        this.editor.updateOptions({theme:themeName});
    }

    setThemeLight() {
        this.editor.updateOptions({theme:'vs'});
    }

    setThemeDark() {
        this.editor.updateOptions({theme:'vs-dark'});
    }

    mount(el) {
        if (this.mounted) this.el = this.parentEl.removeChild(this.el)
        this.parentEl = el;
        this.parentEl.appendChild(this.el);
        this.mounted = true;
    }

    show() {
        this.el.classList.remove('hide')
    }

    hide() {
        this.el.classList.add('hide')
    }

    close() {
        this.editor.destroy();
        this.editor.container.remove();
    }

    selectAll() {
        const range = this.editor.getModel().getFullModelRange();
        this.editor.setSelection(range);
    }

    undo() {
        this.editor.getModel().undo();
    }

    redo() {
        this.editor.getModel().redo();
    }

    cut() {
        this.editor.focus();
        document.execCommand('cut');
    }

    copy() {
        this.editor.focus();
        this.editor.trigger('source','editor.action.clipboardCopyAction');
    }

    paste() {
        this.editor.focus();
        this.editor.trigger('source','editor.action.clipboardPasteAction');
    }

    delete() {
        this.editor.focus();
        this.editor.trigger('source','editor.action.deleteLines')
    }

    find() {
        this.editor.focus();
        this.editor.trigger('source','actions.find')
    }

    replace() {
        this.editor.focus();
        this.editor.trigger('source','editor.action.startFindReplaceAction')
    }

}

/*

Get all the actions from the current version of Monaco with...

    let actions = this.editor.getSupportedActions().map((a) => a.id);
    console.log(actions);

[
    "editor.action.setSelectionAnchor",
    "editor.action.moveCarretLeftAction",
    "editor.action.moveCarretRightAction",
    "editor.action.transposeLetters",
    "editor.action.clipboardCopyWithSyntaxHighlightingAction",
    "editor.action.commentLine",
    "editor.action.addCommentLine",
    "editor.action.removeCommentLine",
    "editor.action.blockComment",
    "editor.action.showContextMenu",
    "cursorUndo",
    "cursorRedo",
    "editor.action.fontZoomIn",
    "editor.action.fontZoomOut",
    "editor.action.fontZoomReset",
    "editor.action.indentationToSpaces",
    "editor.action.indentationToTabs",
    "editor.action.indentUsingTabs",
    "editor.action.indentUsingSpaces",
    "editor.action.detectIndentation",
    "editor.action.reindentlines",
    "editor.action.reindentselectedlines",
    "expandLineSelection",
    "editor.action.copyLinesUpAction",
    "editor.action.copyLinesDownAction",
    "editor.action.duplicateSelection",
    "editor.action.moveLinesUpAction",
    "editor.action.moveLinesDownAction",
    "editor.action.sortLinesAscending",
    "editor.action.sortLinesDescending",
    "editor.action.removeDuplicateLines",
    "editor.action.trimTrailingWhitespace",
    "editor.action.deleteLines",
    "editor.action.indentLines",
    "editor.action.outdentLines",
    "editor.action.insertLineBefore",
    "editor.action.insertLineAfter",
    "deleteAllLeft",
    "deleteAllRight",
    "editor.action.joinLines",
    "editor.action.transpose",
    "editor.action.transformToUppercase",
    "editor.action.transformToLowercase",
    "editor.action.transformToSnakecase",
    "editor.action.transformToTitlecase",
    "editor.action.smartSelect.expand",
    "editor.action.smartSelect.shrink",
    "editor.action.toggleTabFocusMode",
    "editor.action.forceRetokenize",
    "deleteInsideWord",
    "editor.action.showAccessibilityHelp",
    "editor.action.inspectTokens",
    "editor.action.quickCommand",
    "editor.action.gotoLine",
    "editor.action.toggleHighContrast",
    "editor.action.selectToBracket",
    "editor.action.jumpToBracket",
    "actions.find",
    "editor.action.startFindReplaceAction",
    "editor.actions.findWithArgs",
    "actions.findWithSelection",
    "editor.action.nextMatchFindAction",
    "editor.action.previousMatchFindAction",
    "editor.action.nextSelectionMatchFindAction",
    "editor.action.previousSelectionMatchFindAction",
    "editor.unfold",
    "editor.unfoldRecursively",
    "editor.fold",
    "editor.foldRecursively",
    "editor.foldAll",
    "editor.unfoldAll",
    "editor.foldAllBlockComments",
    "editor.foldAllMarkerRegions",
    "editor.unfoldAllMarkerRegions",
    "editor.foldAllExcept",
    "editor.unfoldAllExcept",
    "editor.toggleFold",
    "editor.gotoParentFold",
    "editor.gotoPreviousFold",
    "editor.gotoNextFold",
    "editor.foldLevel1",
    "editor.foldLevel2",
    "editor.foldLevel3",
    "editor.foldLevel4",
    "editor.foldLevel5",
    "editor.foldLevel6",
    "editor.foldLevel7",
    "editor.action.inPlaceReplace.up",
    "editor.action.inPlaceReplace.down",
    "editor.action.openLink",
    "editor.action.insertCursorAbove",
    "editor.action.insertCursorBelow",
    "editor.action.insertCursorAtEndOfEachLineSelected",
    "editor.action.addSelectionToNextFindMatch",
    "editor.action.addSelectionToPreviousFindMatch",
    "editor.action.moveSelectionToNextFindMatch",
    "editor.action.moveSelectionToPreviousFindMatch",
    "editor.action.selectHighlights",
    "editor.action.changeAll",
    "editor.action.addCursorsToBottom",
    "editor.action.addCursorsToTop",
    "editor.action.wordHighlight.trigger",
    "editor.action.marker.next",
    "editor.action.marker.prev",
    "editor.action.marker.nextInFiles",
    "editor.action.marker.prevInFiles",
    "editor.action.showHover",
    "editor.action.showDefinitionPreviewHover",
    "editor.action.triggerSuggest",
    "editor.action.resetSuggestSize",
    "editor.action.inlineSuggest.trigger",
    "editor.action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters",
    "editor.action.unicodeHighlight.disableHighlightingOfInvisibleCharacters",
    "editor.action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters",
    "editor.action.unicodeHighlight.showExcludeOptions",
    "vs.editor.ICodeEditor:3:gpt-prompt-review",
    "vs.editor.ICodeEditor:3:gpt-prompt-create-comment",
    "vs.editor.ICodeEditor:3:gpt-prompt-complete-code",
    "vs.editor.ICodeEditor:3:gpt-prompt-explain",
    "vs.editor.ICodeEditor:3:gpt-prompt-goto-code",
    "vs.editor.ICodeEditor:3:gpt-prompt-preview-code",
    "vs.editor.ICodeEditor:3:gpt-prompt-execute-code",
    "vs.editor.ICodeEditor:3:gpt-prompt-watch-execute-code",
    "vs.editor.ICodeEditor:3:gpt-prompt-disable-execute-code"
]
 */
