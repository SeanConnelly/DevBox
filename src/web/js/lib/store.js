export class Store {

    static namespace = undefined;

    static setNamespace(namespace) {
        this.namespace = namespace;
    }

    static setItem(key, value) {
        localStorage.setItem(this.namespace + ':' + key, value);
    }

    static getItem(key) {
        return localStorage.getItem(this.namespace + ':' + key);
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