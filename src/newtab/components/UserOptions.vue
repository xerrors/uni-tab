<template>
<div class="opt-box" ref="userOptopnsElement">
<div class="options-container">
  <div class="opt-header">
    <h2>用户设置选项</h2>
    <input type="file" id="fileInput" ref="fileInputBtn" @change="loadConfig" style="display: none;">
    <h2 class="c-btn-text" @click="saveConfig"> 保存 </h2>
    <h2 class="c-btn-text" @click="demoClick">  导入 </h2>
  </div>
  <div class="opt-content">
    <form action="" class="opt-sync">
      <p class="opt-pri-name">同步设置</p>
      <span v-if="state.syncing" style="margin-right: 0.5rem"><loading-outlined /></span>
      <span v-else-if="store.syncState.enableSync" 
        type="button"
        class="c-btn-text" 
        @click="syncConfigOpt"
        style="margin-right: 0.5rem"
      >立即同步</span>
      <span v-if="store.syncState.enableSync" style="margin-right: 0.5rem">
        更新于：{{ state.formatedDate }}
        状态：{{ store.syncState.type }}
      </span> 
      <span v-if="store.syncState.enableSync" class="c-btn-text" @click="clickToDisableSync">暂停同步</span>
      <label for="region">Region</label>
      <input type="text" name="region" v-model="store.ossConfig.region">
      <label for="bucket">Bucket Name</label>
      <input type="text" name="bucket" v-model="store.ossConfig.bucket">
      <label for="accessKeyId">AccessKey ID</label>
      <input type="text" name="accessKeyId" v-model="store.ossConfig.accessKeyId">
      <label for="accessKeySecret">Accesskey Secret</label>
      <input type="text" name="accessKeySecret" v-model="store.ossConfig.accessKeySecret">
      <div class="oss-config-btn" v-if="!store.syncState.enableSync">
        <button type="button" class="c-btn-m" @click="clickToEnableSync">保存并同步</button>
        <button type="button" class="c-btn-m btn-secondry" @click="clickToSaveOssConfig">仅保存</button>
      </div>
      <div class="oss-config-btn" v-else>
        <button type="button" class="c-btn-m" @click="clickToSaveOssConfig">保存同步配置</button>
      </div>
    </form>
    <form action="" class="opt-config">
      <p class="opt-pri-name">用户配置</p>
      <label for="engine" style="display: inline-block;">默认搜索引擎</label>
      <select name="engine" v-model="store.userConfig.defaultSearchEngine">
        <option v-for="(engine, key, ind) in searchEngine" :value="key" :key="ind">
          <span><icon-font :type="'icon-' + key"/> </span> {{ engine.name }}
        </option>
      </select>
      <p>触发词：{{ store.userConfig.defaultSearchEngine && searchEngine[store.userConfig.defaultSearchEngine].keywords.join(", ")}}</p>
    </form>
  </div>
  <!-- <div class="opt-submit">
    <button type="button" class="c-btn-m" @click="saveOptions">保存</button>
    <button type="button" class="c-btn-m btn-secondry" @click="$emit('hide-options')">取消</button>
  </div> -->
</div>
</div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { saveAs } from 'file-saver'
import { saveConfigToStorage, loadConfigFromStorage } from '@/plugins/storage';
import { syncConfig } from '@/plugins/sync'
import { LoadingOutlined } from "@ant-design/icons-vue";
import { parseTime } from '@/utils/format';
import { searchEngine } from "@/assets/configs/config";
import { Message, IconFont, CheckBox }  from "@/global-components"

import {
  saveStoreUserConfigToStorage,
  saveStoreOSSConfigToStorage,
  store,  
saveStoreSyncStateToStorage} from '@/plugins/store';

const fileInputBtn = ref(null);
const userOptopnsElement = ref(null)

const state = reactive({
  syncing: false,
  formatedDate: computed(() => parseTime(store.syncState.timeStamp, "{h}:{i}:{s}"))
})

watch(() => store.userConfig.defaultSearchEngine, () => {
  saveStoreUserConfigToStorage()
})

