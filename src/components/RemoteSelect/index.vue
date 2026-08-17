<template>
  <div class="remote-select">
    <!-- 文本框：输入时模糊加载匹配数据，出现唯一数据自动匹配 -->
    <el-autocomplete
      v-model="inputValue"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="false"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      style="width: 100%"
      @select="handleSelect"
      @input="handleInput"
    >
      <template #default="{ item }">
        <div class="remote-select__option">
          <span>{{ item[suggestFields[0]] }}</span>
          <span v-if="suggestFields[1]" class="remote-select__code">{{ item[suggestFields[1]] }}</span>
        </div>
      </template>
      <!-- 点击后缀图标弹出选择框加载数据 -->
      <template #suffix>
        <el-icon v-if="!disabled" class="remote-select__icon" @click.stop="openDialog">
          <Search />
        </el-icon>
      </template>
    </el-autocomplete>

    <!-- 弹窗选择框：加载数据并按条件筛选 -->
    <el-dialog v-model="dialogVisible" :title="title" width="720px" append-to-body>
      <el-form :inline="true" :model="filterForm" @submit.prevent>
        <el-form-item v-for="filter in filters" :key="filter.field" :label="filter.label">
          <el-input
            v-model="filterForm[filter.field]"
            :placeholder="filter.placeholder"
            clearable
            style="width: 180px"
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleFilter">搜索</el-button>
          <el-button icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="loading"
        :data="dialogList"
        height="400"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
          :min-width="col.minWidth"
          :show-overflow-tooltip="true"
        />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="RemoteSelect">
import { Search } from '@element-plus/icons-vue'

/** 弹窗表格列配置 */
interface ColumnConfig {
  /** 字段名 */
  prop: string
  /** 列标题 */
  label: string
  /** 固定宽度 */
  width?: number
  /** 最小宽度 */
  minWidth?: number
}

/** 弹窗筛选条件配置 */
interface FilterConfig {
  /** 输入框绑定的字段名（用于 filterForm 的 key） */
  field: string
  /** 标签文本 */
  label: string
  /** 占位提示 */
  placeholder?: string
  /** 参与匹配的字段（不传则使用 field） */
  fields?: string[]
}

