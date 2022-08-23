// import hotReload from '@/utils/hotReload'
// hotReload()
 
import { saveSyncStateToStorage, syncConfig } from '@/plugins/storage'

console.log('hello world background')

setInterval(() => {
    try {
        syncConfig(res => {
            saveSyncStateToStorage(res)
        })
    } catch (e) {
        console.error(e)
    }
}, 10000)
