import {App} from "./app.js";
import {EventController} from "./lib/event-controller.js";

export class Watcher {

    static watcher = null;

    static watch(command) {
        this.watcher = EventController.on('AfterCompileOK', () => {
            App.app.console.runCommandInConsole(command)
        });
    }

    static unwatch() {
        if (this.watcher) {
            this.watcher.off()
        }
    }

}