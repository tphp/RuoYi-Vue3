import request from '@/utils/request'
import type { LoginInfoResult } from '@/types/api/login'

/**
 * SSO 单点登录
 *
 * @param token OA 颁发的 token，从 /sso?token=xxx 传入
 * @returns 登录成功后的 RuoYi 令牌
 */
export function ssoLogin(token: string): Promise<LoginInfoResult> {
  return request({
    url: '/sso/login',
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    method: 'post',
    params: { token },
    // 由调用方自行展示错误信息，避免与页面内提示重复弹窗
    noMsg: true
  })
}
