<template>
  <a-layout class="layout">
    <!-- 头部 -->
    <a-layout-header class="header">
      <div class="header-content">
        <div class="header-brand">
          <Logo size="small" />
          <h1>Moka</h1>
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
        <!-- 页面标题 -->
        <div class="page-header">
          <div>
            <h2 class="page-title">我的项目</h2>
            <p class="page-subtitle">管理和维护您的 Mock API 项目</p>
          </div>
          <a-button v-if="projectList.length > 0" type="primary" size="large" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            新建项目
          </a-button>
        </div>

        <!-- 项目卡片列表 -->
        <a-spin :spinning="loading">
          <div v-if="projectList.length === 0" class="empty-state">
            <a-empty description="暂无项目">
              <a-button type="primary" @click="showAddModal">
                <template #icon><PlusOutlined /></template>
                创建第一个项目
              </a-button>
            </a-empty>
          </div>

          <div v-else class="project-grid">
            <div
              v-for="project in projectList"
              :key="project.id"
              class="project-card"
              @click="goToProject(project.id)"
            >
              <div class="project-card-header">
                <div class="project-icon" :style="{ background: project.color }">
                  {{ project.icon }}
                </div>
                <a-dropdown :trigger="['click']" @click.stop>
                  <a class="project-actions" @click.prevent>
                    <MoreOutlined />
                  </a>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="handleEdit(project)">
                        <EditOutlined /> 编辑
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item danger @click="handleDelete(project)">
                        <DeleteOutlined /> 删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>

              <div class="project-card-body">
                <h3 class="project-name">{{ project.name }}</h3>
                <p class="project-description">
                  {{ project.description || '暂无描述' }}
                </p>
              </div>

              <div class="project-card-footer">
                <div class="project-stat">
                  <ApiOutlined />
                  <span>{{ project.apiCount || 0 }} 个接口</span>
                </div>
                <div class="project-date">
                  {{ formatDate(project.updated_at) }}
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </a-layout-content>

    <!-- 添加/编辑项目 Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑项目' : '新建项目'"
      @ok="handleSave"
    >
      <a-form :model="form" layout="vertical" class="project-form">
        <a-form-item label="项目名称" required>
          <a-input v-model:value="form.name" placeholder="请输入项目名称" size="large" />
        </a-form-item>

        <a-form-item label="项目描述">
          <a-textarea
            v-model:value="form.description"
            placeholder="请输入项目描述（可选）"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="图标">
          <div class="icon-selector">
            <div
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-option"
              :class="{ selected: form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </div>
          </div>
        </a-form-item>

        <a-form-item label="主题色">
          <div class="color-selector">
            <div
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ selected: form.color === color }"
              :style="{ background: color }"
              @click="form.color = color"
            />
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  ExclamationCircleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import Logo from '@/components/Logo.vue'
import axios from 'axios'
import request from '@/api'
import { createVNode } from 'vue'
import { reportTracking } from '@/utils/tracking'

const router = useRouter()
const loading = ref(false)
const projectList = ref([])
const modalVisible = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  description: '',
  icon: '📦',
  color: '#11998e'
})

const iconOptions = ['📦', '🚀', '💡', '🎯', '🔧', '⚡', '🌟', '🎨', '📱', '💻', '🔬', '🎮']
const colorOptions = [
  '#11998e',
  '#667eea',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#feca57',
  '#ff6b6b',
  '#5f27cd',
  '#00d2d3'
]

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
  window.open('/admin', '_blank')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('mock_platform_token')
  localStorage.removeItem('mock_platform_user')
  message.success('已退出登录')
  router.push('/login')
}

