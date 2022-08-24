import { createApp } from 'vue'
import CheckBox from './App.vue'

const createInstance = cfg => {
    const config = cfg || {}
    // 1、创建包裹容器，并设置外层的 Class 属性、消息计数
    let messageNode = document.createElement('div')
    let attr = document.createAttribute("class")
    attr.value = "c-checkbox"
    messageNode.setAttributeNode(attr)

    // 2、创建实例并挂载到 body
    const app = createApp(CheckBox, {
        config,
        remove: () => {
            handleRemove()// 移除元素，消息关闭后从 Dom 上取消挂载并移除
        }
    })

    const handleRemove = () => {
        app.unmount(messageNode)
        document.body.removeChild(messageNode)
    }

    // 挂载实例并追加到 body 结尾
    app.vm = app.mount(messageNode)
    document.body.appendChild(messageNode)

    app.close = () => {
        handleRemove()
    }

    return app
}


const renderMsg = (cfg = '') => {

    const defaultConfig = {
        content: "这是消息的内容",
        actions: [{
          text: "确认",
          callback: () => {
            console.log("确认")
          }
        },{
          text: "取消",
          callback: () => {
            console.log("取消")
          }
        }]
      }

    const config = Object.assign(defaultConfig, cfg) // 合并配置

    // 创建实例
    return createInstance(config)
}


export default {
    // 纯文本消息
    confirm: (cfg) => {
        const confirmConfig = {
            content: cfg.content,
            actions: [{
                text: "确认",
                callback: cfg.confirm
            }, {
                text: "取消",
                callback: cfg.cancle || (() => { })
            }]
        }
        renderMsg(confirmConfig)
    },
}
