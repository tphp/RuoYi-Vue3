import request from '@/utils/request'
import type { SaleOrderQuery, SaleOrderForm, AjaxResult, TableDataInfo } from '@/types'

// 查询销售订单列表
export function listOrder(query: SaleOrderQuery): Promise<TableDataInfo<SaleOrderForm[]>> {
  return request({
    url: '/sale/order/list',
    method: 'get',
    params: query
  })
}

// 分页查询销售订单列表（含明细）
export function listWithDetail(query: SaleOrderQuery): Promise<TableDataInfo<SaleOrderForm[]>> {
  return request({
    url: '/sale/order/listWithDetail',
    method: 'get',
    params: query
  })
}

// 查询销售订单详情（含明细）
export function getOrder(orderId: number): Promise<AjaxResult<SaleOrderForm>> {
  return request({
    url: '/sale/order/' + orderId,
    method: 'get'
  })
}

// 新增销售订单（含明细）
export function addOrder(data: SaleOrderForm): Promise<AjaxResult> {
  return request({
    url: '/sale/order',
    method: 'post',
    data: data
  })
}

// 修改销售订单（含明细）
export function updateOrder(data: SaleOrderForm): Promise<AjaxResult> {
  return request({
    url: '/sale/order',
    method: 'put',
    data: data
  })
}

// 删除销售订单（含明细）
export function delOrder(orderIds: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/sale/order/' + orderIds,
    method: 'delete'
  })
}