const saveConfig = async () => {
  loadConfigFromStorage().then(config => {
    const content = JSON.stringify(config);
    const blob = new Blob([content ], {type: "text/plain;charset=utf-8"}); 
    saveAs(blob, "chuan.config")
  })
}

const loadConfig = (event) => {
  const files = event.target.files
  if (files.length != 1) {
    console.log("Error Files: " + files)
  }
  else {
    const reader = new FileReader()
    reader.readAsText(files[0])
    reader.onload = (reader_res) => {
      const config = JSON.parse(reader_res.target.result)
      if (config.timeStamp < store.userConfig.timeStamp) {
        CheckBox.confirm({
          content: "当前的版本("  + parseTime(store.userConfig.timeStamp) 
            + ")要比导入的版本("  + parseTime(config.timeStamp) 
            + ")要新，确定使用导入的配置版本覆盖现有的版本吗？",
          confirm: () => {
            store.userConfig = config
            saveConfigToStorage(config, false)
            Message.success("覆盖成功")
          }
        })
      } else {
          store.userConfig = config
          saveConfigToStorage(config, false)
          Message.success("导入成功")
      }
    }
    fileInputBtn.value.value = ""
  }
}

const demoClick = () => {
  fileInputBtn.value.click()
}

// const saveOptions = () => {
//   saveConfigToStorage(userOptions.value)
//   location.reload();
// }

const syncConfigOpt = (isTest = false) => {
  state.syncing = true
  return new Promise((resolve, reject) => {
    syncConfig(res => {
      if (res.type == "failed") {
        Message.error("同步失败")
        state.syncing = false
        reject(res)
      } else {
        Message.success("同步成功")
        state.syncing = false
        resolve(res)
      }
    }, isTest)
  })
}

const clickToDisableSync = () => {
  store.syncState.enableSync = false
  saveStoreSyncStateToStorage()
}

const clickToEnableSync = () => {
  saveStoreOSSConfigToStorage()
  if (!(store.ossConfig.region 
        && store.ossConfig.bucket 
        && store.ossConfig.accessKeyId 
        && store.ossConfig.accessKeySecret)) {
    Message.error("请完善 OSS 配置")
  } else {
    syncConfigOpt(true).then(() => {
      store.syncState.enableSync = true
      saveStoreSyncStateToStorage()
    }).catch((err) => {
      Message.error("与对象存储连接失败: " + err.msg)
    })
  }
}

const clickToSaveOssConfig = () => {
  saveStoreOSSConfigToStorage()
}

</script>

<style lang="less" scoped>
.opt-box {
  position: relative;
  width: var(--option-width);
  height: 100vh;
  position: sticky;
  top: 0;
}

.options-container {
  --opt-bg-color: white;
}

.options-container {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  padding: 0 2rem;
  box-sizing: border-box;
  color: var(--text-main-color);

  background: var(--opt-bg-color);
  border: 1px solid var(--border-color);
  // border-radius: 4px;
  // z-index: 2;
    
  &::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
  scrollbar-width: none; /* Firefox */
}

.opt-header {
  display: flow-root;
  margin: 5rem 0 1rem 0;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  background: var(--opt-bg-color);
  top: 0;

  h2 {
    font-size: 1rem;
    display: inline-block;
    line-height: 2rem;
  }

  .c-btn-text {
    float: right;
    font-size: 0.8rem;
    margin-left: 0.5rem;
    font-weight: normal;
  }
}

// for opt submit
// .opt-content {
//   min-height: calc(100vh - 10rem);
// }

.opt-content form {
  margin-bottom: 2rem;
  .opt-pri-name {
    font-size: 1rem;
    font-weight: bold;
  }
}

.oss-config-btn{
  padding: 1rem 0;
  button {
    margin-right: 1rem;
  }
}


// .opt-submit {
//   background-color: var(--opt-bg-color);
//   border-top: 1px solid var(--border-color);
//   position: sticky;
//   bottom: 0;
//   padding: 1rem 0;
//   button {
//     margin-right: 1rem;
//   }
// }
</style>