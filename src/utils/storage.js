
export function getItemFromStorage(name) {
    // local
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([name], res => {
            if (res[name] && res[name].length > 0) {
                resolve(res[name])
            } else {
                reject(`no ` + name + " in chrome storage")
            }
        })
    })
}

 
export function saveItemToStorage(name, data) {
    // local
    return new Promise((resolve) => {
        const saveData = Object()
        saveData[name] = data.map(item => JSON.stringify(item))
        chrome.storage.sync.set(saveData, () => {
            resolve(data)
        })
    })
}


export function getAndSetStorageItem(name, afterGet, afterSet) {
    chrome.storage.sync.get([name], res => {

        const result = afterGet(res)

        const saveData = Object()
        saveData[name] = result.map(item => JSON.stringify(item))

        console.log(saveData)

        chrome.storage.sync.set(saveData, () => {
            afterSet(result)
        })
    })
}