import { createApp } from 'vue'
import SimpMessage from './App.vue'

const createInstance = cfg => {
    const config = cfg || {}
    // 1、创建包裹容器，并设置外层的 Class 属性、消息计数
    let messageNode = document.createElement('div')
    let attr = document.createAttribute("class")
    attr.value = "c-simp-message"
    messageNode.setAttributeNode(attr)
    const height = 54 // 单个消息框高度

    const messageList = document.getElementsByClassName('c-simp-message')
    messageNode.style.top = `${messageList.length * height}px`

    const mountElement = config.element || document.body

    // 2、创建实例并挂载到 body
    const app = createApp(SimpMessage, {
        config,
        remove: () => {
            handleRemove()// 移除元素，消息关闭后从 Dom 上取消挂载并移除
        }
    })

    const handleRemove = () => {
        app.unmount(messageNode)
        mountElement.removeChild(messageNode)
        resetMsgTop()
    }

    const resetMsgTop = () => {
        for (let i = 0; i < messageList.length; i++) {
            messageList[i].style.top = `${i * height}px`
        }
    }

    // 挂载实例并追加到 body 结尾
    app.vm = app.mount(messageNode)
    mountElement.appendChild(messageNode)

    app.close = () => {
        handleRemove()
    }

    return app
}


const renderMsg = (typeCfg = {}, cfg = '') => {
    // 允许直接传入消息内容，因此要判断传入的 cfg 类型
    const isContent = typeof cfg === 'string'

    // 整合自定义配置
    cfg = isContent ? {
        content: cfg
    } : cfg

    const defaultConfig = {
        type: 'text', // 消息类型
        content: '', // 消息内容
        icon: '', // 消息图标
        iconColor: '',
        duration: 3000, // 自动关闭延迟时间
        close: false, // 是否显示关闭按钮
        element: null,
    }

    const config = Object.assign(defaultConfig, typeCfg, cfg) // 合并配置

    // 创建实例
    return createInstance(config)
}


const Message = {
    // 纯文本消息
    text: (cfg = "") => renderMsg({
        type: "text",
        icon: ''
    }, cfg),
    // 成功提示
    success: (cfg = "") => renderMsg({
        type: "success",
        icon: 'icon-check-circle-fill',
        iconColor: "#52c41a"
    }, cfg),
    // 警告提示
    warning: (cfg = "") => renderMsg({
        type: "warning",
        icon: 'icon-warning-circle-fill',
        iconColor: "#faad14"
    }, cfg),
    // 错误提示
    error: (cfg = "") => renderMsg({
        type: "error",
        icon: 'icon-close-circle-fill',
        iconColor: "#ff4d4f"
    }, cfg),
}

export default Message