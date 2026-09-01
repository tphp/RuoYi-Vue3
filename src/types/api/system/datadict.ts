import type { PageDomain, BaseEntity } from "../common";

/** 数据字典表分页查询参数 */
export interface DataDictTableQueryParams extends PageDomain {
  /** 表名称（模糊搜索） */
  tableName?: string;
  /** 表描述（模糊搜索） */
  tableComment?: string;
}

/** 数据字典表基本信息 */
export interface DataDictTable extends BaseEntity {
  /** 表名称 */
  tableName?: string;
  /** 表描述 */
  tableComment?: string;
  /** 存储引擎 */
  engine?: string;
  /** 字符集排序规则 */
  tableCollation?: string;
  /** 记录数（约） */
  tableRows?: number;
  /** 数据大小（字节） */
  dataLength?: number;
}

/** 数据字典字段信息 */
export interface DataDictColumn {
  /** 字段名称 */
  columnName?: string;
  /** 数据类型（如 varchar） */
  dataType?: string;
  /** 完整类型（含长度，如 varchar(50)） */
  columnType?: string;
  /** 字符最大长度 */
  characterMaximumLength?: number;
  /** 数字精度 */
  numericPrecision?: number;
  /** 数字标度（小数位数） */
  numericScale?: number;
  /** 是否主键（PRI 为主键） */
  columnKey?: string;
  /** 额外属性（auto_increment 表示自增） */
  extra?: string;
  /** 是否可空（YES/NO） */
  isNullable?: string;
  /** 默认值 */
  columnDefault?: string;
  /** 字段注释 */
  columnComment?: string;
}

/** 数据字典外键信息 */
export interface DataDictForeignKey {
  /** 外键约束名称 */
  constraintName?: string;
  /** 本表字段名称 */
  columnName?: string;
  /** 引用表名称 */
  referencedTableName?: string;
  /** 引用字段名称 */
  referencedColumnName?: string;
}

/** 数据字典索引信息 */
export interface DataDictIndex {
  /** 索引名称 */
  indexName?: string;
  /** 索引类型（如 BTREE） */
  indexType?: string;
  /** 是否非唯一（0唯一 1非唯一） */
  nonUnique?: number;
  /** 包含字段 */
  columnName?: string;
}

/** 表结构详情结果 */
export interface DataDictTableInfoResult {
  /** 表基本信息 */
  info: DataDictTable;
  /** 字段列表 */
  columns: DataDictColumn[];
  /** 外键列表 */
  foreignKeys: DataDictForeignKey[];
  /** 索引列表 */
  indexes: DataDictIndex[];
}
