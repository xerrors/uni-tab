<template>
  <div id="countdown-container" :class="{'show-options': state.showOptions}" v-if="store.userConfig.ddlOption">
    <div class="card">
      <div class="name">
        <a :href="store.userConfig.ddlOption.link" target="_blank">
          {{  store.userConfig.ddlOption.name  }}
        </a>
      </div>
      <div class="date-count">
        <span class="days">{{  absResult.days  }}</span> 天
        <span class="hours">{{  absResult.hours  }}</span> 时
        <span class="minutes">{{  absResult.minutes  }}</span> 分
        <span class="seconds">{{  absResult.seconds  }}</span> 秒
      </div>
      <div class="close">
        <setting-outlined @click="state.showOptions = true" />
        <close-outlined />
      </div>
    </div>
    <div class="options">
      <input type="text" class="input-name" v-model="store.userConfig.ddlOption.name" :onchange="inputOnchangeToSave">
      <input type="text" class="input-link" v-model="store.userConfig.ddlOption.link" :onchange="inputOnchangeToSave">
      <input type="text" class="input-ddl" v-model="store.userConfig.ddlOption.ddl" :onchange="inputOnchangeToSave">
      <button class="c-btn-s" @click="state.showOptions = false" >完成</button>
    </div>
  </div>
</template>


<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { saveStoreUserConfigToStorage, store } from "@/plugins/store";
import {
  CloseOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";

const absResult = ref({})
const state = reactive({
  showOptions: false
})

onMounted(() => {
  getAbsResult()
  setInterval(getAbsResult, 1000)
})

watch(() => store.userConfig.ddlOption, () => getAbsResult())

const getAbsResult = () => {
  if (store.userConfig.ddlOption) {
    const absDate = new Date(store.userConfig.ddlOption.ddl) - new Date()
    absResult.value = {
      milliseconds: absDate,
      seconds: parseInt(absDate % (1000 * 60) / (1000)),
      minutes: parseInt(absDate % (1000 * 60 * 60) / (1000 * 60)),
      hours: parseInt(absDate % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
      days: parseInt(absDate / (1000 * 60 * 60 * 24)),
    }
  }
}

const inputOnchangeToSave = () => {
  saveStoreUserConfigToStorage()
}

</script>
 
<style lang="less" scoped>
#countdown-container {
  width: 100%;
  height: 120px;
  margin-bottom: 50px;
  position: relative;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.455, 0.030, 0.515, 0.955);
}

.show-options {
  transform: rotateY(-180deg);
}

.card, .options {
  width: 100%;
  height: 130px;
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 8px;
  padding: 1rem;
  box-sizing: border-box;
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.05);
  background-color: white;
  color: var(--text-main-color);
  transition: all 0.4s ease-in-out;
  border: 2px solid var(--text-secondry-color);
}

.card {
  user-select: none;

  .name a {
    display: inline-block;
    color: var(--text-main-color);
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 2rem;
  }

  .date-count {
    font-size: 1rem;

    span {
      font-weight: bold;
    }

    span.days {
      font-size: 1.5rem;
      font-weight: bold;
    }
  }

  .close {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    position: absolute;
    top: 0;
    right: 10px;
    height: 100%;
    opacity: 0;
    transition: all 0.4s ease-in-out;

    &>span {
      padding: 0.6rem;
      margin: 0 0.4rem;
      border-radius: 8px;
      cursor: pointer;
    }

    &>span:hover {
      color: var(--theme-color);
      background-color: hsl(var(--theme-color-deg), var(--theme-color-saturation), 98%);
    }
  }

  &:hover {

    // border: 2px solid var(--theme-color);
    .close {
      opacity: 1;
      animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
  }

}

.options {
  transform: rotateY(180deg);
  background-color: white;
  border: 2px solid var(--text-main-color);
}

.options input[type=text] {
  display: inline-block;
  width: 100%;
}

.options input[type=text].input-name,
.options input[type=text].input-link {
  width: 47%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.options input[type=text].input-link {
  margin-left: 6%;
}

.options input[type=text].input-ddl {
  width: 74%;
}

button.c-btn-s {
  width: 20%;
  margin-left: 6%;
}


@keyframes slide-in-right {
  0% {
    transform: translateX(20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>