const props = defineProps({
  /** 选中的值（v-model），默认为 valueField 对应字段的文本 */
  modelValue: {
    type: String,
    default: ''
  },
  /** 输入框占位提示 */
  placeholder: {
    type: String,
    default: '请输入'
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 弹窗标题 */
  title: {
    type: String,
    default: '请选择'
  },
  /** 数据请求函数，返回列表（数组或 {data:[...]}/{rows:[...]}），必填 */
  request: {
    type: Function,
    default: null
  },
  /** 选中后回填到 modelValue 的字段名 */
  valueField: {
    type: String,
    default: 'name'
  },
  /** 输入模糊搜索时参与匹配的字段 */
  searchFields: {
    type: Array as () => string[],
    default: () => []
  },
  /** 下拉建议显示字段 [主字段, 副字段(可选)] */
  suggestFields: {
    type: Array as () => string[],
    default: () => []
  },
  /** 弹窗表格列配置 */
  columns: {
    type: Array as () => ColumnConfig[],
    default: () => []
  },
  /** 弹窗筛选条件配置 */
  filters: {
    type: Array as () => FilterConfig[],
    default: () => []
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', value: any): void
}>()

/** 输入框文本，双向绑定到父组件 */
const inputValue = computed<string>({
  get: () => props.modelValue ?? '',
  set: (val: string) => emit('update:modelValue', val)
})

/** 数据加载状态 */
const loading = ref(false)
/** 弹窗显示状态 */
const dialogVisible = ref(false)
/** 弹窗筛选条件（动态生成） */
const filterForm = reactive<Record<string, string>>({})
/** 当前数据列表 */
const list = ref<any[]>([])
/** 弹窗展示的筛选后数据 */
const dialogList = ref<any[]>([])

/** 按请求函数缓存数据，同一页面多个实例复用，避免重复请求 */
const listCache = new WeakMap<Function, any[]>()
const pendingCache = new WeakMap<Function, Promise<any[]>>()

/**
 * 解析接口返回数据，兼容数组与 {data:[...]}/{rows:[...]} 结构
 * @param json 接口响应数据
 * @returns 数据列表
 */
function parseList(json: any): any[] {
  if (Array.isArray(json)) {
    return json
  }
  if (json && Array.isArray(json.data)) {
    return json.data
  }
  if (json && Array.isArray(json.rows)) {
    return json.rows
  }
  return []
}

/**
 * 加载数据（按请求函数缓存，避免重复请求）
 */
async function loadData() {
  const req = props.request
  if (!req) {
    list.value = []
    dialogList.value = []
    return
  }
  const cached = listCache.get(req)
  if (cached) {
    list.value = cached
    applyFilter()
    return
  }
  const pending = pendingCache.get(req)
  if (pending) {
    list.value = await pending
    applyFilter()
    return
  }
  loading.value = true
  const p = Promise.resolve()
    .then(() => req())
    .then(rows => {
      list.value = parseList(rows)
      listCache.set(req, list.value)
      return list.value
    })
    .catch(e => {
      console.error('加载数据失败：', e)
      list.value = []
      throw e
    })
    .finally(() => {
      pendingCache.delete(req)
      loading.value = false
    })
  pendingCache.set(req, p)
  try {
    await p
    applyFilter()
  } catch (e) {
    dialogList.value = []
  }
}

/**
 * 按关键字模糊过滤数据
 * @param keyword 关键字
 * @returns 匹配的数据列表
 */
function filterByKeyword(keyword: string): any[] {
  const kw = (keyword || '').trim().toLowerCase()
  if (!kw) {
    return []
  }
  return list.value.filter(item =>
    props.searchFields.some(field => {
      const v = item[field]
      return v != null && String(v).toLowerCase().includes(kw)
    })
  )
}

/**
 * el-autocomplete 模糊查询回调
 * @param queryString 输入的关键字
 * @param cb 回调函数，用于返回匹配建议列表
 */
function querySearch(queryString: string, cb: (results: any[]) => void) {
  const results = filterByKeyword(queryString)
  cb(results.map(item => ({ value: item[props.valueField], ...item })))
}

/**
 * 选中某项数据，回填文本框并抛出完整行数据
 * @param item 选中的数据
 */
function handleSelect(item: any) {
  inputValue.value = item[props.valueField]
  emit('select', item)
}

/**
 * 输入文本变化处理，出现唯一数据时自动匹配
 * @param value 当前输入文本
 */
function handleInput(value: string) {
  const matches = filterByKeyword(value)
  // 出现唯一数据自动匹配
  if (matches.length === 1 && matches[0][props.valueField] !== value) {
    handleSelect(matches[0])
  }
}

/**
 * 打开选择弹窗
 */
function openDialog() {
  resetFilter()
  dialogVisible.value = true
  loadData()
}

/**
 * 单个筛选条件是否匹配
 * @param item 数据行
 * @param filter 筛选条件配置
 * @param keyword 关键字
 * @returns 是否匹配
 */
function matchFilter(item: any, filter: FilterConfig, keyword: string): boolean {
  if (!keyword) {
    return true
  }
  const fields = filter.fields || [filter.field]
  return fields.some(field => {
    const v = item[field]
    return v != null && String(v).toLowerCase().includes(keyword)
  })
}

/**
 * 按弹窗筛选条件过滤数据
 */
function applyFilter() {
  dialogList.value = list.value.filter(item =>
    props.filters.every(filter => matchFilter(item, filter, (filterForm[filter.field] || '').trim().toLowerCase()))
  )
}

/**
 * 弹窗内按条件筛选数据
 */
function handleFilter() {
  applyFilter()
}

/**
 * 重置弹窗筛选条件
 */
function resetFilter() {
  props.filters.forEach(filter => {
    filterForm[filter.field] = ''
  })
  applyFilter()
}

/**
 * 点击弹窗表格行进行选择
 * @param row 选中的行数据
 */
function handleRowClick(row: any) {
  handleSelect(row)
  dialogVisible.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.remote-select {
  width: 100%;
}
.remote-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.remote-select__code {
  color: #999;
  font-size: 12px;
}
.remote-select__icon {
  cursor: pointer;
  color: #909399;
}
.remote-select__icon:hover {
  color: #409eff;
}
</style>
