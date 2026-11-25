import useSettingsStore from '@/store/modules/settings'
import { currentLocale, translate } from '@/locales'

/**
 * 动态修改标题
 */
export function useDynamicTitle(): void {
  const settingsStore = useSettingsStore()
  // 优先使用多语言 key，保证切换语言后标题同步更新
  const title = settingsStore.titleKey ? translate(settingsStore.titleKey) : settingsStore.title
  // 系统名称取多语言配置，语言切换时同步刷新浏览器标题
  const appTitle = translate('app.title')
  if (settingsStore.dynamicTitle) {
    document.title = title + ' - ' + appTitle
  } else {
    document.title = appTitle
  }
}

// 语言切换后重新刷新标题
watch(currentLocale, () => {
  useDynamicTitle()
})
