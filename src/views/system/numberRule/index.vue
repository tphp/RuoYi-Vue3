<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item :label="$t('numberRule.ruleName')" prop="ruleName">
        <el-input
          v-model="queryParams.ruleName"
          :placeholder="$t('numberRule.ruleNamePlaceholder')"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('numberRule.ruleCode')" prop="ruleCode">
        <el-input
          v-model="queryParams.ruleCode"
          :placeholder="$t('numberRule.ruleCodePlaceholder')"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('numberRule.statusPlaceholder')" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('common.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('common.reset') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:numberRule:add']"
        >{{ $t('common.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:numberRule:edit']"
        >{{ $t('common.edit') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:numberRule:remove']"
        >{{ $t('common.delete') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="ruleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('numberRule.ruleId')" align="center" prop="ruleId" width="80" />
      <el-table-column :label="$t('numberRule.ruleName')" align="center" prop="ruleName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('numberRule.ruleCode')" align="center" prop="ruleCode" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('numberRule.description')" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('common.status')" align="center" prop="status" width="80">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.createTime')" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.action')" align="center" width="240">
        <template #default="scope">
          <el-button
            type="primary"
            link
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:numberRule:edit']"
          >{{ $t('common.edit') }}</el-button>
          <el-button
            type="primary"
            link
            icon="MagicStick"
            @click="handleGenerate(scope.row)"
            v-hasPermi="['system:numberRule:edit']"
          >{{ $t('numberRule.testGenerate') }}</el-button>
          <el-button
            v-if="scope.row.status === '0'"
            type="danger"
            link
            icon="Close"
            @click="handleStatusChange(scope.row, '1')"
            v-hasPermi="['system:numberRule:edit']"
          >{{ $t('common.disable') }}</el-button>
          <el-button
            v-if="scope.row.status !== '0'"
            type="success"
            link
            icon="Open"
            @click="handleStatusChange(scope.row, '0')"
            v-hasPermi="['system:numberRule:edit']"
          >{{ $t('common.enable') }}</el-button>
          <el-button
            type="danger"
            link
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:numberRule:remove']"
          >{{ $t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="720px" append-to-body>
      <el-form ref="ruleRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('numberRule.ruleName')" prop="ruleName">
              <el-input v-model="form.ruleName" :placeholder="$t('numberRule.ruleNamePlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('numberRule.ruleCode')" prop="ruleCode">
              <el-input v-model="form.ruleCode" :placeholder="$t('numberRule.ruleCodePlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('numberRule.description')" prop="description">
              <el-input v-model="form.description" :placeholder="$t('numberRule.descriptionPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('common.status')" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="0">{{ $t('common.enable') }}</el-radio>
                <el-radio value="1">{{ $t('common.disable') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">{{ $t('numberRule.elementConfig') }}</el-divider>
        
        <!-- 元素添加按钮组 -->
        <div class="element-buttons">
          <el-button type="primary" plain icon="Edit" @click="addItem('1')">
            {{ $t('numberRule.addConstant') }}
          </el-button>
          <el-button type="success" plain icon="Calendar" @click="addItem('2')">
            {{ $t('numberRule.addDate') }}
          </el-button>
          <el-button type="warning" plain icon="Number" @click="addItem('3')">
            {{ $t('numberRule.addSerial') }}
          </el-button>
        </div>

        <!-- 元素队列 -->
        <div v-if="form.items && form.items.length > 0" class="element-queue">
          <div
            v-for="(item, index) in form.items"
            :key="index"
            class="element-item"
            :class="{ active: activeItemIndex === index }"
            @click="selectItem(index)"
          >
            <span class="element-sort">{{ index + 1 }}</span>
            <span class="element-type">
              <el-tag v-if="item.itemType === '1'" type="primary">{{ $t('numberRule.typeConstant') }}</el-tag>
              <el-tag v-else-if="item.itemType === '2'" type="success">{{ $t('numberRule.typeDate') }}</el-tag>
              <el-tag v-else-if="item.itemType === '3'" type="warning">{{ $t('numberRule.typeSerial') }}</el-tag>
            </span>
            <span class="element-desc">
              {{ getItemDesc(item) }}
            </span>
            <div class="element-actions">
              <el-button
                type="primary"
                link
                icon="Top"
                :disabled="index === 0"
                @click.stop="moveUp(index)"
              >{{ $t('numberRule.moveUp') }}</el-button>
              <el-button
                type="primary"
                link
                icon="Bottom"
                :disabled="index === form.items.length - 1"
                @click.stop="moveDown(index)"
              >{{ $t('numberRule.moveDown') }}</el-button>
              <el-button
                type="danger"
                link
                icon="Delete"
                @click.stop="removeItem(index)"
              >{{ $t('common.delete') }}</el-button>
            </div>
          </div>
        </div>
        <el-empty v-else :description="$t('numberRule.noElements')" :image-size="80" />

        <!-- 选中元素的配置表单 -->
        <div v-if="activeItemIndex >= 0 && form.items && form.items[activeItemIndex]" class="item-config">
          <el-divider content-position="left">{{ $t('numberRule.elementConfig') }}</el-divider>
          
          <!-- 常量配置 -->
          <div v-if="form.items[activeItemIndex].itemType === '1'">
            <el-form-item :label="$t('numberRule.constantValue')" label-width="100px">
              <el-input
                v-model="form.items[activeItemIndex].itemValue"
                :placeholder="$t('numberRule.constantValuePlaceholder')"
              />
            </el-form-item>
          </div>
          
          <!-- 日期配置 -->
          <div v-else-if="form.items[activeItemIndex].itemType === '2'">
            <el-form-item :label="$t('numberRule.dateFormat')" label-width="100px">
              <el-select v-model="form.items[activeItemIndex].dateFormat" :placeholder="$t('numberRule.dateFormatPlaceholder')">
                <el-option label="yyyyMMdd (20260626)" value="yyyyMMdd" />
                <el-option label="yyyy-MM-dd (2026-06-26)" value="yyyy-MM-dd" />
                <el-option label="yyyyMM (202606)" value="yyyyMM" />
                <el-option label="yyyy (2026)" value="yyyy" />
                <el-option label="MMdd (0626)" value="MMdd" />
                <el-option label="yyMMdd (260626)" value="yyMMdd" />
                <el-option label="HHmmss (143000)" value="HHmmss" />
                <el-option label="yyyyMMddHHmmss (20260626143000)" value="yyyyMMddHHmmss" />
              </el-select>
            </el-form-item>
          </div>
          
          <!-- 流水号配置 -->
          <div v-else-if="form.items[activeItemIndex].itemType === '3'">
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('numberRule.cycleType')" label-width="100px">
                  <el-select v-model="form.items[activeItemIndex].cycleType" :placeholder="$t('numberRule.cycleTypePlaceholder')">
                    <el-option :label="$t('numberRule.cycleNever')" value="1" />
                    <el-option :label="$t('numberRule.cycleByDay')" value="2" />
                    <el-option :label="$t('numberRule.cycleByMonth')" value="3" />
                    <el-option :label="$t('numberRule.cycleByYear')" value="4" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('numberRule.serialLength')" label-width="100px">
                  <el-input-number
                    v-model="form.items[activeItemIndex].serialLength"
                    :min="1"
                    :max="20"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('numberRule.isPadZero')" label-width="100px">
                  <el-radio-group v-model="form.items[activeItemIndex].isPadZero">
                    <el-radio value="1">{{ $t('common.yes') }}</el-radio>
                    <el-radio value="0">{{ $t('common.no') }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('numberRule.startSerial')" label-width="100px">
                  <el-input-number
                    v-model="form.items[activeItemIndex].startNumber"
                    :min="1"
                    :max="999999999"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 预览区 -->
        <el-divider content-position="left">{{ $t('numberRule.preview') }}</el-divider>
        <div class="preview-box">
          <span class="preview-label">{{ $t('numberRule.previewEffect') }}</span>
          <span class="preview-value">{{ previewNumber }}</span>
        </div>

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

<script setup lang="ts">
import {
  listNumberRule,
  getNumberRule,
  addNumberRule,
  updateNumberRule,
  delNumberRule,
  changeNumberRuleStatus,
  generateNumber
} from '@/api/system/numberRule'
import type { SysNumberRule, NumberRuleQueryParams, NumberRuleItem, ItemType } from '@/types'
import { translate } from '@/locales'

const { proxy } = getCurrentInstance()!
const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'))

const ruleList = ref<SysNumberRule[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const activeItemIndex = ref(-1)
const previewNumber = ref('')

const queryParams = reactive<NumberRuleQueryParams>({
  pageNum: 1,
  pageSize: 10,
  ruleName: undefined,
  ruleCode: undefined,
  status: undefined
})

const form = reactive<SysNumberRule>({
  ruleId: undefined,
  ruleName: undefined,
  ruleCode: undefined,
  description: undefined,
  status: '0',
  remark: undefined,
  items: []
})

const rules = {
  ruleName: [{ required: true, message: translate('numberRule.nameRequired'), trigger: 'blur' }],
  ruleCode: [{ required: true, message: translate('numberRule.codeRequired'), trigger: 'blur' }]
}

/** 查询规则列表 */
const getList = async () => {
  loading.value = true
  const res = await listNumberRule(queryParams)
  ruleList.value = res.rows
  total.value = res.total
  loading.value = false
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  proxy!.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: SysNumberRule[]) => {
  ids.value = selection.map(item => item.ruleId!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = proxy.$t('numberRule.addTitle')
}

/** 修改按钮操作 */
const handleUpdate = async (row?: SysNumberRule) => {
  reset()
  const ruleId = row?.ruleId || ids.value[0]
  const res = await getNumberRule(ruleId)
  Object.assign(form, res.data)
  if (!form.items) {
    form.items = []
  }
  activeItemIndex.value = -1
  updatePreview()
  open.value = true
  title.value = proxy.$t('numberRule.editTitle')
}

/** 提交按钮 */
const submitForm = async () => {
  await proxy!.$refs.ruleRef.validate()
  if (!form.items || form.items.length === 0) {
    proxy!.$modal.msgError(proxy!.$t('numberRule.needOneElement'))
    return
  }
  if (form.ruleId) {
    await updateNumberRule(form)
    proxy!.$modal.msgSuccess(proxy!.$t('common.editSuccess'))
  } else {
    await addNumberRule(form)
    proxy!.$modal.msgSuccess(proxy!.$t('common.addSuccess'))
  }
  open.value = false
  getList()
}

/** 删除按钮操作 */
const handleDelete = async (row?: SysNumberRule) => {
  const ruleIds = row?.ruleId || ids.value
  await proxy!.$modal.confirm(proxy!.$t('numberRule.deleteConfirm', { ids: ruleIds }))
  await delNumberRule(ruleIds)
  getList()
  proxy!.$modal.msgSuccess(proxy!.$t('common.deleteSuccess'))
}

/** 状态修改 */
const handleStatusChange = async (row: SysNumberRule, status: string) => {
  const text = status === '0' ? proxy!.$t('common.enable') : proxy!.$t('common.disable')
  await proxy!.$modal.confirm(proxy!.$t('numberRule.confirmChangeStatus', { status: text, name: row.ruleName }))
  await changeNumberRuleStatus({ ruleId: row.ruleId!, status })
  getList()
  proxy!.$modal.msgSuccess(proxy!.$t('numberRule.statusChangeSuccess', { status: text }))
}

/** 测试生成编号 */
const handleGenerate = async (row: SysNumberRule) => {
  const res = await generateNumber(row.ruleCode!)
  proxy!.$modal.msgSuccess(proxy!.$t('numberRule.generatedNo', { no: res.data }))
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  reset()
}

/** 表单重置 */
const reset = () => {
  form.ruleId = undefined
  form.ruleName = undefined
  form.ruleCode = undefined
  form.description = undefined
  form.status = '0'
  form.remark = undefined
  form.items = []
  activeItemIndex.value = -1
  previewNumber.value = ''
  proxy!.resetForm('ruleRef')
}

/** 添加元素 */
const addItem = (type: ItemType) => {
  if (!form.items) {
    form.items = []
  }
  
  const item: NumberRuleItem = {
    itemType: type,
    sortOrder: form.items.length
  }
  
  if (type === '1') {
    item.itemValue = ''
  } else if (type === '2') {
    item.dateFormat = 'yyyyMMdd'
  } else if (type === '3') {
    item.cycleType = '2'
    item.serialLength = 4
    item.isPadZero = '1'
    item.startNumber = 1
  }
  
  form.items.push(item)
  activeItemIndex.value = form.items.length - 1
  updatePreview()
}

/** 选中元素 */
const selectItem = (index: number) => {
  activeItemIndex.value = index
}

/** 上移元素 */
const moveUp = (index: number) => {
  if (!form.items || index <= 0) return
  const temp = form.items[index]
  form.items[index] = form.items[index - 1]
  form.items[index - 1] = temp
  form.items.forEach((item: NumberRuleItem, i: number) => {
    item.sortOrder = i
  })
  activeItemIndex.value = index - 1
  updatePreview()
}

/** 下移元素 */
const moveDown = (index: number) => {
  if (!form.items || index >= form.items.length - 1) return
  const temp = form.items[index]
  form.items[index] = form.items[index + 1]
  form.items[index + 1] = temp
  form.items.forEach((item: NumberRuleItem, i: number) => {
    item.sortOrder = i
  })
  activeItemIndex.value = index + 1
  updatePreview()
}

/** 删除元素 */
const removeItem = (index: number) => {
  if (!form.items) return
  form.items.splice(index, 1)
  form.items.forEach((item: NumberRuleItem, i: number) => {
    item.sortOrder = i
  })
  if (activeItemIndex.value >= form.items.length) {
    activeItemIndex.value = form.items.length - 1
  }
  updatePreview()
}

/** 获取元素描述 */
const getItemDesc = (item: NumberRuleItem): string => {
  if (item.itemType === '1') {
    return item.itemValue || proxy!.$t('numberRule.notSet')
  } else if (item.itemType === '2') {
    return item.dateFormat || 'yyyyMMdd'
  } else if (item.itemType === '3') {
    const cycleMap: Record<string, string> = {
      '1': proxy!.$t('numberRule.cycleNever'),
      '2': proxy!.$t('numberRule.cycleByDay'),
      '3': proxy!.$t('numberRule.cycleByMonth'),
      '4': proxy!.$t('numberRule.cycleByYear')
    }
    const cycle = cycleMap[item.cycleType || '1'] || proxy!.$t('numberRule.cycleNever')
    const padZero = item.isPadZero === '1' ? proxy!.$t('numberRule.padZero') : proxy!.$t('numberRule.notPadZero')
    return proxy!.$t('numberRule.summaryFormat', { n: item.serialLength || 4, cycle, padZero })
  }
  return ''
}

/** 更新预览（前端简单预览，主要用于配置过程中实时查看效果） */
const updatePreview = () => {
  if (!form.items || form.items.length === 0) {
    previewNumber.value = ''
    return
  }
  
  let result = ''
  const now = new Date()
  
  for (const item of form.items) {
    if (item.itemType === '1') {
      result += item.itemValue || ''
    } else if (item.itemType === '2') {
      result += formatDate(now, item.dateFormat || 'yyyyMMdd')
    } else if (item.itemType === '3') {
      const startNum = item.startNumber || 1
      const length = item.serialLength || 4
      const isPadZero = item.isPadZero === '1'
      let numStr = String(startNum)
      if (isPadZero && numStr.length < length) {
        numStr = numStr.padStart(length, '0')
      }
      result += numStr
    }
  }
  
  previewNumber.value = result
}

/** 格式化日期 */
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('yyyy', String(year))
    .replace('yy', String(year).slice(-2))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/** 监听表单变化更新预览 */
watch(
  () => form.items,
  () => {
    updatePreview()
  },
  { deep: true }
)

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.element-buttons {
  margin-bottom: 16px;
  
  :deep(.el-button) {
    margin-right: 12px;
  }
}

.element-queue {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #f5f7fa;
  margin-bottom: 16px;
}

.element-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }
  
  &.active {
    border-color: #409eff;
    background: #ecf5ff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.element-sort {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.element-type {
  margin-right: 12px;
  flex-shrink: 0;
}

.element-desc {
  flex: 1;
  color: #606266;
  font-size: 14px;
}

.element-actions {
  flex-shrink: 0;
}

.item-config {
  margin-top: 8px;
}

.preview-box {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.preview-label {
  color: #606266;
  margin-right: 12px;
}

.preview-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  font-family: 'Courier New', monospace;
}
</style>
