<template>
  <div id="crx-simpmode" ref="simpModeRef"></div>
  <div class="top-actions"></div>
  <div class="simpmode-action-btns">
    <div class="random-src" @click="switchSrc">随机切换</div>
    <div class="random-img" @click="switchImg">随机图片</div>
    <div class="exit-simp-mode" @click="exitSimpMode">退出极简模式</div>
  </div>
  <div class="lazy-image" ref="lazyImageRef1"></div>
  <div class="lazy-image" ref="lazyImageRef2"></div>
</template>

<script setup>
import { saveStoreUserConfigToStorage, store } from '@/plugins/store';
import { convertImgToBase64 } from '@/utils/format';
import { onMounted, ref } from 'vue';
import axios from 'axios';

const simpModeRef = ref(null)
const lazyImageRef1 = ref(null)
const lazyImageRef2 = ref(null)

const sources = [{
  name: "Unsplash Free",
  method: (callback) => fetchRandomUnsplashFree(callback)
}, {
  name: "Unsplash Api",
  method: (callback) => fetchUnsplashApi(callback, {})
}, {
  name: "Unsplash Google Earch",
  method: (callback) => fetchUnsplashApi(callback, {
    collections: "1343739"
  })
}]

onMounted(() => {

  if (!store.userConfig.simpModeOptions) {
    store.userConfig.simpModeOptions = { source: Math.floor(Math.random() * sources.length) }
    saveStoreUserConfigToStorage()
  }
  switchImg()

  // 下面这部分代码，只能用神奇来表示
  /* 具体来说，当网页加载暗色调图片的时候，由于原本的网页背景是白色的，会有一瞬间的闪白
   * 所以我想加一个 0.5s 的过渡效果（transition），但是如果直接在 mounded 的时候修改发现没有作用
   * 于是阴差阳错的我使用了 setTimeOut 这个方法，先把透明度设置为 0， 然后延迟 1ms 再修改为 1。
   * 这两个步骤缺一不可，如果不先设置为 0，而是直接在 css 样式中设置为 0 的话，是没有过渡效果的。
   * 如果不设置 timeout 直接设置为 1 的话，也是没有效果的。
   */
})

const switchSrc = () => {
  let temp;
  do {
    temp = Math.floor(Math.random() * sources.length)
  } while (store.userConfig.simpModeOptions.source == temp)
  console.log(sources[temp].name)
  store.userConfig.simpModeOptions.source = temp
  saveStoreUserConfigToStorage()
  switchImg()
}

const switchImg = () => {
  console.log("Image Source: " + sources[store.userConfig.simpModeOptions.source].name)
  sources[store.userConfig.simpModeOptions.source].method(imageUrl => {
    simpModeRef.value.style.backgroundImage = "url(" + imageUrl + ")"
  })
}

const exitSimpMode = () => {
  store.userConfig.simpMode = false;
  saveStoreUserConfigToStorage();
}

const setpLoadImageCache = (callback, base64Img) => {
  callback(base64Img)
}

const fetchRandomUnsplashFree = (callbacl) => {
  const link = "https://source.unsplash.com/random/"
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callbacl(xhr.responseURL)
  }
  xhr.open('GET', link, true);
  xhr.send()
}

const fetchUnsplashApi = (callback, params) => {
  const config = {
    method: "GET",
    url: "https://api.unsplash.com/photos/random",
    params: params
  }
  config.params.client_id = store.userConfig.simpModeOptions.client_id

  chrome.storage.local.get(["imageCache"], res => {
    if (res.imageCache) {
      setpLoadImageCache(callback, JSON.parse(res.imageCache))
      console.log("use cache")
    }

    axios(config)
      .then(axiosRes => {
        convertImgToBase64(axiosRes.data.urls.regular, base64Img => {
          if (!res.imageCache) {
            setpLoadImageCache(callback, base64Img)
          }
          chrome.storage.local.set({ "imageCache": JSON.stringify(base64Img) })
        })
      })
      .catch(err => {
        console.log(err)
      })
  })
}

</script>

<style lang="less" scoped>
#crx-simpmode {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  // transition: all 0.5s ease-in-out;
  animation: zoom-a 35s ease-out;
  animation-fill-mode: forwards;
  z-index: 9;

  &::after {
    content: "";
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    
    z-index: 10;
    background: linear-gradient(180deg,rgba(0,0,0,.2) 0,transparent 20%,transparent 50%,rgba(0,0,0,.2));
  }
}

.simpmode-action-btns {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8rem 3rem 3rem 3rem;
  box-sizing: border-box;
  background: linear-gradient(#00000000, #00000055);
  color: white;
  transition: all 0.5s ease-in-out;
  opacity: 0;
  z-index: 10;

  >* {
    margin: 0 20px;
    cursor: pointer;
    padding: 1rem;
  }

  .exit-simp-mode {
    margin-left: auto;
  }

  &:hover {
    opacity: 1;
  }
}

.lazy-image {
  opacity: 0;
  width: 1px;
  height: 1px;
  position: fixed;
  left: -10px;
  top: -10px;
  z-index: -10;
}

@keyframes zoom-a {
	0% { 
    transform: scale3d(1.1,1.1,1.1) translate3d(-3%,-3%,0);
    opacity: 0; 
  }
	3% { opacity: 1; }
	100% { 
    transform: scaleX(1) translateZ(0); 
    opacity: 1;
  }
}
</style>