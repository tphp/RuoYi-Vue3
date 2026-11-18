<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('gen.basicInfo')" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane :label="$t('gen.columnInfo')" name="columnInfo">
        <el-table ref="dragTable" :data="columns" row-key="columnId" :max-height="tableHeight">
          <el-table-column :label="$t('common.index')" type="index" min-width="5%" class-name="allowDrag"/>
          <el-table-column :label="$t('gen.columnName')" prop="columnName" min-width="10%" :show-overflow-tooltip="true" class-name="allowDrag"/>
          <el-table-column :label="$t('gen.columnComment')" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('gen.physicalType')"
            prop="columnType"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column :label="$t('gen.javaType')" min-width="11%">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.javaProperty')" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>

          <el-table-column :label="$t('gen.isInsert')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.isEdit')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isEdit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.isList')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isList"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.isQuery')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isQuery"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.queryType')" min-width="10%">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.isRequired')" min-width="5%">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isRequired"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gen.htmlType')" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option :label="$t('gen.htmlTypeInput')" value="input" />
                <el-option :label="$t('gen.htmlTypeTextarea')" value="textarea" />
                <el-option :label="$t('gen.htmlTypeSelect')" value="select" />
                <el-option :label="$t('gen.htmlTypeRadio')" value="radio" />
                <el-option :label="$t('gen.htmlTypeCheckbox')" value="checkbox" />
                <el-option :label="$t('gen.htmlTypeDatetime')" value="datetime" />
                <el-option :label="$t('gen.htmlTypeImageUpload')" value="imageUpload" />
                <el-option :label="$t('gen.htmlTypeFileUpload')" value="fileUpload" />
                <el-option :label="$t('gen.htmlTypeEditor')" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('dict.dictType')" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable :placeholder="$t('common.select')">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType">
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
              </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('gen.genInfo')" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <div style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="submitForm()">{{ $t('common.submit') }}</el-button>
        <el-button @click="close()">{{ $t('common.back') }}</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts" name="GenEdit">
import { getGenTable, updateGenTable } from "@/api/tool/gen"
import { optionselect as getDictOptionselect } from "@/api/system/dict/type"
import type { GenTableInfoResult } from '@/types/api/tool/gen'
import BasicInfoForm from "./basicInfoForm.vue"
import GenInfoForm from "./genInfoForm.vue"
import Sortable from 'sortablejs'

const route = useRoute()
const { proxy } = getCurrentInstance()

const activeName = ref<string>("columnInfo")
const tableHeight = ref<string>(document.documentElement.scrollHeight - 245 + "px")
const tables = ref<any[]>([])
const columns = ref<any[]>([])
const dictOptions = ref<any[]>([])
const info = ref<Record<string, any>>({})

/** 提交按钮 */
function submitForm(): void {
  const basicForm = proxy.$refs.basicInfo.$refs.basicInfoForm
  const genForm = proxy.$refs.genInfo.$refs.genInfoForm
  Promise.all([basicForm, genForm].map(getFormPromise)).then(res => {
    const validateResult = res.every(item => !!item)
    if (validateResult) {
      const genTable = Object.assign({}, info.value)
      genTable.columns = columns.value
      genTable.params = {
        genView: info.value.view ? '1' : '0',
        treeCode: info.value.treeCode,
        treeName: info.value.treeName,
        treeParentCode: info.value.treeParentCode,
        parentMenuId: info.value.parentMenuId
      }
      updateGenTable(genTable).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        if (res.code === 200) {
          close()
        }
      })
    } else {
      proxy.$modal.msgError(proxy.$t('gen.formValidateFailed'))
    }
  })
}

function getFormPromise(form: any): Promise<boolean> {
  return new Promise(resolve => {
    form.validate((res: boolean) => {
      resolve(res)
    })
  })
}

function close(): void {
  const obj = { path: "/tool/gen", query: { t: Date.now(), pageNum: route.query.pageNum } }
  proxy.$tab.closeOpenPage(obj)
}

(() => {
  const tableId = route.params && route.params.tableId
  if (tableId) {
    // 获取表详细信息
    getGenTable(Number(tableId)).then(res => {
      const data = res.data as GenTableInfoResult
      columns.value = data.rows
      info.value = data.info
      tables.value = data.tables
    })
    /** 查询字典下拉列表 */
    getDictOptionselect().then(response => {
      dictOptions.value = response.data
    })
  }
})()

// 拖动排序
onMounted(() => {
  const element = document.querySelector('.el-table__body > tbody')
  if (element) {
    Sortable.create(element as HTMLElement, {
      //@ts-ignore
      handle: ".allowDrag",
      onEnd: (evt) => {
        const targetRow = columns.value.splice(evt.oldIndex!, 1)[0]
        columns.value.splice(evt.newIndex!, 0, targetRow)
        for (const index in columns.value) {
          columns.value[index].sort = parseInt(index) + 1
        }
      }
    })
  }
})
</script>
