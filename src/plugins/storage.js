
import { defaultConfig } from "@/assets/configs/config"
// import { parseTime } from "@/utils/format"

export function loadConfigFromStorage() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["config"], res => {
            if (res.config) {
                res.config = JSON.parse(res.config)
                resolve(res.config)
            } else {
                resolve(defaultConfig)
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
                resolve(res.config)
            } else {
                reject("no local config")
            }
        })
    })
}

export function clearConfig() {
    chrome.storage.sync.set({"config": undefined})
}