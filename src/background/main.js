import hotReload from '@/utils/hotReload'
hotReload()
 
import { syncConfig } from '@/plugins/storage'

console.log('hello world background')

setInterval(syncConfig, 10000)
