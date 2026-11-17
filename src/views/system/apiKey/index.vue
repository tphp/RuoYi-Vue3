<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="$t('apiKey.appName')" prop="appName">
            <el-input
               v-model="queryParams.appName"
               :placeholder="$t('apiKey.appNamePlaceholder')"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="API Key" prop="apiKey">
            <el-input
               v-model="queryParams.apiKey"
               :placeholder="$t('apiKey.apiKeyPlaceholder')"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item :label="$t('common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="$t('common.status')" clearable style="width: 240px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('common.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ $t('common.reset') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:apiKey:add']"
            >{{ $t('common.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:apiKey:edit']"
            >{{ $t('common.edit') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:apiKey:remove']"
            >{{ $t('common.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:apiKey:export']"
            >{{ $t('common.export') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="apiKeyList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="$t('apiKey.appName')" align="center" prop="appName" :show-overflow-tooltip="true" />
         <el-table-column label="API Key" align="center" prop="apiKey" :show-overflow-tooltip="true" width="280">
            <template #default="scope">
               <el-button link type="primary" @click="copyText(scope.row.apiKey)">
                  {{ scope.row.apiKey }}
               </el-button>
            </template>
         </el-table-column>
         <el-table-column label="API Secret" align="center" prop="apiSecret" :show-overflow-tooltip="true" width="280">
            <template #default="scope">
               <span v-if="scope.row.apiSecret">
                  <el-button link type="primary" @click="copyText(scope.row.apiSecret)">
                     {{ $t('apiKey.clickToCopy') }}
                  </el-button>
               </span>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column :label="$t('common.status')" align="center" prop="status" width="80">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="$t('apiKey.expireTime')" align="center" prop="expireTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.expireTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="$t('common.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('common.createTime')" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="$t('common.action')" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:apiKey:edit']">{{ $t('common.edit') }}</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:apiKey:remove']">{{ $t('common.delete') }}</el-button>
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

      <!-- 添加或修改API密钥对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="apiKeyRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item :label="$t('apiKey.appName')" prop="appName">
               <el-input v-model="form.appName" :placeholder="$t('apiKey.appNameExample')" />
            </el-form-item>
            <el-form-item label="API Key" prop="apiKey">
               <el-input v-model="form.apiKey" :placeholder="$t('apiKey.apiKeyPlaceholder')" :readonly="!!form.id">
                  <template #append>
                     <el-button type="button" @click="handleGenerateApiKey" :disabled="!!form.id">{{ $t('common.generate') }}</el-button>
                  </template>
               </el-input>
            </el-form-item>
            <el-form-item label="API Secret" prop="apiSecret">
               <el-input v-model="form.apiSecret" :placeholder="$t('apiKey.generateOnRight')" readonly type="password" show-password>
                  <template #append>
                     <el-button type="button" @click="handleApiSecret" :disabled="!!form.id">{{ $t('common.generate') }}</el-button>
                  </template>
               </el-input>
            </el-form-item>
            <el-form-item :label="$t('common.status')" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :value="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('apiKey.expireTime')" prop="expireTime">
               <el-date-picker
                  v-model="form.expireTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :placeholder="$t('apiKey.expireTimePlaceholder')"
                  style="width: 100%"
               />
            </el-form-item>
            <el-form-item :label="$t('common.remark')" prop="remark">
               <el-input v-model="form.remark" type="textarea" :placeholder="$t('common.remarkPlaceholder')" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">{{ $t('common.confirm') }}</el-button>
               <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup lang="ts" name="ApiKey">
import type { SysApiKey, ApiKeyQueryParams } from '@/types/api/system/apiKey'
import { listApiKey, getApiKey, delApiKey, addApiKey, updateApiKey, generateApiKey, generateApiSecret } from "@/api/system/apiKey"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = useDict("sys_normal_disable")

const apiKeyList = ref<SysApiKey[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as SysApiKey,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appName: undefined,
    apiKey: undefined,
    status: undefined
  } as ApiKeyQueryParams,
  rules: {
    appName: [{ required: true, message: proxy.$t('apiKey.appNameRequired'), trigger: "blur" }],
    apiKey: [{ required: true, message: proxy.$t('apiKey.apiKeyRequired'), trigger: "blur" }],
    apiSecret: [{ required: true, message: proxy.$t('apiKey.apiSecretRequired'), trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询API密钥列表 */
function getList() {
  loading.value = true
  listApiKey(queryParams.value).then(response => {
    apiKeyList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    appName: undefined,
    apiKey: undefined,
    apiSecret: undefined,
    status: '0',
    expireTime: undefined,
    remark: undefined
  }
  proxy.resetForm("apiKeyRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SysApiKey[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = proxy.$t('apiKey.addTitle')
}

/** 修改按钮操作 */
function handleUpdate(row: SysApiKey) {
  reset()
  const id = row.id || ids.value[0]
  getApiKey(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = proxy.$t('apiKey.editTitle')
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["apiKeyRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateApiKey(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.editSuccess'))
          open.value = false
          getList()
        })
      } else {
        addApiKey(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.addSuccess'))
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: SysApiKey) {
  const apiIds = row.id || ids.value
  proxy.$modal.confirm(proxy.$t('apiKey.deleteConfirm', { ids: apiIds })).then(function () {
    return delApiKey(apiIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(proxy.$t('common.deleteSuccess'))
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/apiKey/export", {
    ...queryParams.value
  }, `apiKey_${new Date().getTime()}.xlsx`)
}

/** 生成API Key */
function handleGenerateApiKey() {
  generateApiKey().then(response => {
    form.value.apiKey = response.data
    proxy.$modal.msgSuccess(proxy.$t('apiKey.generateSuccess'))
  }).catch((error) => {
    console.error(error)
    proxy.$modal.msgError(proxy.$t('apiKey.generateFail'))
  })
}

/** 生成API Secret */
function handleApiSecret() {
  generateApiSecret().then(response => {
    form.value.apiSecret = response.data
    proxy.$modal.msgSuccess(proxy.$t('apiKey.secretGenerateSuccess'))
  }).catch(() => {
    proxy.$modal.msgError(proxy.$t('apiKey.secretGenerateFail'))
  })
}

/** 复制文本 */
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    proxy.$modal.msgSuccess(proxy.$t('common.copySuccess'))
  }).catch(() => {
    proxy.$modal.msgError(proxy.$t('common.copyFail'))
  })
}

getList()
</script>
