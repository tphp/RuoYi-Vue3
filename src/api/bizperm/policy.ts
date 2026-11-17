import request from '@/utils/request'
import type {
  AjaxResult,
  TableDataInfo,
  TreePageResult,
  BizPermTreeNode,
  BizPermTreeQuery,
  BizPermTreeChildrenQuery,
  BizPermPolicy,
  BizPermPolicyQuery,
  VisibleUsersQuery,
  VisibleUsersResult
} from '@/types'

/** 查询权限结构树首屏 */
export function getPermTree(query?: BizPermTreeQuery): Promise<AjaxResult<TreePageResult<BizPermTreeNode>>> {
  return request({
    url: '/bizperm/policy/tree',
    method: 'get',
    params: query
  })
}

/** 懒加载树节点子级 */
export function getPermTreeChildren(query: BizPermTreeChildrenQuery): Promise<AjaxResult<TreePageResult<BizPermTreeNode>>> {
  return request({
    url: '/bizperm/policy/tree/children',
    method: 'get',
    params: query
  })
}

/** 查询指定员工的权限树 */
export function getUserPermTree(userCode: string, query?: BizPermTreeQuery): Promise<AjaxResult<TreePageResult<BizPermTreeNode>>> {
  return request({
    url: '/bizperm/policy/user/tree',
    method: 'get',
    params: { userCode, ...query }
  })
}

/** 分页查询指定员工的可见员工 */
export function getUserVisibleUsers(userCode: string, query: VisibleUsersQuery): Promise<AjaxResult<VisibleUsersResult>> {
  return request({
    url: '/bizperm/policy/user/visible-users',
    method: 'get',
    params: { userCode, ...query }
  })
}

/** 查询策略列表 */
export function listPolicy(query: BizPermPolicyQuery): Promise<TableDataInfo<BizPermPolicy[]>> {
  return request({
    url: '/bizperm/policy/list',
    method: 'get',
    params: query
  })
}

/** 查询策略详情（含可见范围） */
export function getPolicy(id: number): Promise<AjaxResult<BizPermPolicy>> {
  return request({
    url: '/bizperm/policy/' + id,
    method: 'get'
  })
}

/** 新增策略 */
export function addPolicy(data: BizPermPolicy): Promise<AjaxResult> {
  return request({
    url: '/bizperm/policy',
    method: 'post',
    data: data
  })
}

/** 修改策略 */
export function updatePolicy(data: BizPermPolicy): Promise<AjaxResult> {
  return request({
    url: '/bizperm/policy',
    method: 'put',
    data: data
  })
}

/** 批量删除策略 */
export function delPolicy(ids: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/bizperm/policy/' + ids,
    method: 'delete'
  })
}
