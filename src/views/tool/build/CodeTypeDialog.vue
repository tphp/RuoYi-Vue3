<template>
  <el-dialog v-model="open" width="500px" :title="$t('build.selectGenType')" @open="onOpen" @close="onClose">
    <el-form ref="codeTypeForm" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="$t('build.genType')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button v-for="(item, index) in typeOptions" :key="index" :label="item.value">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="showFileName" :label="$t('build.fileName')" prop="fileName">
        <el-input v-model="formData.fileName" :placeholder="$t('build.fileNamePlaceholder')" clearable />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handelConfirm">{{ $t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { translate } from '@/locales'

const open = defineModel()
const props = defineProps({
  showFileName: Boolean
})
const emit = defineEmits(['confirm'])
const formData = ref({
  fileName: undefined,
  type: 'file'
})
const codeTypeForm = ref()
const rules = {
  fileName: [{
    required: true,
    message: translate('build.fileNameRequired'),
    trigger: 'blur'
  }],
  type: [{
    required: true,
    message: translate('build.genTypeRequired'),
    trigger: 'change'
  }]
}
const typeOptions = ref([
  {
    label: translate('build.typePage'),
    value: 'file'
  },
  {
    label: translate('build.typeDialog'),
    value: 'dialog'
  }
])
function onOpen(): void {
  if (props.showFileName) {
    formData.value.fileName = `${+new Date()}.vue`
  }
}
function onClose(): void {
  open.value = false
}
function handelConfirm(): void {
  codeTypeForm.value?.validate((valid: boolean) => {
    if (!valid) return
    emit('confirm', { ...formData.value })
    onClose()
  })
}
</script>