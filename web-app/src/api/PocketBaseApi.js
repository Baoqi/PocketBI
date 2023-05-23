import PocketBase from 'pocketbase'
import {toast} from "react-toastify";

export const PB_BASE_URL = '/';

export const client = new PocketBase(PB_BASE_URL);

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
    return client.collection(sub).getOne(id, queryParams)
        .then(handleResponse)
        .catch(err => toast.error(err.message));
}

export const createRecord = (sub, bodyParams, queryParams) => {
    return client.collection(sub).create(handleRequest(bodyParams), queryParams)
        .then(handleResponse)
        .catch(err => toast.error(err.message));
}

export const updateRecord = (sub, id, bodyParams, queryParams) => {
    return client.collection(sub).update(id, handleRequest(bodyParams), queryParams)
        .then(handleResponse)
        .catch(err => toast.error(err.message));
}

export const getFullRecordList = (sub, queryParams) => {
    return client.collection(sub).getFullList(100, queryParams)
        .then(items => {
            if (items) {
                let newItems = [];
                items.forEach(item => {
                    newItems.push(handleResponse(item));
                });
                return newItems;
            }
            return items;
        }).catch(err => toast.error(err.message));
}

export const deleteOneRecord = (sub, id, queryParams) => {
    return client.collection(sub).delete(id, queryParams)
        .then(handleResponse)
        .catch(err => toast.error(err.message));
}
