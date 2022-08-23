<template>
<div id="main-container">
  <div :class="[{'show-option': state.show_options}, 'newtab']">
    <div class="header-ccontainer">
      <search-bar></search-bar>
      <div class="settings div-btn" @click="state.archiveMode = !state.archiveMode" style="margin-left: auto">
        <appstore-outlined />
      </div>
      <div class="settings div-btn" @click="state.edit_link = !state.edit_link">
        <form-outlined />
      </div>
      <div class="settings div-btn" @click="handleSettingClick">
        <setting-outlined />
      </div>
    </div>
    <div :class="[{editable: state.edit_link, archived: state.archiveMode}, 'links-container']">
      <div :class="[{'is-archived': group.archive }, 'link-group']" 
            v-for="group in userConfig.groupLinks" :key="group.name">
        <div class="link-group-name">
          <span>{{ group.name }}</span>
          <span class="archive-btn link-group-btn" @click="archiveGroup(group.name)" v-if="state.archiveMode">
            <eye-invisible-outlined v-if="group.archive"/>
            <eye-outlined v-else/>
          </span>
          <span class="remove-btn link-group-btn" @click="removeLinkGroup(group.name)" v-if="state.edit_link">移除</span>
        </div>
        <draggable
          class="links"
          :list="group.links"
          group="links"
          @change="saveChangeToStorage"
          itemKey="url"
          v-bind="state.dragOptions"
        >
          <template #item="{ element }">
            <div class="list-group-item link-item">
                <a :href="element.url">{{ element.title }}</a>
                <close-circle-outlined @click="delLinks(group.name, element.url)"/>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <read-list></read-list>
    <!-- <div>{{state}}</div> -->
  </div>
  <user-options v-if="state.show_options" @hide-options="state.show_options=false"></user-options>
</div>
</template>
 
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import draggable from 'vuedraggable'
import ReadList from "./ReadList.vue"
import SearchBar from "./SearchBar.vue";
import UserOptions from "./UserOptions.vue";

import { 
  loadConfigFromStorage, 
  saveConfigToStorage, 
  modifyConfigViaStorage,
  getConfigFromOSS,
} from "@/plugins/storage"

import { 
  EyeInvisibleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FormOutlined,
} from '@ant-design/icons-vue';


const state = reactive({
  newGroupName: "",
  edit_link: false,
  show_options: false,
  archiveMode: false,
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
  }),
})

const userConfig = ref({})

onMounted(() => {
  loadConfigTemp().then(res => {
    if (res.timeStamp == 0) {
      getConfigFromOSS().then(ossConfig => {
        console.log("init from oss")
        userConfig.value = ossConfig
        saveConfigToStorage(ossConfig)
        location.reload()
      }).catch(() => {
        userConfig.value = res
      })
    }
    else {
      userConfig.value = res
    }
  })
})

const loadConfigTemp = () => {
  return new Promise(callback => {
    loadConfigFromStorage()
    .then(config => {
      callback(config)
    })
  })
}

const saveChangeToStorage = () => {
  saveConfigToStorage(userConfig.value)
}

const archiveGroup = (groupName) => {
  modifyConfigViaStorage(config => {
    const group = config.groupLinks.find(item => item.name == groupName)
    group.archive = !group.archive
    userConfig.value = config
    return config
  })
}

const delLinks = (groupName, url) => {
  modifyConfigViaStorage(config => {
    const group = config.groupLinks.find(item => item.name == groupName )
    if (group) {
      group.links.map((item, i) => {
        if (item.url == url) {
          group.links.splice(i, 1);
        }
      })
    }
    userConfig.value = config
    return config
  })
}

const removeLinkGroup = (groupName) => {
  modifyConfigViaStorage(config => {
    config.groupLinks.map((item, i) => {
      if (item.name == groupName) {
        config.groupLinks.splice(i, 1);
      }
    })
    userConfig.value = config
    return config
  })
}


// const addNewLinkGroup = () => {
//   modifyConfigViaStorage(config => {
//     if (state.newGroupName in config.groupLinks.map(g => g.name) || !state.newGroupName ) {
//       alert("Existed or Empty")
//     } else {
//       const groupLength = config.groupLinks.length
//       const idx = config.groupLinks[groupLength-1].name == "最近添加" ? groupLength - 1 : groupLength
//       config.groupLinks.splice(idx, 0, {name: state.newGroupName, links: []})
//     }
//     userConfig.value = config
//     return config
//   })
// }

const handleSettingClick = () => {
  state.show_options = !state.show_options;
  state.edit_link = false;
}
</script>
 
<style lang="less" scoped>
@import url("../css/index.css");

#main-container {
  min-width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color); 
  display: flex;

  & > div.newtab.show-option {
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

.links-container {
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fill, var(--linkcard-width));
  grid-gap: 10px;
  margin-bottom: 50px;
}

.links-container > .is-archived {
    display: none;
}
.links-container.archived > .is-archived {
    display: block;
}

.links-container.editable > .link-group {
  .link-group-name .remove-link-group {
    display: inline-block;
  }
  .links .link-item a {
    width: calc(var(--linkcard-width) - 40px);
  }
  .links .link-item span {
    display: inline-block;
  }
}

.link-group {
  width: 100%; 
  margin-bottom: 20px;

  .link-group-name {
    font-size: 1rem;
    height: 1.1rem;
    line-height: 1rem;
    padding-left: 7px;
    border-left: 3px solid var(--theme-color);
    margin-bottom: 12px;
    display: flex;
    position: relative;
    letter-spacing: 1px;
    // font-weight: bold;

    &:hover {
      cursor: grab;
    }
    span.link-group-btn {
      cursor: pointer;
    }
    span.remove-btn {
      color: #ff7875;
      position: absolute;
      right: 0;
    }
    span.archive-btn {
      margin-left: 1rem;
      color: var(--text-main-color);
    }
  }
}
.link-group > .links > .link-item {
  display: block;
  width: 100%;

  & > a, span {
    display: inline-block;
    border-radius: 4px;
    padding: 8px 10px;
    box-sizing: border-box;
    font-size: 0.9rem;
    line-height: 1rem;
    transition: background 0.1s ease-in-out;
  }

  & > a {
    width: var(--linkcard-width);
    text-decoration-line: none;
    color: var(--text-secondry-color);
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  & > span {
    display: none;
    cursor: pointer;
    color: #ff7875;
    text-decoration-line: none;
    float: right;
    text-align: right;
  }

  &:hover > a {
    color: var(--text-main-color);
    background: #f0f2f4;
  }

  &:hover > span {
    background: #fff1f0;
  }
}


</style>