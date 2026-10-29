<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="接口名称" prop="interfaceName">
        <el-input v-model="queryParams.interfaceName" placeholder="请输入接口名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="接口地址" prop="interfaceUrl">
        <el-input v-model="queryParams.interfaceUrl" placeholder="请输入接口地址" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="请求状态" prop="requestStatus">
        <el-select v-model="queryParams.requestStatus" placeholder="请选择请求状态" clearable style="width: 160px">
          <el-option label="成功" value="SUCCESS" />
          <el-option label="失败" value="FAIL" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:outboundLog:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" @click="handleClean" v-hasPermi="['monitor:outboundLog:remove']">清空</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表表格 -->
    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="接口名称" align="center" prop="interfaceName" :show-overflow-tooltip="true" />
      <el-table-column label="接口地址" align="center" prop="interfaceUrl" :show-overflow-tooltip="true" />
      <el-table-column label="请求时间" align="center" prop="requestTime" width="160" />
      <el-table-column label="请求状态" align="center" prop="requestStatus" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.requestStatus === 'SUCCESS' ? 'success' : 'danger'">{{ scope.row.requestStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="HTTP状态码" align="center" prop="responseCode" width="110" />
      <el-table-column label="耗时(ms)" align="center" prop="responseTime" width="100" />
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['monitor:outboundLog:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情对话框 -->
    <el-dialog title="出站日志详情" v-model="detailOpen" width="900px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="接口名称">{{ detail.interfaceName }}</el-descriptions-item>
        <el-descriptions-item label="请求时间">{{ detail.requestTime }}</el-descriptions-item>
        <el-descriptions-item label="请求状态">
          <el-tag :type="detail.requestStatus === 'SUCCESS' ? 'success' : 'danger'">{{ detail.requestStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="HTTP状态码">{{ detail.responseCode }}</el-descriptions-item>
        <el-descriptions-item label="耗时(毫秒)">{{ detail.responseTime }}</el-descriptions-item>
        <el-descriptions-item label="请求ID">{{ detail.requestId }}</el-descriptions-item>
        <el-descriptions-item label="程序标识">{{ detail.programId }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="接口地址" :span="2">{{ detail.interfaceUrl }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">请求参数</el-divider>
      <pre class="log-content">{{ detail.requestParameter }}</pre>

      <el-divider content-position="left">响应内容</el-divider>
      <pre class="log-content">{{ detail.responseContent }}</pre>

      <template v-if="detail.stacktrace">
        <el-divider content-position="left">错误堆栈</el-divider>
        <pre class="log-content">{{ detail.stacktrace }}</pre>
      </template>

      <template #footer>
        <el-button @click="detailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { listOutboundLog, getOutboundLog, delOutboundLog, cleanOutboundLog } from '@/api/apilog/outboundLog'
import type { OutboundLog, OutboundLogQuery } from '@/types'

const { proxy } = getCurrentInstance() as any

const loading = ref(true)
const showSearch = ref(true)
const logList = ref<OutboundLog[]>([])
const total = ref(0)
const ids = ref<number[]>([])
const multiple = ref(true)
const dateRange = ref<string[]>([])
const detailOpen = ref(false)
const detail = ref<OutboundLog>({})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as OutboundLogQuery,
})

const { queryParams } = toRefs(data)

/** 组装时间范围条件 */
function buildQuery(): OutboundLogQuery {
  const query: OutboundLogQuery = { ...queryParams.value }
  if (dateRange.value && dateRange.value.length === 2) {
    query.beginTime = dateRange.value[0] + ' 00:00:00'
    query.endTime = dateRange.value[1] + ' 23:59:59'
  } else {
    delete query.beginTime
    delete query.endTime
  }
  return query
}

/** 查询列表 */
function getList() {
  loading.value = true
  listOutboundLog(buildQuery())
    .then(res => {
      logList.value = res.rows
      total.value = res.total
    })
    .finally(() => {
      loading.value = false
    })
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选 */
function handleSelectionChange(selection: OutboundLog[]) {
  ids.value = selection.map(item => item.outboundId as number)
  multiple.value = !selection.length
}

/** 查看详情 */
function handleDetail(row: OutboundLog) {
  getOutboundLog(row.outboundId as number).then(res => {
    detail.value = res.data
    detailOpen.value = true
  })
}

/** 删除 */
function handleDelete() {
  proxy.$modal.confirm('是否确认删除选中的出站接口日志？').then(() => {
    return delOutboundLog(ids.value)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 清空 */
function handleClean() {
  proxy.$modal.confirm('是否确认清空全部出站接口日志？').then(() => {
    return cleanOutboundLog()
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('清空成功')
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.log-content {
  max-height: 260px;
  overflow: auto;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
}
</style>
