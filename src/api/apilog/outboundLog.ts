import request from '@/utils/request'
import type { OutboundLog, OutboundLogQuery, AjaxResult, TableDataInfo } from '@/types'

// 查询出站接口日志列表
export function listOutboundLog(query: OutboundLogQuery): Promise<TableDataInfo<OutboundLog[]>> {
  return request({
    url: '/monitor/outboundLog/list',
    method: 'get',
    params: query
  })
}

// 查询出站接口日志详情
export function getOutboundLog(outboundId: number): Promise<AjaxResult<OutboundLog>> {
  return request({
    url: '/monitor/outboundLog/' + outboundId,
    method: 'get'
  })
}

// 删除出站接口日志
export function delOutboundLog(outboundIds: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/monitor/outboundLog/' + outboundIds,
    method: 'delete'
  })
}

// 清空出站接口日志
export function cleanOutboundLog(): Promise<AjaxResult> {
  return request({
    url: '/monitor/outboundLog/clean',
    method: 'delete'
  })
}
