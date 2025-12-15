<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { reactive } from 'vue'

const themeConfig = reactive({
  token: {
    colorPrimary: '#007aff',
    borderRadius: 12,
    fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #f8f8f8;
  color: #1d1d1f;
  line-height: 1.47059;
  font-weight: 400;
  letter-spacing: -0.022em;
}

#app {
  min-height: 100vh;
}

/* 苹果风格滚动条 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 全局按钮样式优化 */
.ant-btn {
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ant-btn-primary {
  background: #007aff;
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.ant-btn-primary:hover {
  background: #0051d5;
  border-color: #0051d5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

/* 全局输入框样式 */
.ant-input,
.ant-input-affix-wrapper,
.ant-picker {
  border-radius: 12px;
  border-color: rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ant-input:hover,
.ant-input-affix-wrapper:hover,
.ant-picker:hover {
  border-color: rgba(0, 0, 0, 0.2);
}

.ant-input:focus,
.ant-input-affix-wrapper-focused,
.ant-picker-focused {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* 全局卡片样式 */
.ant-card {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 全局表格样式 */
.ant-table {
  border-radius: 16px;
  overflow: hidden;
}

.ant-table-thead > tr > th {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-weight: 600;
  color: #1d1d1f;
}

.ant-table-tbody > tr:hover > td {
  background: rgba(0, 0, 0, 0.02);
}
</style>
