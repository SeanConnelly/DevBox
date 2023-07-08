import {Store} from './store.js';
export class EventController {

    static data = {};
    static subs = {};
    static index = 0;

    static exists(key) {
        return (EventController.data[key] !== undefined)
    }

    static get(key) {
        return EventController.data[key] || Store.getItem(key);
    }

    static ifKeyDoesNotExistCreateIt(key, value, persist = false) {
        if (EventController.exists(key)) return;
        EventController.data[key] = value;
        if (persist) Store.setItem(key, value);
    }

    // ====================================================================================================
    // Publish a single item event to the event manager. These are events that only contain one state value.
    // Once published, all subscribers will be notified of the new value.
    // Event Params:
    // namespace : The namespace of the event. This is used for event values that need to persist across
    //             multiple namespaces and sessions.
    // key : The name of the event. This is used to identify the event and its value.
    // value : The value of the event. This is the value that will be published to all subscribers.
    // persist : If true, the value will be stored in local storage. This means that when the app is reloaded,
    //           the value will be restored to its last known value.
    // blur : If true, the current element will be blurred. This is useful for input elements that have just
    //        been updated. It will remove the focus from the element, for instance clicking on a menu
    //        item will blur the button and hide the menu.
    // E.G.
    // event : {
    //     namespace: 'localhost:USER',
    //     key: 'Model.NameSpace',
    //     value: 'USER',
    //     persist: true,
    //     blur: false
    // }
    static publishSingleItemEvent(event) {
        this._logEventIfConsoleOpen(event);
        this._ifRequiredBlurAwayFromCurrentDocument(event);
        this._storeEvent(event);
        this._publishToEachSubscriber(event.key,event.value);
    }

    // set is the old version of publishSingleItemEvent. It will be removed in the future. TODO: Remove set.
    static publishEvent(key, value, persist = true, blur = false) {
        if (blur) document.activeElement.blur();
        if (!value) value='';
        if (key !== 'Message.CursorPosition') try { console.log('set (',key,'=',value,' ) from: ',(new Error("StackLog")).stack.split("\n")[2].split('/').pop() ) } catch(err) {}
        EventController.data[key] = value;
        if (persist) Store.setItem(key, value);
        this._publishToEachSubscriber(key,value);
    }

    // ====================================================================================================
    // Toggle the boolean value of an event. This is useful for events that have a true/false value.
    // Toggle will change the value from true to false or false to true. It will then publish the new value.
    static toggleBooleanItemEvent(key, defaultValue, blur = false) {
        let value = EventController.get(key) || defaultValue;
        let newValue = undefined;
        if (value === 'on') newValue = 'off';
        if (value === 'off') newValue = 'on';
        if (value === 'open') newValue = 'closed';
        if (value === 'closed') newValue = 'open';
        if ((value === true) || (value === 'true')) newValue = false;
        if ((value === false) || (value === 'false')) newValue = true;
        if (newValue === undefined) newValue = true;
        EventController.publishSingleItemEvent({key:key,value:newValue,persist:true,blur:blur});
        return newValue;
    }

    // ====================================================================================================
    // Publish a value to a Multi Item Events. These are events that have multiple values.
    // E.g. Publish an open document event to the list of open documents.
    static publishMultiItemEvent(key, value, persist = true, blur = false) {
        if (blur) document.activeElement.blur();
        this.addMultiItemEvent(key, value, persist)
        if (EventController.data[key] === undefined) return;
        this._publishToEachSubscriber(key,value);
    }

    // add item to multi item event, this will only add the item to the store, it will not publish the event.
    static addMultiItemEvent(key, value, persist = true) {
        if (!EventController.data[key]) EventController.data[key] = [];
        if (!EventController.data[key].includes(value)) {
            EventController.data[key].push(value);
            if (persist) Store.setItem(key, JSON.stringify(EventController.data[key]));
        }
    }

    // Remove value from a multi item event key. E.g. remove a document from the list of open documents.
    static removeMultiItemEvent(key, value, persist = true) {
        if (!Array.isArray(EventController.data[key])) return;
        EventController.data[key] = EventController.data[key].filter(v2 => (v2 !== value) )
        if (persist) Store.setItem(key, JSON.stringify(EventController.data[key]));
    }

    // Return true if value is in the multi item event.
    static multiItemEventContains(key, value) {
        if (!EventController.exists(key)) return false;
        let values = JSON.stringify(EventController.data[key]);
        return values.includes('"' + value + '"');
    }

    // ====================================================================================================
    // Subscribe to an event. When the event is published, the callback will be called with the new value.
    static on(key,cb) {
        let id = EventController.index++;
        if (EventController.subs === undefined) EventController.subs = {};
        if (EventController.subs[key] === undefined) EventController.subs[key] = {};
        EventController.subs[key][id] = cb;
        return { off : () => delete EventController.subs[key][id] }
    }

    // ====================================================================================================
    // Bind the innerText of an element to the data value of an event. If an event changes a value of
    // the key it is bound too, then the innerText will automatically update to that value. Its reactive,
    // without the need for a heavy framework.
    static bindInnerTextToEvent(elId, dataName, formatter) {
        return this.on(dataName, val => {
            let el = document.getElementById(elId);
            if (el) {
                if (formatter) val = formatter(val);
                document.getElementById(elId).innerText = val;
            } else {
                console.log("Failed to bind value=",val,"to missing id=",elId);
            }

        })
    }

    // ====================================================================================================
    // Restore data from local storage. This is called once when the app starts up or changes namespace.
    // It restores the state of the app to its last know state for that namespace.
    static republishAllStoredEventData() {
        Store.forEach( (key,value) => {
            try {
                JSON.parse(Store.getItem(key)).map( innerValue => {
                    EventController.publishMultiItemEvent(key,innerValue);
                })
            } catch (e) {
                if (Store.getItem(key) !== '') EventController.publishEvent(key,value);
            }
        })
    }

    static restoreAllStoredEventData() {
        Store.forEach( (key,value) => {
            try {
                JSON.parse(Store.getItem(key)).map( innerValue => {
                    if (!EventController.data[key]) EventController.data[key] = [];
                    if (!EventController.data[key].includes(innerValue)) EventController.data[key].push(innerValue);
                })
            } catch (e) {
                if (Store.getItem(key) !== '') EventController.data[key] = value;
            }
        })
    }

    // ====================================================================================================
    // Reset data, this clears all data from the local storage and resets the app to a blank state.
    static removeAllStoredEvents() {
        Store.clear();
    }

    // ====================================================================================================
    // PRIVATE METHODS
    static _publishToEachSubscriber(key,value) {
        if (EventController.data[key] === undefined) return;
        for (let id in EventController.subs[key]) {
            EventController.subs[key][id](value);
        }
    }

    static _logEventIfConsoleOpen(event){
        if (event.key === 'Message.CursorPosition') return;
        try {
            console.log('set (',event.key,'=',event.value,' ) from: ',(new Error("StackLog")).stack.split("\n")[2].split('/').pop() )
        } catch(err) {
            //ignore error, console.log is not available
        }
    }

    static _ifRequiredBlurAwayFromCurrentDocument(event) {
        if (event.blur) document.activeElement.blur();
    }

    static _storeEvent(event) {
        //store in memory
        EventController.data[event.key] = event.value;
        //if flagged to persist, also store in local storage
        if (event.persist) Store.setItem(event.key, event.value);
    }

}

//attach director to the main window for simplified menu event bindings
window.DevBoxEventController = EventController;