<template>
<div id="main-container">
  <div class="demo"></div>
  <div :class="[{'show-option': state.show_options}, 'newtab']">
    <div class="header-ccontainer">
      <search-bar :default-search-engine="store.userConfig.defaultSearchEngine"></search-bar>
      <div class="settings div-btn" @click="state.archiveMode = !state.archiveMode" style="margin-left: auto">
        <eye-invisible-outlined v-if="state.archiveMode"/>
        <eye-outlined v-else/>
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
            v-for="group in store.userConfig.groupLinks" :key="group.name">
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
          @change="saveStoreUserConfigToStorage"
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
      <div class="add-group">
        <div class="add-btn" v-if="state.addNewLinkGroup==false" @click="clickToActiveInputBox">
          <plus-outlined />
        </div>
        <div ref="addInputBox" class="add-input" v-else>
          <input
            type="text" 
            ref="newGroupInputBox" 
            id="link-add-input-box"
            v-model="state.newGroupName" 
            @keyup.enter="addNewLinkGroup"
          >
          <button class="c-btn-m" @click="addNewLinkGroup">
            <check-outlined />
          </button>
        </div>
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
import ReadList from "./components/ReadList.vue"
import SearchBar from "./components/SearchBar.vue";
import UserOptions from "./components/UserOptions.vue";
import { onClickOutside } from '@vueuse/core';

import { 
  EyeInvisibleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  FormOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons-vue';

import { CheckBox, Message }  from "@/global-components"
import { 
  saveStoreUserConfigToStorage,
  loadStoreUserConfigFromStorage, 
  loadStoreOSSConfigFromStorage,
  loadStoreSyncStateFromStorage,
  store
} from "@/plugins/store"
import { syncConfig } from "@/plugins/sync";

const state = reactive({
  newGroupName: "",
  addNewLinkGroup: false,
  edit_link: false,
  show_options: false,
  archiveMode: false,
  dragOptions: computed(() => {
    return {
      animation: 200,
      group: "links",
      disabled: false,
      ghostClass: "ghost"
    };
  }),
})

const addInputBox = ref(null)
const newGroupInputBox = ref(null)
const links = store.userConfig.groupLinks

onClickOutside(addInputBox, () => state.addNewLinkGroup=false)

onMounted(() => {
  loadStoreSyncStateFromStorage().then(() => {
    if (store.syncState.enableSync) {
      mountSync()
    }
    else {
      loadStoreOSSConfigFromStorage()
      loadStoreUserConfigFromStorage()
    }
  })
})

const mountSync = async () => {
  await loadStoreOSSConfigFromStorage()
  syncConfig(res => {
    if (res.type == "failed") {
      console.log("自动同步失败：" + res.msg)
    }
    
    loadStoreUserConfigFromStorage()
  })

}

const archiveGroup = (groupName) => {
  const group = links.find(item => item.name == groupName)
  group.archive = !group.archive
  saveStoreUserConfigToStorage()
}

const delLinks = (groupName, url) => {
  const group = links.find(item => item.name == groupName )
  if (group) {
    group.links.map((item, i) => {
      if (item.url == url) {
        group.links.splice(i, 1);
      }
    })
    saveStoreUserConfigToStorage()
  } else {
    Message.error("Group: " + groupName + " 不存在")
  }
}

const removeLinkGroup = (groupName) => {
  CheckBox.confirm({
    content: "是否要删除链接组「" + groupName + "」",
    confirm: () => {
      links.map((item, i) => {
        if (item.name == groupName) {
          links.splice(i, 1);
        }
      })
      saveStoreUserConfigToStorage()
    }
  })
}

const clickToActiveInputBox = () => {
  state.addNewLinkGroup = true;
  setTimeout(() => {
    newGroupInputBox.value.focus();
  }, 20)
}

const addNewLinkGroup = () => {
  const trimedName = state.newGroupName.trim()
  if (links.map(g => g.name).indexOf(trimedName) >= 0 || !trimedName ) {
    Message.error("Existed or Empty")
    newGroupInputBox.value.focus();
  } else {
    const groupLength = links.length
    const idx = links[groupLength-1].name == "最近添加" ? groupLength - 1 : groupLength
    links.splice(idx, 0, {name: trimedName, links: []})
    state.addNewLinkGroup = false;
    state.newGroupName = "";
  }
}

const handleSettingClick = () => {
  state.show_options = !state.show_options;
  state.edit_link = false;
}
</script>
 
<style lang="less" scoped>
@import url("css/index.css");

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
      color: hsl(1, 100%, 60%);
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
    color: hsl(1, 100%, 60%);;
  }
}

.links-container > .add-group {
  display: none;
}

.links-container.editable, .links-container.archived {
  & > .add-group {
    display: block;
  }
}

.add-group > .add-btn {
  width: 100%;
  font-size: 1rem;
  line-height: 2rem;
  box-sizing: border-box;
  border: 1px dashed var(--border-color-darker);
  border-radius: 4px;
  text-align: center;
}

.add-group > .add-input {
  width: 100%;

  & > input[type=text]#link-add-input-box {
    display: inline-block;
    width: calc(var(--linkcard-width) - 70px);
  }

  & > button {
    margin-left: 1rem;
  }
}


</style>