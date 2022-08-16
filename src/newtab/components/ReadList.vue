<template>
  <div class="readlist-container">
    <h2 v-if="readlist.length > 0">稍后阅读</h2>
    <div class="readlist">
      <div class="read-item" v-for="(item, idx) in readlist" :key="idx">
        <a class="read-card" :href="item.url">
          <p class="card__title">{{ item.title }}</p>
          <span class="card__domain">{{ item.domain }}</span>
          <span class="card__time">{{ item.fmtTime }}</span>
        </a>
        <button @click="delReadCard(item.url)">已读</button>
      </div>
    </div>
  </div>
</template>


<script>
import { onMounted, ref } from "vue";
import { useTimeAgo } from '@vueuse/core'
import { getItemFromStorage, saveItemToStorage } from '@/utils/storage';

export default {
  name: "read-list",
  setup() {
    const readlist = ref([]);

    const praseReadlist = (list) => {
      readlist.value = list.map(item => {
        item = JSON.parse(item)
        item.domain = item.url.split('/')[2];
        item.fmtTime = useTimeAgo(item.time)
        return item;
      });
    }

    const delReadCard = (url) => {
      readlist.value.map((item, i) => {
        if (item.url == url) {
          readlist.value.splice(i, 1);
        }
      })
      saveItemToStorage('readlist', readlist.value).then(() => {
        console.log("removed")
      })
    }

    onMounted(() => {
      getItemFromStorage('readlist').then( res => praseReadlist(res))
    })

    return {
      readlist,
      delReadCard,
    };
  },
};
</script>
 
<style lang="less" scoped>
.readlist-container {
  width: 100%;
}

.readlist-container .readlist {
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fill, var(--readcard-width));
  grid-gap: 10px;

  .read-item {
    width: 100%;

    .read-card {
      display: block;
      color: inherit;
      border: 1px solid #d0d7de;
      border-radius: 4px;
      padding: 14px 12px;

      text-decoration-line: none;

      p.card__title {
        font-size: 16px;
        margin: 0 0 12px 0;
        height: 48px;
        
        overflow: hidden;
        text-overflow: ellipsis;
        display:-webkit-box; 
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;
      }

      span {
        font-size: small;
      }

      span.card__domain {
        width: auto;
        margin-right: auto;
        border-bottom: 1px dashed gray;

        color: gray;
      }

      span.card__time {
        width: 100px;
        float: right;
        text-align: right;
      }
    }

    button {
      opacity: 0;
      height: 30px;
      padding: 12px;
      margin-left: auto;
      border: none;
      background: transparent;
      color: gray;
      transition: all 0.1s ease-in-out;

      &:hover {
        cursor: pointer;
        pointer-events: auto;
      }
    }

    &:hover button {
      cursor: pointer;
      opacity: 1;
    }
  }

}
</style>