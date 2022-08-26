import hotReload from '@/utils/hotReload'
hotReload()

console.log('hello world background')

// import { syncConfig } from '@/plugins/sync'

// setInterval(() => {
//     try {
//         syncConfig(res => {
//             console.log(res.msg)
//         })
//     } catch (e) {
//         console.error(e)
//     }
// }, 10000)