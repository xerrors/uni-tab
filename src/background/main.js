import hotReload from '@/utils/hotReload'
hotReload()
 
console.log('hello world background')

function getTitle () {
    console.log(document.title);
}

// 获取所有 tab
const pups = chrome.extension.getViews({
    type: 'popup'
}) || []

// 输出第一个使用插件页面的url
if (pups.length) {
    console.log(pups[0].location.href)
}

export default {
    getTitle
}