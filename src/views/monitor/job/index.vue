<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="$t('job.jobName')" prop="jobName">
            <el-input
               v-model="queryParams.jobName"
               :placeholder="$t('job.jobNamePlaceholder')"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item :label="$t('job.jobGroup')" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" :placeholder="$t('job.jobGroupPlaceholder')" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item :label="$t('job.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="$t('job.statusPlaceholder')" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_status"
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
               v-hasPermi="['monitor:job:add']"
            >{{ $t('common.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['monitor:job:edit']"
            >{{ $t('common.edit') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:job:remove']"
            >{{ $t('common.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:job:export']"
            >{{ $t('common.export') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Operation"
               @click="handleJobLog"
               v-hasPermi="['monitor:job:query']"
            >{{ $t('job.log') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="$t('job.jobId')" width="100" align="center" prop="jobId" />
         <el-table-column :label="$t('job.jobName')" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
               <a class="link-type" style="cursor:pointer" @click="handleView(scope.row)">{{ scope.row.jobName }}</a>
            </template>
         </el-table-column>
         <el-table-column :label="$t('job.jobGroup')" align="center" prop="jobGroup">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column :label="$t('job.invokeTarget')" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('job.cronExecutionExpression')" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
         <el-table-column :label="$t('common.status')" align="center">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column :label="$t('common.action')" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip :content="$t('common.edit')" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['monitor:job:edit']"</el-button>
               </el-tooltip>
               <el-tooltip :content="$t('common.delete')" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:job:remove']"</el-button>
               </el-tooltip>
               <el-tooltip :content="$t('job.execOnce')" placement="top">
                  <el-button link type="primary" icon="CaretRight" @click="handleRun(scope.row)" v-hasPermi="['monitor:job:changeStatus']"</el-button>
               </el-tooltip>
               <el-tooltip :content="$t('job.log')" placement="top">
                  <el-button link type="primary" icon="Operation" @click="handleJobLog(scope.row)" v-hasPermi="['monitor:job:query']"</el-button>
               </el-tooltip>
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

      <!-- 添加或修改定时任务对话框 -->
      <el-dialog :title="title" v-model="open" width="820px" append-to-body>
         <el-form ref="jobRef" :model="form" :rules="rules" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item :label="$t('job.jobName')" prop="jobName">
                     <el-input v-model="form.jobName" :placeholder="$t('job.jobNamePlaceholder')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="$t('job.jobGroup')" prop="jobGroup">
                     <el-select v-model="form.jobGroup" :placeholder="$t('common.select')">
                        <el-option
                           v-for="dict in sys_job_group"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item prop="invokeTarget">
                     <template #label>
                        <span>
                           {{ $t('job.invokeMethod') }}
                           <el-tooltip placement="top">
                              <template #content>
                                 <div>
                                    {{ $t('job.beanInvokeExample') }}
                                    <br />{{ $t('job.classInvokeExample') }}
                                    <br />{{ $t('job.paramDescription') }}
                                 </div>
                              </template>
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                        </span>
                     </template>
                     <el-input v-model="form.invokeTarget" :placeholder="$t('job.invokeTargetPlaceholder')" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="$t('job.cronExpression')" prop="cronExpression">
                     <el-input v-model="form.cronExpression" :placeholder="$t('job.cronPlaceholder')">
                        <template #append>
                           <el-button type="primary" @click="handleShowCron">
                              {{ $t('job.generateExpression') }}
                              <i class="el-icon-time el-icon--right"></i>
                           </el-button>
                        </template>
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.jobId !== undefined">
                  <el-form-item :label="$t('common.status')">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_job_status"
                           :key="dict.value"
                           :value="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="$t('job.misfirePolicy')" prop="misfirePolicy">
                     <el-radio-group v-model="form.misfirePolicy">
                        <el-radio-button value="1">{{ $t('job.policyImmediate') }}</el-radio-button>
                        <el-radio-button value="2">{{ $t('job.policyOnce') }}</el-radio-button>
                        <el-radio-button value="3">{{ $t('job.policyDiscard') }}</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="$t('job.isConcurrent')" prop="concurrent">
                     <el-radio-group v-model="form.concurrent">
                        <el-radio-button value="0">{{ $t('job.allow') }}</el-radio-button>
                        <el-radio-button value="1">{{ $t('job.forbid') }}</el-radio-button>
                     </el-radio-group>
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

     <el-dialog :title="$t('job.cronGenerator')" v-model="openCron" append-to-body destroy-on-close>
       <crontab ref="crontabRef" @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
     </el-dialog>

      <!-- 任务日志详细 -->
      <job-detail v-model:visible="openView" :row="form" type="job" />
   </div>
</template>

<script setup lang="ts" name="Job">
import JobDetail from './detail.vue'
import Crontab from '@/components/Crontab/index.vue'
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job"
import type { JobQueryParams, SysJob } from '@/types/api/monitor/job'

const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_job_group, sys_job_status } = useDict("sys_job_group", "sys_job_status")

const jobList = ref<SysJob[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const openView = ref<boolean>(false)
const openCron = ref<boolean>(false)
const expression = ref<string>("")

const data = reactive({
  form: {} as SysJob,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  } as JobQueryParams,
  rules: {
    jobName: [{ required: true, message: proxy.$t('job.nameRequired'), trigger: "blur" }],
    invokeTarget: [{ required: true, message: proxy.$t('job.invokeTargetRequired'), trigger: "blur" }],
    cronExpression: [{ required: true, message: proxy.$t('job.cronRequired'), trigger: "change" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询定时任务列表 */
function getList() {
  loading.value = true
  listJob(queryParams.value).then(response => {
    jobList.value = response.rows
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
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: '1',
    concurrent: '1',
    status: "0"
  }
  proxy.resetForm("jobRef")
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

// 多选框选中数据
function handleSelectionChange(selection: SysJob[]) {
  ids.value = selection.map(item => item.jobId!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 任务状态修改
function handleStatusChange(row: SysJob) {
  const text = row.status === "0" ? proxy.$t('common.enable') : proxy.$t('common.disable')
  proxy.$modal.confirm(proxy.$t('job.confirmChangeStatus', { status: text, name: row.jobName })).then(function () {
    return changeJobStatus(row.jobId!, row.status!)
  }).then(() => {
    proxy.$modal.msgSuccess(proxy.$t('job.statusChangeSuccess', { status: text }))
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0"
  })
}

/* 立即执行一次 */
function handleRun(row: SysJob) {
  proxy.$modal.confirm(proxy.$t('job.confirmRunOnce', { name: row.jobName })).then(function () {
    return runJob(row.jobId!, row.jobGroup!)
  }).then(() => {
    proxy.$modal.msgSuccess(proxy.$t('job.runSuccess'))
  }).catch(() => {})
}

/** 任务详细信息 */
function handleView(row: SysJob) {
  getJob(row.jobId!).then(response => {
    form.value = response.data!
    openView.value = true
  })
}

/** cron表达式按钮操作 */
function handleShowCron() {
  expression.value = form.value.cronExpression || ""
  openCron.value = true
}

/** 确定后回传值 */
function crontabFill(value: string) {
  form.value.cronExpression = value
}

/** 任务日志列表查询 */
function handleJobLog(row: SysJob) {
  const jobId = row.jobId || 0
  router.push('/monitor/job-log/index/' + jobId)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = proxy.$t('job.addTitle')
}

/** 修改按钮操作 */
function handleUpdate(row?: SysJob) {
  reset()
  const jobId = row?.jobId || ids.value[0]
  getJob(jobId).then(response => {
    form.value = response.data!
    open.value = true
    title.value = proxy.$t('job.editTitle')
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["jobRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.jobId != undefined) {
        updateJob(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.editSuccess'))
          open.value = false
          getList()
        })
      } else {
        addJob(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.addSuccess'))
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row?: SysJob) {
  const jobIds = row?.jobId || ids.value
  proxy.$modal.confirm(proxy.$t('job.deleteConfirm', { ids: jobIds })).then(function () {
    return delJob(jobIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(proxy.$t('common.deleteSuccess'))
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `job_${new Date().getTime()}.xlsx`)
}

getList()
</script>
