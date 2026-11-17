<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item :label="$t('user.nickName')" prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item :label="$t('user.phonenumber')" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item :label="$t('user.email')" prop="email">
         <el-input v-model="form.email" maxlength="50" />
      </el-form-item>
      <el-form-item :label="$t('user.sex')">
         <el-radio-group v-model="form.sex">
            <el-radio value="0">{{ $t('user.male') }}</el-radio>
            <el-radio value="1">{{ $t('user.female') }}</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">{{ $t('common.save') }}</el-button>
      <el-button type="danger" @click="close">{{ $t('common.close') }}</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup lang="ts">
import { updateUserProfile } from "@/api/system/user"
import type { SysUser } from '@/types/api/system/user'

interface Props {
  user?: SysUser
}

const props = defineProps<Props>()

const { proxy } = getCurrentInstance()

const form = ref<SysUser>({})
const rules = {
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
}

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate((valid: boolean) => {
    if (valid) {
      updateUserProfile(form.value).then(() => {
        proxy.$modal.msgSuccess(proxy.$t('common.editSuccess'))
        if (props.user) {
          props.user.phonenumber = form.value.phonenumber
          props.user.email = form.value.email
        }
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}

// 回显当前登录用户信息
watch(() => props.user, (user: SysUser) => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
  }
},{ immediate: true })
</script>
