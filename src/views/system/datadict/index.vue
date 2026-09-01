<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="表名称" prop="tableName">
            <el-input
               v-model="queryParams.tableName"
               placeholder="请输入表名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="表描述" prop="tableComment">
            <el-input
               v-model="queryParams.tableComment"
               placeholder="请输入表描述"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:datadict:export']"
            >导出所有</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               :disabled="multiple"
               @click="handleExportSelected"
               v-hasPermi="['system:datadict:export']"
            >导出选中</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="表名称" align="center" prop="tableName" :show-overflow-tooltip="true">
            <template #default="scope">
               <a class="link-type" style="cursor:pointer" @click="handleDetail(scope.row)">{{ scope.row.tableName }}</a>
            </template>
         </el-table-column>
         <el-table-column label="表描述" align="center" prop="tableComment" :show-overflow-tooltip="true" />
         <el-table-column label="存储引擎" align="center" prop="engine" />
         <el-table-column label="排序规则" align="center" prop="tableCollation" :show-overflow-tooltip="true" />
         <el-table-column label="记录数" align="center" prop="tableRows" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['system:datadict:query']">详情</el-button>
               <el-button link type="primary" icon="Operation" @click="handleColumnList(scope.row)" v-hasPermi="['system:datadict:query']">字段</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 表结构详情对话框 -->
      <el-dialog :title="detail.title" v-model="detail.open" width="1100px" top="5vh" append-to-body>
         <el-descriptions :column="3" border size="small" v-loading="detail.loading">
            <el-descriptions-item label="表名称">{{ detail.info.tableName }}</el-descriptions-item>
            <el-descriptions-item label="表描述">{{ detail.info.tableComment }}</el-descriptions-item>
            <el-descriptions-item label="存储引擎">{{ detail.info.engine }}</el-descriptions-item>
            <el-descriptions-item label="排序规则">{{ detail.info.tableCollation }}</el-descriptions-item>
            <el-descriptions-item label="记录数">{{ detail.info.tableRows }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ parseTime(detail.info.createTime) }}</el-descriptions-item>
         </el-descriptions>
         <el-tabs v-model="detail.activeTab" style="margin-top: 12px">
            <el-tab-pane :label="'字段(' + detail.columns.length + ')'" name="column">
               <el-table :data="detail.columns" border size="small" max-height="400">
                  <el-table-column label="字段名" align="center" prop="columnName" :show-overflow-tooltip="true" />
                  <el-table-column label="数据类型" align="center" prop="columnType" :show-overflow-tooltip="true" />
                  <el-table-column label="长度" align="center" prop="characterMaximumLength" />
                  <el-table-column label="精度/标度" align="center" width="90">
                     <template #default="scope">
                        <span v-if="scope.row.numericPrecision">{{ scope.row.numericPrecision }},{{ scope.row.numericScale ?? 0 }}</span>
                     </template>
                  </el-table-column>
                  <el-table-column label="主键" align="center" width="60">
                     <template #default="scope">
                        <el-tag v-if="isPrimaryKey(scope.row)" type="success" size="small">是</el-tag>
                     </template>
                  </el-table-column>
                  <el-table-column label="自增" align="center" width="60">
                     <template #default="scope">
                        <el-tag v-if="isIncrement(scope.row)" type="warning" size="small">是</el-tag>
                     </template>
                  </el-table-column>
                  <el-table-column label="可空" align="center" width="60">
                     <template #default="scope">
                        <el-tag :type="isNullable(scope.row) ? 'info' : 'danger'" size="small">{{ isNullable(scope.row) ? '是' : '否' }}</el-tag>
                     </template>
                  </el-table-column>
                  <el-table-column label="默认值" align="center" prop="columnDefault" :show-overflow-tooltip="true" />
                  <el-table-column label="注释" align="center" prop="columnComment" :show-overflow-tooltip="true" />
               </el-table>
            </el-tab-pane>
            <el-tab-pane :label="'外键(' + detail.foreignKeys.length + ')'" name="foreign">
               <el-table :data="detail.foreignKeys" border size="small" max-height="400">
                  <el-table-column label="约束名称" align="center" prop="constraintName" :show-overflow-tooltip="true" />
                  <el-table-column label="字段" align="center" prop="columnName" :show-overflow-tooltip="true" />
                  <el-table-column label="引用表" align="center" prop="referencedTableName" :show-overflow-tooltip="true" />
                  <el-table-column label="引用字段" align="center" prop="referencedColumnName" :show-overflow-tooltip="true" />
               </el-table>
            </el-tab-pane>
            <el-tab-pane :label="'索引(' + detail.indexes.length + ')'" name="index">
               <el-table :data="detail.indexes" border size="small" max-height="400">
                  <el-table-column label="索引名称" align="center" prop="indexName" :show-overflow-tooltip="true" />
                  <el-table-column label="索引类型" align="center" prop="indexType" />
                  <el-table-column label="唯一" align="center" width="60">
                     <template #default="scope">
                        <el-tag :type="isUnique(scope.row) ? 'success' : 'info'" size="small">{{ isUnique(scope.row) ? '是' : '否' }}</el-tag>
                     </template>
                  </el-table-column>
                  <el-table-column label="包含字段" align="center" prop="columnName" :show-overflow-tooltip="true" />
               </el-table>
            </el-tab-pane>
         </el-tabs>
      </el-dialog>

      <!-- 字段明细对话框 -->
      <el-dialog :title="column.title" v-model="column.open" width="1000px" top="5vh" append-to-body>
         <el-table :data="column.list" v-loading="column.loading" border size="small" max-height="500">
            <el-table-column label="字段名" align="center" prop="columnName" :show-overflow-tooltip="true" />
            <el-table-column label="数据类型" align="center" prop="columnType" :show-overflow-tooltip="true" />
            <el-table-column label="长度" align="center" prop="characterMaximumLength" />
            <el-table-column label="精度/标度" align="center" width="90">
               <template #default="scope">
                  <span v-if="scope.row.numericPrecision">{{ scope.row.numericPrecision }},{{ scope.row.numericScale ?? 0 }}</span>
               </template>
            </el-table-column>
            <el-table-column label="主键" align="center" width="60">
               <template #default="scope">
                  <el-tag v-if="isPrimaryKey(scope.row)" type="success" size="small">是</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="自增" align="center" width="60">
               <template #default="scope">
                  <el-tag v-if="isIncrement(scope.row)" type="warning" size="small">是</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="可空" align="center" width="60">
               <template #default="scope">
                  <el-tag :type="isNullable(scope.row) ? 'info' : 'danger'" size="small">{{ isNullable(scope.row) ? '是' : '否' }}</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="默认值" align="center" prop="columnDefault" :show-overflow-tooltip="true" />
            <el-table-column label="注释" align="center" prop="columnComment" :show-overflow-tooltip="true" />
         </el-table>
      </el-dialog>
   </div>
