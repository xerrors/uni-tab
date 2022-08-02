<template>
  <div class="countdown-container">
    <div class="countdown-cards">
      <div class="card">

      </div>
    </div>
  </div>
</template>


<script>
import { reactive } from "vue";

export default {
  name: "coundown-card",
  setup() {
    const data = reactive()

    return {
      data
    };
  },
};
</script>
 
<style lang="less" scoped>
.countdown-container {
  background: gray;
}
</style>