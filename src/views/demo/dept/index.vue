<template>
   <div class="app-container">
      <div style="width: 400px;"><user-select v-model="value"></user-select></div>
   </div>
</template>

<script setup lang="ts" name="Dept">
import UserSelect from "@/components/User/select.vue";
const value = ref(["abc"]);
</script>
