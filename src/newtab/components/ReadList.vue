<template>
  <div :class="[{'readlist-hidden': readlist.length == 0}, 'readlist-container']">
    <div class="title">稍后阅读</div>
      <div ref="readContainer" class="readlist">
        <div class="read-item" v-for="(item, idx) in readlist" :key="idx">
          <a class="read-card">
            <a class="card__title" :href="item.url">{{ item.title }}</a>
            <div class="card__info">
              <span class="card__domain">{{ item.domain }}</span>
              <span class="card__time">{{ item.fmtTime }}</span>
              <button @click="delReadCard(item.url)">已读</button>
            </div>
          </a>
        </div>
      </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from "vue";
import { loadConfigFromStorage, modifyConfigViaStorage } from "@/plugins/storage"
import { formatTime } from "@/utils/format";

const readlist = ref([]);
const readContainer = ref(null);

const praseReadlist = (list) => {
  list = JSON.parse(JSON.stringify(list))
  readlist.value = list.map(item => {
    item.domain = item.url.split('/')[2];
    item.fmtTime = formatTime(item.time)
    return item;
  });
}

const delReadCard = (url) => {
  modifyConfigViaStorage((config) => {
    config.readList.map((item, i) => {
      if (item.url == url) {
        config.readList.splice(i, 1);
      }
    })
    praseReadlist(config.readList)
    return config
  })
}

onMounted(() => {
  loadConfigFromStorage().then( config => {
    praseReadlist(config.readList)
  })

  readContainer.value.addEventListener("wheel", (event) => {
    event.preventDefault();
    readContainer.value.scrollIntoView({behavior: 'smooth'})
    readContainer.value.scrollLeft += event.deltaY;
  });
})

</script>
 
<style lang="less" scoped>
.readlist-container.readlist-hidden {
  display: none;
}
.readlist-container {
  width: 100%;
  height: 170px;
  display: flex;
  position: relative;

  > * {
    height: 100%;
  }

  .title {
    width: 48px;
    font-size: 1rem;
    padding: 12px;
    box-sizing: border-box;
    box-shadow: 0 0 1px 1px rgb(0 0 0 / 5%);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    text-align: center;
    writing-mode: vertical-lr;
    letter-spacing: 8px;
  }

  &::before {
    z-index: 1;
    content: "";
    width: 100px;
    height: 100%;
    position: absolute;
    right: 0;
    background: linear-gradient(to right, rgba(0,0,0,0), #f9f9fb);
  }
}

.readlist-container .readlist {
  position: relative;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  height: 100%;
  transition: all 0.1s;
  scroll-behavior: smooth;
    
  &::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
  scrollbar-width: none; /* Firefox */
}

.readlist > .read-item {
  width: 180px;
  display: inline-block;
  margin-left: 12px;
  height: 100%;
}

.readlist > .read-item > .read-card {
  display: block;
  height: 100%;
  color: inherit;
  border: 1px solid #e0e6ed;
  border-radius: 4px;
  box-sizing: border-box;
  position: relative;

  text-decoration-line: none;

  a.card__title {
    color: var(--text-main-color);
    font-size: 0.9rem;
    line-height: 1.5rem;
    margin: 16px 12px;
    height: 72px;
    text-decoration: none;
    overflow: hidden;
    white-space: break-spaces;
    text-overflow: ellipsis;
    display:-webkit-box; 
    -webkit-box-orient:vertical;
    -webkit-line-clamp:3;
    transition: all 0.1s ease-in-out;
    &:hover {
      color: var(--theme-color-40);
      margin-top: 20px;
      margin-bottom: 12px;
      // text-decoration: #ff7875 underline;
    }
  }
}

.readlist > .read-item > .read-card > div.card__info {
  padding: 0 12px;
  // background-color: antiquewhite;

  & > * {
    font-size: small;
    display: inline-block;
    line-height: 20px;
    margin: 4px 0;
  }

  span.card__domain {
    width: fit-content;
    display: block;
    border-bottom: 1px dashed var(--text-gray-color);
    color: var(--text-gray-color);
  }

  span.card__time {
    width: 100px;
  }
    
  button {
    opacity: 0;
    margin-left: auto;
    float: right;
    border: none;
    background: transparent;
    transition: all 0.1s ease-in-out;

    &:hover {
      cursor: pointer;
      pointer-events: auto;
    }
  }
  
  
  &:hover > button {
    cursor: pointer;
    opacity: 1;
  }
}
</style>