<template>
<div class="popup-container">
  <!-- <div class="title">{{ title }}</div>
  <div class="title">{{ url }}</div> -->
  <div class="title">
    <div>
      <textarea 
        type="text" 
        rows="3"
        ref="focusTextarea"
        v-model="curSite.title"
      ></textarea>
    </div>
  </div>

  <div class="url">
    <div>
      <!-- <textarea type="text" v-model="curSite.url" rows="1"></textarea>  -->
      <input type="text" v-model="curSite.url" rows="1">
    </div>
  </div>

  <div class="btn-group">
    <button @click="addToReadList" :disabled="liststate"
      class="popup-btn add-to-readlist"
      >
      {{ liststate ? "已经添加" : "稍后阅读" }}
    </button>
    <button @click="addToLinks" :disabled="linkstate"
      class="popup-btn add-to-links"
      >
      {{ linkstate ? "已经添加" : "收藏链接" }}
    </button>
    <button class="popup-btn clear" @click="clearStorage">清空</button></div>
  <!-- <div class="debug">
    <p>state: {{ state }}</p>
    <p>curSite: {{ curSite }}</p>
  </div> -->
</div>
</template>
 
<script>
import { reactive, ref } from "vue";

export default {
  setup() {
    // const backend = chrome.extension.getBackgroundPage()
    const linkstate = ref(false)
    const liststate = ref(false)

    let curSite = reactive({
      title: "",
      url: "",
      icon: "",
      domain: "",
      group: "最近添加",
      time: "",
    })

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      curSite.title = tabs[0].title;
      curSite.url = tabs[0].url;
    })

    const addToLinks = () => {
      if (linkstate.value) {
        return;
      }

      let links = [];
      chrome.storage.sync.get(['links'], function(res) {
        if (res.links) {
          console.log(res.links.length)
          links = res.links
        }
        links.push(JSON.stringify(curSite))
        chrome.storage.sync.set({links: links}, function() {
          linkstate.value = true
        });
      });
    }

    const addToReadList = () => {
      if (liststate.value) {
        return;
      }

      let readlist = [];
      curSite.time = Date.parse(new Date());  // 获取当前时间戳
      chrome.storage.sync.get(['readlist'], function(res) {
        if (res.readlist) {
          console.log(res.readlist.length)
          readlist = res.readlist
        }
        readlist.push(JSON.stringify(curSite))
        chrome.storage.sync.set({readlist: readlist}, function() {
          liststate.value = true
        });
      });
    }

    const clearStorage = () => {
      chrome.storage.sync.set({links: []}, function() {
        console.log("cleared by user!")
      });
      chrome.storage.sync.set({readlist: []}, function() {
        console.log("cleared by user!")
      });
    }

    return {
      curSite, addToLinks, addToReadList, clearStorage,
      linkstate, liststate,
    };
  },
  
  mounted() {
    this.$refs.focusTextarea.focus();
  }
};
</script>
 
<style lang="less" scoped>
.popup-container {
  width: 300px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "PingFang SC", "Microsoft YaHei", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
}

div.title, div.url {
  padding: 10px 14px 0px;
  box-sizing: border-box;

  & > div {
    width: 100%;
    padding: 6px 8px;
    box-sizing: border-box;
    display: block;

    border-radius: 4px;
    border: 1px solid #e0e0de;
    box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px inset;
    background: rgba(242, 241, 238, 0.6);
    cursor: text;

    &:focus-within {
      box-shadow: none;
      outline: 2px solid #abddf1;
      border-color: #6ac1e3;
    }

    textarea, input {
      background: inherit;
      border: none;
      width: 100%;
      box-sizing: border-box;
      font-size: 14px;
      line-height: 22px;
      resize: none;
    
      &:focus {
        outline: 0px;
        border: none;
      }
    }
  }
}

.btn-group {
  display: flex;
  align-items: center;
  padding: 10px 14px 5px;
  margin-top: 10px;
  margin-bottom: 14px;
}

.popup-btn {
  user-select: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
  height: 28px;
  border-radius: 3px;
  box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px inset, rgb(15 15 15 / 10%) 0px 1px 2px;
  background: rgb(46, 170, 220);
  color: white;
  fill: white;
  line-height: 1.2;
  padding-left: 12px;
  padding-right: 12px;
  font-size: 14px;
  font-weight: 500;
  padding: 16px 12px;
  margin-right: 10px;

  border: none;
  outline: none;

  &:disabled {
    background: #8a8a87;
  }
}

.add-to-links {
  background: rgb(37, 174, 37);
}

.clear {
  background: rgb(240, 60, 60);
  margin-left: auto;
  margin-right: 0;
}

.debug {
  width: 100%;
  min-height: 100px;
  margin-top: 20px;
  padding: 10px 14px 0px;
  box-sizing: border-box;

  border-radius: 4px;
  border: 1px solid #e0e0de;
  box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px inset;
  background: rgba(242, 241, 238, 0.6);

  overflow: scroll;
}
</style>