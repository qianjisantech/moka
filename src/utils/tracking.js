import { trackingApi } from '@/api'

/**
 * 上报埋点
 * @param {string} event - 事件名称
 * @param {object} data - 事件数据
 */
export const reportTracking = async (event, data = {}) => {
  try {
    // 获取用户信息
    const userInfo = localStorage.getItem('mock_platform_user')
    let userId = null
    let username = null
    
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo)
        userId = user.id
        username = user.username
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 构建埋点数据
    const trackingData = {
      event,
      userId,
      username,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      ...data
    }

    // 异步上报，不阻塞主流程
    trackingApi.report(trackingData).catch(error => {
      console.error('埋点上报失败:', error)
    })
  } catch (error) {
    console.error('埋点上报异常:', error)
  }
}

