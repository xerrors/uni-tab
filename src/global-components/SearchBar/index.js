import { createApp } from 'vue'
import SearchBar from './App.vue'

const createInstance = cfg => {
    const config = cfg || {}
    // 1、创建包裹容器，并设置外层的 Class 属性、消息计数
    let messageNode = document.createElement('div')
    let attr = document.createAttribute("class")
    attr.value = "c-searchbar-plus"
    messageNode.setAttributeNode(attr)

    const handleRemove = () => {
        app.unmount(messageNode)
        document.body.removeChild(messageNode)
    }

    // 2、创建实例并挂载到 body
    const app = createApp(SearchBar, {
        config: config,
        remove: handleRemove
    })

    // 挂载实例并追加到 body 结尾
    if (document.getElementsByClassName("c-searchbar-plus").length == 0) {
        app.vm = app.mount(messageNode)
        document.body.appendChild(messageNode)
    }

    app.close = () => {
        handleRemove()
    }

    return app
}

export default createInstance