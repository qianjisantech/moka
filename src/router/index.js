import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import ProjectList from '../views/ProjectList.vue'
import ApiEdit from '../views/ApiEdit.vue'
import Admin from '../views/Admin.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'ProjectList',
    component: ProjectList,
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:projectId/api/new',
    name: 'ApiNew',
    component: ApiEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:projectId/api/:apiId/edit',
    name: 'ApiEdit',
    component: ApiEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('mock_platform_token')
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin

  if (requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页，跳转到首页
    next('/')
  } else if (requiresAdmin && token) {
    // 检查管理员权限
    const userInfo = localStorage.getItem('mock_platform_user')
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo)
        if (user.role === 'admin') {
          next()
        } else {
          next('/home')
        }
      } catch {
        next('/login')
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
