<template>
  <el-dialog :title="$t('operlog.detailTitle')" v-model="dialogVisible" width="780px" append-to-body @close="$emit('update:visible', false)">
    <div class="detail-wrap">
      <!-- 基本信息 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><InfoFilled /><</el-icon> {{ $t('common.basicInfo') }}</div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.moduleTitle') }}</span><span class="detail-value">{{ form.title }}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.businessType') }}</span><span class="detail-value">{{ typeLabel }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.operTime') }}</span><span class="detail-value">{{ form.operTime }}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">{{ $t('operlog.execStatus') }}</span>
              <el-tag v-if="form.status === 0" type="success" size="small">{{ $t('user.normal') }}</el-tag>
              <el-tag v-else type="danger" size="small">{{ $t('operlog.exception') }}</el-tag>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作人员 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><User /><</el-icon> {{ $t('operlog.operatorSection') }}</div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.operName') }}</span><span class="detail-value">{{ form.operName }}</span></div>
          </el-col>
          <el-col :span="12" v-if="form.deptName">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.deptName') }}</span><span class="detail-value">{{ form.deptName }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">{{ $t('operlog.operAddress') }}</span>
              <span class="detail-value">{{ form.operIp }}&nbsp;&nbsp;<span class="detail-location">{{ form.operLocation }}</span></span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 请求信息 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Sort /><</el-icon> {{ $t('operlog.requestInfo') }}</div>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">{{ $t('operlog.operUrl') }}</span>
              <span class="detail-value">
                <span :class="'method-tag method-' + form.requestMethod">{{ form.requestMethod }}</span>
                {{ form.operUrl }}
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.method') }}</span><span class="detail-value mono">{{ form.method }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('operlog.costTime') }}</span><span class="detail-value">{{ form.costTime }} {{ $t('common.millisecond') }}</span></div>
          </el-col>
        </el-row>
      </div>

      <!-- 请求参数 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Upload /><</el-icon> {{ $t('operlog.operParam') }}</div>
        <div class="code-body">
          <div class="code-wrap">
            <div class="code-action">
              <el-button size="small" :icon="CopyDocument" @click="copyText(form.operParam)">{{ $t('common.copy') }}</el-button>
            </div>
            <pre class="code-pre">{{ formatJson(form.operParam) }}</pre>
          </div>
        </div>
      </div>

      <!-- 返回参数 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Download /><</el-icon> {{ $t('operlog.returnParam') }}</div>
        <div class="code-body">
          <div class="code-wrap">
            <div class="code-action">
              <el-button size="small" :icon="CopyDocument" @click="copyText(form.jsonResult)">{{ $t('common.copy') }}</el-button>
            </div>
            <pre class="code-pre">{{ formatJson(form.jsonResult) }}</pre>
          </div>
        </div>
      </div>

      <!-- 异常信息 -->
      <div class="detail-card" v-if="form.status !== 0">
        <div class="detail-card-title error-title"><el-icon><Warning /><</el-icon> {{ $t('common.exceptionInfo') }}</div>
        <div class="error-body">
          <div class="error-msg">{{ form.errorMsg }}</div>
        </div>
      </div>

    </div>
  </el-dialog>
</template>

<script setup lang="ts">
const { proxy } = getCurrentInstance()
import type { SysOperLog } from '@/types/api/monitor/operlog'

const props = defineProps<{
  visible: boolean
  row: SysOperLog
}>()

const emit = defineEmits<{(e: 'update:visible', val: boolean): void}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
})

const { sys_oper_type } = useDict('sys_oper_type')

const form = computed<SysOperLog>(() => props.row || {})
const typeLabel = computed<string>(() => selectDictLabel(sys_oper_type.value, form.value.businessType) || '-')

function formatJson(str?: string): string {
  if (!str) return proxy.$t('common.noDataAvailable')
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

function copyText(str?: string): void {
  const text = formatJson(str)
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => proxy.$modal.msgSuccess({ message: proxy.$t('common.copied'), type: 'success', duration: 1500 }))
  } else {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    proxy.$modal.msgSuccess({ message: proxy.$t('common.copied'), type: 'success', duration: 1500 })
  }
}
</script>
