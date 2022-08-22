<template>
<div class="options-container">
  <h1>设置</h1>
  <div class="quick-btns">
    <div class="options-btn" @click="saveConfig"> 保存配置 </div>
    <div class="options-btn" @click="demoClick">  加载配置 </div>
    <div class="options-btn" @click="userOptions.searchBar=!userOptions.searchBar">切换 header</div>
    <input type="file" id="fileInput" ref="fileInputBtn" @change="loadConfig" style="display: none;">
  </div>
  <button @click="saveOptions">保存</button>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { saveAs } from 'file-saver'
import { saveConfigToStorage, loadConfigFromStorage } from '@/plugins/storage';

const fileInputBtn = ref(null);
const userOptions = ref({});

onMounted(() => {
  loadConfigFromStorage().then(res => {
    console.dir(res)
    userOptions.value = res
  } )
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
      saveConfigToStorage(config)
      location.reload();
    }
  }
}

const demoClick = () => {
  fileInputBtn.value.click()
}

// const changeConfigItem = (name, value) => {
//   modifyConfigViaStorage(config => {
//     config[name] = value
//     userOptions.value = config
//     return config
//   })
// }

const saveOptions = () => {
  saveConfigToStorage(userOptions.value)
  location.reload();
}
</script>

<style lang="less" scoped>

.options-container {
  width: 100%;
  padding: 8px 1rem;
  box-sizing: border-box;
  // user-select: none;

  background: #fafafa;
  border: 1px solid #d0d7de;
  border-radius: 4px;
}

.quick-btns {
  &>.options-btn {
    margin-left: 0;
  }
} 

.options-btn {
  height: 2rem;
  display: inline-block;
  color: white;
  background: #2eaadc;
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  
  font-size: 0.8rem;
  line-height: 1rem;
}
</style>