// 加载项目列表
const loadProjects = async () => {
  loading.value = true
  try {
    // 传递当前用户信息，只加载该用户的项目
    const res = await request.get('/projects', {
      params: { username: username.value }
    })
    projectList.value = res.data
    
    // 上报项目查询埋点
    await reportTracking('project_query', {
      success: true,
      projectCount: projectList.value?.length || 0
    })
  } catch (error) {
    message.error('加载失败')
    
    // 上报项目查询失败埋点
    await reportTracking('project_query', {
      success: false,
      error: '加载失败'
    })
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 跳转到项目
const goToProject = (projectId) => {
  router.push(`/project/${projectId}`)
}

// 显示添加 Modal
const showAddModal = () => {
  editingId.value = null
  form.value = {
    name: '',
    description: '',
    icon: '📦',
    color: '#11998e'
  }
  modalVisible.value = true
}

// 编辑项目
const handleEdit = (project) => {
  editingId.value = project.id
  form.value = {
    name: project.name,
    description: project.description,
    icon: project.icon,
    color: project.color
  }
  modalVisible.value = true
}

// 保存项目
const handleSave = async () => {
  if (!form.value.name) {
    message.error('请输入项目名称')
    return
  }

  try {
    if (editingId.value) {
      // 更新项目时添加当前用户信息用于权限校验
      await request.put(`/projects/${editingId.value}`, {
        ...form.value,
        username: username.value
      })
      message.success('更新成功')
      
      // 上报更新项目埋点
      await reportTracking('project_update', {
        projectId: editingId.value,
        projectName: form.value.name,
        success: true
      })
    } else {
      // 创建项目时添加当前用户信息
      await request.post('/projects', {
        ...form.value,
        username: username.value
      })
      message.success('创建成功')
      
      // 上报创建项目埋点
      await reportTracking('project_create', {
        projectName: form.value.name,
        success: true
      })
    }
    modalVisible.value = false
    loadProjects()
  } catch (error) {
    if (error.response?.status === 403) {
      message.error('无权操作该项目')
    } else {
      message.error('操作失败')
    }
    
    // 上报项目操作失败埋点
    await reportTracking(editingId.value ? 'project_update' : 'project_create', {
      projectId: editingId.value,
      projectName: form.value.name,
      success: false,
      error: error.response?.status === 403 ? '无权操作' : '操作失败'
    })
  }
}

// 删除项目
const handleDelete = (project) => {
  Modal.confirm({
    title: '确认删除项目',
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode('div', { style: 'color: #6b7280;' }, [
      createVNode('p', {}, `确定要删除项目「${project.name}」吗？`),
      createVNode('p', { style: 'margin-top: 8px; font-weight: 500; color: #ef4444;' }, '删除后，该项目下的所有 API 接口也将被删除，此操作无法撤销！')
    ]),
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      try {
        // 删除项目时传递当前用户信息用于权限校验
        await request.delete(`/projects/${project.id}`, {
          params: { username: username.value }
        })
        message.success('删除成功')
        
        // 上报删除项目埋点
        await reportTracking('project_delete', {
          projectId: project.id,
          projectName: project.name,
          success: true
        })
        
        loadProjects()
      } catch (error) {
        if (error.response?.status === 403) {
          message.error('无权删除该项目')
        } else {
          message.error('删除失败')
        }
        
        // 上报删除项目失败埋点
        await reportTracking('project_delete', {
          projectId: project.id,
          projectName: project.name,
          success: false,
          error: error.response?.status === 403 ? '无权删除' : '删除失败'
        })
      }
    }
  })
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
/* 使用系统字体栈 */
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #fafafa 100%);
}

/* 头部样式 */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* 内容区域 */
.content {
  padding: 48px 32px;
  min-height: calc(100vh - 64px);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* 空状态 */
.empty-state {
  padding: 120px 20px;
  text-align: center;
}

/* 项目网格 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

/* 适配不同屏幕尺寸 */
@media (max-width: 1600px) {
  .project-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1280px) {
  .project-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 项目卡片 */
.project-card {
  background: #fafafa;
  border-radius: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.project-card:hover {
  border-color: rgba(17, 153, 142, 0.3);
  box-shadow: 0 12px 32px rgba(17, 153, 142, 0.15);
  transform: translateY(-4px);
}

.project-card:hover::before {
  opacity: 1;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-actions {
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.project-actions:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.project-card-body {
  margin-bottom: 16px;
}

.project-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.project-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 39px;
}

.project-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.project-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #11998e;
}

.project-date {
  font-size: 12px;
  color: #9ca3af;
}

/* 图标选择器 */
.icon-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.icon-option {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.icon-option:hover {
  background: #f3f4f6;
  transform: scale(1.05);
}

.icon-option.selected {
  border-color: #11998e;
  background: rgba(17, 153, 142, 0.1);
}

/* 颜色选择器 */
.color-selector {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 3px solid transparent;
  position: relative;
}

.color-option:hover {
  transform: scale(1.05);
}

.color-option.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px #11998e;
}

.color-option.selected::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
  font-weight: bold;
}

/* 响应式设计 - 全面优化 */

/* 超大屏幕 (>1920px) */
@media (min-width: 1920px) {
  .container {
    max-width: 1600px;
  }
}

/* 平板横屏和小桌面 (768px - 1024px) */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 24px;
  }

  .content {
    padding: 32px 24px;
  }

  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 15px;
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

  .content {
    padding: 24px 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .project-grid {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }

  .project-card {
    padding: 18px;
  }

  .user-dropdown span {
    display: none;
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
    padding: 20px 12px;
    min-height: calc(100vh - 56px);
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .project-card {
    padding: 16px;
  }

  .project-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 10px;
  }

  .project-name {
    font-size: 16px;
  }

  .project-description {
    font-size: 12px;
  }

  .project-stat {
    font-size: 12px;
  }

  .project-date {
    font-size: 11px;
  }
}

/* 小手机 (<480px) */
@media (max-width: 480px) {
  .header-brand {
    gap: 8px;
  }

  .page-title {
    font-size: 22px;
  }

  :deep(.ant-btn-lg) {
    height: 40px;
    font-size: 14px;
    padding: 0 16px;
  }

  .empty-state {
    padding: 80px 12px;
  }
}

/* 确认弹窗样式优化 */
:deep(.ant-modal-confirm) {
  .ant-modal-content {
    border-radius: 16px;
  }

  .ant-modal-body {
    padding: 32px;
  }

  .ant-modal-confirm-title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }

  .ant-modal-confirm-content {
    margin-top: 16px;
    font-size: 14px;
    line-height: 1.6;
  }

  .ant-modal-confirm-btns {
    margin-top: 24px;
  }

  .ant-btn {
    height: 40px;
    border-radius: 10px;
    font-weight: 600;
    padding: 0 24px;
  }
}
</style>
