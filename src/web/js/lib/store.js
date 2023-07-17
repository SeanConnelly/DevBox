export class Store {

    static namespace = undefined;

    static setNamespace(namespace) {
        this.namespace = namespace;
    }

    static setItem(key, value) {
        //if value is an object, convert to string
        if (typeof value === 'object') value = JSON.stringify(value);
        localStorage.setItem(this.namespace + ':' + key, value);
    }

    static getItem(key) {
        return localStorage.getItem(this.namespace + ':' + key);
    }

    static getItemAsObject(key) {
        let item = this.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        return {};
    }

    static getItemAsArray(key) {
        let item = this.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        return [];
    }

    static removeItem(key) {
        localStorage.removeItem(this.namespace + ':' + key);
    }

    static clear() {
        Object.keys(localStorage).map( key =>  {
            if (key.indexOf(this.namespace) > -1) {
                localStorage.removeItem(key);
            }
        })
    }

    static forEach(callback) {
        Object.keys(localStorage).map( key =>  {
            if (key.indexOf(this.namespace) > -1) {
                let shortKey = key.replace(this.namespace + ':','');
                callback(shortKey,this.getItem(shortKey));
            }
        })
    }

}