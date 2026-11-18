<template>
  <div>
    <el-dropdown trigger="click" @command="handleSetSize">
      <div class="size-icon--style">
        <svg-icon class-name="size-icon" icon-class="size" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size === item.value" :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import useAppStore from "@/store/modules/app"

interface SizeOption {
  label: string
  value: 'large' | 'default' | 'small'
}

const appStore = useAppStore()
const size = computed(() => appStore.size)
const { proxy } = getCurrentInstance()
const sizeOptions = computed<SizeOption[]>(() => [
  { label: proxy.$t('common.sizeLarge'), value: "large" },
  { label: proxy.$t('common.sizeDefault'), value: "default" },
  { label: proxy.$t('common.sizeSmall'), value: "small" },
])

function handleSetSize(size: 'large' | 'default' | 'small'): void {
  proxy.$modal.loading(proxy.$t('common.settingLayoutSize'))
  appStore.setSize(size)
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
</script>

<style lang='scss' scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>