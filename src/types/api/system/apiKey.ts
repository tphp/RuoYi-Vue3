import type { PageDomain, BaseEntity } from "../common";

/** API密钥分页查询参数 */
export interface ApiKeyQueryParams extends PageDomain {
  /** 应用名称 */
  appName?: string;
  /** API Key */
  apiKey?: string;
  /** 状态 */
  status?: string;
}

/** API密钥信息 */
export interface SysApiKey extends BaseEntity {
  /** 主键ID */
  id?: number;
  /** 应用名称 */
  appName?: string;
  /** API Key */
  apiKey?: string;
  /** API Secret */
  apiSecret?: string;
  /** 状态（0正常 1停用） */
  status?: '0' | '1';
  /** 过期时间 */
  expireTime?: string;
}
