<template>
  <el-dialog :title="type === 'log' ? $t('job.logDetail') : $t('job.taskDetail')" v-model="dialogVisible" width="780px" append-to-body>
    <div class="detail-wrap">
      <template v-if="type === 'log'">
        <!-- 基本信息 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><InfoFilled /><</el-icon> {{ $t('common.basicInfo') }}
          </div>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.jobLogId') }}</span><span class="detail-value">{{ logForm.jobLogId }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">{{ $t('job.execStatus') }}</span>
                <el-tag v-if="logForm.status == 0" type="success" size="small">{{ $t('user.normal') }}</el-tag>
                <el-tag v-else type="danger" size="small">{{ $t('common.error') }}</el-tag>
              </div>
            </el-col>
          </el-row>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.startTime') }}</span><span class="detail-value">{{ logForm.startTime }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.endTime') }}</span><span class="detail-value">{{ logForm.endTime }}</span></div>
            </el-col>
          </el-row>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.recordTime') }}</span><span class="detail-value">{{ logForm.createTime }}</span></div>
            </el-col>
            <el-col :span="12" v-if="logForm.status == 0 && logForm.startTime && logForm.endTime">
              <div class="detail-item"><span class="detail-label">{{ $t('job.costTime') }}</span><span class="detail-value">{{ costTime }} {{ $t('common.millisecond') }}</span></div>
            </el-col>
          </el-row>
        </div>
        <!-- 任务信息 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><Clock /><</el-icon> {{ $t('job.taskInfo') }}
          </div>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.jobName') }}</span><span class="detail-value">{{ logForm.jobName }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">{{ $t('job.jobGroup') }}</span>
                <dict-tag :options="sys_job_group" :value="logForm.jobGroup" />
              </div>
            </el-col>
          </el-row>
          <el-row class="detail-row">
            <el-col :span="24">
              <div class="detail-item"><span class="detail-label">{{ $t('job.jobMessage') }}</span><span class="detail-value">{{ logForm.jobMessage }}</span></div>
            </el-col>
          </el-row>
        </div>
        <!-- 调用目标 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><Operation /><</el-icon> {{ $t('job.invokeTarget') }}
          </div>
          <div class="code-body">
            <div class="code-wrap"><pre class="code-pre">{{ logForm.invokeTarget || $t('common.none') }}</pre></div>
          </div>
        </div>
        <!-- 异常信息 -->
        <div class="detail-card" v-if="logForm.status == 1">
          <div class="detail-card-title error-title">
            <el-icon><Warning /><</el-icon> {{ $t('common.exceptionInfo') }}
          </div>
          <div class="error-body"><div class="error-msg">{{ logForm.exceptionInfo }}</div></div>
        </div>
      </template>

      <template v-else>
        <!-- 任务配置 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><Setting /><</el-icon> {{ $t('job.taskConfig') }}
          </div>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.jobId') }}</span><span class="detail-value">{{ jobForm.jobId }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.jobName') }}</span><span class="detail-value">{{ jobForm.jobName }}</span></div>
            </el-col>
          </el-row>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">{{ $t('job.jobGroup') }}</span>
                <dict-tag :options="sys_job_group" :value="jobForm.jobGroup" />
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">{{ $t('job.execStatus') }}</span>
                <el-tag v-if="jobForm.status == 0" type="success" size="small">{{ $t('user.normal') }}</el-tag>
                <el-tag v-else type="info" size="small">{{ $t('job.paused') }}</el-tag>
              </div>
            </el-col>
          </el-row>
        </div>
        <!-- 调度信息 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><Calendar /><</el-icon> {{ $t('job.scheduleInfo') }}
          </div>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.cronExpression') }}</span><span class="detail-value mono">{{ jobForm.cronExpression }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('job.nextRunTime') }}</span><span class="detail-value">{{ parseTime(jobForm.nextValidTime) }}</span></div>
            </el-col>
          </el-row>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">{{ $t('job.misfirePolicy') }}</span>
                <el-tag v-if="jobForm.misfirePolicy == 0" type="info" size="small">{{ $t('job.policyDefault') }}</el-tag>
                <el-tag v-else-if="jobForm.misfirePolicy == 1" type="warning" size="small">{{ $t('job.policyImmediate') }}</el-tag>
                <el-tag v-else-if="jobForm.misfirePolicy == 2" type="primary" size="small">{{ $t('job.policyOnce') }}</el-tag>
                <el-tag v-else-if="jobForm.misfirePolicy == 3" type="danger" size="small">{{ $t('job.policyDiscard') }}</el-tag>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="detail-label">{{ $t('job.concurrentExec') }}</span>
                <el-tag v-if="jobForm.concurrent == 0" type="success" size="small">{{ $t('job.allow') }}</el-tag>
                <el-tag v-else type="danger" size="small">{{ $t('job.forbid') }}</el-tag>
              </div>
            </el-col>
          </el-row>
        </div>
        <!-- 执行方法 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><Operation /><</el-icon> {{ $t('job.execMethod') }}
          </div>
          <div class="code-body">
            <div class="code-wrap"><pre class="code-pre">{{ jobForm.invokeTarget || $t('common.none') }}</pre></div>
          </div>
        </div>
        <!-- 元信息 -->
        <div class="detail-card">
          <div class="detail-card-title">
            <el-icon><Document /><</el-icon> {{ $t('job.metaInfo') }}
          </div>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('common.createBy') }}</span><span class="detail-value">{{ jobForm.createBy || '-' }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('common.createTime') }}</span><span class="detail-value">{{ jobForm.createTime }}</span></div>
            </el-col>
          </el-row>
          <el-row class="detail-row">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('common.updateBy') }}</span><span class="detail-value">{{ jobForm.updateBy || '-' }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">{{ $t('common.updateTime') }}</span><span class="detail-value">{{ jobForm.updateTime || '-' }}</span></div>
            </el-col>
          </el-row>
          <el-row class="detail-row" v-if="jobForm.remark">
            <el-col :span="24">
              <div class="detail-item"><span class="detail-label">{{ $t('common.remark') }}</span><span class="detail-value">{{ jobForm.remark }}</span></div>
            </el-col>
          </el-row>
        </div>
      </template>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('common.close') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="JobDetail">
import type { SysJob } from '@/types/api/monitor/job'
import type { SysJobLog } from '@/types/api/monitor/jobLog'

type DetailType = 'job' | 'log'

const props = defineProps<{
  visible: boolean
  row: SysJob | SysJobLog
  type?: DetailType
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
})

const { proxy } = getCurrentInstance()!
const { sys_job_group } = useDict('sys_job_group')

const jobForm = computed<SysJob>(() => props.row as SysJob)
const logForm = computed<SysJobLog>(() => props.row as SysJobLog)

const costTime = computed<number>(() => {
  const { startTime, endTime } = logForm.value
  if (!startTime || !endTime) return 0
  return new Date(endTime).getTime() - new Date(startTime).getTime()
})
</script>

<style scoped>
.detail-label {
  width: 80px;
}
</style>
