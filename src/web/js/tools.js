
const $div = (...cl) => { let div = document.createElement('div'); if (cl) div.classList.add(...cl); return div}

//TODO: rename and seperate out the GPT stuff from the Tools class
export class Tools {

    ChatGPTKey = "123";

    stashLastPrompt = "";

    constructor() {
        this.promptEl = document.getElementById('tools-gpt-input-textbox');
        this.output = document.getElementById('tools-gpt-output');
    }

    onEnter(ev) {

        ev.preventDefault();
        let prompt = this.promptEl.value
        this.promptEl.value = '';

        this.writeToOutput(prompt,true);

        if (this.ChatGPTKey === '') {
            this.stashLastPrompt = prompt;
            this.writeToOutput('Please enter a ChatGPT API Key before using this functionality.');
        }

        this.drawTypingAnimation();

        this.askGPT(prompt);
    }

    onContextPrompt(prompt) {
        this.writeToOutput(prompt,true);

        if (this.ChatGPTKey === '') {
            this.stashLastPrompt = prompt;
            this.writeToOutput('Please enter a ChatGPT API Key before using this functionality.');
        }

        this.drawTypingAnimation();

        this.askGPT(prompt);
    }

    askGPT(prompt) {
        let url = `/devboxapi/openai/completion/`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: prompt
        })
            .then(response => response.text())
            .then(data => {
                this.removeTypingAnimation();
                this.writeToOutput(data);
                this.promptEl.focus();
            })
            .catch(err => {
                this.removeTypingAnimation();
                this.writeToOutput('HTTP ERROR: ' + err.toString());
                this.promptEl.focus();
            });
    }

    writeToOutput(text,isQuestion=false) {

        //if the start of the string is a <div> , <table> , <p> or <span> then assume its HTML
        if (text.trim().startsWith('<div') || text.trim().startsWith('<table') || text.trim().startsWith('<p') || text.trim().startsWith('<span')) {
            let responseEl = $div("gpt-message","gpt-message-" + (isQuestion ? 'q' : 'a'));
            responseEl.innerHTML = `<div class="gpt-message-as-html">${text}</div>`;
            this.output.insertBefore(responseEl, this.output.firstChild);
            this.output.scrollTop = this.output.scrollHeight;
            return;
        }

        //if the first character is a < then assume its XML, and format it
        if (text.trim().startsWith('<')) {
            let responseEl = $div("gpt-message","gpt-message-" + (isQuestion ? 'q' : 'a'));

            // Parse the XML text and format it
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(text,"text/xml");
            let xmlSerializer = new XMLSerializer();
            let rawXml = xmlSerializer.serializeToString(xmlDoc);

            responseEl.innerHTML = `<div class="gpt-message-as-xml"><pre>${encodeHTML(formatXml(rawXml))}</pre></div>`;;

            this.output.insertBefore(responseEl, this.output.firstChild);
            this.output.scrollTop = this.output.scrollHeight;
            return;
        }

        //if first character starts with { or [ then assume its JSON, and format it
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            let responseEl = $div("gpt-message","gpt-message-" + (isQuestion ? 'q' : 'a'));
            let obj = JSON.parse(text);
            let prettyJSON = JSON.stringify(obj,null, 2);
            responseEl.innerHTML = `<div class="gpt-message-as-json"><pre>${prettyJSON}</pre></div>`;
            this.output.insertBefore(responseEl, this.output.firstChild);
            this.output.scrollTop = this.output.scrollHeight;
            return;
        }

        let responseEl = $div("gpt-message","gpt-message-" + (isQuestion ? 'q' : 'a'));
        let tab = '&nbsp;&nbsp;&nbsp;&nbsp;'
        responseEl.innerHTML = '<pre>' + this.escapeHtml(text).split('```').join('</pre><pre>') + '</pre>'

        //text = this.escapeHtml(text.trim());
        //responseEl.innerHTML = '<div>' + text.split('\n').join('<br>').split('\t').join(tab).split('```').join('</div><div>') + '</div>'

        this.output.insertBefore(responseEl, this.output.firstChild);
        this.output.scrollTop = this.output.scrollHeight;
    }

    escapeHtml(unsafe)
    {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") .replace(/'/g, "&#039;");
    }

    drawTypingAnimation() {
        this.TypingAnimation = $div("gpt-key-anim");
        this.TypingAnimation.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 20" width="50" height="20">
            <rect class="gpt-key" x="10" y="10" width="10" height="8" rx="1" ry="1" />
            <rect class="gpt-key" x="25" y="10" width="10" height="8" rx="1" ry="1" />
            <rect class="gpt-key" x="40" y="10" width="10" height="8" rx="1" ry="1" />
        </svg>`
        this.output.insertBefore(this.TypingAnimation, this.output.firstChild);
        this.output.scrollTop = this.output.scrollHeight;
    }

    removeTypingAnimation() {
        this.TypingAnimation.remove();
    }

    clearResponses() {
        this.output.innerHTML = '';
    }

}

// Function to format XML
function formatXml(xml){
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    var formatted = '';
    var lines = xml.split('\r\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (line.match(/^<\/\w/)) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (line.match(/^<\w/)) {
            indent = 1;
        }

        var padding = '';
        for (var j = 0; j < pad; j++) {
            padding += '  ';
        }

        formatted += padding + line + '\r\n';
        pad += indent;
    }

    return formatted;
}

function encodeHTML(html) {
    var element = document.createElement('div');
    element.innerText = html;
    return element.innerHTML;
}