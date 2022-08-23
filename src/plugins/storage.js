import OSS from 'ali-oss';
import { ossConfig } from '@/assets/configs/alioss';
import { defaultConfig } from "@/assets/configs/config"
// import { parseTime } from "@/utils/format"

let oss = new OSS(ossConfig);

export function loadConfigFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["config"], res => {
            if (res.config) {
                res.config = JSON.parse(res.config)
                resolve(res.config)
            } else {
                resolve(defaultConfig)
                reject("init from defaultConfig")
            }
        })
    })
}

export function saveConfigToStorage(config, update = true) {
    config.timeStamp = update ? Date.parse(new Date()) : config.timeStamp;
    const configFormatted = JSON.stringify(config)
    chrome.storage.sync.set({"config": configFormatted})
}

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

export function saveSyncStateToStorage(sync) {
    const syncFormatted = JSON.stringify(sync)
    chrome.storage.sync.set({"sync": syncFormatted})
}

export function modifyConfigViaStorage(intermater) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["config"], res => {
            if (res.config) {
                res.config = JSON.parse(res.config)
                const configOut = intermater(res.config)
                saveConfigToStorage(configOut)
            } else {
                reject("no local config")
            }
        })
    })
}

export function clearConfig() {
    chrome.storage.sync.set({"config": undefined})
}

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

export async function syncConfig(callback) {
    let state = {
        timeStamp: Date.parse(new Date()),
    }

    try {
        const configLocal = await loadConfigFromStorage();
        const configRemote = await getConfigFromOSS();
        
        if (configLocal.timeStamp < configRemote.timeStamp) {
            saveConfigToStorage(configRemote, false)
            state.type = "from remote"
            console.log("repace local")
            callback(state)
        }

        else if (configLocal.timeStamp > configRemote.timeStamp) {
            putConfigToOSS(configLocal).then(() => {
                state.type = "replace remote"
                console.log("repace remote")
                callback(state)
            }).catch(err => {
                state.type = "failed",
                console.error(err)
                console.log("failed to replace remote")
                callback(state)
            })
        } 

        else {
            state.type = "no change"
            callback(state)
        }
    }
    catch(e) {
        state.type = "failed",
        console.log(e)
        callback(state)
    }

    
}
