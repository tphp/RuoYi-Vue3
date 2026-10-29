import request from '@/utils/request'
import type { InboundLog, InboundLogQuery, AjaxResult, TableDataInfo } from '@/types'

// 查询入站接口日志列表
export function listInboundLog(query: InboundLogQuery): Promise<TableDataInfo<InboundLog[]>> {
  return request({
    url: '/monitor/inboundLog/list',
    method: 'get',
    params: query
  })
}

// 查询入站接口日志详情
export function getInboundLog(inboundId: number): Promise<AjaxResult<InboundLog>> {
  return request({
    url: '/monitor/inboundLog/' + inboundId,
    method: 'get'
  })
}

// 删除入站接口日志
export function delInboundLog(inboundIds: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/monitor/inboundLog/' + inboundIds,
    method: 'delete'
  })
}

// 清空入站接口日志
export function cleanInboundLog(): Promise<AjaxResult> {
  return request({
    url: '/monitor/inboundLog/clean',
    method: 'delete'
  })
}
