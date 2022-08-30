
import { defaultConfig } from "@/assets/configs/config"
// import { parseTime } from "@/utils/format"

export const uniStorage = chrome.storage.sync

export function loadConfigFromStorage() {
    return new Promise((resolve) => {
        uniStorage.get(["config"], res => {
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
    uniStorage.set({"config": configFormatted})
}

export function modifyConfigViaStorage(intermater) {
    return new Promise((resolve, reject) => {
        uniStorage.get(["config"], res => {
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
    uniStorage.set({"config": undefined})
}