<template>
  <a-layout class="layout">
    <!-- 头部 -->
    <a-layout-header class="header">
      <div class="header-content">
        <div class="header-brand">
          <Logo size="small" />
          <h1>Moka</h1>
          <a-button type="text" class="back-button" @click="goBack">
            <template #icon><ArrowLeftOutlined /></template>
            返回项目列表
          </a-button>
        </div>
        <div class="user-info">
          <a-dropdown>
            <a class="user-dropdown" @click.prevent>
              <UserOutlined />
              <span>{{ username }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="userRole === 'admin'" @click="goToAdmin">
                  <SettingOutlined />
                  管理后台
                </a-menu-item>
                <a-menu-divider v-if="userRole === 'admin'" />
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>

    <!-- 内容 -->
    <a-layout-content class="content">
      <div class="container">
        <!-- 项目基础信息 -->
        <a-card class="project-info-card">
          <div class="project-info-header">
            <div class="project-base-url">
              <span class="label">接口基础地址：</span>
              <span class="url-text">{{ baseUrl }}/{{ projectId }}</span>
              <a-button size="small" @click="copyBaseUrl" class="copy-btn">
                <template #icon><CopyOutlined /></template>
                复制
              </a-button>
            </div>
          </div>
        </a-card>

        <!-- 控制栏 -->
        <a-card class="control-card">
          <a-space :size="16" wrap>
            <a-space>
              <span>Mock 状态:</span>
              <a-switch
                v-model:checked="globalEnabled"
                @change="handleGlobalToggle"
                checked-children="开"
                un-checked-children="关"
              />
              <span>{{ globalEnabled ? '已启用' : '已禁用' }}</span>
            </a-space>

            <a-button type="primary" @click="goToAddApi">
              <template #icon><PlusOutlined /></template>
              添加 Mock API
            </a-button>

            <a-button @click="handleExport">
              <template #icon><ExportOutlined /></template>
              导出配置
            </a-button>

            <a-button @click="showImportModal">
              <template #icon><ImportOutlined /></template>
              导入配置
            </a-button>

            <a-button danger @click="handleClearLogs">
              <template #icon><DeleteOutlined /></template>
              清空日志
            </a-button>
          </a-space>
        </a-card>

        <!-- 标签页 -->
        <a-tabs v-model:activeKey="activeTab" class="tabs">
          <!-- Mock APIs -->
          <a-tab-pane key="apis" tab="Mock APIs">
            <!-- 搜索框 -->
            <div class="search-bar">
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索接口名称或路径..."
                allow-clear
                enter-button="搜索"
                size="large"
                style="max-width: 400px"
              />
            </div>

            <a-spin :spinning="loading">
              <div v-if="filteredMockList.length === 0" class="empty">
                <a-empty :description="searchKeyword ? '未找到匹配的接口' : '暂无 Mock API，点击上方按钮添加'" />
              </div>

              <div v-else>
                <div class="mock-list">
                  <a-card
                    v-for="mock in paginatedMockList"
                    :key="mock.id"
                    class="mock-item"
                    :class="{ disabled: !mock.enabled }"
                  >
                    <div class="mock-header">
                      <div class="mock-title">
                        <a-tag :color="getMethodColor(mock.method)">
                          {{ mock.method }}
                        </a-tag>
                        <strong>{{ mock.name }}</strong>
                      </div>
                      <a-space>
                        <a-button size="small" @click="copyApiUrl(mock)" title="复制完整地址">
                          <template #icon><CopyOutlined /></template>
                        </a-button>
                        <a-button size="small" @click="handleToggle(mock)">
                          {{ mock.enabled ? '禁用' : '启用' }}
                        </a-button>
                        <a-button size="small" @click="handleEdit(mock)">
                          编辑
                        </a-button>
                        <a-button size="small" danger @click="handleDelete(mock)">
                          删除
                        </a-button>
                      </a-space>
                    </div>

                    <div class="mock-url" @click="copyApiUrl(mock)" title="点击复制完整地址">
                      {{ mock.url }}
                      <CopyOutlined class="copy-icon" />
                    </div>

                    <div class="mock-info">
                      状态码: {{ mock.status }} | 延迟: {{ mock.delay }}ms
                    </div>
                  </a-card>
                </div>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                  <a-pagination
                    v-model:current="apiPagination.current"
                    v-model:page-size="apiPagination.pageSize"
                    :total="filteredMockList.length"
                    :show-size-changer="true"
                    :show-total="total => `共 ${total} 条`"
                    :page-size-options="['10', '20', '50', '100']"
                  />
                </div>
              </div>
            </a-spin>
          </a-tab-pane>

          <!-- 请求日志 -->
          <a-tab-pane key="logs" tab="请求日志">
            <a-spin :spinning="logsLoading">
              <div v-if="logList.length === 0" class="empty">
                <a-empty description="暂无请求日志" />
              </div>

              <div v-else>
                <div class="log-list">
                  <div v-for="log in paginatedLogList" :key="log.id" class="log-item">
                    <div class="log-header">
                      <div>
                        <a-tag :color="getMethodColor(log.method)">
                          {{ log.method }}
                        </a-tag>
                        <strong>{{ log.mock_name || '未匹配' }}</strong>
                      </div>
                      <a-tag :color="log.status >= 200 && log.status < 300 ? 'success' : 'error'">
                        {{ log.status }}
                      </a-tag>
                    </div>
                    <div class="log-url">{{ log.url }}</div>
                    <div class="log-time">{{ formatTime(log.created_at) }}</div>
                  </div>
                </div>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                  <a-pagination
                    v-model:current="logPagination.current"
                    v-model:page-size="logPagination.pageSize"
                    :total="logList.length"
                    :show-size-changer="true"
                    :show-total="total => `共 ${total} 条`"
                    :page-size-options="['10', '20', '50', '100']"
                  />
                </div>
              </div>
            </a-spin>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-layout-content>

    <!-- 导入 Modal -->
    <a-modal
      v-model:open="importModalVisible"
      title="导入配置"
      @ok="handleImport"
    >
      <a-textarea
        v-model:value="importText"
        :rows="10"
        placeholder="粘贴导出的 JSON 配置"
        style="font-family: monospace"
      />
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { mockApi, logApi, settingApi, configApi } from '@/api'
import Logo from '@/components/Logo.vue'
import axios from 'axios'
import request from '@/api'
import { reportTracking } from '@/utils/tracking'

const router = useRouter()
const route = useRoute()
const projectId = computed(() => route.params.id)

// 用户信息
const username = computed(() => {
  const userInfo = localStorage.getItem('mock_platform_user')
  if (userInfo) {
    try {
      return JSON.parse(userInfo).username
    } catch {
      return 'admin'
    }
  }
  return 'admin'
})

// 用户角色
const userRole = computed(() => {
  const userInfo = localStorage.getItem('mock_platform_user')
  if (userInfo) {
    try {
      return JSON.parse(userInfo).role || 'user'
    } catch {
      return 'user'
    }
  }
  return 'user'
})

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('mock_platform_token')
  localStorage.removeItem('mock_platform_user')
  message.success('已退出登录')
  router.push('/login')
}

