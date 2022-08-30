<template>
  <div :class="[{ editable: props.editLink }, 'links-container']">
    <div v-for="group in store.userConfig.groupLinks" :key="group.name"
      :class="[{ 'is-archived': group.archive }, 'link-group']" ref="linkGroupsRef">
      <div :class="[{ 'dragged': dragGroupOptions.state }, 'link-group-name']" :draggable="dragGroupOptions.draggable">
        <span>{{ group.name }}</span>
        <span class="archive-btn link-group-btn" @click="archiveGroup(group.name)" v-if="props.editLink">
          <eye-invisible-outlined v-if="group.archive" />
          <eye-outlined v-else />
        </span>
        <!-- <span class="remove-btn link-group-btn" @click="removeLinkGroup(group.name)" v-if="state.edit_link">
          移除
        </span> -->
      </div>
      <draggable class="links" :list="group.links" group="links" @change="saveStoreUserConfigToStorage" itemKey="url"
        v-bind="state.dragOptions">
        <template #item="{ element }">
          <div class="list-group-item link-item">
            <a :href="element.url">{{ element.title }}</a>
            <close-circle-outlined @click="delLinks(group.name, element.url)" />
          </div>
        </template>
      </draggable>
    </div>
    <div class="add-group">
      <div class="add-btn" v-if="state.addNewLinkGroup == false" @click="clickToActiveInputBox">
        <plus-outlined />
      </div>
      <div ref="addInputBox" class="add-input" v-else>
        <input type="text" ref="newGroupInputBox" id="link-add-input-box" v-model="state.newGroupName"
          @keyup.enter="addNewLinkGroup">
        <button class="c-btn-m" @click="addNewLinkGroup">
          <check-outlined />
        </button>
      </div>
    </div>
    <div class="link-group-bin" ref="linkBinRef">
      <img src="@/assets/icons/recycle-bin.png" alt="bin">
      <p>拖拽到此处删除</p>
    </div>
  </div>

</template>

<script setup>
import { computed, onMounted, reactive, ref, defineProps } from "vue";
import draggable from 'vuedraggable'
import { onClickOutside } from '@vueuse/core';

