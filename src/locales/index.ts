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

/** 当前语言（全局唯一状态源） */
export const currentLocale = ref<string>(Cookies.get('locale') || 'zh-cn')

const i18n = createI18n({
  legacy: false,
  locale: currentLocale.value,
  fallbackLocale: 'zh-cn',
  messages,
})

/**
 * 切换语言（不刷新页面）
 * @param lang 语言标识，如 'zh-cn' | 'en'
 */
export function setLocale(lang: string): void {
  if (!elementLocales[lang] || lang === currentLocale.value) return
  currentLocale.value = lang
  Cookies.set('locale', lang)
  // 同步 vue-i18n 内部的 locale
  ;(i18n.global.locale as any).value = lang
}

/** 当前语言对应的 Element Plus 语言包 */
export const elementLocale = computed<any>(() => elementLocales[currentLocale.value] || elementLocales['zh-cn'])

/**
 * 在无法使用 useI18n() 的场景（普通 .ts 模块、路由守卫等）中翻译文案
 * @param key 多语言 key，如 'common.confirm'
 * @param named 命名插值参数，如 { ids: '1,2' }
 */
export function translate(key: string, named?: Record<string, unknown>): string {
  return i18n.global.t(key, named as any) as unknown as string
}

export default i18n
