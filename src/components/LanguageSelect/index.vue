<template>
  <div>
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
import Cookies from 'js-cookie'
import { elementLocales } from '@/locales'

const { locale } = useI18n()

const languageOptions = [
  { value: 'zh-cn', label: '简体中文' },
  { value: 'en', label: 'English' },
]

function handleCommand(lang: string) {
  if (lang === locale.value) return
  locale.value = lang
  Cookies.set('locale', lang)
  const elementLocale = elementLocales[lang]
  if (elementLocale) {
    import('element-plus').then((ElementPlus) => {
      ElementPlus.useLocale(elementLocale)
    }).catch(() => {})
  }
  location.reload()
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
