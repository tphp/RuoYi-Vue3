<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item :label="$t('gen.tableName')" prop="tableName">
          <el-input :placeholder="$t('gen.tableNamePlaceholder')" v-model="info.tableName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('gen.tableComment')" prop="tableComment">
          <el-input :placeholder="$t('gen.tableCommentPlaceholder')" v-model="info.tableComment" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('gen.className')" prop="className">
          <el-input :placeholder="$t('gen.classNamePlaceholder')" v-model="info.className" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('gen.author')" prop="functionAuthor">
          <el-input :placeholder="$t('gen.authorPlaceholder')" v-model="info.functionAuthor" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('common.remark')" prop="remark">
          <el-input type="textarea" :rows="3" v-model="info.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { translate } from '@/locales'

defineProps({
  info: {
    type: Object,
    default: null
  }
})

// 表单校验
const rules = ref({
  tableName: [{ required: true, message: () => translate('gen.tableNamePlaceholder'), trigger: "blur" }],
  tableComment: [{ required: true, message: () => translate('gen.tableCommentPlaceholder'), trigger: "blur" }],
  className: [{ required: true, message: () => translate('gen.classNamePlaceholder'), trigger: "blur" }],
  functionAuthor: [{ required: true, message: () => translate('gen.authorPlaceholder'), trigger: "blur" }]
})
</script>
