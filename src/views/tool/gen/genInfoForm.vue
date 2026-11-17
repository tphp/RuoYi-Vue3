<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>{{ $t('gen.tplCategory') }}</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option :label="$t('gen.tplCrud')" value="crud" />
            <el-option :label="$t('gen.tplTree')" value="tree" />
            <el-option :label="$t('gen.tplSub')" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="tplWebType">
          <template #label>{{ $t('gen.frontType') }}</template>
          <el-select v-model="info.tplWebType">
            <el-option :label="$t('gen.tplElementUi')" value="element-ui" />
            <el-option :label="$t('gen.tplElementPlus')" value="element-plus" />
            <el-option :label="$t('gen.tplElementPlusTs')" value="element-plus-typescript" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            {{ $t('gen.packageName') }}
            <el-tooltip :content="$t('gen.packageNameTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            {{ $t('gen.moduleName') }}
            <el-tooltip :content="$t('gen.moduleNameTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            {{ $t('gen.businessName') }}
            <el-tooltip :content="$t('gen.businessNameTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            {{ $t('gen.functionName') }}
            <el-tooltip :content="$t('gen.functionNameTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="formColNum">
          <template #label>
            {{ $t('gen.formLayout') }}
            <el-tooltip :content="$t('gen.formLayoutTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.formColNum">
            <el-option :label="$t('gen.layoutOneCol')" :value="1" />
            <el-option :label="$t('gen.layoutTwoCol')" :value="2" />
            <el-option :label="$t('gen.layoutThreeCol')" :value="3" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genView">
          <template #label>{{ $t('gen.extendFeature') }}</template>
          <el-checkbox v-model="info.view">{{ $t('gen.genDetailPage') }}</el-checkbox>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            {{ $t('gen.genType') }}
            <el-tooltip :content="$t('gen.genTypeTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="info.genType" value="0">{{ $t('gen.genTypeZip') }}</el-radio>
          <el-radio v-model="info.genType" value="1">{{ $t('gen.genTypeCustomPath') }}</el-radio>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <template #label>
            {{ $t('gen.parentMenu') }}
            <el-tooltip :content="$t('gen.parentMenuTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-tree-select
            v-model="info.parentMenuId"
            :data="menuOptions"
            :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
            :placeholder="$t('gen.selectSystemMenu')"
            check-strictly
          />
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            {{ $t('gen.customPath') }}
            <el-tooltip :content="$t('gen.customPathTip')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  {{ $t('gen.recentPath') }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="info.genPath = '/'">{{ $t('gen.restoreDefaultPath') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
    
    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">{{ $t('gen.otherInfo') }}</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('gen.treeCodeField') }}
              <el-tooltip :content="$t('gen.treeCodeFieldTip')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" :placeholder="$t('common.select')">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('gen.treeParentField') }}
              <el-tooltip :content="$t('gen.treeParentFieldTip')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" :placeholder="$t('common.select')">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('gen.treeNameField') }}
              <el-tooltip :content="$t('gen.treeNameFieldTip')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" :placeholder="$t('common.select')">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">{{ $t('gen.relationInfo') }}</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('gen.subTableName') }}
              <el-tooltip :content="$t('gen.subTableNameTip')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" :placeholder="$t('common.select')" @change="subSelectChange">
              <el-option
                v-for="(table, index) in tables"
                :key="index"
                :label="table.tableName + '：' + table.tableComment"
                :value="table.tableName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('gen.subTableFkName') }}
              <el-tooltip :content="$t('gen.subTableFkNameTip')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" :placeholder="$t('common.select')">
              <el-option
                v-for="(column, index) in subColumns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

  </el-form>
</template>

<script setup lang="ts">
import { listMenu } from "@/api/system/menu"
import { translate } from '@/locales'

const subColumns = ref([])
const menuOptions = ref([])
const { proxy } = getCurrentInstance()

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  tables: {
    type: Array,
    default: null
  }
})

// 表单校验
const rules = ref({
  tplCategory: [{ required: true, message: translate('gen.tplCategoryRequired'), trigger: "blur" }],
  packageName: [{ required: true, message: translate('gen.packageNameRequired'), trigger: "blur" }],
  moduleName: [{ required: true, message: translate('gen.moduleNameRequired'), trigger: "blur" }],
  businessName: [{ required: true, message: translate('gen.businessNameRequired'), trigger: "blur" }],
  functionName: [{ required: true, message: translate('gen.functionNameRequired'), trigger: "blur" }]
})

function subSelectChange(value: string): void {
  if (props.info) {
    props.info.subTableFkName = ""
  }
}

function tplSelectChange(value: string): void {
  if (value !== "sub" && props.info) {
    props.info.subTableName = ""
    props.info.subTableFkName = ""
  }
}

function setSubTableColumns(value: string): void {
  for (const item of props.tables || []) {
    const name = item.tableName
    if (value === name) {
      subColumns.value = item.columns || []
      break
    }
  }
}

/** 查询菜单下拉树结构 */
function getMenuTreeselect(): void {
  listMenu().then(response => {
    menuOptions.value = proxy.handleTree(response.data, "menuId")
  })
}

onMounted(() => {
  getMenuTreeselect()
})

watch(() => props.info?.subTableName, (val: string) => {
  if (val) {
    setSubTableColumns(val)
  }
})

watch(() => props.info?.tplWebType, (val: string) => {
  if (val === '' && props.info) {
    props.info.tplWebType = "element-plus-typescript"
  }
})
</script>
