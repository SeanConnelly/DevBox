import {EventController} from "./lib/event-controller.js";
import {System} from "./servers/iris/System.js";
import {App} from "./app.js";

const $div = (...cl) => { let div = document.createElement('div'); if (cl) div.classList.add(...cl); return div}

export class DocumentSearch {

    constructor(findWhat,inFiles) {
        this.el=$div();
        this.el.innerHTML = this.make(findWhat,inFiles);
        document.body.appendChild(this.el);
        this.el.querySelector('#dialogBoxOKButton').addEventListener('click', ev => this.onOKButton());
        this.el.querySelector('#dialogBoxCancelButton').addEventListener('click', ev => this.onCancelButton());
        this.el.querySelector('#findWhat').focus();
    }

    static findInFiles(findWhat,inFiles) {
        System.searchSourceCode(App.app.namespace,inFiles,findWhat).then(result => {
            EventController.publishEvent('DocumentSearchResult',{type:'search-results',results:result},false);
        });
    }

    onOKButton() {
        let findWhat = this.el.querySelector('#findWhat').value;
        let inFiles = this.el.querySelector('#inFiles').value;
        DocumentSearch.findInFiles(findWhat,inFiles);
        this.el.remove();
    }

    onCancelButton() {
        this.el.remove();
    }

    make(findWhat,inFiles) {
        return `
            <div class="fit flex-row dialog-box">
                <div class="flex-1"></div>
                <div class="flex-col">
                    <div class="flex-1"></div>
                    <div class="dialog-box--panel">
                        <div class="dialog-box--title">Find in files</div>
                        <div class="dialog-box--body">
                            <div class="dialog-box--input"><label class="dialog-box--label">Find What:</label><input id="findWhat" value="${findWhat}"></div>
                            <div class="dialog-box--input"><label class="dialog-box--label">In Files:</label><input id="inFiles" value="${inFiles}"></div>                            
                        </div>
                        <div class="dialog-box--footer flex-row">
                            <div class="flex-1"></div>
                            <div>
                                <button class="dialog-box--button" id="dialogBoxOKButton">Search</button>
                                <button class="dialog-box--button" id="dialogBoxCancelButton">Cancel</button>
                            </div>
                        </div>                                                
                    </div>
                    <div class="flex-1"></div>
                </div>
                <div class="flex-1"></div>
            </div>
        `
    }

}