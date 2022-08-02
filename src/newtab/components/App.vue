<template>
  <div class="newtab">
    <div class="header-ccontainer">
      <h1>{{ userConfig.name }}, {{ state.greet }}</h1>
      <div class="settings div-btn" @click="handleSettingClick">
        设置
      </div>
    </div>
    <div class="options-container" v-if="state.show_options">
      <input type="file" id="fileInput" ref="fileInputBtn" @change="loadConfig" style="display: none;">
      <div class="options-btn div-btn" @click="saveConfig">
        保存配置
      </div>
      <div class="options-btn div-btn" @click="demoClick">
        加载配置
      </div>
      <input type="text" v-model="state.newGroupName">
      <div class="options-btn div-btn" @click="addNewLinkGroup">创建新组</div>
      <div class="options-btn div-btn" @click="state.edit_link = !state.edit_link">
        {{ state.edit_link ? "完成" : "编辑" }}
      </div>
    </div>
    <div :class="[{editable: state.edit_link}, 'links-container']">
      <div class="link-group" v-for="(links, key) in groupedLinks" :key="key">
        <div class="link-group-name">
          <span>{{ key }}</span>
          <span class="remove-link-group" @click="removeLinkGroup(key)">移除</span>
        </div>
        <draggable
          class="links"
          :list="links"
          group="links"
          @change="saveChangeToStorage"
          itemKey="url"
          v-bind="state.dragOptions"
        >
          <template #item="{ element }">
            <div class="list-group-item link-item">
                <a :href="element.url">{{ element.title }}</a>
                <span @click="delLinks(element.url)">删除</span>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <read-list></read-list>
    <!-- <div>{{state}}</div> -->
  </div>
</template>
 
<script>
import { computed, onMounted, reactive, ref } from "vue";
import { saveAs } from 'file-saver'
import draggable from 'vuedraggable'

import ReadList from "./ReadList.vue"
import { getItemFromStorage, saveItemToStorage, getAndSetStorageItem } from "@/utils/storage"


export default {
  components: {
    draggable,
    ReadList,
  },
  setup() {
    const init_links = [
      {
        title: "Weight & Bias - Projects",
        url: "https://wandb.ai/xerrors/projects",
        group: "常用链接"
      },
      {
        title: "Github",
        url: "https://github.com",
        group: "常用链接"
      },
      {
        title: "卖萌屋学术站",
        url: "https://arxiv.xixiaoyao.cn/trend",
        group: "每日一刷"
      },
      {
        title: "arXiv Daily - NLP",
        url: "https://www.arxivdaily.com/cate/20/seq/0",
        group: "每日一刷"
      },
      {
        title: "AI Deadline",
        url: "https://aideadlin.es/?sub=ML,CV,NLP,DM",
        group: "每日一刷"
      },
    ];

    const fileInputBtn = ref(null);
    const groupedLinks = ref({});

    const state = reactive({
      newGroupName: "",
      edit_link: false,
      show_options: false,
      greet: computed(() => {
        const time = new Date();
        const hour = time.getHours();
        if (hour < 2) { return "年轻人身体重要啊！" }
        else if (hour < 4) { return "夜深了！头发要紧！" }
        else if (hour < 8) { return "一大早就起来上班啦！" }
        else if (hour < 10) { return "准备开启美好一天！" }
        else if (hour < 12) { return "还差一会儿，坐等干饭！" }
        else if (hour < 14) { return "中午好，吃完饭休息一会儿！" }
        else if (hour < 16) { return "真是效率最高的时间段啊！" }
        else if (hour < 18) { return "也该好好休息一下了！" }
        else if (hour < 20) { return "好好学习一会儿！" }
        else if (hour < 22) { return "若不是为了生活，早下班了！" }
        else if (hour < 24) { return "看样子加班加的有点晚啦！" }
        return "加油！";
      }),
      dragOptions: computed(() => {
        return {
          animation: 200,
          group: "links",
          disabled: false,
          ghostClass: "ghost"
        };
      })
    })

    const userConfig = reactive({
      name: "玉川"
    })

    const saveChangeToStorage = () => {
      let links = [];
      Object.keys(groupedLinks.value).forEach(key => {
        groupedLinks.value[key] = groupedLinks.value[key].map(link => {
          link.group = key;
          return link;
        })
        links = links.concat(groupedLinks.value[key])
      });
      saveItemToStorage("links", links).then(() => console.log("saved"))
    }

    const loadLinks = () => {
      return new Promise(callback => {
        getItemFromStorage("links")
        .then( res => {
          const links = res.map(link => JSON.parse(link))
          callback(links)
        })
        .catch(() => {
          callback(init_links)
          saveItemToStorage("links", init_links).then(() => console.log("init"))
        })
      })
    }

    const delLinks = (url) => {
      getAndSetStorageItem("links",
        getResult => {
          let links = getResult.links.map(link => JSON.parse(link));
          links.map((item, i) => {
            if (item.url == url) {
              links.splice(i, 1);
            }
          })
          return links
        },
        setResult => praseLinksToGroupLinks(setResult)
      )
    }

    const removeLinkGroup = (groupName) => {
      console.log('remove group: ' + groupName)
      delete groupedLinks.value[groupName]
      saveChangeToStorage()
    }

    const saveConfig = async () => {
      const config = Object()
      await loadLinks().then( res => config.links = res)

      const content = JSON.stringify(config);
      const blob = new Blob([content ], {type: "text/plain;charset=utf-8"}); 
      saveAs(blob, "chuan.config")
    }

    const loadConfig = (event) => {
      const files = event.target.files
      if (files.length != 1) {
        console.log("Error Files: " + files)
      } 
      else {
        const reader = new FileReader()
        reader.readAsText(files[0])
        reader.onload = function (reader_res) {
          const config = JSON.parse(reader_res.target.result)
          saveItemToStorage("links", config.links).then((data) => praseLinksToGroupLinks(data))
        }
      }
    }

    const praseLinksToGroupLinks = (links) => {
      groupedLinks.value = {}
      links.forEach(item => {
        const key = item.group;
        groupedLinks.value[key] = groupedLinks.value[key] || [];
        groupedLinks.value[key].push(item);
      })
    }

    const demoClick = () => {
      fileInputBtn.value.click()
    }

    const addNewLinkGroup = () => {
      if (state.newGroupName in groupedLinks.value || !state.newGroupName ) {
        alert("Existed or Empty")
      } else {
        groupedLinks.value[state.newGroupName] = []
        state.newGroupName = ""
      }
    }

    const handleSettingClick = () => {
      state.show_options = !state.show_options;
      state.edit_link = false;
    }

    onMounted(() => {
      loadLinks().then( res => praseLinksToGroupLinks(res))
    })

    return {
      state,
      userConfig,
      groupedLinks,
      fileInputBtn,
      delLinks,
      saveChangeToStorage,
      saveConfig,
      loadConfig,
      demoClick,
      removeLinkGroup,
      addNewLinkGroup,
      handleSettingClick,
    };
  },
};
</script>
 
