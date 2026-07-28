<template>
  <div class="sso">
    <div class="sso-card">
      <h3 class="title">{{ title }}</h3>
      <div class="sso-body">
        <el-icon
          class="sso-icon"
          :class="{ 'is-loading': loading, 'is-error': isError }"
        >
          <component :is="loading ? 'Loading' : statusIcon" />
        </el-icon>
        <p class="sso-text" :class="{ 'is-error': isError }">{{ message }}</p>
        <div v-if="errorMsg" class="sso-actions">
          <el-button type="primary" @click="goLogin">返回登录</el-button>
        </div>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ssoLogin } from '@/api/sso'
import { setToken } from '@/utils/auth'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const route = useRoute()
const router = useRouter()

const loading = ref<boolean>(true)
const message = ref<string>('正在验证身份，请稍候...')
const statusIcon = ref<string>('CircleCheck')
const errorMsg = ref<string>('')

const isError = computed<boolean>(() => !!errorMsg.value)

/**
 * 进入错误态
 */
function setErrorState(text: string): void {
  loading.value = false
  statusIcon.value = 'CircleCloseFilled'
  errorMsg.value = text
  message.value = text
}

/**
 * 解析 URL 中的 token 并发起 SSO 登录
 */
async function doSsoLogin(): Promise<void> {
  const token = (route.query?.token as string) || ''
  if (!token) {
    setErrorState('登录凭证缺失，无法完成单点登录')
    return
  }

  try {
    const res = await ssoLogin(token)
    if (res && res.token) {
      setToken(res.token)
      statusIcon.value = 'CircleCheck'
      message.value = '登录成功，正在跳转...'
      errorMsg.value = ''
      // 跳转到首页（保留其它 query 参数）
      const query = { ...route.query }
      delete query.token
      router.replace({ path: '/', query })
    } else {
      setErrorState(res?.msg || '登录失败')
    }
  } catch (err: any) {
    const msg = (err && (err.msg || err.message)) || '单点登录失败，请重试'
    setErrorState(msg)
  }
}

function goLogin(): void {
  router.replace({ path: '/login' })
}

onMounted(() => {
  doSsoLogin()
})
</script>

<style lang="scss" scoped>
.sso {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}

.sso-card {
  border-radius: 6px;
  background: #ffffff;
  width: 420px;
  padding: 30px 30px 20px 30px;
  text-align: center;
  z-index: 1;
}

.title {
  margin: 0 auto 25px;
  text-align: center;
  color: #707070;
}

.sso-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 20px;
}

.sso-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;

  &.is-loading {
    animation: rotating 2s linear infinite;
  }

  &.is-error {
    color: #f56c6c;
  }
}

.sso-text {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px;
  word-break: break-all;

  &.is-error {
    color: #f56c6c;
  }
}

.sso-actions {
  margin-top: 18px;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

html.dark .sso {
  background-image: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url("../assets/images/login-background.jpg");
  .sso-card {
    background: var(--el-bg-color-overlay) !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  }
}
</style>
