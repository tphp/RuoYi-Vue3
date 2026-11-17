import { translate } from '@/locales'

const errorCode: Record<string, string> = {
  '401': translate('error.authFailed'),
  '403': translate('error.noPermission'),
  '404': translate('error.resourceNotFound'),
  'default': translate('error.unknownError')
}

export default errorCode