<style lang="less" scoped>

body, html {
  margin: 0;
  padding: 0;
}

.newtab {
  width: 80vw;
  max-width: 1050px;
  margin: 0 auto;
  padding: 50px;
  /* background-color: red; */

  > * {
    margin-bottom: 50px;
  }
}

.div-btn {
  font-size: 16px;
  cursor: pointer;
  display: inline-block;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 12px 10px;
  line-height: 16px;
  border-radius: 4px;
}

.header-ccontainer {
  height: 60px;
  display: flex;
  justify-items: center;

  user-select: none;

  h1 {
    margin: 0;
    line-height: 60px;
  }
  div.settings {
    margin-left: auto;

    &:hover {
      transition: all 0.1s ease-in-out;
      background: #f2f2f2;
    }
  }
}

.options-container {
  width: 100%;
  padding: 16px 12px;
  box-sizing: border-box;

  background: #fafafa;
  border: 1px solid #d0d7de;
  border-radius: 4px;

  input {
    height: 32px;
    width: 100px;
    margin-right: 10px;
  }

  .options-btn {
    height: 40px;
    margin-right: 10px;
    background: #2eaadc;
    color: white;
    box-sizing: border-box;
  }
}

.links-container {
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fill, 220px);
  grid-gap: 10px;
}
.link-group {
  width: 100%; 
  margin-bottom: 20px;

  .link-group-name {
    font-size: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid black;
    margin-bottom: 12px;
    display: flex;
    font-weight: bold;

    span.remove-link-group {
      display: none;
      margin-left: auto;
      cursor: pointer;
      
      color: #ff7875
    }
  }

  .links > .link-item {
    display: block;
    width: 100%;

    & > a, span {
      font-size: 14px;
      display: inline-block;
      border-radius: 4px;
      padding: 10px 8px;
      box-sizing: border-box;
      transition: background 0.1s ease-in-out;
    }

    & > a {
      width: 220px;
      text-decoration-line: none;
      color: black;
      overflow:hidden; 
      text-overflow:ellipsis;
      white-space:nowrap; 
    }

    & > span {
      display: none;
      cursor: pointer;
      color: #bd4644;
      text-decoration-line: none;
      float: right;
      text-align: right;
    }

    &:hover > a {
      background: #f2f2f2;
    }

    &:hover > span {
      background: #fff1f0;
    }
  }
}

.links-container.editable {
  .link-group .link-group-name span.remove-link-group {
    display: inline-block;
  }
  .link-group .links {
    .link-item > a {
        width: 170px;
    }
    .link-item > span {
        display: inline-block;
    }
  }
}

</style>