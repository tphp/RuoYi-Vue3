import type { PageDomain, BaseEntity } from "../common"

/** 销售订单分页查询参数 */
export interface SaleOrderQuery extends PageDomain {
  /** 订单编号 */
  orderNo?: string
  /** 客户名称 */
  customerName?: string
  /** 订单状态 */
  orderStatus?: string
  /** 开始时间 */
  beginTime?: string
  /** 结束时间 */
  endTime?: string
}

/** 销售订单主表 */
export interface SaleOrder extends BaseEntity {
  /** 订单ID */
  orderId?: number
  /** 订单编号 */
  orderNo?: string
  /** 客户名称 */
  customerName?: string
  /** 客户电话 */
  customerPhone?: string
  /** 订单日期 */
  orderDate?: string
  /** 订单状态 */
  orderStatus?: string
  /** 总金额 */
  totalAmount?: number
  /** 收货地址 */
  deliveryAddress?: string
  /** 备注 */
  remark?: string
}

/** 销售订单明细 */
export interface SaleOrderItem extends BaseEntity {
  /** 明细ID */
  detailId?: number
  /** 订单ID */
  orderId?: number
  /** 商品名称 */
  productName?: string
  /** 商品规格 */
  productSpec?: string
  /** 数量 */
  quantity?: number
  /** 单位 */
  unit?: string
  /** 单价 */
  unitPrice?: number
  /** 金额 */
  amount?: number
  /** 备注 */
  remark?: string
}

/** 销售订单表单（新增/编辑提交） */
export interface SaleOrderForm {
  /** 订单ID */
  orderId?: number
  /** 订单编号 */
  orderNo?: string
  /** 客户名称 */
  customerName?: string
  /** 客户电话 */
  customerPhone?: string
  /** 订单日期 */
  orderDate?: string
  /** 订单状态 */
  orderStatus?: string
  /** 收货地址 */
  deliveryAddress?: string
  /** 备注 */
  remark?: string
  /** 订单明细列表（后端字段名） */
  orderDetailList: SaleOrderItem[]
}
