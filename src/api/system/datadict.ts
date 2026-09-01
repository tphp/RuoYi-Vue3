import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'
import type {
  DataDictTableQueryParams,
  DataDictTable,
  DataDictTableInfoResult,
  DataDictColumn
} from '@/types/api/system/datadict'

/**
 * 查询数据字典表列表（分页，支持表名/表描述模糊搜索）
 * @param query 查询参数（表名称、表描述、分页参数）
 */
export function listDataTable(query: DataDictTableQueryParams): Promise<TableDataInfo<DataDictTable>> {
  return request({
    url: '/system/datadict/table/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询表结构详情（基本信息 + 字段 + 外键 + 索引）
 * @param tableName 表名称
 */
export function getTableInfo(tableName: string): Promise<AjaxResult<DataDictTableInfoResult>> {
  return request({
    url: '/system/datadict/table/' + tableName,
    method: 'get'
  })
}

/**
 * 查询单表字段明细
 * @param tableName 表名称
 */
export function listColumn(tableName: string): Promise<AjaxResult<DataDictColumn[]>> {
  return request({
    url: '/system/datadict/column/list',
    method: 'get',
    params: { tableName }
  })
}
