import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'
import { currentLocale } from '@/locales'

/** 字典选项 */
export interface DictOption {
  /** 显示文案（随语言实时变化） */
  label: string
  /** 字典键值 */
  value: string
  /** 标签样式 */
  elTagType?: string
  /** 自定义样式 */
  elTagClass?: string
  /** 原始中文标签 */
  dictLabel?: string
  /** 英文标签 */
  dictLabelEn?: string
}

/**
 * 构造字典选项
 *
 * label 使用 getter 实现：读取时根据当前语言实时计算，
 * 因此切换语言后无需重新请求字典、无需刷新页面即可显示对应文案。
 */
function buildOption(item: any): DictOption {
  const option: any = {
    value: item.dictValue,
    elTagType: item.listClass,
    elTagClass: item.cssClass,
    dictLabel: item.dictLabel,
    dictLabelEn: item.dictLabelEn
  }
  Object.defineProperty(option, 'label', {
    enumerable: true,
    configurable: true,
    get() {
      // 英文界面优先使用后端返回的英文标签，未配置时回退到中文标签
      if (currentLocale.value === 'en' && item.dictLabelEn) {
        return item.dictLabelEn
      }
      return item.dictLabel || ''
    },
    // label 由语言实时推导，不支持直接赋值
    set() {}
  })
  return option as DictOption
}

/**
 * 获取字典数据
 */
export function useDict(...args: string[]) {
  const res = ref<Record<string, any[]>>({})
  return (() => {
    args.forEach((dictType) => {
      res.value[dictType] = []
      const dicts = useDictStore().getDict(dictType)
      if (dicts) {
        res.value[dictType] = dicts
      } else {
        getDicts(dictType).then(resp => {
          res.value[dictType] = (resp.data || []).map((p: any) => buildOption(p))
          useDictStore().setDict(dictType, res.value[dictType])
        })
      }
    })
    return toRefs(res.value)
  })()
}
