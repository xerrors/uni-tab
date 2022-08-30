<template>
  <div id="crx-simpmode" ref="simpModeRef"></div>
  <div class="top-actions">{{ state.src.label }}</div>
  <div class="simpmode-action-btns">
    <!-- <div class="random-src" @click="switchSrc">随机切换</div> -->
    <div class="random-img" @click="switchImg">随机图片</div>
    <div class="exit-simp-mode" @click="exitSimpMode">退出极简模式</div>
  </div>
  <div class="lazy-image" ref="lazyImageRef1"></div>
  <div class="lazy-image" ref="lazyImageRef2"></div>
</template>

<script setup>
import { saveStoreUserConfigToStorage, store } from '@/plugins/store';
import { convertImgToBase64 } from '@/utils/format';
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';

const simpModeRef = ref(null)
const lazyImageRef1 = ref(null)
const lazyImageRef2 = ref(null)

const sources = [{
  name: 'unsplash-free',
  label: 'Unsplash Free',
  method: (callback) => fetchRandomUnsplashFree(callback)
}, {
  name: 'unsplash-api',
  label: 'Unsplash API',
  method: (callback) => fetchUnsplashApi(callback, 'unsplash-api', {})
}, {
  name: 'unsplash-api-earth',
  label: 'Unsplash Google Earch',
  method: (callback) => fetchUnsplashApi(callback, 'unsplash-api-earth', {
    collections: '1343739'
  })
}, {
  name: 'unsplash-api-oil-art',
  label: 'Unsplash Oil Art',
  method: (callback) => fetchUnsplashApi(callback, 'unsplash-api-oil-art', {
    collections: 'h_xXYYzbisg'
  })
}]

const state = reactive({
  src: sources[0]
})

onMounted(() => {
  if (!store.userConfig.simpModeOptions) {
    const randSrc = sources[Math.floor(Math.random() * sources.length)]
    state.src = randSrc
    store.userConfig.simpModeOptions = { source: randSrc.name, imageSize: "regular" }
    saveStoreUserConfigToStorage()
  } else {
    const imageSrc = sources.find(item => item.name == store.userConfig.simpModeOptions.source)
    state.src = imageSrc
  }
  console.log(state.src)
  switchImg()
})

// const switchSrc = () => {
//   let temp;
//   do {
//     temp = Math.floor(Math.random() * sources.length)
//   } while (store.userConfig.simpModeOptions.source == temp)
//   console.log(sources[temp].name)
//   store.userConfig.simpModeOptions.source = temp
//   saveStoreUserConfigToStorage()
//   switchImg()
// }

const switchImg = () => {
  state.src.method(imageUrl => {
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

const fetchUnsplashApi = (callback, name, params) => {
  const config = {
    method: "GET",
    url: "https://api.unsplash.com/photos/random",
    params: params
  }
  config.params.client_id = store.userConfig.simpModeOptions.client_id || "brbgDcyKVK0ahmSJYXgM85P4hRnI8FmhDM4Fhtohrl0"

  chrome.storage.local.get([name], res => {
    const cache  = res[name]
    if (cache) {
      setpLoadImageCache(callback, JSON.parse(cache))
      console.log("use cache from " + name)
    }

    axios(config)
      .then(axiosRes => {
        const unsplashImageSizeUrl = getImageSizeUrl(axiosRes.data.urls)
        convertImageUrlToStorageByName(unsplashImageSizeUrl, name, base64Img => {
          if (!cache) {
            setpLoadImageCache(callback, base64Img)
          }
        })
      })
      .catch(err => console.log(err))
  })
}

const convertImageUrlToStorageByName = (url, name, callback) => {
  convertImgToBase64(url, base64Img => {
    callback(base64Img)
    const temp = Object({})
    temp[name] = JSON.stringify(base64Img)
    chrome.storage.local.set(temp)
  })
}

const getImageSizeUrl = (urls) => {
  if (store.userConfig.simpModeOptions.imageSize) {
    return urls[store.userConfig.simpModeOptions.imageSize]
  } else {
    return urls.regular
  }
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

.top-actions {
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  padding: 2rem;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.5s ease-in-out;
  z-index: 10;
}

.simpmode-action-btns {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8rem 2rem 2rem 2rem;
  box-sizing: border-box;
  background: linear-gradient(#00000000, #00000055);
  color: white;
  transition: all 0.5s ease-in-out;
  opacity: 0;
  z-index: 10;

  >* {
    cursor: pointer;
    padding: 1rem 0;
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