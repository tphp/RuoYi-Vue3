/**
 * 密码强度规则
 * 根据参数 chrtype 动态生成校验规则
 *
 * chrtype 说明：
 *   0 - 任意字符（默认）
 *   1 - 纯数字（0-9）
 *   2 - 纯字母（a-z / A-Z）
 *   3 - 字母 + 数字（必须同时包含）
 *   4 - 字母 + 数字 + 特殊字符（必须同时包含，特殊字符：~!@#$%^&*()-=_+）
 */

import cache from '@/plugins/cache'
import { translate } from '@/locales'

// 密码限制类型
const pwdChrType: Ref<string> = ref(cache.session.get('pwrChrtype') || '0')

// 各类型对应的正则、错误提示
const PWD_RULES: Record<string, { pattern: RegExp; messageKey: string }> = {
  '0': { pattern: /^[^<>"'|\\]+$/, messageKey: 'pwd.illegalChars' },
  '1': { pattern: /^[0-9]+$/, messageKey: 'pwd.onlyDigits' },
  '2': { pattern: /^[a-zA-Z]+$/, messageKey: 'pwd.onlyLetters' },
  '3': { pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, messageKey: 'pwd.lettersAndDigits' },
  '4': { pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()\-=_+])[A-Za-z\d~!@#$%^&*()\-=_+]+$/, messageKey: 'pwd.lettersDigitsSpecial' }
}

export function usePasswordRule() {
  // 默认密码校验
  const pwdValidator = computed(() => {
    const rule = PWD_RULES[pwdChrType.value] || PWD_RULES['0']
    return [
      { required: true, message: translate('pwd.empty'), trigger: 'blur' },
      { min: 6, max: 20, message: translate('pwd.lengthRange'), trigger: 'blur' },
      { pattern: rule.pattern, message: translate(rule.messageKey), trigger: 'blur' }
    ]
  })
  // 校验prompt的inputValidator函数
  const pwdPromptValidator = (value: string) => {
    const rule = PWD_RULES['0']
    if (!value || value.length < 6 || value.length > 20) {
      return translate('pwd.lengthRange')
    }
    if (!rule.pattern.test(value)) {
      return translate(rule.messageKey)
    }
  }
  // 个人中心密码校验
  const infoPwdValidator = computed(() => {
    const rule = PWD_RULES[pwdChrType.value] || PWD_RULES['0']
    return [
      { required: true, message: translate('pwd.newEmpty'), trigger: 'blur' },
      { min: 6, max: 20, message: translate('pwd.newLengthRange'), trigger: 'blur' },
      { pattern: rule.pattern, message: translate(rule.messageKey), trigger: 'blur' }
    ]
  })
  // 注册页面密码校验
  const registerPwdValidator = computed(() => {
    const rule = PWD_RULES['0']
    return [
      { required: true, message: translate('login.passwordRequired'), trigger: 'blur' },
      { min: 6, max: 20, message: translate('pwd.userLengthRange'), trigger: 'blur' },
      { pattern: rule.pattern, message: translate(rule.messageKey), trigger: 'blur' }
    ]
  })

  return {
    pwdChrType,
    pwdValidator,
    infoPwdValidator,
    pwdPromptValidator,
    registerPwdValidator
  }
}
