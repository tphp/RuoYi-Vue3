<template>
  <el-drawer :title="$t('user.detailTitle')" v-model="visible" direction="rtl" size="68%" append-to-body :before-close="handleClose" class="detail-drawer" :close-on-click-modal="true" :close-on-press-escape="true">
    <div v-loading="loading" class="drawer-content">
      <!-- 基本信息 -->
      <h4 class="section-header">{{ $t('common.basicInfo') }}</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.userName') }}：</label>
            <span class="info-value plaintext">{{ getNickName(info) }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.deptName') }}：</label>
            <span class="info-value plaintext">{{ getDeptName(info.dept) }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.phonenumber') }}：</label>
            <span class="info-value plaintext">{{ info.phonenumber }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.email') }}：</label>
            <span class="info-value plaintext">{{ info.email }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.loginAccount') }}：</label>
            <span class="info-value plaintext">{{ info.userName }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.userStatus') }}：</label>
            <span class="info-value plaintext">
              <el-tag size="small" :type="info.status === '0' ? 'success' : 'danger'">{{ info.status === '0' ? $t('user.normal') : $t('common.disable') }}</el-tag>
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.post') }}：</label>
            <span class="info-value plaintext">{{ postNames || $t('user.noPost') }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.userSex') }}：</label>
            <span class="info-value plaintext">{{ sexLabel }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="24">
          <div class="info-item full-width">
            <label class="info-label">{{ $t('user.role') }}：</label>
            <span class="info-value plaintext">{{ roleNames || $t('user.noRole') }}</span>
          </div>
        </el-col>
      </el-row>
      <!-- 其他信息 -->
      <h4 class="section-header">{{ $t('user.otherInfo') }}</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.createBy') }}：</label>
            <span class="info-value plaintext">{{ info.createBy }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('common.createTime') }}：</label>
            <span class="info-value plaintext">{{ info.createTime }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.updateBy') }}：</label>
            <span class="info-value plaintext">{{ info.updateBy }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('common.updateTime') }}：</label>
            <span class="info-value plaintext">{{ info.updateTime }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.lastLoginIp') }}：</label>
            <span class="info-value plaintext">{{ info.loginIp }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('user.lastLoginTime') }}：</label>
            <span class="info-value plaintext">{{ info.loginDate }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="24">
          <div class="info-item full-width">
            <label class="info-label">{{ $t('common.remark') }}：</label>
            <span class="info-value plaintext">{{ info.remark }}</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { getUser } from '@/api/system/user'
import type { SysUser } from '@/types/api/system/user'
import type { SysRole } from '@/types/api/system/role'
import type { SysPost } from '@/types/api/system/post'
import { translate } from '@/locales'
import { getDeptName, getNickName } from '@/utils/ruoyi'

const visible = ref<boolean>(false)
const loading = ref<boolean>(false)
const info = reactive<SysUser>({})
const postOptions = ref<SysPost[]>([])
const roleOptions = ref<SysRole[]>([])

const { sys_user_sex } = useDict("sys_user_sex")

const sexLabel = computed(() => selectDictLabel(sys_user_sex.value, info.sex) || '-')

const postNames = computed<string>(() => {
  if (!postOptions.value.length || !info.postIds) return ''
  return postOptions.value.filter((p: SysPost) => info.postIds?.includes(p.postId)).map((p: SysPost) => p.postName).join(translate('common.listSeparator')) || ''
})

const roleNames = computed<string>(() => {
  if (!roleOptions.value.length || !info.roleIds) return ''
  return roleOptions.value.filter((r: SysRole) => info.roleIds?.includes(r.roleId)).map((r: SysRole) => r.roleName).join(translate('common.listSeparator')) || ''
})

const open = async (userId: number): Promise<void> => {
  visible.value = true
  loading.value = true
  try {
    const res = await getUser(userId)
    Object.assign(info, res.data || {})
    postOptions.value = res.posts || []
    roleOptions.value = res.roles || []
    info.postIds = res.postIds || []
    info.roleIds = res.roleIds || []
  } catch (error) {
    console.error(translate('user.fetchFailed'), error)
  } finally {
    loading.value = false
  }
}

const handleClose = (): void => {
  visible.value = false
}

defineExpose({
  open
})
</script>
