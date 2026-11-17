<template>
  <div class="app-container tree-sidebar-manage-wrap">
    <tree-panel :title="$t('dept.organization')" :tree-data="deptOptions" search-:placeholder="$t('dept.deptNamePlaceholder')" storage-key="dept-sidebar-width" :defaultExpandAll="true" @node-click="handleNodeClick" @refresh="getDeptTree" ref="deptTreeRef" />
    <div class="tree-sidebar-content">
      <div class="content-inner">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
          <el-form-item :label="$t('user.userName')" prop="userName">
            <el-input v-model="queryParams.userName" :placeholder="$t('user.userNamePlaceholder')" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('user.phonenumber')" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" :placeholder="$t('user.phonenumberPlaceholder')" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="$t('user.statusPlaceholder')" clearable style="width: 240px">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('common.createTime')" style="width: 308px">
            <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-:placeholder="$t('common.startDate')" end-:placeholder="$t('common.endDate')"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('common.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">{{ $t('common.add') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">{{ $t('common.edit') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">{{ $t('common.delete') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['system:user:import']">{{ $t('common.import') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:user:export']">{{ $t('common.export') }}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column :label="$t('user.userId')" align="center" key="userId" prop="userId" v-if="columns.userId.visible" />
          <el-table-column :label="$t('user.userName')" align="center" key="userName" v-if="columns.userName.visible" :show-overflow-tooltip="true">
            <template #default="scope">
              <a class="link-type" style="cursor:pointer" @click="handleViewData(scope.row)">{{ scope.row.userName }}</a>
            </template>
         </el-table-column>
          <el-table-column :label="$t('user.nickName')" align="center" key="nickName" prop="nickName" v-if="columns.nickName.visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('user.deptName')" align="center" key="deptName" prop="dept.deptName" v-if="columns.deptName.visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('user.phonenumber')" align="center" key="phonenumber" prop="phonenumber" v-if="columns.phonenumber.visible" width="120" />
          <el-table-column :label="$t('common.status')" align="center" key="status" v-if="columns.status.visible">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createTime')" align="center" prop="createTime" v-if="columns.createTime.visible" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.action')" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip :content="$t('common.edit')" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"</el-button>
              </el-tooltip>
              <el-tooltip :content="$t('common.delete')" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"</el-button>
              </el-tooltip>
              <el-tooltip :content="$t('common.resetPassword')" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"</el-button>
              </el-tooltip>
              <el-tooltip :content="$t('role.assignUser')" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </div>
    </div>
    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.nickName')" prop="nickName">
              <el-input v-model="form.nickName" :placeholder="$t('user.nickNamePlaceholder')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.deptName')" prop="deptId">
              <el-tree-select v-model="form.deptId" :data="enabledDeptOptions" :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" :placeholder="$t('user.deptPlaceholder')" clearable check-strictly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.phonenumber')" prop="phonenumber">
              <el-input v-model="form.phonenumber" :placeholder="$t('user.phonenumberPlaceholder')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('user.emailPlaceholder')" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" :label="$t('user.userName')" prop="userName">
              <el-input v-model="form.userName" :placeholder="$t('user.userNamePlaceholder')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" :label="$t('user.password')" prop="password" :rules="pwdValidator">
              <el-input v-model="form.password" :placeholder="$t('user.passwordPlaceholder')" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.sex')">
              <el-select v-model="form.sex" :placeholder="$t('common.select')">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('common.status')">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.post')">
              <el-select v-model="form.postIds" multiple :placeholder="$t('common.select')">
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.role')">
              <el-select v-model="form.roleIds" multiple :placeholder="$t('common.select')">
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('common.remark')">
              <el-input v-model="form.remark" type="textarea" :placeholder="$t('common.remarkPlaceholder')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('common.confirm') }}</el-button>
          <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情抽屉 -->
    <user-view-drawer ref="userViewRef" />
    <!-- 用户导入对话框 -->
    <excel-import-dialog ref="importUserRef" :title="$t('user.importTitle')" action="/system/user/importData" template-action="/system/user/importTemplate" template-file-name="user_template" :update-support-label="$t('user.updateExistingData')" @success="getList" />
  </div>
</template>

<script setup lang="ts" name="User">
import TreePanel from "@/components/TreePanel/index.vue"
import ExcelImportDialog from "@/components/ExcelImportDialog/index.vue"
import UserViewDrawer from "./view.vue"
import { usePasswordRule } from "@/utils/passwordRule"
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user"
import type { SysUser, UserQueryParams, UserFormDataResult } from '@/types/api/system/user'
import type { SysRole } from '@/types/api/system/role'
import type { SysPost } from '@/types/api/system/post'
import type { TreeSelect, TableShowColumns, AjaxResult } from '@/types/api/common'

const router = useRouter()
const { proxy } = getCurrentInstance()
const { pwdValidator, pwdPromptValidator } = usePasswordRule()
const { sys_normal_disable, sys_user_sex } = useDict("sys_normal_disable", "sys_user_sex")

