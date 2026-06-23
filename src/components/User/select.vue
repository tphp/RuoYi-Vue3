<template>
  <el-dialog :title="emitTitle" v-model="dialogUserShow" width="1024px" append-to-body>
    <div class="css_dialog_user_select" :style="{height: boxHeight + 136 + 'px'}">
      <el-tabs v-model="tagName" type="border-card">
        <el-tab-pane label="最近联系人" name="recently">
          <div style="margin: -15px;">
            <div
              class="app-container tree-sidebar-manage-wrap"
              style="min-height: 0px; transition: height 0.25s ease;"
              :style="{height: collapsed ? '0px' : boxHeight + 'px'}"
            >
              <div class="tree-sidebar-content">
                <div class="tree-header">
                  <el-button
                    @click="clearRecently"
                    style="position: absolute; left: 10px"
                    v-if="userRecentlyList.length > 0 && !collapsed"
                  >
                    清空最近联系人
                  </el-button>
                  <el-input v-model="recentlyUserName" style="width: 200px;" placeholder="请输入用户名" clearable>
                  </el-input>
                </div>
                <user-table
                  v-model="userCheck"
                  :list="userRecentlyList"
                  :loading="loading"
                  :height="boxHeight"
                  :user-dict="emitDepartment ? deptDict : userDict"
                  :split="true"
                  :multiple="emitMultiple"
                  :department="emitDepartment"
                  :invoke="tableInvoke"
                ></user-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="组织架构" name="organization">
          <div style="margin: -15px;">
            <div
              class="app-container tree-sidebar-manage-wrap"
              style="min-height: 0px; transition: height 0.25s ease;"
              :style="{height: collapsed ? '0px' : boxHeight + 'px'}"
            >
              <tree-panel
                title="组织架构"
                :tree-data="deptOptions"
                search-placeholder="请输入部门名称"
                storage-key="dept-sidebar-width"
                :defaultExpandAll="true"
                @node-click="handleNodeClick"
                @refresh="getDeptTree"
                :invoke="treeInvoke"
                ref="deptTreeRef"
              />
              <div class="tree-sidebar-content">
                <div class="tree-header">
                  <el-input v-model="userName" style="width: 200px;" placeholder="请输入用户名" clearable @keyup.enter="searchList">
                    <template #append>
                      <el-button @click="searchList" :icon="Search" />
                    </template>
                  </el-input>
                </div>
                <user-table
                  v-model="userCheck"
                  :list="userList"
                  :loading="loading"
                  :height="boxHeight"
                  :user-dict="emitDepartment ? deptDict : userDict"
                  :multiple="emitMultiple"
                  :department="emitDepartment"
                  :invoke="tableInvoke"
                ></user-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 侧边栏展开/收起按钮 -->
      <div class="collapse-button-container">
        <el-tooltip :content="collapsed ? '展开' : '收起'" placement="right">
          <el-icon class="collapse-button" @click="collapsed = !collapsed">
            <DArrowRight v-if="collapsed" />
            <DArrowLeft v-else />
          </el-icon>
        </el-tooltip>
      </div>
      <div class="selected" :style="{height: collapsed ? boxHeight + 66 + 'px' : '96px'}">
        <div v-for="(e, index) in userCheck" class="css_avatar">
          <div class="css_icon" @click="delete userCheck[index]">
            <el-icon :size="20">
              <CircleCloseFilled />
            </el-icon>
          </div>
          <div><el-avatar :src="getAvatar(e)" /></div>
          <div class="css_user">{{ e?.nickName && e?.nickName.length > 0 ? e?.nickName : e?.userName }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="clearUserCheck" style="float: left;">清空</el-button>
        <el-button type="primary" @click="confirmClick()" v-if="!(emitQuick && !emitMultiple)">
          确定
          <span
            v-if="Object.keys(userCheck).length > 0"
            style="margin-left: 5px"
          >
            ( {{ Object.keys(userCheck).length }} )
          </span>
        </el-button>
        <el-button @click="dialogUserShow = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
  <el-select
    v-model="updateValue"
    class="css_user_select"
    multiple
    filterable
    remote
    reserve-keyword
    :remote-method="remoteMethod"
    :collapse-tags="emitMaxCollapseTags > 0"
    collapse-tags-tooltip
    :max-collapse-tags="emitMaxCollapseTags"
  >
    <template #label="{ value }">
      <span v-if="getTagName(value)">{{ getTagName(value) }}</span>
      <span v-else :style="{color: isOpened ? '#f33' : 'inherit'}">{{ value }}</span>
    </template>
    <el-option
      v-for="e in optionValue"
      :key="e?.userId"
      :label="e?.nickName ?? e?.userName "
      :value="e?.userId"
    />
    <template #prefix>
      <el-icon @click="clickOpen">
         <User />
      </el-icon>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import TreePanel from "@/components/TreePanel/index.vue"
import UserTable from "@/components/User/table.vue"
import request from '@/utils/request'
import emitRef from "@/utils/emit_ref";
import { listUserTop, deptTreeSelect } from "@/api/system/user"
import type { TreeSelect } from '@/types/api/common'
import type { SysUser, UserQueryParams } from '@/types/api/system/user'
import male from "@/assets/images/male.png"
import female from "@/assets/images/female.png"
import dept from "@/assets/images/dept.png"
const collapsed = ref<boolean>(false)

const props = defineProps({
  modelValue: {
    type: Object,
  },
  title: {
    type: String,
    default: "请选择人员"
  },
  multiple: {
    type: Boolean,
    default: false
  },
  quick: {
    type: Boolean,
    default: true
  },
  department: {
    type: Boolean,
    default: false
  },
  maxCollapseTags: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "update:title", value: string): void;
  (e: "update:multiple", value: boolean): void;
  (e: "update:quick", value: boolean): void;
  (e: "update:department", value: boolean): void;
  (e: "update:maxCollapseTags", value: Number): void;
}>();

const emitValue = emitRef(props, emit, "modelValue")
const emitTitle = emitRef(props, emit, "title")
const emitMultiple = emitRef(props, emit, "multiple")
const emitQuick = emitRef(props, emit, "quick")
const emitDepartment = emitRef(props, emit, "department")
const emitMaxCollapseTags = emitRef(props, emit, "maxCollapseTags")
const updateValue = ref([] as any)
const dialogUserShow = ref<boolean>(false)
const tagName = ref('recently')
const userName = ref('')
const recentlyUserName = ref('')
const deptOptions = ref<TreeSelect[] | undefined>(undefined)
const enabledDeptOptions = ref<TreeSelect[] | undefined>(undefined)
const loading = ref<boolean>(false)
const isOpened = ref<boolean>(false)
const optionValue = ref([] as any)
const { proxy } = getCurrentInstance()
const userList = ref<SysUser[]>([])
const userListCache = ref<string>("")
const userRecentlyList = ref<SysUser[]>([])
const userRecentlyListCache = ref<string>("")
const userCheck = ref({} as any)
const treeInvoke = ref({} as any)
const tableInvoke = ref({} as any)
const boxHeight = ref(500)
const userDict = ref({} as any)
const deptDict = ref({} as any)
const dataType = emitDepartment.value ? 1 : 0
const queryParams = ref({
  userName: undefined,
  phonenumber: undefined,
  status: "0",
  deptId: undefined
} as UserQueryParams)

const queryParamsDefault = ref({status: "0"} as UserQueryParams)
const setUserCheck = () => {
  clearUserCheck()
  for (const i in updateValue.value) {
    const userId = updateValue.value[i]
    const ud = emitDepartment.value ? deptDict.value[userId] : userDict.value[userId]
    if (ud) {
      userCheck.value[`U${userId}`] = ud
    }
  }
}

const onOpen = () => {
  updateValue.value.length = 0
  if (emitMultiple.value) {
    if (emitValue.value instanceof Array) {
      for (const i in emitValue.value) {
        const ev = emitValue.value[i]
        if (typeof ev == "string") {
          emitValue.value[i] = getInt(emitValue.value[i])
        }
        updateValue.value.push(emitValue.value[i])
      }
    }
  } else {
    if (typeof emitValue.value == "string") {
      emitValue.value = getInt(emitValue.value)
    }
    if (typeof emitValue.value == "number") {
      updateValue.value.push(emitValue.value)
    }
  }
}
const remoteMethod = (query: string) => {
  if (query) {
    const list = Object.values(emitDepartment.value ? deptDict.value : userDict.value)
    optionValue.value = list.filter((item: any) => {
      const listFor = ["userName", "nickName"]
      for (const i in listFor) {
        const v = item[listFor[i]]
        if (v && v.toLowerCase().includes(query.toLowerCase())) {
          return true
        }
      }
      return false
    })
  } else {
    optionValue.value = []
  }
}

const getTagName = (value: any) => {
  const dict = emitDepartment.value ? deptDict.value : userDict.value
  return dict[value]?.nickName ?? dict[value]?.userName
}

const clickOpen = () => {
  onOpen()
  userName.value = ""
  recentlyUserName.value = ""
  dialogUserShow.value = true
  request({
    url: `/system/recently/list/${dataType}`,
    method: 'get'
  }).then((res: any) => {
    userRecentlyList.value.length = 0
    setUserCheck()
    const checkNode = treeInvoke.value?.checkNode
    if (checkNode instanceof Function) {
      checkNode()
    }
    const rows = res?.rows
    if (!rows) {
      return
    }
    rows.forEach((e: any) => {
      const userInfo = emitDepartment.value ? deptDict.value[e?.selectId] : userDict.value[e?.selectId]
      if (userInfo) {
        userRecentlyList.value.push(userInfo)
      }
    })
    userRecentlyListCache.value = JSON.stringify(userRecentlyList.value)
  })
}

const confirmClick = () => {
  updateValue.value.length = 0
  for (const i in userCheck.value) {
    const userId = userCheck.value[i]?.userId
    if (userId) {
      updateValue.value.push(userId)
    }
  }
  updateValueRefresh()
  if (updateValue.value.length == 0) {
    dialogUserShow.value = false
    return
  }
  request({
    url: `/system/recently/update/${dataType}`,
    method: 'post',
    data: {
      userIds: updateValue.value
    }
  }).then((res: any) => {
    dialogUserShow.value = false
  })
}

const setUserDict = (rows: any, isDept = false) => {
  if (!(rows instanceof Array)) {
    return
  }
  const dict = isDept ? deptDict.value : userDict.value
  rows.forEach((e: any) => {
    dict[e?.userId] = {
      userId: e?.userId,
      userName: e?.userName,
      nickName: e?.nickName,
      deptName: e?.dept?.deptName,
      avatar: e?.avatar,
      sex: e?.sex,
    }
  })
}

/** 过滤禁用的部门 */
function filterDisabledDept(deptList: TreeSelect[]) {
  return deptList.filter(dept => {
    if (dept.disabled) {
      return false
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children)
    }
    return true
  })
}

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data
    enabledDeptOptions.value = filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
    getListDept()
  })
}

