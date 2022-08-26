<template>
  <div id="main-container">
    <simp-mode v-if="store.userConfig.simpMode"></simp-mode>
    <div :class="[{ 'show-option': state.showOptions }, 'newtab']" v-else-if="store.userConfig.name">
      <div class="header-ccontainer">
        <search-bar :default-search-engine="store.userConfig.defaultSearchEngine"></search-bar>
        <div class="settings div-btn" @click="state.archiveMode = !state.archiveMode" style="margin-left: auto">
          <eye-invisible-outlined v-if="state.archiveMode" />
          <eye-outlined v-else />
        </div>
        <div class="settings div-btn" @click="state.editLink = !state.editLink">
          <form-outlined />
        </div>
        <div class="settings div-btn" @click="enterSimpMode">
          <send-outlined />
        </div>
        <div class="settings div-btn" @click="state.showOptions = !state.showOptions">
          <setting-outlined />
        </div>
      </div>
      <group-links :edit-link="state.editLink" :archive-mode="state.archiveMode"></group-links>
      <read-list></read-list>
    </div>
    <user-options v-if="state.showOptions" @hide-options="state.showOptions = false"></user-options>
  </div>
</template>
 
<script setup>
import { onMounted, reactive } from "vue";

// import SearchBar from "./components/SearchBar.vue";
import SearchBar from "@/global-components/SearchBar/App.vue";
import SearchBarPop from "@/global-components/SearchBar";
import UserOptions from "./components/UserOptions.vue";
import GroupLinks from "./components/GroupLinks.vue";
import ReadList from "./components/ReadList.vue"
import SimpMode from "./components/SimpMode.vue"

import {
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
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
  saveStoreUserConfigToStorage();
}

document.addEventListener("keydown", function (e) {
  if (e.shiftKey && (e.code == 'Space') && store.userConfig.simpMode) {
    SearchBarPop({name: "unitab"})
    e.preventDefault();
  }
});

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

.div-btn {
  font-size: 16px;
  cursor: pointer;
  display: inline-block;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 12px 12px;
  line-height: 16px;
  border-radius: 4px;
  user-select: none;
}

.header-ccontainer {
  height: 60px;
  display: flex;
  justify-items: center;

  user-select: none;
  margin-top: 50px;
  margin-bottom: 100px;

  h1 {
    margin: 0;
    line-height: 60px;
  }

  div.settings:hover {
    transition: all 0.1s ease-in-out;
    background: #f0f2f4;
  }
}
</style>