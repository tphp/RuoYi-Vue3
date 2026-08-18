import request from '@/utils/request'
import type { SysCommonApi, CommonApiQueryParams, AjaxResult, TableDataInfo } from '@/types'

export function listCommonApi(query: CommonApiQueryParams): Promise<TableDataInfo<SysCommonApi[]>> {
  return request({
    url: '/system/commonApi/list',
    method: 'get',
    params: query
  })
}

export function getCommonApi(id: number): Promise<AjaxResult<SysCommonApi>> {
  return request({
    url: '/system/commonApi/' + id,
    method: 'get'
  })
}

export function addCommonApi(data: SysCommonApi): Promise<AjaxResult> {
  return request({
    url: '/system/commonApi',
    method: 'post',
    data: data
  })
}

export function updateCommonApi(data: SysCommonApi): Promise<AjaxResult> {
  return request({
    url: '/system/commonApi',
    method: 'put',
    data: data
  })
}

export function delCommonApi(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/system/commonApi/' + id,
    method: 'delete'
  })
}

/** 枚举基础数据：fdKeyword=CRM_Area(国家)/CRM_PayP(付款方式)/CRM_CustT(客户分类) 等 */
export interface LayOption {
  value: string;
  label: string;
}

/**
 * 后端通过关键字去 sys_common_api 取URL，通用代理接口
 * 接口关键字：crm_get_lay / mdm_crm_comper / mdm_crm_items 等
 */
export function listLayData(fdKeyword: string, keyword?: string, rowsize = 500): Promise<AjaxResult<LayOption[]>> {
  return request({
    url: '/system/commonApi/proxy/layList',
    method: 'get',
    params: { fdKeyword, keyword, rowsize }
  })
}

/** CRM客户列表 接口关键字：mdm_crm_comper → findDsData
 *  返回 { list: [...], total: N }
 */
export function listCrmCustomer(params: {
  keyword?: string
  pageno?: number
  rowsize?: number
  [key: string]: any
} = {}): Promise<AjaxResult<{ list: any[]; total: number }>> {
  return request({
    url: '/system/commonApi/proxy/customerList',
    method: 'get',
    params: { pageno: 0, rowsize: 10, ...params }
  })
}

/** CRM物料列表 接口关键字：mdm_crm_items → findOltmData
 *  返回 { list: [...], total: N }
 */
export function listCrmItem(params: {
  keyword?: string
  pageno?: number
  rowsize?: number
  fdBrandAuth?: string
  [key: string]: any
} = {}): Promise<AjaxResult<{ list: any[]; total: number }>> {
  return request({
    url: '/system/commonApi/proxy/itemList',
    method: 'get',
    params: { pageno: 0, rowsize: 10, ...params }
  })
}

/** 通用GET代理：任意接口关键字 + 任意query参数 */
export function proxyCommonApiGet(apiKey: string, params: Record<string, any> = {}): Promise<AjaxResult<any>> {
  return request({
    url: '/system/commonApi/proxy/get',
    method: 'get',
    params: { apiKey, ...params }
  })
}
