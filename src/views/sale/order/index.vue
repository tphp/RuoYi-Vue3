<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="订单状态" clearable style="width: 200px">
          <el-option v-for="dict in sale_order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单日期">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['sale:order:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['sale:order:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['sale:order:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['sale:order:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表表格 -->
    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" align="center" prop="orderNo" width="160" />
      <el-table-column label="客户名称" align="center" prop="customerName" :show-overflow-tooltip="true" />
      <el-table-column label="订单日期" align="center" prop="orderDate" width="120" />
      <el-table-column label="订单状态" align="center" prop="orderStatus" width="100">
        <template #default="scope">
          <dict-tag :options="sale_order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center" prop="totalAmount" width="120" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['sale:order:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sale:order:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sale:order:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialogTitle" v-model="open" width="1000px" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="保存后自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单日期" prop="orderDate">
              <el-date-picker v-model="form.orderDate" value-format="YYYY-MM-DD" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="客户电话" prop="customerPhone">
              <el-input v-model="form.customerPhone" placeholder="请输入客户电话" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="收货地址" prop="deliveryAddress">
              <el-input v-model="form.deliveryAddress" placeholder="请输入收货地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 明细子表格 -->
        <el-divider content-position="left">订单明细</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAddItem">添加行</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="itemSelection.length === 0" @click="handleDeleteItem">删除行</el-button>
          </el-col>
        </el-row>
        <el-table :data="form.orderDetailList" @selection-change="handleItemSelectionChange" border>
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="商品名称" align="center" width="180">
            <template #default="scope">
              <el-input v-model="scope.row.productName" placeholder="商品名称" />
            </template>
          </el-table-column>
          <el-table-column label="商品规格" align="center" width="160">
            <template #default="scope">
              <el-input v-model="scope.row.productSpec" placeholder="规格" />
            </template>
          </el-table-column>
          <el-table-column label="单位" align="center" width="80">
            <template #default="scope">
              <el-input v-model="scope.row.unit" placeholder="单位" />
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" width="130">
            <template #default="scope">
              <el-input-number v-model="scope.row.quantity" :min="1" :precision="0" controls-position="right" @change="calcItemAmount(scope.row)" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="单价" align="center" width="130">
            <template #default="scope">
              <el-input-number v-model="scope.row.unitPrice" :min="0" :precision="2" controls-position="right" @change="calcItemAmount(scope.row)" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="金额" align="center" width="120">
            <template #default="scope">
              <span>{{ scope.row.amount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: right; margin-top: 10px; font-size: 16px; font-weight: bold;">
          合计金额：{{ totalAmount.toFixed(2) }}
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="销售订单详情" v-model="detailOpen" width="900px" append-to-body>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="订单编号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ detailData.customerName }}</el-descriptions-item>
        <el-descriptions-item label="客户电话">{{ detailData.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="订单日期">{{ detailData.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <dict-tag :options="sale_order_status" :value="detailData.orderStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="总金额">{{ detailData.totalAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ detailData.deliveryAddress }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">订单明细</el-divider>
      <el-table :data="detailData.orderDetailList" border>
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="商品名称" align="center" prop="productName" />
        <el-table-column label="商品规格" align="center" prop="productSpec" />
        <el-table-column label="单位" align="center" prop="unit" width="80" />
        <el-table-column label="数量" align="center" prop="quantity" width="100" />
        <el-table-column label="单价" align="center" prop="unitPrice" width="100">
          <template #default="scope">
            <span>{{ scope.row.unitPrice?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" align="center" prop="amount" width="120">
          <template #default="scope">
            <span>{{ scope.row.amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SaleOrder">
import { listOrder, listWithDetail, getOrder, addOrder, updateOrder, delOrder } from "@/api/sale/order"
import type { SaleOrderForm, SaleOrderItem, SaleOrderQuery } from '@/types/api/sale/order'

const { proxy } = getCurrentInstance() as any
const { sale_order_status } = useDict("sale_order_status")

const orderList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dialogTitle = ref("")
const dateRange = ref<[string, string]>(['', ''])

/** 详情弹窗 */
const detailOpen = ref(false)
const detailData = ref<SaleOrderForm>({} as SaleOrderForm)

/** 明细行选中 */
const itemSelection = ref<SaleOrderItem[]>([])

const data = reactive({
  form: { orderDetailList: [] } as SaleOrderForm,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as SaleOrderQuery,
  rules: {
    customerName: [{ required: true, message: "请输入客户名称", trigger: "blur" }],
    orderDate: [{ required: true, message: "请选择订单日期", trigger: "change" }],
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 合计金额 */
const totalAmount = computed(() => {
  return (form.value.orderDetailList || []).reduce((sum: number, item: SaleOrderItem) => sum + (item.amount || 0), 0)
})

/** 计算明细行金额 */
function calcItemAmount(row: SaleOrderItem) {
  row.amount = (row.quantity || 0) * (row.unitPrice || 0)
}

/** 查询列表 */
function getList() {
  loading.value = true
  listOrder(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    orderList.value = res.rows
    total.value = res.total
  }).finally(() => {
    loading.value = false
  })
}

/** 取消 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    orderId: undefined,
    orderNo: undefined,
    customerName: undefined,
    customerPhone: undefined,
    orderDate: undefined,
    orderStatus: '0',
    deliveryAddress: undefined,
    remark: undefined,
    orderDetailList: [],
  }
  proxy.resetForm("orderRef")
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置 */
function resetQuery() {
  dateRange.value = ['', '']
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 查看详情 */
function handleDetail(row: any) {
  listWithDetail({
    pageNum: 1,
    pageSize: 1,
    orderNo: row.orderNo,
  }).then(res => {
    if (res.rows && res.rows.length > 0) {
      detailData.value = res.rows[0]
      detailOpen.value = true
    }
  })
}

/** 新增 */
function handleAdd() {
  reset()
  open.value = true
  dialogTitle.value = "新增销售订单"
}

/** 修改 */
function handleUpdate(row?: any) {
  reset()
  const orderId = row?.orderId || ids.value[0]
  getOrder(orderId).then(res => {
    const data = res.data!
    form.value = {
      orderId: data.orderId,
      orderNo: data.orderNo,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      orderDate: data.orderDate,
      orderStatus: data.orderStatus,
      deliveryAddress: data.deliveryAddress,
      remark: data.remark,
      orderDetailList: data.orderDetailList || [],
    }
    open.value = true
    dialogTitle.value = "修改销售订单"
  })
}

/** 提交 */
function submitForm() {
  proxy.$refs["orderRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.orderId != undefined) {
        updateOrder(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addOrder(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除 */
function handleDelete(row?: any) {
  const orderIds = row?.orderId || ids.value
  const orderNo = row?.orderNo || ids.value.join(",")
  proxy.$modal.confirm('是否确认删除订单编号为"' + orderNo + '"的数据项？').then(() => {
    return delOrder(orderIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出 */
function handleExport() {
  proxy.download("sale/order/export", {
    ...queryParams.value
  }, `sale_order_${new Date().getTime()}.xlsx`)
}

/** 添加明细行 */
function handleAddItem() {
  form.value.orderDetailList = form.value.orderDetailList || []
  form.value.orderDetailList.push({
    productName: undefined,
    productSpec: undefined,
    unit: undefined,
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  })
}

/** 删除明细行 */
function handleDeleteItem() {
  const selected = new Set(itemSelection.value)
  form.value.orderDetailList = form.value.orderDetailList.filter(item => !selected.has(item))
}

/** 明细行多选 */
function handleItemSelectionChange(selection: SaleOrderItem[]) {
  itemSelection.value = selection
}

getList()
</script>
