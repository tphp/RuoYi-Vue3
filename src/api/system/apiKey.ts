import request from '@/utils/request'
import type { SysApiKey, ApiKeyQueryParams, AjaxResult, TableDataInfo } from '@/types'

// 查询API密钥列表
export function listApiKey(query: ApiKeyQueryParams): Promise<TableDataInfo<SysApiKey[]>> {
  return request({
    url: '/system/apiKey/list',
    method: 'get',
    params: query
  })
}

// 查询API密钥详细
export function getApiKey(id: number): Promise<AjaxResult<SysApiKey>> {
  return request({
    url: '/system/apiKey/' + id,
    method: 'get'
  })
}

// 新增API密钥
export function addApiKey(data: SysApiKey): Promise<AjaxResult> {
  return request({
    url: '/system/apiKey',
    method: 'post',
    data: data
  })
}

// 修改API密钥
export function updateApiKey(data: SysApiKey): Promise<AjaxResult> {
  return request({
    url: '/system/apiKey',
    method: 'put',
    data: data
  })
}

// 删除API密钥
export function delApiKey(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/system/apiKey/' + id,
    method: 'delete'
  })
}

// 生成API Key
export function generateApiKey(): Promise<AjaxResult<string>> {
  return request({
    url: '/system/apiKey/generateApiKey',
    method: 'get'
  })
}

// 生成API Secret
export function generateApiSecret(): Promise<AjaxResult<string>> {
  return request({
    url: '/system/apiKey/generateApiSecret',
    method: 'get'
  })
}
