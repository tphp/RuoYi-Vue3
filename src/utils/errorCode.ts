/**
 * 错误码对应的多语言 key
 * 存 key 而非文案，翻译在消费时进行，保证切换语言后提示同步更新
 */
const errorCode: Record<string, string> = {
  '401': 'error.authFailed',
  '403': 'error.noPermission',
  '404': 'error.resourceNotFound',
  'default': 'error.unknownError'
}

export default errorCode
