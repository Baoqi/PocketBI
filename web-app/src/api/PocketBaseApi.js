import PocketBase from 'pocketbase'

export const client = new PocketBase('http://localhost:8090');

const camelToSnakeCase = str =>
    str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const snakeToCamel = str =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );


function _handleBuilder(fn) {
    return obj => {
        let newObj = {};
        Object.entries(obj).forEach(([key, value]) => {
            newObj[fn(key)] = value;
        });
        return newObj;
    }
}

const handleResponse = _handleBuilder(snakeToCamel);

const handleRequest = _handleBuilder(camelToSnakeCase);


export const getOneRecord = (sub, id, queryParams) => {
    return client.records.getOne(sub, id, queryParams).then(handleResponse);
}

export const createRecord = (sub, bodyParams, queryParams) => {
    return client.records.create(sub, handleRequest(bodyParams), queryParams)
        .then(handleResponse);
}

export const updateRecord = (sub, id, bodyParams, queryParams) => {
    return client.records.update(sub, id, handleRequest(bodyParams), queryParams)
        .then(handleResponse);
}

export const getFullRecordList = (sub, queryParams) => {
    return client.records.getFullList(sub, 100, queryParams)
        .then(items => {
            if (items) {
                let newItems = [];
                items.forEach(item => {
                    newItems.push(handleResponse(item));
                });
                return newItems;
            }
            return items;
        });
}

export const deleteOneRecord = (sub, id, queryParams) => {
    return client.records.delete(sub, id, queryParams).then(handleResponse);
}
