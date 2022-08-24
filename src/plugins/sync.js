import OSS from 'ali-oss';
import { store, saveStoreOSSConfigToStorage } from '@/plugins/store';
import { loadConfigFromStorage, saveConfigToStorage } from "@/plugins/storage"

let oss;

// syncState
export function loadSyncStateFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["sync"], res => {
            if (res.sync) {
                res.sync = JSON.parse(res.sync)
                resolve(res.sync)
            } else {
                resolve({timeStamp: 0, type: null})
                reject("init from default")
            }
        })
    })
}

export function saveSyncStateToStorage(syncState) {
    const syncStateFormatted = JSON.stringify(syncState)
    chrome.storage.sync.set({"sync": syncStateFormatted})
}

// ossConfig
export function loadOSSConfigFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["ossConfig"], res => {
            if (res.ossConfig) {
                res.ossConfig = JSON.parse(res.ossConfig)
                resolve(res.ossConfig)
            } else {
                console.log("no sync config loadl")
                reject("no sync config loadl")
            }
        })
    })
}

export function saveOSSConfigToStorage(ossConfig) {
    console.log(ossConfig)
    const ossConfigFormatted = JSON.stringify(ossConfig)
    chrome.storage.sync.set({"ossConfig": ossConfigFormatted})
}


// userConfig storage <== ==> oss 
// https://help.aliyun.com/document_detail/32068.htm
const reader = new FileReader()
export function getConfigFromOSS() {
    return new Promise((resolve, reject) => {    
        oss.get('/debug/chuan.config.json').then(res => {
            const blob = new Blob([res.content], {type: 'application/json'});
            reader.readAsText(blob)
            reader.onload = (reader_res) => {
                const config = JSON.parse(reader_res.target.result)
                resolve(config)
            }
        }).catch(err => {
            reject(err)
        });
    })
}

export function putConfigToOSS(config) {
    return new Promise((resolve, reject) => {
        const configFormatted = JSON.stringify(config)
        const blob = new Blob([configFormatted], {type: 'application/json'});
        oss.put('/debug/chuan.config.json', blob).then(res => {
            resolve(res)
        }).catch(function (err) {
            reject(err)
        });
    })
}


export async function syncConfig(callback, isTest = false) {
    store.syncState.timeStamp = Date.parse(new Date())
    store.syncState.type = "failed"
    store.syncState.msg = "success"
    
    if ((store.syncState.enableSync || isTest) && store.ossConfig ) {

        if (!oss) {
            oss = new OSS(store.ossConfig);
        }

        let configLocal;
        let configRemote;

        try {
            configLocal = await loadConfigFromStorage();
            configRemote = await getConfigFromOSS();
        }

        catch(e) {
            console.log(e)
            console.log("sync failed")
            store.syncState.type = "failed"
        }

        finally {

            if (!(configLocal && configRemote)) {
                store.syncState.msg = "Pull Error: "
                configLocal ?  "" : store.syncState.msg += "loadConfigFromStorage()"
                configRemote ? "" : store.syncState.msg += "getConfigFromOSS()"
            }

            else if (configLocal.timeStamp < configRemote.timeStamp) {
                saveConfigToStorage(configRemote, false)
                store.syncState.type = "from remote"
                store.syncState.lastType = "from remote"
                console.log("repace local")
            }
    
            else if (configLocal.timeStamp > configRemote.timeStamp) {
                putConfigToOSS(configLocal).then(() => {
                    store.syncState.type = "replace remote"
                    store.syncState.lastType = "replace remote"
                    console.log("repace remote")
                }).catch(err => {
                    store.syncState.msg = "fail to putConfigToOSS()"
                    console.error(err)
                    console.log("failed to replace remote")
                })
            } 
    
            else {
                store.syncState.type = "no change"
            }
        }
    } 
    
    else {
        store.syncState.msg = "fail to confirm sync state"
        console.log(store.syncState.enableSync)
        console.log(store.ossConfig)
    }

    callback(store.syncState)
    saveStoreOSSConfigToStorage()
}
