<template>
  <div>
    <el-dialog :title="$t('build.addOption')" v-model="open" width="800px" :close-on-click-modal="false" :modal-append-to-body="false"
      @open="onOpen" @close="onClose">
      <el-form ref="treeNodeForm" :model="formData" :rules="rules" label-width="100px">
        <el-col :span="24">
          <el-form-item :label="$t('build.optionLabel')" prop="label">
            <el-input v-model="formData.label" :placeholder="$t('build.optionLabelRequired')" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="$t('build.optionValue')" prop="value">
            <el-input v-model="formData.value" :placeholder="$t('build.optionValueRequired')" clearable>
              <template #append>
                <el-select v-model="dataType" :style="{ width: '100px' }">
                  <el-option v-for="(item, index) in dataTypeOptions" :key="index" :label="item.label" :value="item.value"
                    :disabled="item.disabled" />
                </el-select>
              </template>

            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handelConfirm">{{ $t('common.confirm') }}</el-button>
          <el-button @click="onClose">{{ $t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { translate } from '@/locales'

const open = defineModel()
const emit = defineEmits(['confirm'])
const formData = ref({
  label: undefined,
  value: undefined
})
const rules = {
  label: [
    {
      required: true,
      message: translate('build.optionLabelRequired'),
      trigger: 'blur'
    }
  ],
  value: [
    {
      required: true,
      message: translate('build.optionValueRequired'),
      trigger: 'blur'
    }
  ]
}
const dataType = ref<string>('string')
const dataTypeOptions = ref<any[]>([
  {
    label: translate('build.valueTypeString'),
    value: 'string'
  },
  {
    label: translate('build.valueTypeNumber'),
    value: 'number'
  }
])
const id = ref<number>(100)
const treeNodeForm = ref<any>()

function onOpen(): void {
  formData.value = {
    label: undefined,
    value: undefined
  }
}

function onClose(): void {
  if (open.value !== undefined) {
    open.value = false
  }
}

function handelConfirm(): void {
  treeNodeForm.value?.validate((valid: boolean) => {
    if (!valid) return
    if (dataType.value === 'number') {
      formData.value.value = parseFloat(String(formData.value.value))
    }
    formData.value.id = id.value++
    emit('commit', formData.value)
    onClose()
  })
}
</script>
