import { reactive } from "vue";
import { loadConfigFromStorage, saveConfigToStorage } from "./storage";
import {
    saveOSSConfigToStorage,
    saveSyncStateToStorage,
    loadOSSConfigFromStorage,
    loadSyncStateFromStorage,
} from "./sync";

export const store = reactive({
    userConfig: {},
    ossConfig: {},
    syncState: {},
})

export function saveStoreUserConfigToStorage() {
    saveConfigToStorage(store.userConfig)
}

export function loadStoreUserConfigFromStorage() {
    return new Promise((resolve, reject) => {
        loadConfigFromStorage().then(res => {
            store.userConfig = res
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

export function saveStoreOSSConfigToStorage() {
    saveOSSConfigToStorage(store.ossConfig)
}

export function loadStoreOSSConfigFromStorage() {
    return new Promise((resolve) => {
        loadOSSConfigFromStorage().then(res => {
            store.ossConfig = res
            resolve(store.ossConfig)
        }).catch(() => {
            console.log("no ossConfig found local.")
            store.ossConfig = {}
            resolve(store.ossConfig)
        })
    })
}

export function saveStoreSyncStateToStorage() {
    saveSyncStateToStorage(store.syncState)
}

export function loadStoreSyncStateFromStorage() {
    return new Promise((resolve) => {
        loadSyncStateFromStorage().then(res => {
            store.syncState = res
            resolve(res)
        })
    })
}