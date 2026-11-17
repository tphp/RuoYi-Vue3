/**
 * 语言切换后刷新表单校验提示
 *
 * Element Plus 的 el-form-item 在校验发生时会把错误文案快照到 validateMessage，
 * 之后不再更新（见 element-plus/es/components/form/src/form-item.mjs）。
 * 因此切换语言后，需要对处于错误态的表单项重新触发一次校验，
 * 让函数形式的 message 按新语言重新求值。
 */
import type { App } from 'vue'
import { currentLocale } from '@/locales'

/** el-form-item 通过 __expose 暴露的成员 */
interface FormItemExpose {
  validateState?: { value?: string }
  validate?: (trigger?: string) => Promise<boolean>
}

/** 已挂载的表单项 */
const formItems = new Set<FormItemExpose>()

/** 判断当前组件实例是否为 el-form-item */
function isFormItem(instance: any): boolean {
  const exposed = instance?.exposed
  return !!exposed && typeof exposed.validate === 'function' && !!exposed.validateState
}

/** 读取校验状态（exposed 中保存的是 ref，需取 .value） */
function getValidateState(item: FormItemExpose): string {
  return item.validateState?.value || ''
}

/**
 * 重新校验处于错误态的表单项，使校验提示按当前语言重新显示
 * 只处理已经显示过错误的字段，不会给未操作过的字段新增错误提示
 */
export function refreshFormValidation(): void {
  formItems.forEach((item) => {
    if (getValidateState(item) !== 'error' || typeof item.validate !== 'function') return
    const result = item.validate('')
    // 校验失败会 reject，错误提示已由组件内部更新，这里忽略即可
    if (result && typeof result.catch === 'function') {
      result.catch(() => {})
    }
  })
}

/**
 * 注册全局混入以收集所有 el-form-item 实例，并在语言切换后刷新其校验提示
 */
export function setupLocaleForm(app: App): void {
  app.mixin({
    mounted(this: any) {
      if (isFormItem(this?.$)) {
        formItems.add(this.$.exposed as FormItemExpose)
      }
    },
    unmounted(this: any) {
      if (isFormItem(this?.$)) {
        formItems.delete(this.$.exposed as FormItemExpose)
      }
    }
  })

  // 语言切换后，等待界面更新再重新校验
  watch(currentLocale, () => {
    nextTick(() => refreshFormValidation())
  })
}
