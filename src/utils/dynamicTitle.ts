import defaultSettings from '@/settings'
import useSettingsStore from '@/store/modules/settings'
import { currentLocale, translate } from '@/locales'

/**
 * 动态修改标题
 */
export function useDynamicTitle(): void {
  const settingsStore = useSettingsStore()
  // 优先使用多语言 key，保证切换语言后标题同步更新
  const title = settingsStore.titleKey ? translate(settingsStore.titleKey) : settingsStore.title
  if (settingsStore.dynamicTitle) {
    document.title = title + ' - ' + defaultSettings.title
  } else {
    document.title = defaultSettings.title
  }
}

// 语言切换后重新刷新标题
watch(currentLocale, () => {
  useDynamicTitle()
})
