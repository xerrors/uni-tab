<template>
  <div :class="[{ 'plus-mode': props.config }, 'searchbar']" id="crx-unitab-searchbar" ref="searchBarRef">
    <span class="c-search-icon" id="c-search-icon">
      <icon-font-ali :type="'icon-' + state.engine" v-if="props.config && props.config.name != 'unitab'" />
      <icon-font :type="'icon-' + state.engine" v-else />
    </span>
    <input type="text" ref="searchBarInput" id="search-bar-input" class="search-bar-input" v-model="inputValue"
      :placeholder="searchEngine[state.engine].des" @keyup.enter="onSearch">
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from "vue"
import { searchEngine } from "@/assets/configs/config";
import { IconFont, IconFontAli } from "@/global-components";
import { onClickOutside } from "@vueuse/core";

// eslint-disable-next-line
const props = defineProps({
  defaultSearchEngine: { type: String }, // 消息配置项
  config: { type: Object, default: () => { } }, // 消息配置项
  remove: { type: Function, default: () => { } }, // 取消挂载回调
})

const state = reactive({
  engine: "google"
})

const inputValue = ref("")
const searchBarRef = ref(null)
const searchBarInput = ref(null)

const onSearch = () => {
  if (inputValue.value) {
    if (props.config) {
      window.open(searchEngine[state.engine].url + inputValue.value)
      props.remove()
    }
    else {
      window.location.href = searchEngine[state.engine].url + inputValue.value
    }
  }
}

watch(inputValue, (value) => {
  for (var engine in searchEngine) {
    const info = searchEngine[engine];
    info.keywords.forEach(keyword => {
      if (value.toLowerCase().startsWith(keyword + " ") && state.engine != engine) {
        inputValue.value = inputValue.value.slice(keyword.length + 1)
        state.engine = engine
      }
    });
  }
})

// watch(() => props.defaultSearchEngine, (value) => {
//   state.engine = value;
// })

onMounted(() => {
  state.engine = props.defaultSearchEngine || 'google'
  if (props.config) {
    setTimeout(() => {
      searchBarInput.value.focus()
    }, 100)
    onClickOutside(searchBarRef, () => props.remove()) // 隐藏输入
    searchBarRef.value.addEventListener("keydown", function (e) {
      if (e && e.code == "Escape") {
        props.remove()
      }
    });
  }
})


</script>

<style lang="less">
.c-searchbar-plus {
  position: fixed;
  top: 30vh;
  width: 100vw;
  z-index: 9999;
}
</style>

<style lang="less" scoped>
div.c-searchbar-plus>div#crx-unitab-searchbar.searchbar {
  width: 60vw;
  max-width: 680px;
}

div:not(.c-searchbar-plus)>div#crx-unitab-searchbar.searchbar {
  width: 90%;
  max-width: 700px;
}

div#crx-unitab-searchbar.searchbar {
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
  position: relative;

  &:focus-within {
    outline: 2px solid var(--theme-color-60);
    // border-color: var(--theme-color);
  }

  &>span#c-search-icon.c-search-icon {
    width: 42px;
    height: 42px;
    display: inline-block;
    box-sizing: border-box;
    font-size: 20px;
    text-align: center;
    color: var(--text-gray-color);
  }

  input[type=text]#search-bar-input.search-bar-input {
    width: 100%;
    height: 100%;
    display: inline-block;
    background-color: white;
    border: none;
    outline: none;
    font-size: 16px;
    padding: 0 4px;

    &:focus {
      border: none;
      outline: none;
    }
  }
}

#crx-unitab-searchbar.plus-mode.searchbar {
  margin: 0 auto;
  box-shadow: rgb(0 0 0 / 20%) 0px 10px 100px 10px;
}


#crx-unitab-searchbar.searchbar>span#c-search-icon.c-search-icon>span {
  vertical-align: -webkit-baseline-middle;
}
</style>