<template>
   <div style="margin: 20px;">
      <el-form label-width="180px">
         <el-form-item :label="$t('demo.singleUser')">
            <div style="width: 400px;"><user-select v-model="value1" :quick="false"></user-select></div>
         </el-form-item>
         <el-form-item :label="$t('demo.multiUser')">
            <div style="width: 400px;"><user-select v-model="value2" multiple></user-select></div>
         </el-form-item>
         <el-form-item :label="$t('demo.singleDept')">
            <div style="width: 400px;"><user-select v-model="value3" department :quick="false"></user-select></div>
         </el-form-item>
         <el-form-item :label="$t('demo.quickSingleDept')">
            <div style="width: 400px;"><user-select v-model="value3" department></user-select></div>
         </el-form-item>
         <el-form-item :label="$t('demo.multiDept')">
            <div style="width: 400px;"><user-select v-model="value4" department multiple></user-select></div>
         </el-form-item>
         <el-form-item :label="$t('demo.limitedMultiDept')">
            <div style="width: 400px;"><user-select v-model="value4" department multiple :max-collapse-tags="2"></user-select></div>
         </el-form-item>
      </el-form>
   </div>
</template>

<script setup lang="ts" name="Dept">
import UserSelect from "@/components/User/select.vue";
const value1 = ref(6);
const value2 = ref([1, "4"]);
const value3 = ref("100");
const value4 = ref([101, 102, 103, "104"]);
</script>
