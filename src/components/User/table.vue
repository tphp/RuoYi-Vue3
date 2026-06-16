<template>
  <div v-loading="emitLoading">
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
      class="css_checkbox_list"
      style="height: 50px;"
      v-if="emitList.length > 0"
    >
      全选
    </el-checkbox>
    <div v-else class="css_checkbox_list" style="color: #999">没有找到数据</div>
    <div style="overflow-y: auto;" :style="{height: (emitHeight - 90) + 'px'}">
      <el-checkbox-group
        v-model="checkedCities"
        @change="handleCheckedCitiesChange"
      > 
        <div v-for="(e, index) in emitList">
          <el-checkbox :key="e.userId" :label="e.userId" :value="e.userId" class="css_checkbox_list" :class="index % 2 == 0 ? 'css_checkbox_brack' : ''">
            <div class="css_div">
              <el-avatar :src="getAvatar(e)" />
              <span class="css_user">{{ e?.nickName && e.nickName.length > 0 ? e.nickName :e.userName }}</span>
              <span class="css_dept">{{ e?.dept?.deptName }}</span>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitRef from "@/utils/emit_ref"
import male from "@/assets/images/male.png"
import female from "@/assets/images/female.png"
const checkAll = ref(false)
const isIndeterminate = ref(true)
const checkedCities = ref(['Shanghai', 'Beijing'])
const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen']

const props = defineProps({
  modelValue: {
    type: Array,
  },
  list: {
    type: Array
  },
  loading: {
    type: Boolean
  },
  height: {
    type: Number,
    default: 400
  }
})

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "update:list", value: any): void;
  (e: "update:loading", value: boolean): void;
  (e: "update:height", value: number): void;
}>();

const emitValue = emitRef(props, emit, "modelValue")
const emitList = emitRef(props, emit, "list")
const emitLoading = emitRef(props, emit, "loading")
const emitHeight = emitRef(props, emit, "height")

const getAvatar = (row: any) => {
  if (row?.avatar) {
    return row.avatar
  }
  if (row?.sex == "0") {
    return male
  }
  return female
}

const handleCheckAllChange = (val: any) => {
  checkedCities.value = val ? cities : []
  isIndeterminate.value = false
}
const handleCheckedCitiesChange = (value: any[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === cities.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < cities.length
}
</script>

<style lang='scss' scoped>
.css_checkbox_brack {
  background-color: #f8f8f8;;
}
.css_checkbox_list {
  padding: 10px;
  width: 100%;
  height: 60px;
  .css_div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    .css_user {
      margin-left: 10px;
      width: 120px;
    }
    .css_dept {
      margin-left: 10px;
      color: #999;
    }
  }
}
.css_checkbox_list:hover {
  background-color: #eee;
}
</style>