/** 查询用户列表 */
function getListUser() {
  loading.value = true
  listUserTop(proxy.addDateRange(queryParams.value)).then(res => {
    loading.value = false
    userList.value = res.rows
    userListCache.value = JSON.stringify(res.rows)
    setUserDict(res?.rows)
  })
}

function setListDeptTree(allList: any, tree: any, parentId = 0) {
  if (!(tree instanceof Array)) {
    return
  }

  for (const i in tree) {
    const iv = tree[i]
    allList.push({
      userId: iv?.id,
      userName: iv?.label,
      parentId: parentId
    })
    if (iv?.children) {
      setListDeptTree(allList, iv.children, iv?.id)
    }
  }
}

function getListDeptTree(allList: any) {
  const rows: any = []
  const deptId = queryParams.value.deptId
  if (typeof deptId != "number") {
    return rows
  }
  for (const i in allList) {
    const iv = allList[i]
    if (iv?.parentId == deptId || iv?.userId == deptId) {
      rows.push(iv)
    }
  }
  return rows
}

/** 查询部门列表 */
function getListDept() {
  const allList: any = []
  setListDeptTree(allList, deptOptions.value)
  userListCache.value = JSON.stringify(allList)
  setUserDict(allList, true)
  userList.value = getListDeptTree(allList)
}