const userList = ref<SysUser[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const dateRange = ref<string[]>([])
const deptOptions = ref<TreeSelect[] | undefined>(undefined)
const enabledDeptOptions = ref<TreeSelect[] | undefined>(undefined)
const initPassword = ref<string | undefined>(undefined)
const postOptions = ref<SysPost[]>([])
const roleOptions = ref<SysRole[]>([])
// 列显隐信息
const columns = ref<Record<string, TableShowColumns>>({
  userId: { label: proxy.$t('user.userId'), visible: true },
  userName: { label: proxy.$t('user.userName'), visible: true },
  nickName: { label: proxy.$t('user.nickName'), visible: true },
  deptName: { label: proxy.$t('user.deptName'), visible: true },
  phonenumber: { label: proxy.$t('user.phonenumber'), visible: true },
  status: { label: proxy.$t('common.status'), visible: true },
  createTime: { label: proxy.$t('common.createTime'), visible: true }
})

const data = reactive({
  form: {} as SysUser,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  } as UserQueryParams,
  rules: {
    userName: [{ required: true, message: proxy.$t('user.nameRequired'), trigger: "blur" }, { min: 2, max: 20, message: proxy.$t('user.nameLengthRange'), trigger: "blur" }],
    nickName: [{ required: true, message: proxy.$t('user.nickNameRequired'), trigger: "blur" }],
    email: [{ type: "email", message: proxy.$t('common.invalidEmail'), trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: proxy.$t('common.invalidPhone'), trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false
    userList.value = res.rows
    total.value = res.total
  })
}

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data
    enabledDeptOptions.value = filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
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

/** 节点单击事件 */
function handleNodeClick(data: any) {
  queryParams.value.deptId = data.id
  handleQuery()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value.deptId = undefined
  proxy.$refs.deptTreeRef.setCurrentKey(null)
  handleQuery()
}

/** 删除按钮操作 */
function handleDelete(row?: SysUser) {
  const userIds = row?.userId || ids.value
  proxy.$modal.confirm(proxy.$t('user.deleteConfirm', { ids: userIds })).then(function () {
    return delUser(userIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(proxy.$t('common.deleteSuccess'))
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`)
}

/** 用户状态修改  */
function handleStatusChange(row: SysUser) {
  const text = row.status === "0" ? proxy.$t('common.enable') : proxy.$t('common.disable')
  proxy.$modal.confirm(proxy.$t('user.confirmChangeStatus', { status: text, name: row.userName })).then(function () {
    return changeUserStatus(row.userId!, row.status!)
  }).then(() => {
    proxy.$modal.msgSuccess(proxy.$t('user.statusChangeSuccess', { status: text }))
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0"
  })
}

/** 更多操作 */
function handleCommand(command: string, row: SysUser) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row)
      break
    case "handleAuthRole":
      handleAuthRole(row)
      break
    default:
      break
  }
}

/** 跳转角色分配 */
function handleAuthRole(row: SysUser) {
  const userId = row.userId
  router.push("/system/user-auth/role/" + userId)
}

/** 重置密码按钮操作 */
function handleResetPwd(row: SysUser) {
  proxy.$prompt(proxy.$t('user.enterNewPassword', { name: row.userName }), proxy.$t('common.resetPassword'), {
    confirmButtonText: proxy.$t('common.confirm'),
    cancelButtonText: proxy.$t('common.cancel'),
    closeOnClickModal: false,
    inputValidator: pwdPromptValidator
  }).then(({ value }: { value: string }) => {
    resetUserPwd(row.userId!, value).then(() => {
      proxy.$modal.msgSuccess(proxy.$t('user.resetPwdSuccess', { pwd: value }))
    })
  }).catch(() => {})
}

/** 选择条数  */
function handleSelectionChange(selection: SysUser[]) {
  ids.value = selection.map(item => item.userId!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 详情按钮操作 */
function handleViewData(row: SysUser) {
  proxy.$refs["userViewRef"].open(row.userId)
}

/** 导入按钮操作 */
function handleImport() {
  proxy.$refs["importUserRef"].open()
}

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: []
  }
  proxy.resetForm("userRef")
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  getUser().then(response => {
    postOptions.value = response.posts
    roleOptions.value = response.roles
    open.value = true
    title.value = proxy.$t('user.addTitle')
    form.value.password = initPassword.value
  })
}

/** 修改按钮操作 */
function handleUpdate(row?: SysUser) {
  reset()
  const userId = row?.userId || ids.value[0]
  getUser(userId).then(response => {
    form.value = response.data!
    postOptions.value = response.posts
    roleOptions.value = response.roles
    form.value.postIds = response.postIds
    form.value.roleIds = response.roleIds
    open.value = true
    title.value = proxy.$t('user.editTitle')
    form.value.password = ""
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.editSuccess'))
          open.value = false
          getList()
        })
      } else {
        addUser(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.addSuccess'))
          open.value = false
          getList()
        })
      }
    }
  })
}

onMounted(() => {
  getDeptTree()
  getList()
  proxy.getConfigKey("sys.user.initPassword").then((response: AjaxResult) => {
    initPassword.value = response.msg
  })
})
</script>
