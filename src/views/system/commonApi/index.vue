<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
         <el-form-item label="接口名称" prop="apiName">
            <el-input
               v-model="queryParams.apiName"
               placeholder="请输入接口名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
         <el-form-item style="float:right;margin-left:0">
            <div class="link-list" v-if="showSearch">
               <el-button type="primary" link @click="showSearch = false">展开筛选</el-button>
            </div>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:commonApi:add']"
            >新建</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:commonApi:remove']"
            >批量删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="commonApiList" @selection-change="handleSelectionChange" border>
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="序号" width="60" type="index" align="center" />
         <el-table-column label="接口名称" align="center" prop="apiName" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="接口关键字" align="center" prop="apiKey" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="接口地址" align="center" prop="apiUrl" min-width="320" :show-overflow-tooltip="true" />
         <el-table-column label="创建人" align="center" prop="createBy" width="100" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:commonApi:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:commonApi:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 添加或修改通用接口对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="commonApiRef" :model="form" :rules="rules" label-width="100px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="接口名称" prop="apiName">
                     <el-input v-model="form.apiName" placeholder="请输入接口名称" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="接口关键字" prop="apiKey">
                     <el-input v-model="form.apiKey" placeholder="请输入接口关键字（唯一标识）" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="接口地址" prop="apiUrl">
                     <el-input v-model="form.apiUrl" placeholder="请输入接口URL地址" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="Cookie" prop="cookie">
                     <el-input v-model="form.cookie" type="textarea" :rows="2" placeholder="请输入请求Cookie（如 LtpaToken=xxx; JSESSIONID=xxx）" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="描述" prop="description">
                     <el-input v-model="form.description" type="textarea" :rows="5" placeholder="请输入描述信息" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="创建人" prop="createBy">
                     <el-input v-model="form.createBy" disabled />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="修改人" prop="updateBy">
                     <el-input v-model="form.updateBy" disabled />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="创建时间" prop="createTime">
                     <el-input v-model="form.createTime" disabled />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="更新时间" prop="updateTime">
                     <el-input v-model="form.updateTime" disabled />
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup lang="ts" name="CommonApi">
import type { SysCommonApi, CommonApiQueryParams } from '@/types/api/system/commonApi'
import { listCommonApi, getCommonApi, delCommonApi, addCommonApi, updateCommonApi } from "@/api/system/commonApi"

const { proxy } = getCurrentInstance()

const commonApiList = ref<SysCommonApi[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(false)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as SysCommonApi,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    apiName: undefined,
    apiKey: undefined
  } as CommonApiQueryParams,
  rules: {
    apiName: [{ required: true, message: "接口名称不能为空", trigger: "blur" }],
    apiKey: [{ required: true, message: "接口关键字不能为空", trigger: "blur" }],
    apiUrl: [{ required: true, message: "接口地址不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listCommonApi(queryParams.value).then(response => {
    commonApiList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = {
    id: undefined,
    apiName: undefined,
    apiKey: undefined,
    apiUrl: undefined,
    cookie: undefined,
    description: undefined,
    createBy: undefined,
    createTime: undefined,
    updateBy: undefined,
    updateTime: undefined,
    remark: undefined
  }
  proxy.resetForm("commonApiRef")
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection: SysCommonApi[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "通用接口"
}

function handleUpdate(row: SysCommonApi) {
  reset()
  const id = row.id || ids.value[0]
  getCommonApi(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "通用接口"
  })
}

function submitForm() {
  proxy.$refs["commonApiRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCommonApi(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCommonApi(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row: SysCommonApi) {
  const apiIds = row.id || ids.value
  const tips = Array.isArray(apiIds) ? apiIds.length + "条选中数据" : '"' + apiIds + '"'
  proxy.$modal.confirm('是否确认删除通用接口编号为' + tips + '的数据项？').then(function () {
    return delCommonApi(apiIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>
