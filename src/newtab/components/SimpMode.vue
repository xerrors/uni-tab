<template>
  <div id="crx-simpmode" ref="simpModeRef"></div>
  <!-- <div class="top-actions">
    <div>{{ state.src.label }}</div>
    <div @click="$emit('exitSimpMode')"><export-outlined /></div>
  </div> -->
  <div class="simpmode-action-btns">
    <!-- <div class="random-src" @click="switchSrc">随机切换</div> -->
    <div class="actions-left">
      <span @click="switchImg">{{ state.src.label }}</span>
      <span>
        <loading-outlined v-if="state.loading" />
        <!-- <format-painter-filled v-else /> -->
      </span>
    </div>
    <div class="actions-right">
      <span @click="$emit('exitSimpMode')">Exit</span>
    </div>
  </div>
  <div class="lazy-image" ref="lazyImageRef1"></div>
  <div class="lazy-image" ref="lazyImageRef2"></div>
</template>

<script setup>
import { saveStoreUserConfigToStorage, store } from '@/plugins/store';
import { convertImgToBase64 } from '@/utils/format';
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';

import {
  // FormatPainterFilled,
  LoadingOutlined,
} from '@ant-design/icons-vue'

const simpModeRef = ref(null)
const lazyImageRef1 = ref(null)
const lazyImageRef2 = ref(null)
// eslint-disable-next-line
defineEmits(['exitSimpMode'])


// const uniStorage = chrome.storage.local;
const uniStorage = localStorage;

const sources = [{
  name: 'unsplash-free',
  label: 'Unsplash Free',
  method: () => fetchRandomUnsplashFree('unsplash-free')
}, {
  name: 'unsplash-api',
  label: 'Unsplash API',
  method: () => fetchUnsplashApi('unsplash-api', {
    orientation: 'landscape',
  })
}, {
  name: 'unsplash-api-earth',
  label: 'Unsplash Google Earch',
  method: () => fetchUnsplashApi('unsplash-api-earth', {
    collections: '1343739',
    orientation: 'landscape',
  })
}, {
  name: 'unsplash-api-oil-art',
  label: 'Unsplash Oil Art',
  method: () => fetchUnsplashApi('unsplash-api-oil-art', {
    collections: 'h_xXYYzbisg',
    orientation: 'landscape',
  })
}]

const state = reactive({
  src: sources[0],
  loading: false,
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
  state.loading = true
  state.src.method()
}

const replaceBgImage = url => {
  simpModeRef.value.style.backgroundImage = "url(" + url + ")"
    setTimeout(() => state.loading = false, 1000)
}

const setpLoadImageCache = (base64Img) => {
  replaceBgImage(base64Img)
}

const fetchRandomUnsplashFree = (name) => {
  uniStorage.get(["wallpaperCache", "imageSrc"], res => {
    const cache  = res.wallpaperCache
    const canUseCache = cache && res.imageSrc && JSON.parse(res.imageSrc) == name
    if (canUseCache) {
      setpLoadImageCache(JSON.parse(cache))
      console.log("use cache")
    }
    getRedirectLinkCallback("https://source.unsplash.com/random/", resURL => {
      convertImageUrlToStorageByName(resURL, name, setpLoadImageCache, !canUseCache)
    })
  })

}

const fetchUnsplashApi = (name, params) => {
  const config = {
    method: "GET",
    url: "https://api.unsplash.com/photos/random",
    params: params
  }
  config.params.client_id = store.userConfig.simpModeOptions.client_id

  uniStorage.get(['wallpaperCache', "imageSrc"], res => {
    const cache  = res.wallpaperCache
    const canUseCache = cache && res.imageSrc && JSON.parse(res.imageSrc) == name
    if (canUseCache) {
      setpLoadImageCache(JSON.parse(cache))
      console.log("use cache")
    }

    axios(config)
      .then(axiosRes => {
        const imageSizeUrl = getImageSizeUrl(axiosRes.data.urls)
        convertImageUrlToStorageByName(imageSizeUrl, name, setpLoadImageCache, !canUseCache)
      })
      .catch(err => console.log(err))
  })
}

const convertImageUrlToStorageByName = (url, name, callback, replace = false) => {
  convertImgToBase64(url, base64Img => {
    if (replace) {
      console.log("replace")
      callback(base64Img)
    }
    uniStorage.set({
      'wallpaperCache': JSON.stringify(base64Img),
      'imageSrc': JSON.stringify(name)
    })
  })
}

const getImageSizeUrl = (urls) => {
  if (store.userConfig.simpModeOptions.imageSize) {
    return urls[store.userConfig.simpModeOptions.imageSize]
  } else {
    return urls.regular
  }
}

const getRedirectLinkCallback = (link, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(xhr.responseURL)
  }
  xhr.open('GET', link, true);
  xhr.send()
}

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && (e.code == 'KeyR')) {
    switchImg()
    e.preventDefault();
  }
});
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

// .top-actions {
//   display: flex;
//   position: fixed;
//   top: 0;
//   width: 100%;
//   padding: 2rem;
//   color: white;
//   font-size: 1rem;
//   font-weight: bold;
//   transition: all 0.5s ease-in-out;
//   z-index: 10;
// }

.simpmode-action-btns {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8rem 2rem 2rem 2rem;
  box-sizing: border-box;
  color: white;
  transition: all 0.5s ease-in-out;
  z-index: 10;

  .actions-left, .actions-right {
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: white;
    opacity: .8;
    text-shadow: 0 1px 4px rgb(0 0 0 / 15%);

    &:hover {
      opacity: 1;
    }
  }
  .actions-left {
    flex-grow: 1;

    * {
      display: inline-block;
      margin-right: 0.5rem;
      cursor: pointer;
    }
  }
  .actions-right {
    flex-grow: 0;
    cursor: pointer;
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