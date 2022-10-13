<template>
<div class="checkbox-container" ref="checkBox">
  <div class="content">
    <p>{{ config.content }}</p>
  </div>
  <div class="actions">
    <button v-for="(action, idx) in props.config.actions" :key="idx"
      @click="handleClick(action.callback)"
      :class="{'c-checkbox-action-primary': idx==0}"
    >{{ action.text }}</button>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue';

// eslint-disable-next-line
const props = defineProps({
  config: { type: Object, default: () => { } }, // 消息配置项
  remove: { type: Function, default: () => { } }, // 取消挂载回调
})
const checkBox = ref(null)

const handleClick = callback => {
  setTimeout(props.remove, 200)
  callback()
}

</script>

<style lang="less">
.c-checkbox {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.2);
  z-index: 99;
}

.c-checkbox > .checkbox-container {
  width: 200px;
  padding: 2rem;
  margin: 0 auto;
  margin-top: calc(50vh - 100px);
  background-color: white;
  border: 1px solid white;
  border-radius: 8px;
  box-shadow: 0 0 10px 2px rgba(0,0,0,0.05);
  
  .content {
    font-size: 1rem;
    margin-bottom: 40px;
    text-align: center;
  }

  .actions {
    display: flex;
    justify-content: space-between;
  }
}

.c-checkbox button {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  line-height: 1rem;
  border-radius: 4px;
  border: 1px solid var(--text-main-color);
  cursor: pointer;
  background: white;
  color: var(--text-main-color);
}

.c-checkbox .c-checkbox-action-primary {
  background-color: var(--theme-color-60);
  border-color: var(--theme-color);
  color: white;
}
</style>