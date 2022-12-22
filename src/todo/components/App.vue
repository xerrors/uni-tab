<template>
  <div class="todo-container">
    TODO
  </div>
</template>
     
<script setup>

// const items = [
//   {
//     "id": "3c4897dc-9571-47da-a32a-da2fb2f0d752",
//     "title": "2",
//     "status": "Not started",
//     "type": "不重要也不紧急",
//     "created_time": "2022-12-22T04:06:00.000Z",
//     "alarm": "2022-12-24T12:00:00.000+08:00"
//   },
//   {
//     "id": "985a1f08-5130-466a-b452-8a698e184d68",
//     "title": "1",
//     "status": "Not started",
//     "type": "不重要也不紧急",
//     "note": "1111",
//     "created_time": "2022-12-22T04:06:00.000Z"
//   },
//   {
//     "id": "f04e02c9-5d9b-46af-8ebf-211e72a1b989",
//     "title": "3",
//     "status": "Not started",
//     "type": "不重要也不紧急",
//     "created_time": "2022-12-22T04:06:00.000Z",
//     "deadline": "2022-12-23"
//   }
// ]
import { getAllItems } from '../notion'

try {
  const items = await getAllItems();
  console.log(items)
} catch (error) {
  console.log(error);
}

</script>
     
<style lang="less" scoped>
.popup-container {
  width: 300px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "PingFang SC", "Microsoft YaHei", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
}

</style>