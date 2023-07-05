import {EventController} from "../lib/event-controller.js";

const $div = (...cl) => { let div = document.createElement('div'); if (cl) div.classList.add(...cl); return div}

export class DialogBox {

    constructor(title,extension,docType) {
        this.el=$div();
        this.docType=docType;
        this.extension=extension;
        this.el.innerHTML = this.make(title,extension);
        document.body.appendChild(this.el);
        this.el.querySelector('#dialogBoxOKButton').addEventListener('click', ev => this.onOKButton());
        this.el.querySelector('#dialogBoxCancelButton').addEventListener('click', ev => this.onCancelButton());
        this.el.querySelector('#newItemName').focus();
    }

    onOKButton() {
        let newItemName = this.el.querySelector('#newItemName').value;
        EventController.publishEvent('MakeNew',{"name":newItemName,"type":this.extension,"docType":this.docType},false);
        this.el.remove();
    }

    onCancelButton() {
        this.el.remove();
    }

    make(title,extension) {
        return `
            <div class="fit flex-row dialog-box">
                <div class="flex-1"></div>
                <div class="flex-col">
                    <div class="flex-1"></div>
                    <div class="dialog-box--panel">
                        <div class="dialog-box--title">${title}</div>
                        <div class="dialog-box--body flex-row">
                            <div class="dialog-box--input"><input id="newItemName" style="width:400px;"><span class="pad-left-1em">.${extension}</span></div>
                        </div>
                        <div class="dialog-box--footer flex-row">
                            <div class="flex-1"></div>
                            <div>
                                <button class="dialog-box--button" onclick="DevBoxEventController.publishEvent('NewOK','')" id="dialogBoxOKButton">OK</button>
                                <button class="dialog-box--button" onclick="DevBoxEventController.publishEvent('NewCancel','')" id="dialogBoxCancelButton">Cancel</button>
                            </div>
                        </div>                                                
                    </div>
                    <div class="flex-2"></div>
                </div>
                <div class="flex-1"></div>
            </div>
        `
    }

}