<template>
   <div style="margin: 20px;">
      <el-form label-width="160px">
         <el-form-item label="单选 - 用户">
            <div style="width: 400px;"><user-select v-model="value1"></user-select></div>
         </el-form-item>
         <el-form-item label="多选 - 用户">
            <div style="width: 400px;"><user-select v-model="value2" multiple></user-select></div>
         </el-form-item>
         <el-form-item label="单选 - 部门">
            <div style="width: 400px;"><user-select v-model="value3" department></user-select></div>
         </el-form-item>
         <el-form-item label="快速选择 - 单选 - 部门">
            <div style="width: 400px;"><user-select v-model="value3" department quick></user-select></div>
         </el-form-item>
         <el-form-item label="多选 - 部门">
            <div style="width: 400px;"><user-select v-model="value4" department multiple></user-select></div>
         </el-form-item>
         <el-form-item label="限制个数 - 多选 - 部门">
            <div style="width: 400px;"><user-select v-model="value4" department multiple :max-collapse-tags="2"></user-select></div>
         </el-form-item>
      </el-form>
   </div>
</template>

<script setup lang="ts" name="Dept">
import UserSelect from "@/components/User/select.vue";
const value1 = ref(6);
const value2 = ref([1, 4]);
const value3 = ref(100);
const value4 = ref([101, 102, 103, 104]);
</script>