// 返回项目列表
const goBack = () => {
  router.push('/home')
}

const activeTab = ref('apis')
const loading = ref(false)
const logsLoading = ref(false)
const globalEnabled = ref(true)
const mockList = ref([])
const logList = ref([])
const baseUrl = ref('')
const searchKeyword = ref('')

// 分页
const apiPagination = ref({
  current: 1,
  pageSize: 10
})

const logPagination = ref({
  current: 1,
  pageSize: 20
})

// 过滤后的 Mock 列表（根据搜索关键词）
const filteredMockList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return mockList.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return mockList.value.filter(mock => {
    return mock.name.toLowerCase().includes(keyword) ||
           mock.url.toLowerCase().includes(keyword)
  })
})

// 计算分页后的数据
const paginatedMockList = computed(() => {
  const start = (apiPagination.value.current - 1) * apiPagination.value.pageSize
  const end = start + apiPagination.value.pageSize
  return filteredMockList.value.slice(start, end)
})

const paginatedLogList = computed(() => {
  const start = (logPagination.value.current - 1) * logPagination.value.pageSize
  const end = start + logPagination.value.pageSize
  return logList.value.slice(start, end)
})

// Modal
const importModalVisible = ref(false)
const importText = ref('')

// 方法颜色
const getMethodColor = (method) => {
  const colors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    DELETE: 'red'
  }
  return colors[method] || 'default'
}

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 获取完整 URL
const getFullUrl = (path) => {
  // 如果已经是完整 URL，直接返回
  if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path
  }
  // 否则拼接基础 URL 和项目 ID
  const url = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl.value}/${projectId.value}${url}`
}

// 加载 Mock 列表
const loadMocks = async () => {
  loading.value = true
  try {
    // 基于项目 ID 加载 API
    const res = await request.get(`/projects/${projectId.value}/mocks`)
    mockList.value = res.data
    
    // 上报接口查询埋点
    await reportTracking('api_query', {
      projectId: projectId.value,
      success: true,
      apiCount: mockList.value?.length || 0
    })
  } catch (error) {
    message.error('加载失败')
    
    // 上报接口查询失败埋点
    await reportTracking('api_query', {
      projectId: projectId.value,
      success: false,
      error: '加载失败'
    })
  } finally {
    loading.value = false
  }
}

// 加载日志
const loadLogs = async () => {
  logsLoading.value = true
  try {
    const res = await logApi.getAll(100, projectId.value)
    logList.value = res.data
  } catch (error) {
    message.error('加载日志失败')
  } finally {
    logsLoading.value = false
  }
}

// 加载全局状态
const loadGlobalStatus = async () => {
  try {
    const res = await settingApi.getEnabled()
    globalEnabled.value = res.data.enabled
  } catch (error) {
    console.error('加载全局状态失败', error)
  }
}

// 加载基础 URL
const loadBaseUrl = async () => {
  try {
    const res = await request.get('/config/base-url')
    baseUrl.value = res.data.baseUrl
  } catch (error) {
    console.error('加载基础 URL 失败', error)
  }
}

// 切换全局状态
const handleGlobalToggle = async () => {
  try {
    await settingApi.setEnabled(globalEnabled.value)
    message.success(globalEnabled.value ? 'Mock 已启用' : 'Mock 已禁用')
  } catch (error) {
    message.error('操作失败')
    globalEnabled.value = !globalEnabled.value
  }
}

// 跳转到新建 API 页面
const goToAddApi = () => {
  router.push(`/project/${projectId.value}/api/new`)
}

// 跳转到编辑 API 页面
const handleEdit = (mock) => {
  router.push(`/project/${projectId.value}/api/${mock.id}/edit`)
}

// 切换状态
const handleToggle = async (mock) => {
  try {
    await mockApi.toggle(mock.id)
    message.success('状态已更新')
    
    // 上报切换接口状态埋点
    await reportTracking('api_toggle', {
      apiId: mock.id,
      apiName: mock.name,
      enabled: !mock.enabled,
      projectId: projectId.value,
      success: true
    })
    
    loadMocks()
  } catch (error) {
    message.error('操作失败')
    
    // 上报切换接口状态失败埋点
    await reportTracking('api_toggle', {
      apiId: mock.id,
      apiName: mock.name,
      projectId: projectId.value,
      success: false,
      error: '操作失败'
    })
  }
}

// 删除
const handleDelete = async (mock) => {
  try {
    await mockApi.delete(mock.id)
    message.success('删除成功')
    
    // 上报删除接口埋点
    await reportTracking('api_delete', {
      apiId: mock.id,
      apiName: mock.name,
      projectId: projectId.value,
      success: true
    })
    
    loadMocks()
  } catch (error) {
    message.error('删除失败')
    
    // 上报删除接口失败埋点
    await reportTracking('api_delete', {
      apiId: mock.id,
      apiName: mock.name,
      projectId: projectId.value,
      success: false,
      error: '删除失败'
    })
  }
}

// 导出
const handleExport = async () => {
  try {
    const res = await configApi.export()
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mock-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
  }
}

// 显示导入 Modal
const showImportModal = () => {
  importText.value = ''
  importModalVisible.value = true
}

// 导入
const handleImport = async () => {
  try {
    const config = JSON.parse(importText.value)
    await configApi.import(config)
    message.success('导入成功')
    importModalVisible.value = false
    loadMocks()
    loadGlobalStatus()
  } catch (error) {
    message.error('导入失败，请检查格式')
  }
}

// 清空日志
const handleClearLogs = async () => {
  try {
    await logApi.clear()
    message.success('日志已清空')
    loadLogs()
  } catch (error) {
    message.error('清空失败')
  }
}

// 复制基础地址
const copyBaseUrl = async () => {
  const url = `${baseUrl.value}/${projectId.value}`
  try {
    await navigator.clipboard.writeText(url)
    message.success('基础地址已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

// 复制接口完整地址
const copyApiUrl = async (mock) => {
  const fullUrl = getFullUrl(mock.url)
  try {
    await navigator.clipboard.writeText(fullUrl)
    message.success('接口地址已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

// 初始化
onMounted(() => {
  loadBaseUrl()
  loadMocks()
  loadLogs()
  loadGlobalStatus()

  // 定时刷新日志
  setInterval(() => {
    if (activeTab.value === 'logs') {
      loadLogs()
    }
  }, 3000)
})
</script>

<style scoped>
/* 使用系统字体栈 - 苹果和 Google 风格 */
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #fafafa 100%);
}

/* 头部优化 - 更现代的设计 */
.header {
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 100%;
  padding: 0 32px;
  height: 64px;
  color: #1f2937;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  color: #374151;
  font-weight: 500;
  padding: 8px 12px;
  margin-left: 16px;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover {
  background: rgba(17, 153, 142, 0.08);
  color: #11998e;
}

.header-content h1 {
  margin: 0;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
}

.user-dropdown:hover {
  background: rgba(17, 153, 142, 0.08);
  transform: translateY(-1px);
}

/* 内容区域优化 */
.content {
  padding: 32px;
  min-height: calc(100vh - 64px);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

/* 项目信息卡片 */
.project-info-card {
  margin-bottom: 20px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  background: linear-gradient(135deg, rgba(17, 153, 142, 0.03) 0%, rgba(56, 239, 125, 0.03) 100%);
}

.project-info-card :deep(.ant-card-body) {
  padding: 20px 24px;
}

.project-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-base-url {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.project-base-url .label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.project-base-url .url-text {
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #11998e;
  background: rgba(17, 153, 142, 0.08);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(17, 153, 142, 0.2);
}

.project-base-url .copy-btn {
  border-radius: 8px;
  font-weight: 600;
}

.project-base-url .copy-btn:hover {
  color: #11998e;
  border-color: #11998e;
}

/* 控制卡片优化 - Material Design 3 风格 */
.control-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.control-card :deep(.ant-card-body) {
  padding: 20px 24px;
}

/* 标签页优化 */
.tabs {
  background: #fafafa;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.tabs :deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

.tabs :deep(.ant-tabs-tab) {
  font-size: 15px;
  font-weight: 600;
  padding: 12px 16px;
}

.tabs :deep(.ant-tabs-ink-bar) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  height: 3px;
  border-radius: 3px 3px 0 0;
}

/* 搜索框 */
.search-bar {
  margin-bottom: 24px;
}

.search-bar :deep(.ant-input-search-large) {
  font-size: 16px;
}

.search-bar :deep(.ant-input-search-button) {
  height: 40px;
}

.search-bar :deep(.ant-input-group-addon) {
  padding: 0;
}

.search-bar :deep(.ant-btn) {
  height: 40px;
}

/* 空状态优化 */
.empty {
  padding: 80px 20px;
  text-align: center;
}

.empty :deep(.ant-empty-description) {
  color: #6b7280;
  font-size: 15px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  padding: 24px 0;
}

:deep(.ant-pagination) {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mock 列表优化 */
.mock-list {
  display: grid;
  gap: 16px;
}

.mock-item {
  border-radius: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.mock-item:hover {
  border-color: rgba(17, 153, 142, 0.3);
  box-shadow: 0 8px 24px rgba(17, 153, 142, 0.12);
  transform: translateY(-2px);
}

.mock-item.disabled {
  opacity: 0.5;
}

.mock-item :deep(.ant-card-body) {
  padding: 20px 24px;
}

.mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mock-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
}

.mock-title :deep(.ant-tag) {
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  padding: 2px 10px;
  border: none;
}

.mock-url {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
  color: #11998e;
  background: rgba(17, 153, 142, 0.06);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.6;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mock-url:hover {
  background: rgba(17, 153, 142, 0.12);
  transform: translateX(2px);
}

.mock-url .copy-icon {
  opacity: 0;
  transition: opacity 0.2s;
  color: #11998e;
  font-size: 12px;
  flex-shrink: 0;
}

.mock-url:hover .copy-icon {
  opacity: 1;
}

.mock-info {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* 日志列表优化 */
.log-list {
  display: grid;
  gap: 12px;
}

.log-item {
  padding: 20px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
}

.log-item:hover {
  border-color: rgba(17, 153, 142, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-header > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-header :deep(.ant-tag) {
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  padding: 2px 10px;
  border: none;
}

.log-url {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
  color: #11998e;
  background: rgba(17, 153, 142, 0.06);
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* 按钮优化 */
:deep(.ant-btn) {
  border-radius: 10px;
  font-weight: 600;
  height: 36px;
  padding: 0 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(17, 153, 142, 0.25);
}

:deep(.ant-btn-primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.35);
}

:deep(.ant-btn-default) {
  border: 1.5px solid rgba(0, 0, 0, 0.1);
}

:deep(.ant-btn-default:hover) {
  border-color: #11998e;
  color: #11998e;
}

:deep(.ant-btn-dangerous) {
  border: 1.5px solid #fee;
}

:deep(.ant-btn-dangerous:hover) {
  transform: translateY(-1px);
}

/* Switch 优化 */
:deep(.ant-switch-checked) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

/* Modal 优化 */
:deep(.ant-modal-content) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.ant-modal-header) {
  border-radius: 20px 20px 0 0;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.ant-modal-body) {
  padding: 28px;
}

:deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

/* Form 优化 */
:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

:deep(.ant-input),
:deep(.ant-input-number),
:deep(.ant-select-selector),
:deep(.ant-input-number-input) {
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input:hover),
:deep(.ant-input-number:hover),
:deep(.ant-select-selector:hover) {
  border-color: #11998e;
}

:deep(.ant-input:focus),
:deep(.ant-input-number-focused),
:deep(.ant-select-focused .ant-select-selector) {
  border-color: #11998e;
  box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
}

:deep(.ant-input-number-input) {
  border: none;
}

/* 响应式设计 - 全面优化 */

/* 超大屏幕 (>1920px) */
@media (min-width: 1920px) {
  .container {
    max-width: 1600px;
  }
}

/* 平板横屏和小桌面 (768px - 1200px) */
@media (max-width: 1200px) {
  .container {
    max-width: 100%;
  }

  .header-content {
    padding: 0 24px;
  }

  .content {
    padding: 24px;
  }
}

/* 平板竖屏 (600px - 768px) */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .header-content h1 {
    font-size: 22px;
  }

  .back-button span {
    display: none;
  }

  .user-dropdown span {
    display: none;
  }

  .content {
    padding: 20px 16px;
  }

  .tabs {
    padding: 16px;
    border-radius: 12px;
  }

  .mock-item,
  .control-card {
    border-radius: 12px;
  }

  .control-card :deep(.ant-space) {
    width: 100%;
  }

  .control-card :deep(.ant-space-item) {
    width: 100%;
  }

  .control-card :deep(.ant-btn) {
    width: 100%;
  }

  .project-base-url {
    flex-wrap: wrap;
  }

  .project-base-url .url-text {
    font-size: 13px;
    padding: 6px 12px;
  }

  .mock-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .mock-header .mock-title {
    width: 100%;
  }

  .mock-header :deep(.ant-space) {
    width: 100%;
    justify-content: flex-start;
  }
}

/* 手机横屏 (480px - 600px) */
@media (max-width: 600px) {
  .header {
    height: 56px;
  }

  .header-content {
    height: 56px;
    padding: 0 12px;
  }

  .header-content h1 {
    font-size: 20px;
  }

  .content {
    padding: 16px 12px;
    min-height: calc(100vh - 56px);
  }

  .project-info-card {
    margin-bottom: 16px;
  }

  .project-info-card :deep(.ant-card-body) {
    padding: 16px;
  }

  .project-base-url .label {
    font-size: 13px;
  }

  .project-base-url .url-text {
    font-size: 12px;
    padding: 6px 10px;
  }

  .control-card {
    margin-bottom: 16px;
  }

  .control-card :deep(.ant-card-body) {
    padding: 16px;
  }

  .tabs {
    padding: 12px;
  }

  .tabs :deep(.ant-tabs-tab) {
    font-size: 14px;
    padding: 10px 12px;
  }

  .mock-item :deep(.ant-card-body) {
    padding: 16px;
  }

  .mock-title {
    font-size: 14px;
  }

  .mock-url {
    font-size: 12px;
    padding: 6px 10px;
  }

  .mock-info {
    font-size: 12px;
  }

  .log-item {
    padding: 16px;
  }

  .log-url {
    font-size: 12px;
  }

  :deep(.ant-modal) {
    max-width: calc(100vw - 32px);
    margin: 16px auto;
  }

  :deep(.ant-modal-body) {
    padding: 20px;
  }
}

/* 小手机 (<480px) */
@media (max-width: 480px) {
  .header-brand {
    gap: 8px;
  }

  .back-button {
    padding: 6px 8px;
    margin-right: 4px;
  }

  .content {
    padding: 12px 8px;
  }

  .control-card :deep(.ant-btn) {
    font-size: 13px;
    height: 32px;
    padding: 0 12px;
  }

  .tabs {
    padding: 10px;
  }

  .mock-header :deep(.ant-btn) {
    font-size: 12px;
    height: 28px;
    padding: 0 10px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 4px;
  }

  :deep(.ant-modal) {
    max-width: calc(100vw - 24px);
    margin: 12px auto;
  }

  :deep(.ant-modal-header),
  :deep(.ant-modal-body) {
    padding: 16px;
  }
}
</style>
