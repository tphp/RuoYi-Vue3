/** 出站接口日志查询参数 */
export interface OutboundLogQuery {
  pageNum?: number;
  pageSize?: number;
  /** 接口名称 */
  interfaceName?: string;
  /** 接口地址 */
  interfaceUrl?: string;
  /** 请求状态（SUCCESS/FAIL） */
  requestStatus?: string;
  /** HTTP状态码 */
  responseCode?: string;
  /** 请求唯一标识 */
  requestId?: string;
  /** 开始时间 */
  beginTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/** 出站接口日志（本系统调用外部接口） */
export interface OutboundLog {
  outboundId?: number;
  interfaceName?: string;
  interfaceUrl?: string;
  requestTime?: string;
  requestParameter?: string;
  requestStatus?: string;
  responseContent?: string;
  /** 响应耗时（毫秒） */
  responseTime?: number;
  responseCode?: string;
  stacktrace?: string;
  objectVersionNumber?: number;
  requestId?: string;
  programId?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  lastUpdateLogin?: string;
}

/** 入站接口日志查询参数 */
export interface InboundLogQuery {
  pageNum?: number;
  pageSize?: number;
  /** 接口名称 */
  interfaceName?: string;
  /** 接口地址 */
  interfaceUrl?: string;
  /** 请求方式 */
  requestMethod?: string;
  /** 请求状态（SUCCESS/FAIL） */
  requestStatus?: string;
  /** 调用方IP */
  ip?: string;
  /** 请求唯一标识 */
  requestId?: string;
  /** 开始时间 */
  beginTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/** 入站接口日志（外部系统调用本系统接口） */
export interface InboundLog {
  inboundId?: number;
  interfaceName?: string;
  interfaceUrl?: string;
  requestTime?: string;
  requestHeaderParameter?: string;
  requestBodyParameter?: string;
  requestMethod?: string;
  requestStatus?: string;
  responseContent?: string;
  /** 响应耗时（毫秒） */
  responseTime?: number;
  stacktrace?: string;
  ip?: string;
  referer?: string;
  userAgent?: string;
  objectVersionNumber?: number;
  requestId?: string;
  programId?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  lastUpdateLogin?: string;
}
