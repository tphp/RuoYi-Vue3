<template>
   <div class="app-container">
      <el-row :gutter="20">
         <el-col :span="6" :xs="24">
            <el-card class="box-card">
               <template v-slot:header>
                 <div class="clearfix">
                   <span>{{ $t('profile.personalInfo') }}</span>
                 </div>
               </template>
               <div>
                  <div class="text-center">
                     <userAvatar />
                  </div>
                  <ul class="list-group list-group-striped">
                     <li class="list-group-item">
                        <svg-icon icon-class="user" />{{ $t('user.userName') }}
                        <div class="pull-right">{{ state.user.userName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="phone" />{{ $t('user.phonenumber') }}
                        <div class="pull-right">{{ state.user.phonenumber }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="email" />{{ $t('user.userEmail') }}
                        <div class="pull-right">{{ state.user.email }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="tree" />{{ $t('user.deptName') }}
                        <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="peoples" />{{ $t('user.userRole') }}
                        <div class="pull-right">{{ state.roleGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="date" />{{ $t('user.createDate') }}
                        <div class="pull-right">{{ state.user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="18" :xs="24">
            <el-card>
               <template v-slot:header>
                 <div class="clearfix">
                   <span>{{ $t('profile.baseInfo') }}</span>
                 </div>
               </template>
               <el-tabs v-model="selectedTab">
                  <el-tab-pane :label="$t('profile.baseInfo')" name="userinfo">
                     <userInfo :user="state.user" />
                  </el-tab-pane>
                  <el-tab-pane :label="$t('profile.resetPwd')" name="resetPwd">
                     <resetPwd />
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup lang="ts" name="Profile">
import userAvatar from "./userAvatar.vue"
import userInfo from "./userInfo.vue"
import resetPwd from "./resetPwd.vue"
import { getUserProfile } from "@/api/system/user"
import type { SysUser } from '@/types/api/system/user'

const route = useRoute()
const selectedTab = ref<string>("userinfo")

interface UserProfileState {
  user: SysUser
  roleGroup: string
  postGroup: string
}

const state = reactive<UserProfileState>({
  user: {} as SysUser,
  roleGroup: '',
  postGroup: ''
})

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data
    state.roleGroup = response.roleGroup
    state.postGroup = response.postGroup
  })
}

onMounted(() => {
  const activeTab = route.params && route.params.activeTab
  if (activeTab) {
    selectedTab.value = activeTab as string
  }
  getUser()
})
</script>
