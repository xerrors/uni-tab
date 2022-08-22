import hotReload from '@/utils/hotReload'
hotReload()
 
import {
    loadConfigFromStorage,
    getConfigFromOSS,
    saveConfigToStorage,
    putConfigToOSS,
} from '@/plugins/storage'

console.log('hello world background')


setInterval(async () => {
    // loadConfigFromStorage().then(configLocal => {
    //     getConfigFromOSS().then(configRemote => {
    //         console.log(configLocal.timeStamp == configRemote.timeStamp)
    //     })
    // })
    const configLocal = await loadConfigFromStorage()
    const configRemote = await getConfigFromOSS()

    if (configLocal.timeStamp < configRemote.timeStamp) {
        saveConfigToStorage(configRemote, false)
        console.log("repace local")
    } else if (configLocal.timeStamp > configRemote.timeStamp) {
        putConfigToOSS(configLocal)
        console.log("repace remote")
    }
    // console.log(Date.parse(new Date()))
}, 10000)