function getList() {
  if (emitDepartment.value) {
    getListDept()
  } else {
    getListUser()
  }
}

/** 查询所有用户信息 **/
function searchUserList(uName: any) {
  loading.value = true
  listUserTop(proxy.addDateRange({
    userName: uName,
    status: "0"
  })).then(res => {
    loading.value = false
    userList.value = res.rows
    setUserDict(res?.rows)
  })
}

/** 查询所有部门信息 **/
function searchDeptList(uName: any) {
  loading.value = true
  listUserTop(proxy.addDateRange({
    userName: uName,
    status: "0"
  })).then(res => {
    loading.value = false
    userList.value = res.rows
    setUserDict(res?.rows)
  })
}

function searchList() {
  const uName = userName.value.trim()
  if (uName.length == 0) {
    return
  }
  if (emitDepartment.value) {
    searchDeptList(uName)
  } else {
    searchUserList(uName)
  }
}

/** 节点单击事件 */
function handleNodeClick(data: any) {
  queryParams.value.deptId = data.id
  getList()
}

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

const clearUserCheck = () => {
  const keys = Object.keys(userCheck.value)
  keys.forEach((e: any) => {
    delete userCheck.value[e]
  })
}

const clearRecently = () => {
  request({
    url: `/system/recently/clear/${dataType}`,
    method: 'delete'
  }).then(() => {
    userRecentlyList.value = []
  })
}

