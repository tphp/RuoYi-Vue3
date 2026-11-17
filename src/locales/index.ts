import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import zhCn from './zh-cn'
import en from './en'

// Element Plus 语言包
import zhCnElement from 'element-plus/es/locale/lang/zh-cn'
import enElement from 'element-plus/es/locale/lang/en'

export const elementLocales: Record<string, any> = {
  'zh-cn': zhCnElement,
  'en': enElement,
}

const messages = {
  'zh-cn': zhCn,
  'en': en,
}

const i18n = createI18n({
  legacy: false,
  locale: Cookies.get('locale') || 'zh-cn',
  fallbackLocale: 'zh-cn',
  messages,
})

/**
 * 在无法使用 useI18n() 的场景（普通 .ts 模块、路由守卫等）中翻译文案
 * @param key 多语言 key，如 'common.confirm'
 * @param named 命名插值参数，如 { ids: '1,2' }
 */
export function translate(key: string, named?: Record<string, unknown>): string {
  return i18n.global.t(key, named as any) as unknown as string
}

export default i18n
