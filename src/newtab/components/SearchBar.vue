<template>
<div class="searchbar">
  <span>
    <icon-font :type="'icon-' + state.engine"/>
  </span>
  <input type="text" placeholder="Search Here" @keyup.enter="onSearch" v-model="inputValue">
</div>
</template>

<script setup>
import { reactive, ref, watch, defineProps } from "vue"
import { createFromIconfontCN } from "@ant-design/icons-vue";
import { searchEngine } from "@/assets/configs/config";

const IconFont = createFromIconfontCN({
  scriptUrl: '../../assets/icons/iconfont.js',
});

const props = defineProps(['defaultSearchEngine'])
const state = reactive({
  engine: "google",
})
const inputValue = ref("")
const onSearch = () => {
  if (inputValue.value) {
    window.location.href = searchEngine[state.engine].url + inputValue.value
  }
}


watch(inputValue, (value) => {
  for (var engine in searchEngine) {
    const info = searchEngine[engine];
    info.keywords.forEach(keyword => {
      if (value.toLowerCase().startsWith(keyword + " ") && state.engine != engine) {
        inputValue.value = inputValue.value.slice(keyword.length+1)
        state.engine = engine
      }
    });
  }
})

watch(() => props.defaultSearchEngine, (value) => {
  state.engine = value;
})

</script>

<style lang="less" scoped>
.searchbar {
  width: 50vw;
  max-width: 680px;
  height: 52px;
  display: flex;

  margin: 4px 0;
  padding: 4px 8px;
  border: 1px solid white;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: white;
  box-shadow: 0 2px 6px rgb(0 0 0 / 15%);
  align-items: center;

  &:focus-within {
    box-shadow: none;
    outline: 2px solid var(--theme-color-80);
    border-color: var(--theme-color);
  }

  & > span {
    width: 42px;
    height: 42px;
    display: inline-block;
    padding: 7px 0;
    box-sizing: border-box;
    font-size: 20px;
    text-align: center;
    color: var(--text-gray-color);
  }

  input {
    width: 100%;
    height: 100%;
    display: inline-block;
    background-color: white;
    border: none;
    outline: none;
    font-size: 1rem;
    padding: 0 4px;

    &:focus {
      border: none;
      outline: none;
    }
  }
}

</style>