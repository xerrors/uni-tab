import OSS from 'ali-oss';
import { store, saveStoreOSSConfigToStorage } from '@/plugins/store';
import { uniStorage ,loadConfigFromStorage, saveConfigToStorage } from "@/plugins/storage"
import { parseTime } from '@/utils/format';

let oss;

export function generateOSS() {
    oss = new OSS(store.ossConfig);
}

// syncState
export function loadSyncStateFromStorage() {
    return new Promise((resolve) => {
        uniStorage.get(["sync"], res => {
            if (res.sync) {
                res.sync = JSON.parse(res.sync)
                resolve(res.sync)
            } else {
                resolve({timeStamp: 0, enableSync: false})
            }
        })
    })
}

export function saveSyncStateToStorage(syncState) {
    const syncStateFormatted = JSON.stringify(syncState)
    uniStorage.set({"sync": syncStateFormatted})
}

// ossConfig
export function loadOSSConfigFromStorage() {
    return new Promise((resolve, reject) => {
        uniStorage.get(["ossConfig"], res => {
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
    const ossConfigFormatted = JSON.stringify(ossConfig)
    uniStorage.set({"ossConfig": ossConfigFormatted})
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


export async function syncConfig(callback, config = {}) {
    store.syncState.timeStamp = Date.parse(new Date())
    store.syncState.type = "syncing"
    store.syncState.msg = ""
    
    if ((store.syncState.enableSync || config.isTest) && store.ossConfig ) {

        if (!oss || config.reconnect) {
            generateOSS()
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
        }

        finally {

            if (!(configLocal && configRemote)) {
                store.syncState.msg = "Pull Error: "
                configLocal ?  "" : store.syncState.msg += "loadConfigFromStorage()"
                configRemote ? "" : store.syncState.msg += "getConfigFromOSS()"
            }

            else if (configLocal.timeStamp < configRemote.timeStamp) {
                saveConfigToStorage(configRemote, false)
                store.syncState.msg = "repace local"
                store.syncState.type = "from remote"
                store.syncState.lastType = "from remote"
            }
    
            else if (configLocal.timeStamp > configRemote.timeStamp) {
                await putConfigToOSS(configLocal).then(() => {
                    store.syncState.msg = "repace remote"
                    store.syncState.type = "replace remote"
                    store.syncState.lastType = "replace remote"
                }).catch(err => {
                    store.syncState.msg = "fail to putConfigToOSS()"
                    console.error(err)
                })
            } 
    
            else {
                store.syncState.msg = "Version: " + parseTime(store.userConfig.timeStamp)
                store.syncState.type = "no change"
            }
        }
    } 
    
    else {
        store.syncState.msg = "fail to confirm sync state"
        console.log(store.syncState.enableSync)
        console.log(store.ossConfig)
    }

    if (store.syncState.type == "syncing") {
        store.syncState.type = "failed"
    }
    
    console.log(store.syncState.msg)
    callback(store.syncState)
    saveStoreOSSConfigToStorage()
}
