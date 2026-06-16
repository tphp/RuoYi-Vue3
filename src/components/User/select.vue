<template>
  <el-dialog :title="emitTitle" v-model="dialogUserShow" width="1024px" append-to-body>
    <div class="css_dialog_user_select">
      <el-tabs v-model="tagName" type="border-card">
        <el-tab-pane label="最近" name="recently">
          <div>
            用户选择:
            <!-- <el-input v-model="emitValue"></el-input> -->
            {{ emitValue }}
          </div>
        </el-tab-pane>
        <el-tab-pane label="组织架构" name="organization">
          <div style="margin: -15px;">
            <div
              class="app-container
              tree-sidebar-manage-wrap"
              style="min-height: 0px; height: 400px;"
              :style="{height: boxHeight + 'px'}"
            >
              <tree-panel
                title="组织机构"
                :tree-data="deptOptions"
                search-placeholder="请输入部门名称"
                storage-key="dept-sidebar-width"
                :defaultExpandAll="true"
                @node-click="handleNodeClick"
                @refresh="getDeptTree"
                ref="deptTreeRef"
              />
              <div class="tree-sidebar-content">
                <div class="tree-header">
                  <el-input v-model="userName" style="width: 200px;" placeholder="请输入用户名" clearable>
                    <template #append>
                      <el-button :icon="Search" />
                    </template>
                  </el-input>
                </div>
                <user-table v-model="emitValue" :list="userList" :loading="loading" :height="boxHeight"></user-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
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
import { Search } from '@element-plus/icons-vue'
import TreePanel from "@/components/TreePanel/index.vue"
import UserTable from "@/components/User/table.vue"
import request from '@/utils/request'
import emitRef from "@/utils/emit_ref";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user"
import type { TreeSelect, TableShowColumns, AjaxResult } from '@/types/api/common'
import type { SysUser, UserQueryParams, UserFormDataResult } from '@/types/api/system/user'

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

const emitValue = emitRef(props, emit, "modelValue")
const emitTitle = emitRef(props, emit, "title")
const dialogUserShow = ref<boolean>(false)
const tagName = ref('recently')
const userName = ref('')
const deptOptions = ref<TreeSelect[] | undefined>(undefined)
const enabledDeptOptions = ref<TreeSelect[] | undefined>(undefined)
const loading = ref<boolean>(true)
const { proxy } = getCurrentInstance()
const dateRange = ref<string[]>([])
const userList = ref<SysUser[]>([])
const boxHeight = ref(500)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10000,
  userName: undefined,
  phonenumber: undefined,
  status: undefined,
  deptId: undefined
} as UserQueryParams)

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
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false
    userList.value = res.rows
  })
}

/** 节点单击事件 */
function handleNodeClick(data: any) {
  console.log(data)
  queryParams.value.deptId = data.id
  getList()
}

onMounted(() => {
  getDeptTree()
  getList()
})
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
</style>
