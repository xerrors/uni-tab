<template>
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
      <span class="c-btn-text" @click="syncConfigOpt" style="margin-right: 1rem">立即同步</span>
      <span style="margin-right: 0.5rem">更新于：{{ state.sync.timeStamp ? state.formatedDate : ""}}</span> 
      <span>状态：{{ state.sync.type }}</span>
      <label for="region">Region</label>
      <input type="text" name="region" v-model="state.ossUserConfig.region">
      <label for="bucket">Bucket Name</label>
      <input type="text" name="bucket" v-model="state.ossUserConfig.bucket">
      <label for="accessKeyId">AccessKey ID</label>
      <input type="password" name="accessKeyId" v-model="state.ossUserConfig.accessKeyId">
      <label for="accessKeySecret">Accesskey Secret</label>
      <input type="password" name="accessKeySecret" v-model="state.ossUserConfig.accessKeySecret">
    </form>
    <form action="" class="opt-config">
      <p class="opt-pri-name">用户配置</p>
      <label for="engine" style="display: inline-block;">默认搜索引擎</label>
      <select name="engine" v-model="userOptions.defaultSearchEngine">
        <option v-for="(engine, key, ind) in searchEngine" :value="key" :key="ind">
          <span><icon-font :type="'icon-' + key"/> </span> {{ engine.name }}
        </option>
      </select>
    </form>
  </div>
  <div class="opt-submit">
    <button class="c-btn-m" @click="saveOptions">保存</button>
    <button class="c-btn-m btn-secondry" @click="$emit('hide-options')">取消</button>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { saveAs } from 'file-saver'
import { 
  saveConfigToStorage, 
  loadConfigFromStorage, 
  loadSyncStateFromStorage, 
  syncConfig
} from '@/plugins/storage';
import { parseTime } from '@/utils/format';
import { ossConfig } from '@/assets/configs/alioss';
import { createFromIconfontCN } from "@ant-design/icons-vue";
import { searchEngine } from "@/assets/configs/config";

const IconFont = createFromIconfontCN({
  scriptUrl: '../../assets/icons/iconfont.js',
});

const fileInputBtn = ref(null);
const userOptions = ref({});

const state = reactive({
  sync: {},
  ossUserConfig: {...ossConfig},
  formatedDate: computed(() => parseTime(state.sync.timeStamp))
})

console.log(state.ossUserConfig)

onMounted(() => {
  loadConfigFromStorage().then(res => userOptions.value = res)
  loadSyncStateFromStorage().then(res => state.sync = res)
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
      saveConfigToStorage(config, false)
      location.reload();
    }
  }
}

const demoClick = () => {
  fileInputBtn.value.click()
}

const saveOptions = () => {
  saveConfigToStorage(userOptions.value)
  location.reload();
}

const syncConfigOpt = () => {
  syncConfig(res => state.sync = res )
}
</script>

<style lang="less" scoped>

.options-container {
  --opt-bg-color: white;
}

.options-container {
  width: var(--option-width);
  height: 100vh;
  position: sticky;
  top: 0;
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
  margin: 2rem 0 1rem 0;
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
.opt-content {
  min-height: calc(100vh - 10rem);

}

.opt-content form {
  margin-bottom: 2rem;
  .opt-pri-name {
    font-size: 1rem;
    font-weight: bold;
  }
}


.opt-submit {
  background-color: var(--opt-bg-color);
  border-top: 1px solid var(--border-color);
  position: sticky;
  bottom: 0;
  padding: 1rem 0;
  button {
    margin-right: 1rem;
  }
}
</style>