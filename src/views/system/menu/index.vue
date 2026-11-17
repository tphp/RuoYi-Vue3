<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="$t('menu.menuName')" prop="menuName">
            <el-input
               v-model="queryParams.menuName"
               :placeholder="$t('menu.menuNamePlaceholder')"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item :label="$t('common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="$t('menu.statusPlaceholder')" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
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
               v-hasPermi="['system:menu:add']"
            >{{ $t('common.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Check"
               @click="handleSaveSort"
               v-hasPermi="['system:menu:edit']"
            >{{ $t('common.saveSort') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button 
               type="info"
               plain
               icon="Sort"
               @click="toggleExpandAll"
            >{{ $t('common.expandAll') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table
         v-if="refreshTable"
         v-loading="loading"
         :data="menuList"
         row-key="menuId"
         :default-expand-all="isExpandAll"
         :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
         <el-table-column prop="menuName" :label="$t('menu.menuName')" :show-overflow-tooltip="true" width="220">
            <template #default="scope">
               <svg-icon :icon-class="scope.row.icon" />
               <span class="ml5">{{ scope.row.menuName }}</span>
            </template>
         </el-table-column>
         <el-table-column prop="menuName" :label="$t('menu.menuType')" :show-overflow-tooltip="true" width="100">
            <template #default="scope">
               <el-tag v-if="scope.row.menuType === 'M' && scope.row.isFrame === '0'" type="danger" size="small">{{ $t('menu.externalLink') }}</el-tag>
               <el-tag v-else-if="scope.row.menuType === 'M'" type="primary" size="small">{{ $t('menu.directory') }}</el-tag>
               <el-tag v-else-if="scope.row.menuType === 'C' && scope.row.isFrame === '0'" type="danger" size="small">{{ $t('menu.externalLink') }}</el-tag>
               <el-tag v-else-if="scope.row.menuType === 'C'" type="success" size="small">{{ $t('menu.menu') }}</el-tag>
               <el-tag v-else-if="scope.row.menuType === 'F'" type="warning" size="small">{{ $t('menu.button') }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column prop="orderNum" :label="$t('common.sort')" width="200">
            <template #default="scope">
               <el-input-number v-model="scope.row.orderNum" controls-position="right" :min="0" style="width: 88px" />
            </template>
         </el-table-column>
         <el-table-column prop="perms" :label="$t('menu.perms')" :show-overflow-tooltip="true" />
         <el-table-column prop="component" :label="$t('menu.component')" :show-overflow-tooltip="true" />
         <el-table-column prop="status" :label="$t('common.status')" width="80">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="$t('common.action')" align="center" width="210" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']">{{ $t('common.edit') }}</el-button>
               <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">{{ $t('common.add') }}</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']">{{ $t('common.delete') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <!-- 添加或修改菜单对话框 -->
      <el-dialog :title="title" v-model="open" width="680px" append-to-body>
         <el-form ref="menuRef" :model="form" :rules="rules" label-width="120px">
            <el-row>
               <el-col :span="24">
                  <el-form-item :label="$t('menu.parentName')">
                     <el-tree-select
                        v-model="form.parentId"
                        :data="menuOptions"
                        :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                        value-key="menuId"
                        :placeholder="$t('menu.parentMenuPlaceholder')"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="$t('menu.menuType')" prop="menuType">
                     <el-radio-group v-model="form.menuType">
                        <el-radio value="M">{{ $t('menu.directory') }}</el-radio>
                        <el-radio value="C">{{ $t('menu.menu') }}</el-radio>
                        <el-radio value="F">{{ $t('menu.button') }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item :label="$t('menu.icon')" prop="icon">
                     <el-popover
                        placement="bottom-start"
                        :width="540"
                        trigger="click"
                     >
                        <template #reference>
                           <el-input v-model="form.icon" :placeholder="$t('menu.iconPlaceholder')" @blur="showSelectIcon" readonly>
                              <template #prefix>
                                 <svg-icon
                                    v-if="form.icon"
                                    :icon-class="form.icon"
                                    class="el-input__icon"
                                    style="height: 32px;width: 16px;"
                                 />
                                 <el-icon v-else style="height: 32px;width: 16px;"><search /></el-icon>
                              </template>
                           </el-input>
                        </template>
                        <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon" />
                     </el-popover>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="$t('menu.orderNum')" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="$t('menu.menuName')" prop="menuName">
                     <el-input v-model="form.menuName" :placeholder="$t('menu.menuNamePlaceholder')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item prop="routeName">
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.routeNameTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.routeName') }}
                        </span>
                     </template>
                     <el-input v-model="form.routeName" :placeholder="$t('menu.routeNamePlaceholder')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.externalLinkTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>{{ $t('menu.isExternal') }}
                        </span>
                     </template>
                     <el-radio-group v-model="form.isFrame">
                        <el-radio value="0">{{ $t('common.yes') }}</el-radio>
                        <el-radio value="1">{{ $t('common.no') }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item prop="path">
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.pathTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.path') }}
                        </span>
                     </template>
                     <el-input v-model="form.path" :placeholder="$t('menu.pathPlaceholder')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item prop="component">
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.componentTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.component') }}
                        </span>
                     </template>
                     <el-input v-model="form.component" :placeholder="$t('menu.componentPlaceholder')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'M'">
                  <el-form-item>
                     <el-input v-model="form.perms" :placeholder="$t('menu.permsPlaceholder')" maxlength="100" />
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.permsTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.perms') }}
                        </span>
                     </template>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item>
                     <el-input v-model="form.query" :placeholder="$t('menu.queryPlaceholder')" maxlength="255" />
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.queryTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.query') }}
                        </span>
                     </template>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.cacheTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.isCache') }}
                        </span>
                     </template>
                     <el-radio-group v-model="form.isCache">
                        <el-radio value="0">{{ $t('menu.cache') }}</el-radio>
                        <el-radio value="1">{{ $t('menu.noCache') }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.hiddenTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.showStatus') }}
                        </span>
                     </template>
                     <el-radio-group v-model="form.visible">
                        <el-radio
                           v-for="dict in sys_show_hide"
                           :key="dict.value"
                           :value="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip :content="$t('menu.disabledTip')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           {{ $t('menu.menuStatus') }}
                        </span>
                     </template>
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_normal_disable"
                           :key="dict.value"
                           :value="dict.value"
                        >{{ dict.label }}</el-radio>
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
   </div>
</template>

<script setup lang="ts" name="Menu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu, updateMenuSort, } from "@/api/system/menu"
import SvgIcon from "@/components/SvgIcon/index.vue"
import IconSelect from "@/components/IconSelect/index.vue"
import type { SysMenu, MenuQueryParams } from '@/types/api/system/menu'

const { proxy } = getCurrentInstance()
const { sys_show_hide, sys_normal_disable } = useDict("sys_show_hide", "sys_normal_disable")

const menuList = ref<any[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const title = ref<string>("")
const menuOptions = ref<any[]>([])
const isExpandAll = ref<boolean>(false)
const refreshTable = ref<boolean>(true)
const iconSelectRef = ref<any | null>(null)
const originalOrders = ref<Record<number, number>>({})

const data = reactive({
  form: {} as SysMenu,
  queryParams: {
    menuName: undefined,
    visible: undefined
  } as MenuQueryParams,
  rules: {
    menuName: [{ required: true, message: () => proxy.$t('menu.nameRequired'), trigger: "blur" }],
    orderNum: [{ required: true, message: () => proxy.$t('menu.orderRequired'), trigger: "blur" }],
    path: [{ required: true, message: () => proxy.$t('menu.pathRequired'), trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询菜单列表 */
function getList() {
  loading.value = true
  listMenu(queryParams.value).then(response => {
    menuList.value = proxy.handleTree(response.data, "menuId")
    recordOriginalOrders(menuList.value)
    loading.value = false
  })
}

/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = []
  listMenu().then(response => {
    const menu = { menuId: 0, menuName: proxy.$t('menu.mainCategory'), children: [] }
    menu.children = proxy.handleTree(response.data, "menuId")
    menuOptions.value.push(menu)
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
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: undefined,
    isFrame: "1",
    isCache: "0",
    visible: "0",
    status: "0"
  }
  proxy.resetForm("menuRef")
}

/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value?.reset()
}

/** 选择图标 */
function selected(name: string) {
  form.value.icon = name
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd(row?: SysMenu) {
  reset()
  getTreeselect()
  if (row != null && row.menuId) {
    form.value.parentId = row.menuId
  } else {
    form.value.parentId = 0
  }
  open.value = true
  title.value = proxy.$t('menu.addTitle')
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 修改按钮操作 */
async function handleUpdate(row: SysMenu) {
  reset()
  await getTreeselect()
  getMenu(row.menuId!).then(response => {
    form.value = response.data!
    open.value = true
    title.value = proxy.$t('menu.editTitle')
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["menuRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.menuId != undefined) {
        updateMenu(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.editSuccess'))
          open.value = false
          getList()
        })
      } else {
        addMenu(form.value).then(() => {
          proxy.$modal.msgSuccess(proxy.$t('common.addSuccess'))
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 递归记录原始排序 */
function recordOriginalOrders(list: SysMenu[]) {
  list.forEach(item => {
    originalOrders.value[item.menuId] = item.orderNum
    if (item.children && item.children.length) {
      recordOriginalOrders(item.children)
    }
  })
}

/** 保存排序 */
function handleSaveSort() {
  const changedMenuIds: number[] = []
  const changedOrderNums: number[] = []
  const collectChanged = (list: SysMenu[]) => {
    list.forEach(item => {
      if (String(originalOrders.value[item.menuId!]) !== String(item.orderNum)) {
        changedMenuIds.push(item.menuId!)
        changedOrderNums.push(item.orderNum!)
      }
      if (item.children && item.children.length) {
        collectChanged(item.children)
      }
    })
  }
  collectChanged(menuList.value)
  if (changedMenuIds.length === 0) {
   proxy.$modal.msgWarning(proxy.$t('common.sortNoChange'))
    return
  }
  updateMenuSort({ menuIds: changedMenuIds.join(","), orderNums: changedOrderNums.join(",") }).then(() => {
   proxy.$modal.msgSuccess(proxy.$t('common.sortSuccess'))
    recordOriginalOrders(menuList.value)
  })
}

/** 删除按钮操作 */
function handleDelete(row: SysMenu) {
  proxy.$modal.confirm(proxy.$t('menu.deleteConfirm', { name: row.menuName })).then(function() {
    return delMenu(row.menuId!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(proxy.$t('common.deleteSuccess'))
  }).catch(() => {})
}

getList()
</script>
