import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'
import { currentLocale, translate } from '@/locales'

let downloadLoadingInstance: ReturnType<typeof ElLoading.service>
// 是否显示重新登录
export const isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use((config: any) => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  // 间隔时间(ms)，小于此时间视为重复提交
  const interval = (config.headers || {}).interval || 1000
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // 携带当前语言，后端按此返回对应语言的资源与提示
  config.headers['X-Lang'] = currentLocale.value
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
    const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + translate('common.requestTooLarge'))
      return config
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url                // 请求地址
      const s_data = sessionObj.data              // 请求数据
      const s_time = sessionObj.time              // 请求时间
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = translate('common.duplicateSubmit')
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, (error: any) => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use((res: any) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const msg = errorCode[code] ? translate(errorCode[code]) : (res.data.msg || translate(errorCode['default']))
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        ElMessageBox.confirm(translate('common.sessionExpired'), translate('common.systemTip'), { confirmButtonText: translate('common.relogin'), cancelButtonText: translate('common.cancel'), type: 'warning' }).then(() => {
          isRelogin.show = false
          useUserStore().logOut().then(() => {
            location.href = '/index'
          })
      }).catch(() => {
        isRelogin.show = false
      })
    }
      return Promise.reject(translate('common.invalidSession'))
    } else if (code === 500) {
      if (!res?.config?.noMsg) {
        ElMessage({ message: msg, type: 'error' })
      }
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return  Promise.resolve(res.data)
    }
  },
  (error: any) => {
    console.log('err' + error)
    let { message } = error
    if (message == "Network Error") {
      message = translate('common.backendConnectError')
    } else if (message.includes("timeout")) {
      message = translate('common.apiTimeout')
    } else if (message.includes("Request failed with status code")) {
      message = translate('common.apiError', { status: message.slice(-3) })
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url: string, params: any, filename: string, config?: any) {
  downloadLoadingInstance = ElLoading.service({ text: translate('common.downloadingData'), background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params: any) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data: any) => {
    const isBlob = blobValidate(data)
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text()
      const rspObj = JSON.parse(resText)
      const errMsg = errorCode[rspObj.code] ? translate(errorCode[rspObj.code]) : (rspObj.msg || translate(errorCode['default']))
      ElMessage.error(errMsg)
    }
    downloadLoadingInstance.close()
  }).catch((r: any) => {
    console.error(r)
    ElMessage.error(translate('common.downloadError'))
    downloadLoadingInstance.close()
  })
}

export default service
