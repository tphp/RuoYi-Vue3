import request from '@/utils/request'
import type { SysNumberRule, NumberRuleQueryParams, AjaxResult, TableDataInfo } from '@/types'

// 查询编号规则列表
export function listNumberRule(query: NumberRuleQueryParams): Promise<TableDataInfo<SysNumberRule[]>> {
  return request({
    url: '/system/numberRule/list',
    method: 'get',
    params: query
  })
}

// 查询编号规则详细
export function getNumberRule(ruleId: number): Promise<AjaxResult<SysNumberRule>> {
  return request({
    url: '/system/numberRule/' + ruleId,
    method: 'get'
  })
}

// 新增编号规则
export function addNumberRule(data: SysNumberRule): Promise<AjaxResult> {
  return request({
    url: '/system/numberRule',
    method: 'post',
    data: data
  })
}

// 修改编号规则
export function updateNumberRule(data: SysNumberRule): Promise<AjaxResult> {
  return request({
    url: '/system/numberRule',
    method: 'put',
    data: data
  })
}

// 删除编号规则
export function delNumberRule(ruleId: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/system/numberRule/' + ruleId,
    method: 'delete'
  })
}

// 修改规则状态
export function changeNumberRuleStatus(data: { ruleId: number; status: string }): Promise<AjaxResult> {
  return request({
    url: '/system/numberRule/status',
    method: 'put',
    data: data
  })
}

// 预览编号格式
export function previewNumber(data: SysNumberRule): Promise<AjaxResult<string>> {
  return request({
    url: '/system/numberRule/preview',
    method: 'post',
    data: data
  })
}

// 生成编号（测试用）
export function generateNumber(ruleCode: string): Promise<AjaxResult<string>> {
  return request({
    url: '/system/numberRule/generate/' + ruleCode,
    method: 'post'
  })
}
