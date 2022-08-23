<template>
<div class="searchbar">
  <span>
    <icon-font :type="'icon-' + state.engine"/>
  </span>
  <input type="text" placeholder="Search Here" @keyup.enter="onSearch" v-model="inputValue">
</div>
</template>

<script setup>
import { reactive, ref, watch } from "vue"
import { createFromIconfontCN } from "@ant-design/icons-vue";

const IconFont = createFromIconfontCN({
  scriptUrl: '../../assets/icons/iconfont.js',
});

const state = reactive({
  engine: "google",
})
const inputValue = ref("")
const onSearch = () => {
  if (inputValue.value) {
    window.location.href = searchEngine[state.engine].url + inputValue.value
  }
}

const searchEngine = {
  baidu: {
    url: "https://www.baidu.com/s?wd=",
    keywords: ["百度", "baidu"]
  },
  google: {
    url: "https://google.com/search?q=",
    keywords: ["谷歌", "google"]
  },
  bing: {
    url: "https://www.bing.com/search?q=",
    keywords: ["必应", "bing"]
  },
  github: {
    url: "https://github.com/search?q=",
    keywords: ["github"]
  },
  dblp: {
    url: "https://dblp.org/search?q=",
    keywords: ["dblp", "dplb"]
  },
  weixin: {
    url: "https://weixin.sogou.com/weixin?type=2&query=",
    keywords: ["微信", "weixin", "wechat", "公众号", "gongzhonghao"]
  },
  zhihu: {
    url: "https://www.zhihu.com/search?type=content&q=",
    keywords: ["知乎", "zhihu"]
  },
  googlescholar: {
    url: "https://scholar.google.com/scholar?q=",
    keywords: ["学术", "xueshu", "scholar"]
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