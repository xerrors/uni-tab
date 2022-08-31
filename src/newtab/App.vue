<template>
  <div id="main-container" class="unitab">
    <simp-mode v-if="store.userConfig.simpMode" @exit-simp-mode="exitSimpMode"></simp-mode>
    <div :class="[{ 'show-option': state.showOptions }, 'newtab']" v-else-if="store.userConfig.name">
      <div class="header-container">
        <div class="uni-search-bar">
          <search-bar :default-search-engine="store.userConfig.defaultSearchEngine"></search-bar>
        </div>
        <div class="header-actions">
          <div :class="['header-act-btn', {'finish-btn': state.editLink }]" @click="state.editLink = !state.editLink"
            style="margin-left: auto" v-if="!store.userConfig.hideLinks">
            <form-outlined v-if="!state.editLink" />
            <span v-else>完成</span>
          </div>
          <div class="header-act-btn" @click="enterSimpMode">
            <send-outlined class="flip-horizontal-bottom" />
          </div>
          <div class="header-act-btn" @click="state.showOptions = !state.showOptions">
            <setting-filled class="rotate-90-cw act-setting-icon" v-if="state.showOptions" />
            <setting-outlined class="rotate-90-cw" v-else />
          </div>
        </div>
      </div>
      <group-links v-if="!store.userConfig.hideLinks" :edit-link="state.editLink"></group-links>
      <read-list v-if="!store.userConfig.hideReadList"></read-list>
    </div>
    <user-options v-if="state.showOptions" @hide-options="state.showOptions = false"></user-options>
  </div>
</template>
 
<script setup>
import { onMounted, reactive } from "vue";

import SearchBar from "@/global-components/SearchBar/App.vue";
import SearchBarPop from "@/global-components/SearchBar";
import UserOptions from "./components/UserOptions.vue";
import GroupLinks from "./components/GroupLinks.vue";
import ReadList from "./components/ReadList.vue"
import SimpMode from "./components/SimpMode.vue"

import {
  SettingOutlined,
  SettingFilled,
  FormOutlined,
  SendOutlined,
} from '@ant-design/icons-vue';

import {
  loadStoreUserConfigFromStorage,
  loadStoreOSSConfigFromStorage,
  loadStoreSyncStateFromStorage,
  saveStoreUserConfigToStorage,
  store
} from "@/plugins/store"
import { syncConfig } from "@/plugins/sync";

const state = reactive({
  editLink: false,
  showOptions: false,
  archiveMode: false,
})

// loadStoreUserConfigFromStorage()

// 加载时先获取同步状态，如果启用了同步就开始同步
onMounted(() => {
  loadStoreSyncStateFromStorage().then(() => {
    if (store.syncState.enableSync) {
      mountSync()
    }
    else {
      loadStoreUserConfigFromStorage()
      loadStoreOSSConfigFromStorage()
    }
  })
})

// 在 mount 的阶段做一次同步
const mountSync = async () => {
  loadStoreUserConfigFromStorage()  // 先把本地的加载出来，减少页面加载时间
  await loadStoreOSSConfigFromStorage()
  await syncConfig(() => { })

  if (store.syncState.type == "failed") {
    console.log("自动同步失败：" + store.syncState.msg)
  }

  loadStoreUserConfigFromStorage()
}

// 进入极简模型并存储
const enterSimpMode = () => {
  store.userConfig.simpMode = true;
  state.showOptions = false;
  saveStoreUserConfigToStorage();
}

const exitSimpMode = () => {
  store.userConfig.simpMode = false;
  saveStoreUserConfigToStorage();
}

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && (e.code == 'Space') && store.userConfig.simpMode) {
    SearchBarPop({name: "unitab"})
    e.preventDefault();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.code == 'KeyP') {
    if (store.userConfig.simpMode) {
      exitSimpMode()
    } else {
      enterSimpMode()
    }
    e.preventDefault();
  }
});

// document.addEventListener("keydown", function (e) {
//   if (e.altKey && (e.code)) {
//     console.log(e.code)
//     e.preventDefault();
//   }
// });

</script>
 
<style lang="less" scoped>

@import url("css/index.css");

#main-container {
  min-width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;

  &>div.newtab.show-option {
    width: calc(100vw - var(--option-width));
    transition: width 0.3s ease-in-out;
  }
}

.newtab {
  width: 100vw;
  color: var(--text-main-color);
  max-width: var(--page-width-main);
  margin: 0 auto;
  padding: 3rem;
  background-color: #f9f9fb;
  box-sizing: border-box;
  // position: relative;
}

.header-container {
  height: 60px;
  display: flex;
  justify-items: center;

  user-select: none;
  margin-top: 50px;
  margin-bottom: 100px;

  .uni-search-bar {
    flex-grow: 1;
  }

  .header-actions {
    display: flex;
    justify-content: center;
    flex-grow: 0;

    .finish-btn {
      background-color: var(--theme-color);
      color: white;
      border-radius: 4px;
      padding: 10px 1rem;
      margin: 12px 10px;
    }

    .act-setting-icon {
      color: var(--theme-color);
      transform: rotate(90deg);
    }
  }

  div.header-act-btn {
    font-size: 1rem;
    cursor: pointer;
    display: inline-block;
    padding: 1rem;
    line-height: 16px;
    margin: 6px 0;
    border-radius: 12px;
    user-select: none;
    transition: all 0.1s ease-in-out;
  }

  div.header-act-btn:not(.finish-btn):hover {
    background: #f0f2f4; 
    color: var(--theme-color);

    & > .rotate-90-cw {
      animation: rotate-90-cw 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }

    & > .flip-horizontal-bottom {
      animation: flip-horizontal-bottom 0.4s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
    }
  }
}

@keyframes rotate-90-cw {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(90deg);
  }
}

@keyframes flip-horizontal-bottom {
  0% {
    transform: rotateX(0);
  }
  100% {
    transform: rotateX(-180deg);
  }
}
</style>