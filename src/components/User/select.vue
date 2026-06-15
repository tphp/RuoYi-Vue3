<template>
  <el-dialog :title="emitTitle" v-model="dialogUserShow" width="1024px" append-to-body>
    <div class="css_dialog_user_select">
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="最近" name="recently">
          <div>
            用户选择:
            <!-- <el-input v-model="emitValue"></el-input> -->
            {{ emitValue }}
          </div>
        </el-tab-pane>
        <el-tab-pane label="组织架构" name="organization">Config</el-tab-pane>
      </el-tabs>
      <div class="selected">
        abc
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogUserShow = false">
          确定
        </el-button>
        <el-button @click="dialogUserShow = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
  <el-input-tag v-model="emitValue" trigger="Space" class="css_user_select">
    <template #suffix>
      <el-icon @click="clickOpen"><User /></el-icon>
    </template>
  </el-input-tag>
</template>

<script setup lang="ts">
import request from '@/utils/request'
import emitRef from "@/utils/emit_ref";

const props = defineProps({
  modelValue: {
    type: Array,
  },
  title: {
    type: String,
    default: "请选择人员"
  }
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:title", value: string): void;
}>();

const emitValue = emitRef(props, emit, "modelValue");
const emitTitle = emitRef(props, emit, "title");
const dialogUserShow = ref<boolean>(false)
const activeName = ref('recently')

const clickOpen = () => {
  request({
    url: '/tool/gen/db/list',
    method: 'get',
    params: {"abc": "ddd"}
  }).then((res: any) => {
    dialogUserShow.value = true
    console.log(res)
  })
}
</script>

<style lang='scss' scoped>

.css_dialog_user_select {
  margin: 0px -16px;
  .selected {
    padding: 16px;
    border-bottom: 1px #ddd solid;
  }
}

.css_user_select {
  .el-icon:hover {
    color: #333;
  }
}
</style>
