import axios from 'axios'

// 只使用你现在的 .env 写法：VITE_API_BASE_URL=http://139.196.208.166
// 需求：
// - 本地开发：直接请求 http://139.196.208.166/api（方便调试）
// - 线上 https://moka.qianjisan.com：一律请求 /api，由 vercel.json 代理到后端，避免 Mixed Content
const envBase = import.meta.env.VITE_API_BASE_URL || ''

let baseURL

if (typeof window !== 'undefined') {
  const isHttps = window.location.protocol === 'https:'
  const isProdHost = window.location.hostname === 'moka.qianjisan.com'

  if (isHttps && isProdHost) {
    // 线上环境：只用相对路径，让浏览器请求 https://moka.qianjisan.com/api/...
    baseURL = '/api'
  } else {
    // 本地或其它环境：用 .env 里的完整地址
    baseURL = envBase ? `${envBase}/api` : '/api'
  }
} else {
  // SSR 或构建时兜底
  baseURL = envBase ? `${envBase}/api` : '/api'
}

const request = axios.create({
  baseURL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const data = response.data
    
    // 如果响应格式为 { code, data, message }，统一处理
    if (data && typeof data === 'object' && 'code' in data) {
      // code === 0 表示成功，返回 data 字段
      if (data.code === 0) {
        return data
      } else {
        // code !== 0 表示业务错误，抛出错误
        const error = new Error(data.message || '请求失败')
        error.response = response
        error.code = data.code
        return Promise.reject(error)
      }
    }
    
    // 兼容旧格式，直接返回 response.data
    return data
  },
  error => {
    console.error('Request error:', error)
    // 处理 HTTP 错误响应
    if (error.response && error.response.data) {
      const errorData = error.response.data
      // 如果错误响应也是 { code, data, message } 格式
      if (errorData && typeof errorData === 'object' && 'code' in errorData) {
        error.message = errorData.message || error.message
        error.code = errorData.code
      }
    }
    return Promise.reject(error)
  }
)

// Mock API 管理
export const mockApi = {
  // 获取所有 Mock
  getAll: () => request.get('/mocks'),

  // 获取单个 Mock
  getById: (id) => request.get(`/mocks/${id}`),

  // 创建 Mock
  create: (data) => request.post('/mocks', data),

  // 更新 Mock
  update: (id, data) => request.put(`/mocks/${id}`, data),

  // 删除 Mock
  delete: (id) => request.delete(`/mocks/${id}`),

  // 切换状态
  toggle: (id) => request.post(`/mocks/${id}/toggle`)
}

// 日志管理
export const logApi = {
  // 获取日志（支持按项目过滤）
  getAll: (limit = 100, projectId = null) => request.get('/logs', {
    params: {
      limit,
      project_id: projectId
    }
  }),

  // 清空日志
  clear: () => request.delete('/logs')
}

// 设置管理
export const settingApi = {
  // 获取全局状态
  getEnabled: () => request.get('/settings/enabled'),

  // 设置全局状态
  setEnabled: (enabled) => request.post('/settings/enabled', { enabled })
}

// 导入导出
export const configApi = {
  // 导出配置
  export: () => request.get('/export'),

  // 导入配置
  import: (data) => request.post('/import', data)
}

// 用户认证相关接口
export const authApi = {
  // 登录接口
  login: (data) => request.post('/auth/login', data),

  // 注册接口
  register: (data) => request.post('/auth/register', data),

  // 检查用户名是否已存在
  checkUsernameExists: (username) => request.post('/auth/check-username', { username }),

  // 忘记密码 - 检查用户名并获取安全问题
  checkUsername: (username) => request.get(`/auth/forgot-password/check/${username}`),

  // 忘记密码 - 验证安全问题答案
  verifyAnswers: (username, data) => request.post(`/auth/forgot-password/verify/${username}`, data),

  // 忘记密码 - 重置密码
  resetPassword: (username, data) => request.post(`/auth/forgot-password/reset/${username}`, data)
}

// 埋点上报接口
export const trackingApi = {
  // 上报埋点
  report: (data) => request.post('/tracking/report', data)
}

// 管理后台相关接口
export const adminApi = {
  // 埋点管理
  tracking: {
    // 获取埋点列表（POST请求）
    getList: (data) => request.post('/admin/tracking/list', data),
    // 创建埋点
    create: (data) => request.post('/admin/tracking', data),
    // 更新埋点
    update: (id, data) => request.put(`/admin/tracking/${id}`, data),
    // 删除埋点
    delete: (id) => request.delete(`/admin/tracking/${id}`),
    // 批量删除
    batchDelete: (ids) => request.post('/admin/tracking/batch-delete', { ids }),
    // 获取统计数据
    getStatistics: (data) => request.post('/admin/tracking/statistics', data),
    // 获取访问趋势数据
    getTrend: (data) => request.post('/admin/tracking/trend', data),
    // 获取埋点分布数据
    getDistribution: (data) => request.post('/admin/tracking/distribution', data),
    // 获取热门埋点排行
    getRanking: (data) => request.post('/admin/tracking/ranking', data)
  },

  // 用户管理
  users: {
    // 获取用户列表（POST请求）
    getList: (data) => request.post('/admin/users/list', data),
    // 创建用户
    create: (data) => request.post('/admin/users', data),
    // 更新用户
    update: (id, data) => request.put(`/admin/users/${id}`, data),
    // 删除用户
    delete: (id) => request.delete(`/admin/users/${id}`),
    // 批量删除
    batchDelete: (ids) => request.post('/admin/users/batch-delete', { ids }),
    // 重置密码
    resetPassword: (id, data) => request.post(`/admin/users/${id}/reset-password`, data)
  },

  // 项目管理
  projects: {
    // 获取项目列表（POST请求）
    getList: (data) => request.post('/admin/projects/list', data),
    // 创建项目
    create: (data) => request.post('/admin/projects', data),
    // 更新项目
    update: (id, data) => request.put(`/admin/projects/${id}`, data),
    // 删除项目
    delete: (id) => request.delete(`/admin/projects/${id}`),
    // 批量删除
    batchDelete: (ids) => request.post('/admin/projects/batch-delete', { ids })
  },

  // 接口管理
  apis: {
    // 获取接口列表（POST请求）
    getList: (data) => request.post('/admin/apis/list', data),
    // 创建接口
    create: (data) => request.post('/admin/apis', data),
    // 更新接口
    update: (id, data) => request.put(`/admin/apis/${id}`, data),
    // 删除接口
    delete: (id) => request.delete(`/admin/apis/${id}`),
    // 批量删除
    batchDelete: (ids) => request.post('/admin/apis/batch-delete', { ids }),
    // 切换状态
    toggle: (id) => request.post(`/admin/apis/${id}/toggle`)
  }
}

export default request