const getInt = (value: any) => {
  if (isNaN(value)) {
    return value
  }

  const v = parseInt(value)
  return isNaN(v) ? value : v
}

const updateValueRefresh = () => {
  if (emitMultiple.value) {
    if (emitValue.value instanceof Array) {
      emitValue.value.length = 0
      for (const i in updateValue.value) {
        emitValue.value.push(getInt(updateValue.value[i]))
      }
    }
    return
  }
  if (updateValue.value.length == 0) {
    emitValue.value = undefined
    return
  }
  const first = updateValue.value[0]
  emitValue.value = getInt(first)
  updateValue.value.length = 0
  updateValue.value.push(first)
}

const emitValueRefresh = () => {
  updateValue.value.length = 0
  if (emitMultiple.value) {
    if (emitValue.value instanceof Array) {
      for (const i in emitValue.value) {
        updateValue.value.push(getInt(emitValue.value[i]))
      }
    }
    return
  }
  if (!emitValue.value) {
    return
  }

  updateValue.value.push(getInt(emitValue.value))
}

watch(userName, () => {
  const uName = userName.value.trim()
  if (uName.length > 0) {
    return
  }
  userList.value = JSON.parse(userListCache.value)
})

watch(recentlyUserName, () => {
  const uName = recentlyUserName.value.trim()
  const list = JSON.parse(userRecentlyListCache.value)
  if (uName.length == 0) {
    userRecentlyList.value = list
    return
  }
  userRecentlyList.value = []
  for (const i in list) {
    const iv = list[i]
    const un = iv?.userName
    if (typeof un == "string" && un.includes(uName)) {
      userRecentlyList.value.push(iv)
      continue
    }
    const nn = iv?.nickName
    if (typeof nn == "string" && nn.includes(uName)) {
      userRecentlyList.value.push(iv)
      continue
    }
  }
})

watch(updateValue, updateValueRefresh)
watch(emitValue, emitValueRefresh)
watch(emitValue.value, emitValueRefresh)

if (emitQuick.value && !emitMultiple.value) {
  tableInvoke.value.confirm = confirmClick
}

onMounted(() => {
  onOpen()
  getDeptTree()
  listUserTop(proxy.addDateRange(queryParamsDefault.value)).then(res => {
    setUserDict(res?.rows)
    isOpened.value = true
  })
})
</script>

<style lang='scss' scoped>

.css_dialog_user_select {
  margin: 0px -16px;
  border-bottom: 1px #ddd solid;
  .selected {
    height: 96px;
    overflow-y: auto;
    transition: height 0.25s ease;
    .css_avatar {
      margin: 16px;
    }

  }

  .collapse-button-container {
    cursor: pointer;
    position: absolute;
    right: 50%;
    transform: translateY(-50%) rotate(90deg);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 20px;
    background: #fff;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    
    .tree-sidebar.collapsed & {
      right: 0;
      background: #f7f8fa;
      border-radius: 0 4px 4px 0;
    }
    
    .tree-sidebar.resizing & {
      pointer-events: none;
    }
  }
  .collapse-button {
    font-size: 20px;
    color: #909399;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    
    &:hover {
      color: #409eff;
      background: #ecf5ff;
    }
  }
}

.css_user_select {
  .el-icon {
    position:absolute;
    right:10px;
    cursor:pointer;
    z-index:2;
  }
  .el-icon:hover {
    color: #333;
  }
}
.tree-header {
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0 10px;
  height: 40px;
  border-bottom: 1px solid #e8eaed;
  background: #f7f8fa;
  flex-shrink: 0;
}

.css_avatar {
  position: relative;
  display: inline-block;
  cursor: pointer;
  text-align: center;
  margin: 0px 20px;
  .css_user {
    color: #999;
  }
  .css_icon {
    position: absolute;
    float: right;
    top: -5px;
    right: -5px;
    color: #ccc;
    display: none;
  }
  .css_icon:hover {
    color: #f33;
  }
}
.css_avatar:hover {
  .css_icon {
    display: inline-block;
  }
}

</style>
