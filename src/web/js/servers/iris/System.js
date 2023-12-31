export class System {

    static Query(ns,queryString,parameters) {

        return fetch(`/api/atelier/v1/${encodeURI(ns)}/action/query`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: queryString,
                parameters: parameters
            })
        })
        .then( res => res.json())
    }

    static MemoizedGetNameSpaceDefaultUrlPath = {};

    static GetNameSpaceDefaultUrlPath(namespace) {

        if (System.MemoizedGetNameSpaceDefaultUrlPath.hasOwnProperty(namespace)) {
            return Promise.resolve(System.MemoizedGetNameSpaceDefaultUrlPath[namespace]);
        }

        return fetch(`/devboxapi/namespace/${namespace}/defaultUrlPath`,{
            method: 'GET'
        })
        .then( res => {
            let url = res.text();
            System.MemoizedGetNameSpaceDefaultUrlPath[namespace] = url;
            return url;
        })
    }

    static compileArrayOfItems(namespace,items,flags) {
        //pass flags in the query string as flags=value
        return fetch(`/api/atelier/v1/${encodeURI(namespace)}/action/compile?flags=${flags}`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        })
       .then( res => res.json())
    }

    static searchSourceCode(namespace,searchItems,searchText,searchTypeIsRegex=0,maxResults=200,includeSystem=0) {
        let searchItemsString = Array.isArray(searchItems) ? searchItems.join(',') : searchItems;
        let query=`?query=${encodeURI(searchText)}&documents=${encodeURI(searchItemsString)}&sys=${includeSystem}&regex=${searchTypeIsRegex}&max=${maxResults}`;
        return fetch(`/api/atelier/v3/${encodeURI(namespace)}/action/search` + query,{
            method: 'GET'
        })
        .then( res => res.json())
    }

}

