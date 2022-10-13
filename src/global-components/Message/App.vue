<template>
  <!-- 消息列表 -->
  <transition name="slide-fade">
    <div class="message-container" v-show="state.visibled">
      <!-- 内容 -->
      <div class="message-content">

        <!-- 消息类型图标，通过消息类型确定，text类型不配置图标 -->
        <div class="message-icon" v-if="config.icon" :style="{ color: config.iconColor}">
          <icon-font :type="config.icon" />
        </div>

        <!-- 消息文本 -->
        <span v-text="config.content"></span>

        <!-- 手动关闭消息 -->
        <div class="option" v-if="config.close" @click="onClose">
          <icon-font type="icon-close"/>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive } from "vue";
import { IconFont } from "@/global-components"

// eslint-disable-next-line
const props = defineProps({
  config: { type: Object, default: () => { } }, // 消息配置项
  remove: { type: Function, default: () => { } }, // 取消挂载回调
})
const state = reactive({
  visibled: false,
})

// 打开消息
const onOpen = (config) => {
  setTimeout(() => {
    state.visibled = true;
  }, 10)

  // 指定时间后移除消息
  if (config.duration !== 0) {
    setTimeout(() => {
      onClose();
    }, config.duration);
  }
}

onOpen(props.config)

// 消息关闭
const onClose = () => {
  state.visibled = false;
  setTimeout(() => {
    props.remove()
  }, 200)
};

</script>

<style lang="less">
.c-simp-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  z-index: 9999;
  transform: translateZ(9999px);
  padding-top: 28px;
  transition: top .4s ease;
  cursor: pointer;

  .message-container {
    margin-bottom: 14px;

    .message-icon {
      display: inline-block;

      span {
        font-size: 18px;
        font-weight: 400;
        margin-top: -3px;
        margin-right: 6px;
        display: inline-block;
        box-sizing: border-box;
        vertical-align: middle;
      }
    }

    .message-content {
      display: inline-block;
      padding: 4px 1rem;
      height: 34px;
      text-align: left;
      line-height: 34px;
      font-size: 14px;
      font-weight: 400;
      border-radius: 4px;
      color: #595959;
      box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
      background: #ffffff;

      .option {
        display: inline-block;
        pointer-events: all;
        margin-left: 8px;

        span {
          font-size: 18px;
          font-weight: 400;
          margin-top: -3px;
          display: inline-block;
          box-sizing: border-box;
          vertical-align: middle;
          cursor: pointer;
          color: #9399a3;
          transition: color 0.2s ease;
        }
      }
    }
  }

  .slide-fade-enter-active {
    transition: all .2s ease-out;
  }

  .slide-fade-leave-active {
    transition: all .2s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }
}
</style>
