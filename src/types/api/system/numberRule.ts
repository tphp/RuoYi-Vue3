import type { PageDomain, BaseEntity } from "../common";

/** 元素类型：1常量 2日期 3流水号 */
export type ItemType = '1' | '2' | '3'

/** 周期类型：1不循环 2按日 3按月 4按年 */
export type CycleType = '1' | '2' | '3' | '4'

/** 编号规则元素 */
export interface NumberRuleItem extends BaseEntity {
  /** 元素ID */
  itemId?: number
  /** 规则ID */
  ruleId?: number
  /** 元素类型（1常量 2日期 3流水号） */
  itemType: ItemType
  /** 常量值 */
  itemValue?: string
  /** 日期格式 */
  dateFormat?: string
  /** 累计周期（1不循环 2按日 3按月 4按年） */
  cycleType?: CycleType
  /** 流水号长度 */
  serialLength?: number
  /** 是否补零（0否 1是） */
  isPadZero?: '0' | '1'
  /** 起始流水号 */
  startNumber?: number
  /** 排序号 */
  sortOrder?: number
}

/** 编号规则查询参数 */
export interface NumberRuleQueryParams extends PageDomain {
  /** 规则名称 */
  ruleName?: string
  /** 规则编码 */
  ruleCode?: string
  /** 状态 */
  status?: string
}

/** 编号规则信息 */
export interface SysNumberRule extends BaseEntity {
  /** 规则ID */
  ruleId?: number
  /** 规则名称 */
  ruleName?: string
  /** 规则编码 */
  ruleCode?: string
  /** 规则描述 */
  description?: string
  /** 状态（0停用 1启用） */
  status?: '0' | '1'
  /** 备注 */
  remark?: string
  /** 规则元素列表 */
  items?: NumberRuleItem[]
}
