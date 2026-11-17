<template>
  <div class="language-select">
    <el-dropdown trigger="click" @command="handleCommand">
      <svg-icon icon-class="language" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in languageOptions"
            :key="item.value"
            :command="item.value"
            :class="{ 'is-active': locale === item.value }"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/locales'

const { locale, t } = useI18n()

const languageOptions = computed(() => [
  { value: 'zh-cn', label: t('common.zhCn') },
  { value: 'en', label: t('common.en') },
])

function handleCommand(lang: string): void {
  if (lang === locale.value) return
  // 切换语言（不刷新页面）
  setLocale(lang)
}
</script>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.is-active {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}
:deep(.el-dropdown) {
  vertical-align: middle;
  margin-left: -10px;
  width: 25px;
  .svg-icon {
    font-size: 20px;
  }
}
</style>
