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
                  :user-dict="userDict"
                  :split="true"
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
                <user-table v-model="userCheck" :list="userList" :loading="loading" :height="boxHeight" :user-dict="userDict"></user-table>
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
          <div class="css_user">{{ e?.nickName && e.nickName.length > 0 ? e.nickName :e.userName }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="clearUserCheck" style="float: left;">清空</el-button>
        <el-button type="primary" @click="confirmClick()">
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
  <el-input-tag v-model="emitValue" trigger="Space" class="css_user_select">
    <template #tag="{ value }">
      <span v-if="userDict[value]">
        {{ userDict[value]?.nickName ?? userDict[value]?.userName ?? value }}
      </span>
      <span v-else style="color: #f33;">
        {{ value }}
      </span>
    </template>
    <template #suffix>
      <el-icon @click="clickOpen"><User /></el-icon>
    </template>
  </el-input-tag>
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
const collapsed = ref<boolean>(false)

const props = defineProps({
  modelValue: {
    type: Array,
  },
  title: {
    type: String,
    default: "请选择人员"
  },
  multiple: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "update:title", value: string): void;
  (e: "update:multiple", value: boolean): void;
}>();

const emitValue = emitRef(props, emit, "modelValue")
const emitTitle = emitRef(props, emit, "title")
const emitMultiple = emitRef(props, emit, "multiple")
const dialogUserShow = ref<boolean>(false)
const tagName = ref('recently')
const userName = ref('')
const recentlyUserName = ref('')
const deptOptions = ref<TreeSelect[] | undefined>(undefined)
const enabledDeptOptions = ref<TreeSelect[] | undefined>(undefined)
const loading = ref<boolean>(false)
const { proxy } = getCurrentInstance()
const userList = ref<SysUser[]>([])
const userListCache = ref<string>("")
const userRecentlyList = ref<SysUser[]>([])
const userRecentlyListCache = ref<string>("")
const userCheck = ref({} as any)
const treeInvoke = ref({} as any)
const boxHeight = ref(500)
const userDict = ref({} as any)
const dataType = emitMultiple.value ? 0 : 1
const queryParams = ref({
  userName: undefined,
  phonenumber: undefined,
  status: "0",
  deptId: undefined
} as UserQueryParams)

if (!(emitValue.value instanceof Array)) {
  emitValue.value = []
}

const queryParamsDefault = ref({status: "0"} as UserQueryParams)
const setUserCheck = () => {
  clearUserCheck()
  for (const i in emitValue.value) {
    const userId = emitValue.value[i]
    const ud = userDict.value[userId]
    if (ud) {
      userCheck.value[`U${userId}`] = ud
    }
  }
}
const clickOpen = () => {
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
      const userInfo = userDict.value[e?.selectId]
      if (userInfo) {
        userRecentlyList.value.push(userInfo)
      }
    })
    userRecentlyListCache.value = JSON.stringify(userRecentlyList.value)
  })
}

const confirmClick = () => {
  emitValue.value.length = 0
  for (const i in userCheck.value) {
    const userId = userCheck.value[i]?.userId
    if (userId) {
      emitValue.value.push(userId)
    }
  }
  request({
    url: `/system/recently/update/${dataType}`,
    method: 'post',
    data: {
      userIds: emitValue.value
    }
  }).then((res: any) => {
    dialogUserShow.value = false
  })
}

const setUserDict = (rows: any) => {
  if (!(rows instanceof Array)) {
    return
  }
  rows.forEach((e: any) => {
    userDict.value[e?.userId] = {
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
  })
}

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUserTop(proxy.addDateRange(queryParams.value)).then(res => {
    loading.value = false
    userList.value = res.rows
    userListCache.value = JSON.stringify(res.rows)
    setUserDict(res?.rows)
  })
}

/** 查询所有用户信息 **/
function searchList() {
  const uName = userName.value.trim()
  if (uName.length == 0) {
    return
  }
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

/** 节点单击事件 */
function handleNodeClick(data: any) {
  queryParams.value.deptId = data.id
  getList()
}

const getAvatar = (row: any) => {
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

onMounted(() => {
  getDeptTree()
  listUserTop(proxy.addDateRange(queryParamsDefault.value)).then(res => {
    setUserDict(res?.rows)
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