import {
  EyeInvisibleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons-vue';

import { CheckBox, Message } from "@/global-components"
import {
  saveStoreUserConfigToStorage,
  store
} from "@/plugins/store"

const props = defineProps(["editLink", "archiveMode"])

const addInputBox = ref(null)
const newGroupInputBox = ref(null)
const linkGroupsRef = ref([])
const linkBinRef = ref(null)

const state = reactive({
  newGroupName: "",
  addNewLinkGroup: false,
  dragOptions: computed(() => {
    return {
      animation: 200,
      group: "links",
      disabled: false,
      ghostClass: "ghost"
    };
  }),
})

const dragGroupOptions = reactive({
  dragElement: null,
  state: false,
  draggable: computed(() => !state.edit_link),
})

onClickOutside(addInputBox, () => state.addNewLinkGroup = false) // 隐藏输入

// 加载时先获取同步状态，如果启用了同步就开始同步
onMounted(() => {
  setTimeout(addDragListenerToGroups, 500) // 等待数据加载完毕
})


// 折叠或者展开某个分组
const archiveGroup = (groupName) => {
  const group = store.userConfig.groupLinks.find(item => item.name == groupName)
  group.archive = !group.archive
  saveStoreUserConfigToStorage()
}

// 删除链接并将状态保存到存储中
const delLinks = (groupName, url) => {
  const group = store.userConfig.groupLinks.find(item => item.name == groupName)
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

// 弹出消息框，删除某个链接组
const removeLinkGroup = (groupName) => {
  let groupIndex;
  store.userConfig.groupLinks.map((item, i) => {
    if (item.name == groupName) {
      groupIndex = i
    }
  })

  CheckBox.confirm({
    content: "删除链接组「" + groupName + "」?",
    confirm: () => {
      store.userConfig.groupLinks.splice(groupIndex, 1);
      saveStoreUserConfigToStorage()
    }
  })
}

// 激活「添加新组」状态
const clickToActiveInputBox = () => {
  state.addNewLinkGroup = true;
  setTimeout(() => {
    newGroupInputBox.value.focus();
  }, 20)
}

// 添加一个空的链接组，并放在「最近添加」前面
const addNewLinkGroup = () => {
  const trimedName = state.newGroupName.trim()
  if (store.userConfig.groupLinks.map(g => g.name).indexOf(trimedName) >= 0 || !trimedName) {
    Message.error("Existed or Empty")
    newGroupInputBox.value.focus();
  } else {
    const groupLength = store.userConfig.groupLinks.length
    const idx = store.userConfig.groupLinks[groupLength - 1].name == "最近添加" ? groupLength - 1 : groupLength
    store.userConfig.groupLinks.splice(idx, 0, { name: trimedName, links: [] })
    state.addNewLinkGroup = false;
    state.newGroupName = "";
  }
}

const getIndex = element => [].indexOf.call(element.parentElement.parentElement.children, element.parentElement)
const swap = (arr, i, j) => {
  let temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

// 链接组的拖拽排序
const addDragListenerToGroups = () => {
  document.ondragover = function (e) { e.preventDefault(); }          // 必须设置dragover阻止默认事件
  document.ondrop = function (e) { e.preventDefault(); }

  linkGroupsRef.value.forEach(refItem => {

    const refHeader = refItem.firstChild

    // drag start
    refHeader.addEventListener('dragstart', () => {
      dragGroupOptions.state = true
      dragGroupOptions.dragElement = refHeader;                     // 用于存放拖动元素

      refItem.style.opacity = 0.7;
      linkBinRef.value.style.display = "block"                    // 显示垃圾桶
    }, false);

    // drag end
    refHeader.addEventListener('dragend', (event) => {
      dragGroupOptions.state = false

      refItem.style.opacity = 1;
      linkBinRef.value.style.display = "none"                     // 隐藏垃圾桶
      saveStoreUserConfigToStorage()
      event.preventDefault();
    }, false)

    // drag enter
    refHeader.addEventListener('dragenter', () => {
      swap(store.userConfig.groupLinks, getIndex(refHeader), getIndex(dragGroupOptions.dragElement))
    }, false)

    // drag leave
    refHeader.addEventListener('dragleave', () => { }, false)
  })

  linkBinRef.value.addEventListener('drop', () => {               // 拖进回收站则删除该元素
    const group = store.userConfig.groupLinks[getIndex(dragGroupOptions.dragElement)]
    removeLinkGroup(group.name)
  }, false)
}


</script>
 
<style lang="less" scoped>
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

.links-container.editable>.is-archived {
  display: block;
}

.links-container.editable>.link-group {
  .link-group-name {
    cursor: auto;
  }

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
  user-select: none;
  // position: relative;

  // &:hover .link-group-name span.remove-btn {
  //   opacity: 1;
  // }

  .link-group-name {
    font-size: 1rem;
    height: 2rem;
    line-height: 2rem;
    padding-left: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    display: flex;
    position: relative;
    letter-spacing: 1px;

    &:hover {
      cursor: grab;
    }

    &:hover span.archive-btn {
      background: #f0f9ff;
      color: var(--theme-color);
    }

    &::before {
      content: "";
      width: 3px;
      height: 1rem;
      position: absolute;
      left: 0px;
      top: 0.6rem;
      border-radius: 2px;
      z-index: 2;
      background-color: var(--theme-color);
    }

    span.link-group-btn {
      cursor: pointer;
    }

    // span.remove-btn {
    //   color: hsl(1, 100%, 60%);
    //   position: absolute;
    //   opacity: 0;
    //   right: 0;
    //   transition: opacity 0.3s ease-in-out;
    // }

    span.archive-btn {
      color: var(--text-main-color);
      border-radius: 4px;
      padding: 8px 10px;
      box-sizing: border-box;
      font-size: 1rem;
      line-height: 1rem;
      transition: background 0.1s ease-in-out;
      margin-left: auto;
    }
  }

  .link-group-name.dragged {
    background-color: white;
    border: 2px dashed var(--border-color);
    margin: -2px -2px 8px -2px;
  }
}

.link-group>.links>.link-item {
  display: block;
  width: 100%;

  &>a,
  span {
    display: inline-block;
    border-radius: 4px;
    padding: 8px 10px;
    box-sizing: border-box;
    font-size: 0.9rem;
    line-height: 1rem;
    transition: background 0.1s ease-in-out;
  }

  &>a {
    width: var(--linkcard-width);
    text-decoration-line: none;
    color: var(--text-secondry-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &>span {
    display: none;
    cursor: pointer;
    text-decoration-line: none;
    float: right;
    text-align: right;
    opacity: 0.6;
  }

  &:hover>a {
    color: var(--text-main-color);
    background: #f0f2f4;
  }

  &:hover>span {
    opacity: 1;
    background: #fff1f0;
    color: hsl(1, 100%, 60%);
    ;
  }
}

.link-group-bin {
  position: fixed;
  width: 200px;
  left: calc(50vw - 100px);
  bottom: 40px;
  padding: 20px 40px;
  border: 2px dashed var(--border-color);
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  text-align: center;
  font-size: 1rem;
  color: var(--text-secondry-color);
  display: none;
  z-index: 90;

  img {
    width: 50px;
    margin-top: 20px;
  }
}

.links-container>.add-group {
  display: none;
}

.links-container.editable,
.links-container.archived {
  &>.add-group {
    display: block;
  }
}

.add-group>.add-btn {
  width: 100%;
  font-size: 1rem;
  line-height: 2rem;
  box-sizing: border-box;
  border: 1px dashed var(--border-color-darker);
  border-radius: 4px;
  text-align: center;
}

.add-group>.add-input {
  width: 100%;

  &>input[type=text]#link-add-input-box {
    display: inline-block;
    width: calc(var(--linkcard-width) - 70px);
  }

  &>button {
    margin-left: 1rem;
  }
}
</style>