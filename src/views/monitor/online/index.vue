<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="登录地址" prop="ipaddr">
            <el-input
               v-model="queryParams.ipaddr"
               placeholder="请输入登录地址"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item :label="$t('user.userName')" prop="userName">
            <el-input
               v-model="queryParams.userName"
               :placeholder="$t('user.userNamePlaceholder')"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('common.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ $t('common.reset') }}</el-button>
         </el-form-item>
      </el-form>
      <el-table
         v-loading="loading"
         :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
         style="width: 100%;"
      >
         <el-table-column label="序号" width="50" type="index" align="center">
            <template #default="scope">
               <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="$t('online.tokenId')" align="center" prop="tokenId" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('online.userName')" align="center" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('user.deptName')" align="center" prop="deptName" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('online.ipaddr')" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('online.loginLocation')" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('online.os')" align="center" prop="os" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('online.browser')" align="center" prop="browser" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('logininfor.loginTime')" align="center" prop="loginTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="$t('common.action')" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">{{ $t('online.forceExit') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
   </div>
</template>

<script setup lang="ts" name="Online">
import { forceLogout, list as initData } from "@/api/monitor/online"
import type { SysUserOnline, OnlineQueryParams } from '@/types/api/monitor/online'

const { proxy } = getCurrentInstance()

const onlineList = ref<SysUserOnline[]>([])
const loading = ref<boolean>(true)
const total = ref<number>(0)
const pageNum = ref<number>(1)
const pageSize = ref<number>(10)

const queryParams = ref<OnlineQueryParams>({
  ipaddr: undefined,
  userName: undefined
})

/** 查询登录日志列表 */
function getList() {
  loading.value = true
  initData(queryParams.value).then(response => {
    onlineList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  pageNum.value = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 强退按钮操作 */
function handleForceLogout(row: SysUserOnline) {
  proxy.$modal.confirm('是否确认强退名称为"' + row.userName + '"的用户?').then(function () {
    return forceLogout(row.tokenId!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(proxy.$t('common.deleteSuccess'))
  }).catch(() => {})
}

getList()
</script>
