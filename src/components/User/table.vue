<template>
  <div v-loading="emitLoading">
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="changeAll"
      class="css_select_list"
      style="height: 50px;"
      v-if="emitList.length > 0 && emitMultiple"
    >
      全选
    </el-checkbox>
    <div v-else-if="emitList.length == 0" class="css_select_list" style="color: #999">没有找到数据</div>
    <div style="overflow-y: auto;" :style="{height: (emitHeight - 90) + 'px'}">
      <el-checkbox-group
        v-model="userCheckList"
        @change="changeChild"
        v-if="emitMultiple"
      > 
        <div :class="{css_split: emitSplit}" v-for="(e, index) in emitList">
          <el-checkbox :key="e.userId" :label="e.userId" :value="e.userId" class="css_select_list" :class="getClass(index)">
            <div class="css_div">
              <el-avatar :src="getAvatar(e)" />
              <span class="css_user">{{ e?.nickName && e.nickName.length > 0 ? e.nickName :e.userName }}</span>
              <span class="css_dept">{{ e?.dept?.deptName }}</span>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <el-radio-group v-model="userCheckRadio" v-else style="display: inherit;">
        <div :class="{css_split: emitSplit}" v-for="(e, index) in emitList" @click="radioClick">
          <el-radio :key="e.userId" :label="e.userId" :value="e.userId" class="css_select_list" :class="getClass(index)">
            <div class="css_div">
              <el-avatar :src="getAvatar(e)" />
              <span class="css_user">{{ e?.nickName && e.nickName.length > 0 ? e.nickName :e.userName }}</span>
              <span class="css_dept">{{ e?.dept?.deptName }}</span>
            </div>
          </el-radio>
        </div>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitRef from "@/utils/emit_ref"
import male from "@/assets/images/male.png"
import female from "@/assets/images/female.png"
import dept from "@/assets/images/dept.png"
const checkAll = ref(false)
const isIndeterminate = ref(true)
const userCheckList = ref([] as any)
const userCheckRadio = ref(0 as any)

const props = defineProps({
  modelValue: {
    type: Object,
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
  },
  userDict: {
    type: Object
  },
  split: {
    type: Boolean
  },
  multiple: {
    type: Boolean,
    default: true
  },
  department: {
    type: Boolean,
    default: false
  },
  invoke: {
    type: Object
  },
})

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "update:list", value: any): void;
  (e: "update:loading", value: boolean): void;
  (e: "update:height", value: number): void;
  (e: "update:userDict", value: Object): void;
  (e: "update:split", value: boolean): void;
  (e: "update:multiple", value: boolean): void;
  (e: "update:department", value: boolean): void;
  (e: "update:invoke", value: any): void;
}>();

const emitValue = emitRef(props, emit, "modelValue")
const emitList = emitRef(props, emit, "list")
const emitLoading = emitRef(props, emit, "loading")
const emitHeight = emitRef(props, emit, "height")
const emitUserDict = emitRef(props, emit, "userDict")
const emitSplit = emitRef(props, emit, "split")
const emitMultiple = emitRef(props, emit, "multiple")
const emitDepartment = emitRef(props, emit, "department")
const emitInvoke = emitRef(props, emit, "invoke")

const getAvatar = (row: any) => {
  if (emitDepartment.value) {
    return dept
  }
  if (row?.avatar) {
    return row.avatar
  }
  if (row?.sex == "0") {
    return male
  }
  return female
}

const getClass = (index: any) => {
  if (emitSplit.value) {
    return '';
  }
  return index % 2 == 0 ? 'css_checkbox_brack' : ''
}

const getChangeAll = () => {
  const list: any = [];
  emitList.value.forEach((e: any) => {
    list.push(e?.userId);
  })
  return list;
}

const updateChild = (value: any[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === emitList.value.length && checkedCount > 0
  isIndeterminate.value = checkedCount > 0 && checkedCount < emitList.value.length
}

const updateUserList = () => {
  emitList.value.forEach((e: any) => {
    const key = e?.userId
    const uKey = `U${key}`
    if (userCheckList.value.includes(key)) {
      if (!emitValue.value[uKey] && emitUserDict.value[key]) {
        emitValue.value[uKey] = emitUserDict.value[key]
      }
    } else {
      delete emitValue.value[uKey]
    }
  })
}

const changeAll = (val: any) => {
  userCheckList.value = val ? getChangeAll() : []
  isIndeterminate.value = false
  updateUserList()
}

const changeChild = (value: any[]) => {
  updateChild(value)
  updateUserList()
}

const updateChange = () => {
  userCheckList.value.length = 0
  const all = getChangeAll();
  Object.keys(emitValue.value).forEach((e: any) => {
    const eInt = emitValue.value[e]?.userId
    if (all.includes(eInt)) {
      userCheckList.value.push(eInt)
    }
  })
  updateChild(userCheckList.value);
}

const updateRadio = () => {
  const keys = Object.keys(emitValue.value)
  for (const k in keys) {
    delete emitValue.value[keys[k]]
  }
  const key = userCheckRadio.value
  if (!key) {
    return
  }
  const uKey = `U${key}`
  if (!emitValue.value[uKey]) {
    emitValue.value[uKey] = emitUserDict.value[key]
  }
  updateChange()
}

const updateChangeForData = () => {
  if (!emitMultiple.value) {
    let isSet = false;
    for (const i in emitValue.value) {
      userCheckRadio.value = emitValue.value[i]?.userId
      isSet = true;
      break
    }
    if (!isSet) {
      userCheckRadio.value = 0
    }
  }
  updateChange()
}

const radioClick = () => {
  const confirm = emitInvoke.value?.confirm
  if (confirm instanceof Function) {
    setTimeout(confirm)
  }
}

watch(emitList, updateChangeForData)
watch(emitValue.value, updateChangeForData)
watch(userCheckRadio, updateRadio)
onMounted(() => {
  if (emitMultiple.value) {
    updateChange()
  } else {
    updateRadio()
  }
})
</script>

<style lang='scss' scoped>
.css_checkbox_brack {
  background-color: #f8f8f8;;
}
.css_select_list {
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
.css_select_list:hover {
  background-color: #eee;
}
.css_split {
  width: 50%;
  display: inline-block;
}
</style>