</template>

<script setup lang="ts" name="Datadict">
import { listDataTable, getTableInfo, listColumn } from "@/api/system/datadict"
import type {
  DataDictTable,
  DataDictColumn,
  DataDictForeignKey,
  DataDictIndex,
  DataDictTableQueryParams
} from '@/types/api/system/datadict'

const { proxy } = getCurrentInstance()

const tableList = ref<DataDictTable[]>([])
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const total = ref<number>(0)
const selectedRows = ref<DataDictTable[]>([])
const multiple = ref<boolean>(true)

const data = reactive({
  /** 查询参数 */
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined
  } as DataDictTableQueryParams,
  /** 表结构详情对话框 */
  detail: {
    open: false,
    loading: false,
    title: "",
    activeTab: "column",
    info: {} as DataDictTable,
    columns: [] as DataDictColumn[],
    foreignKeys: [] as DataDictForeignKey[],
    indexes: [] as DataDictIndex[]
  },
  /** 字段明细对话框 */
  column: {
    open: false,
    loading: false,
    title: "",
    list: [] as DataDictColumn[]
  }
})

const { queryParams, detail, column } = toRefs(data)

/**
 * 查询数据字典表列表
 */
function getList() {
  loading.value = true
  listDataTable(queryParams.value).then(response => {
    tableList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/**
 * 搜索按钮操作：重置页码后查询
 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/**
 * 重置按钮操作：清空查询条件后查询
 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/**
 * 导出所有按钮操作：按当前筛选条件导出数据字典 Excel（不传条件则导出全库）
 */
function handleExport() {
  proxy.download("system/datadict/table/export", {
    ...queryParams.value
  }, `datadict_${new Date().getTime()}.xlsx`)
}

/**
 * 多选框选中数据
 * @param selection 选中的行数据
 */
function handleSelectionChange(selection: DataDictTable[]) {
  selectedRows.value = selection
  multiple.value = !selection.length
}

/**
 * 导出选中按钮操作：导出勾选的表数据字典 Excel
 */
function handleExportSelected() {
  const tableNames = selectedRows.value.map(item => item.tableName)
  proxy.download("system/datadict/table/export", {
    tableNames: tableNames.join(',')
  }, `datadict_${new Date().getTime()}.xlsx`)
}

/**
 * 查看表结构详情：基本信息 + 字段 + 外键 + 索引
 * @param row 当前行表数据
 */
function handleDetail(row: DataDictTable) {
  detail.value.title = "表结构详情"
  detail.value.open = true
  detail.value.loading = true
  detail.value.activeTab = "column"
  detail.value.info = {} as DataDictTable
  detail.value.columns = []
  detail.value.foreignKeys = []
  detail.value.indexes = []
  getTableInfo(row.tableName!).then(response => {
    const result = response.data!
    detail.value.info = result.info || {} as DataDictTable
    detail.value.columns = result.columns || []
    detail.value.foreignKeys = result.foreignKeys || []
    detail.value.indexes = result.indexes || []
    detail.value.loading = false
  }).catch(() => {
    detail.value.loading = false
  })
}

/**
 * 查看单表字段明细
 * @param row 当前行表数据
 */
function handleColumnList(row: DataDictTable) {
  column.value.title = "字段明细 - " + row.tableName
  column.value.open = true
  column.value.loading = true
  column.value.list = []
  listColumn(row.tableName!).then(response => {
    column.value.list = response.data || []
    column.value.loading = false
  }).catch(() => {
    column.value.loading = false
  })
}

/**
 * 判断字段是否为主键
 * @param row 字段信息
 * @returns 是否主键
 */
function isPrimaryKey(row: DataDictColumn): boolean {
  return row.columnKey === 'PRI'
}

/**
 * 判断字段是否为自增
 * @param row 字段信息
 * @returns 是否自增
 */
function isIncrement(row: DataDictColumn): boolean {
  return (row.extra || '').indexOf('auto_increment') > -1
}

/**
 * 判断字段是否可空
 * @param row 字段信息
 * @returns 是否可空
 */
function isNullable(row: DataDictColumn): boolean {
  return row.isNullable === 'YES'
}

/**
 * 判断索引是否为唯一索引
 * @param row 索引信息
 * @returns 是否唯一索引
 */
function isUnique(row: DataDictIndex): boolean {
  return row.nonUnique === 0
}

getList()
</script>
