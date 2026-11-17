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

export default i18n
