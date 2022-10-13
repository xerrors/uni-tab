<template>
  <div class="readlist-next">
    <div class="card-container">
      <div class="card" v-for="item in readlist" :key="item.url">
        <div class="card__title">
          <a :href="item.url">{{ item.title }}</a>
        </div>
        <div class="card__info">
          <span class="card__domain">{{ item.domain }}</span>
          <span class="card__time">{{ item.fmtTime }}</span>
          <button @click="delReadCard(item.url)" id="readedBtn">已读</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { formatTime } from "@/utils/format";
import { store, saveStoreUserConfigToStorage } from "@/plugins/store";

const readlist = ref([]);

const praseReadlist = (list) => {
  list = JSON.parse(JSON.stringify(list))
  readlist.value = list.map(item => {
    let domain = item.url.match(/:\/\/(.[^/]+)/)[1]
    // item.domain = item.url.split('/')[2];
    if (domain.startsWith('www.')) {
      domain = domain.slice(4)
    }
    if (domain == 'mp.weixin.qq.com') {
      domain = 'wechat'
    }
    else if (domain == 'zhihu.com' || domain == 'zhuanlan.zhihu.com') {
      domain = 'zhihu'
    }
    else if (domain == 'github.com') {
      domain = 'github'
    }
    item.domain = domain
    item.fmtTime = formatTime(item.time, '{m}-{d}')
    return item;
  });
}

const delReadCard = (url) => {
  store.userConfig.readList.map((item, i) => {
    if (item.url == url) {
      store.userConfig.readList.splice(i, 1);
    }
  })
  praseReadlist(store.userConfig.readList)
  saveStoreUserConfigToStorage()
}

onMounted(() => {
  praseReadlist(store.userConfig.readList)
})

watch(() => store.userConfig.readList, value => {
  praseReadlist(value)
})
</script>

<style lang=less scoped>
.readlist-next {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .card-container {
    width: 100%;
    height: 100%;
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(auto-fill, var(--linkcard-width));
    grid-gap: 20px;

    .card {
      display: inline-block;
      width: 220px;
      // height: 100px;
      // margin: 10px;
      
      padding: 14px 12px;
      border-radius: 6px;
      background-color: #fff;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
      transition: all 0.3s ease-in-out;

      &:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      .card__title {
        margin-bottom: 12px;
        a {
          height: 42px;
          text-decoration: none;
          color: var(--text-secondry-color);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          white-space: break-spaces;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          text-overflow: ellipsis;
        }
      }

      .card__info {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card__domain {
          font-size: 12px;
          color: #999;
        }

        .card__time {
          font-size: 12px;
          color: #999;
        }

        #readedBtn {
          width: 40px;
          height: 20px;
          border: none;
          border-radius: 10px;
          background-color: #fff;
          color: #999;
          font-size: 12px;
          cursor: pointer;

          // 悬浮的时候字体变为浅红色，同时背景颜色为淡红色
          &:hover {
            color: #d00;
            background-color: #fdd;
          }
        }
      }
    }
  }
}
</style>