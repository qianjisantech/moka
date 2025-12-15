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
            返回首页
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

    <!-- 主体内容 -->
    <a-layout class="main-layout">
      <!-- 左侧菜单 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :width="240"
        class="sider"
        :trigger="null"
        collapsible
      >
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          class="admin-menu"
          @click="handleMenuClick"
        >
          <a-sub-menu key="tracking-menu">
            <template #title>埋点管理</template>
            <a-menu-item key="tracking">
              <template #icon><BarChartOutlined /></template>
              <span>埋点记录</span>
            </a-menu-item>
            <a-menu-item key="tracking-report">
              <template #icon><LineChartOutlined /></template>
              <span>埋点报表</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item key="users">
            <template #icon><UserOutlined /></template>
            <span>用户管理</span>
          </a-menu-item>
          <a-menu-item key="projects">
            <template #icon><FolderOutlined /></template>
            <span>项目管理</span>
          </a-menu-item>
          <a-menu-item key="apis">
            <template #icon><ApiOutlined /></template>
            <span>接口管理</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <!-- 右侧主内容 -->
      <a-layout-content class="content">
        <div class="content-wrapper">
          <!-- 埋点记录 -->
          <TrackingManagement v-if="selectedKeys[0] === 'tracking'" />

          <!-- 埋点报表 -->
          <TrackingReport v-if="selectedKeys[0] === 'tracking-report'" />

          <!-- 用户管理 -->
          <UserManagement v-if="selectedKeys[0] === 'users'" />

          <!-- 项目管理 -->
          <ProjectManagement v-if="selectedKeys[0] === 'projects'" />

          <!-- 接口管理 -->
          <ApiManagement v-if="selectedKeys[0] === 'apis'" />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  FolderOutlined,
  ApiOutlined,
  LineChartOutlined
} from '@ant-design/icons-vue'
import Logo from '@/components/Logo.vue'
import TrackingManagement from '@/components/admin/TrackingManagement.vue'
import TrackingReport from '@/components/admin/TrackingReport.vue'
import UserManagement from '@/components/admin/UserManagement.vue'
import ProjectManagement from '@/components/admin/ProjectManagement.vue'
import ApiManagement from '@/components/admin/ApiManagement.vue'

const router = useRouter()
const collapsed = ref(false)
const selectedKeys = ref(['tracking'])
const openKeys = ref(['tracking-menu'])

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

// 菜单点击
const handleMenuClick = ({ key }) => {
  selectedKeys.value = [key]
}

// 返回首页
const goBack = () => {
  router.push('/home')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('mock_platform_token')
  localStorage.removeItem('mock_platform_user')
  message.success('已退出登录')
  router.push('/login')
}

// 检查权限
onMounted(() => {
  const userInfo = localStorage.getItem('mock_platform_user')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      if (user.role !== 'admin') {
        message.error('无权限访问管理后台')
        router.push('/home')
      }
    } catch {
      message.error('用户信息错误')
      router.push('/login')
    }
  } else {
    router.push('/login')
  }
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

/* 头部优化 - 和 Home 页面一样 */
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

/* 主体布局 */
.main-layout {
  min-height: calc(100vh - 64px);
}

/* 左侧菜单 */
.sider {
  background: rgba(250, 250, 250, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.admin-menu {
  height: 100%;
  border-right: none;
  padding: 16px 0;
}

.admin-menu :deep(.ant-menu-item) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-menu :deep(.ant-menu-item:hover) {
  background: rgba(17, 153, 142, 0.08);
  color: #11998e;
}

.admin-menu :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, rgba(17, 153, 142, 0.15) 0%, rgba(56, 239, 125, 0.15) 100%);
  color: #11998e;
  font-weight: 600;
}

.admin-menu :deep(.ant-menu-item-selected::after) {
  display: none;
}

.admin-menu :deep(.ant-menu-item-icon) {
  font-size: 18px;
  margin-right: 12px;
}

/* 右侧内容区域 */
.content {
  padding: 0;
  background: #f8f9fa;
  height: calc(100vh - 64px);
  overflow-y: auto;
  width: 100%;
}

.content-wrapper {
  width: 100%;
  height: 100%;
}

/* 响应式设计 */
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

  .sider {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 99;
  }

  .content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
