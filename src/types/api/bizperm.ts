import type { BaseEntity, PageDomain } from './common'

/** 权限树节点 */
export interface BizPermTreeNode {
  /** 节点唯一标识 */
  nodeKey: string
  /** 节点类型：OWNER / SCENE / DEPT / SCOPE / EMPLOYEE / MORE */
  nodeType: string
  /** 父节点标识 */
  parentKey?: string
  /** 显示名称 */
  label: string
  /** 业务编码：工号 / 场景编码 / 部门ID */
  code?: string
  /** 是否还有子节点 */
  hasChildren?: boolean
  /** 是否叶子节点 */
  leaf?: boolean
  /** 是否停用 */
  disabled?: boolean
  /** 扩展字段：userCount / deptCount / policyCount / userCode / deptName 等 */
  extra?: Record<string, any>
  /** 子节点 */
  children?: BizPermTreeNode[]
}

/** 树节点分页结果 */
export interface TreePageResult<T = BizPermTreeNode> {
  /** 子节点总数 */
  total: number
  /** 当前页节点 */
  nodes: T[]
}

/** 权限树首屏查询参数 */
export interface BizPermTreeQuery {
  policyCode?: string
  ownerUserCode?: string
  keyword?: string
  status?: string
  /** 返回层级 1~3 */
  depth?: number
  /** 是否统计人数 */
  withCount?: boolean
}

/** 树节点懒加载参数 */
export interface BizPermTreeChildrenQuery {
  nodeKey: string
  nodeType: string
  keyword?: string
  pageNum?: number
  pageSize?: number
}

/** 可见范围明细 */
export interface BizPermScope {
  id?: number
  policyId?: number
  /** USER / POST / DEPT */
  scopeType: string
  scopeValue: string
  scopeName?: string
  /** 部门是否含下级：0否 1是 */
  includeChild?: string
  orderNum?: number
  createBy?: string
}

/** 业务权限策略 */
export interface BizPermPolicy extends BaseEntity {
  id?: number
  policyCode?: string
  policyName?: string
  /** USER / POST / DEPT */
  subjectType?: string
  subjectValue?: string
  subjectName?: string
  includeChild?: string
  /** 0启用 1停用 */
  status?: string
  /** 非数据库字段：可见范围中是否有含下级的部门，0否 1是 */
  scopeIncludeChild?: string
  scopes?: BizPermScope[]
}

/** 策略列表查询参数 */
export interface BizPermPolicyQuery extends PageDomain {
  policyCode?: string
  policyName?: string
  subjectType?: string
  subjectValue?: string
  status?: string
}

/** 可见人员 */
export interface VisibleUser {
  userCode: string
  nickName?: string
  deptId?: number
  deptName?: string
}

/** 按部门分组的可见人员 */
export interface VisibleDeptGroup {
  deptId?: number
  deptName?: string
  includeChild?: string
  userCount?: number
  returnedCount?: number
  users?: VisibleUser[]
}

/** 可见人员查询结果 */
export interface VisibleUsersResult {
  policyCode?: string
  userCode?: string
  total?: number
  userCodes?: string[]
  users?: VisibleUser[]
  departments?: VisibleDeptGroup[]
}

/** 可见人员查询参数 */
export interface VisibleUsersQuery extends PageDomain {
  policyCode: string
  userCode?: string
  keyword?: string
  groupByDept?: boolean
}
