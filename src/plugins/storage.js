import { oss } from "@/assets/configs/alioss"
import { defaultConfig } from "@/assets/configs/config"

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
            // console.dir(res)
            resolve(res)
        }).catch(function (err) {
            reject(err)
        });
    })
}

export async function syncConfig() {
    const configLocal = await loadConfigFromStorage()
    const configRemote = await getConfigFromOSS()

    if (configLocal.timeStamp < configRemote.timeStamp) {
        saveConfigToStorage(configRemote, false)
        console.log("repace local")
    } else if (configLocal.timeStamp > configRemote.timeStamp) {
        putConfigToOSS(configLocal)
        console.log("repace remote")
    }
}