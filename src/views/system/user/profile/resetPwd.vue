<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="100px">
    <el-form-item :label="$t('profile.oldPassword')" prop="oldPassword">
      <el-input v-model="user.oldPassword" :placeholder="$t('profile.oldPasswordPlaceholder')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('profile.newPassword')" prop="newPassword" :rules="infoPwdValidator">
      <el-input v-model="user.newPassword" :placeholder="$t('profile.newPasswordPlaceholder')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('profile.confirmPassword')" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" :placeholder="$t('profile.confirmPasswordPlaceholder')" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">{{ $t('common.save') }}</el-button>
      <el-button type="danger" @click="close">{{ $t('common.close') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { usePasswordRule } from "@/utils/passwordRule"
import { updateUserPwd } from "@/api/system/user"

const { proxy } = getCurrentInstance()
const { infoPwdValidator } = usePasswordRule()

interface UserProfilePwd {
  // 旧密码
  oldPassword?: string
  // 新密码
  newPassword?: string
  // 确认密码
  confirmPassword?: string
}

const user = reactive<UserProfilePwd>({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (rule: any, value: string, callback: (error?: Error) => void): void => {
  if (user.newPassword !== value) {
    callback(new Error(proxy.$t('profile.passwordNotMatch')))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: () => proxy.$t('profile.oldPasswordRequired'), trigger: "blur" }],
  confirmPassword: [{ required: true, message: () => proxy.$t('profile.confirmPasswordRequired'), trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
}

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate((valid: boolean) => {
    if (valid) {
      updateUserPwd(user.oldPassword!, user.newPassword!).then(() => {
        proxy.$modal.msgSuccess(proxy.$t('common.editSuccess'))
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>
