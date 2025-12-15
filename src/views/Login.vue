<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>
    <div class="decoration decoration-3"></div>
    <div class="decoration decoration-4"></div>

    <!-- 居中的登录/注册表单 -->
    <div class="login-box">
      <div class="login-header">
        <Logo size="large" />
        <h1 class="brand-title">Moka</h1>
        <p class="brand-slogan">让接口Mock 变得更优雅～</p>
      </div>

      <!-- 登录/注册/忘记密码切换标签 -->
      <div class="mode-tabs">
        <div
          class="mode-tab"
          :class="{ active: mode === 'login' }"
          @click="switchMode('login')"
        >
          登录
        </div>
        <div
          class="mode-tab"
          :class="{ active: mode === 'register' }"
          @click="switchMode('register')"
        >
          注册
        </div>
        <div
          class="mode-tab"
          :class="{ active: mode === 'forgot' }"
          @click="switchMode('forgot')"
        >
          找回密码
        </div>
      </div>

      <!-- 登录表单 -->
      <a-form
        v-if="mode === 'login'"
        :model="form"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="form.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="form.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="form.remember">
            记住我
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 注册表单 -->
      <a-form
        v-else-if="mode === 'register'"
        :model="registerForm"
        @finish="handleRegister"
        layout="vertical"
        class="login-form"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ validator: validateUsername, trigger: 'blur' }]"
        >
          <a-input
            v-model:value="registerForm.username"
            placeholder="请输入用户名(3-20个字符)"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' }
          ]"
        >
          <a-input-password
            v-model:value="registerForm.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="确认密码"
          name="confirmPassword"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validateConfirmPassword }
          ]"
        >
          <a-input-password
            v-model:value="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-divider style="margin: 16px 0; font-size: 13px; color: #6b7280;">设置安全问题（用于找回密码）</a-divider>

        <a-form-item
          label="安全问题1"
          name="question1"
          :rules="[{ required: true, message: '请选择安全问题' }]"
        >
          <a-select
            v-model:value="registerForm.question1"
            placeholder="请选择安全问题"
            size="large"
          >
            <a-select-option v-for="q in securityQuestions" :key="q" :value="q">
              {{ q }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="答案1"
          name="answer1"
          :rules="[{ required: true, message: '请输入答案' }]"
        >
          <a-input
            v-model:value="registerForm.answer1"
            placeholder="请输入答案"
            size="large"
          />
        </a-form-item>

        <a-form-item
          label="安全问题2"
          name="question2"
          :rules="[{ required: true, message: '请选择安全问题' }]"
        >
          <a-select
            v-model:value="registerForm.question2"
            placeholder="请选择安全问题"
            size="large"
          >
            <a-select-option v-for="q in securityQuestions" :key="q" :value="q">
              {{ q }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="答案2"
          name="answer2"
          :rules="[{ required: true, message: '请输入答案' }]"
        >
          <a-input
            v-model:value="registerForm.answer2"
            placeholder="请输入答案"
            size="large"
          />
        </a-form-item>

        <a-form-item
          label="安全问题3"
          name="question3"
          :rules="[{ required: true, message: '请选择安全问题' }]"
        >
          <a-select
            v-model:value="registerForm.question3"
            placeholder="请选择安全问题"
            size="large"
          >
            <a-select-option v-for="q in securityQuestions" :key="q" :value="q">
              {{ q }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="答案3"
          name="answer3"
          :rules="[{ required: true, message: '请输入答案' }]"
        >
          <a-input
            v-model:value="registerForm.answer3"
            placeholder="请输入答案"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            注册
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 忘记密码表单 -->
      <a-form
        v-else-if="mode === 'forgot'"
        :model="forgotForm"
        @finish="handleForgotPassword"
        layout="vertical"
        class="login-form"
      >
        <!-- 步骤1：输入用户名 -->
        <template v-if="forgotStep === 1">
          <a-form-item
            label="用户名"
            name="username"
            :rules="[{ required: true, message: '请输入用户名' }]"
          >
            <a-input
              v-model:value="forgotForm.username"
              placeholder="请输入要找回密码的用户名"
              size="large"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              size="large"
              block
              :loading="loading"
              @click="checkUsername"
            >
              下一步
            </a-button>
          </a-form-item>
        </template>

        <!-- 步骤2：回答安全问题 -->
        <template v-else-if="forgotStep === 2">
          <a-alert
            message="请回答您注册时设置的安全问题"
            type="info"
            show-icon
            style="margin-bottom: 20px;"
          />

          <a-form-item
            :label="userSecurityQuestions.question1"
            name="answer1"
            :rules="[{ required: true, message: '请输入答案' }]"
          >
            <a-input
              v-model:value="forgotForm.answer1"
              placeholder="请输入答案"
              size="large"
            />
          </a-form-item>

          <a-form-item
            :label="userSecurityQuestions.question2"
            name="answer2"
            :rules="[{ required: true, message: '请输入答案' }]"
          >
            <a-input
              v-model:value="forgotForm.answer2"
              placeholder="请输入答案"
              size="large"
            />
          </a-form-item>

          <a-form-item
            :label="userSecurityQuestions.question3"
            name="answer3"
            :rules="[{ required: true, message: '请输入答案' }]"
          >
            <a-input
              v-model:value="forgotForm.answer3"
              placeholder="请输入答案"
              size="large"
            />
          </a-form-item>

          <a-form-item>
            <a-space style="width: 100%; justify-content: space-between;">
              <a-button size="large" @click="forgotStep = 1">
                上一步
              </a-button>
              <a-button
                type="primary"
                size="large"
                :loading="loading"
                @click="verifyAnswers"
              >
                验证答案
              </a-button>
            </a-space>
          </a-form-item>
        </template>

        <!-- 步骤3：设置新密码 -->
        <template v-else-if="forgotStep === 3">
          <a-alert
            message="验证成功！请设置新密码"
            type="success"
            show-icon
            style="margin-bottom: 20px;"
          />

          <a-form-item
            label="新密码"
            name="newPassword"
            :rules="[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]"
          >
            <a-input-password
              v-model:value="forgotForm.newPassword"
              placeholder="请输入新密码"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item
            label="确认新密码"
            name="confirmNewPassword"
            :rules="[
              { required: true, message: '请确认新密码' },
              { validator: validateNewPassword }
            ]"
          >
            <a-input-password
              v-model:value="forgotForm.confirmNewPassword"
              placeholder="请再次输入新密码"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
            >
              重置密码
            </a-button>
          </a-form-item>
        </template>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import Logo from '@/components/Logo.vue'
import { authApi } from '@/api'
import { reportTracking } from '@/utils/tracking'

const router = useRouter()
const loading = ref(false)
const mode = ref('login') // 'login' | 'register' | 'forgot'

const form = ref({
  username: '',
  password: '',
  remember: true
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  question1: '',
  answer1: '',
  question2: '',
  answer2: '',
  question3: '',
  answer3: ''
})

const forgotForm = ref({
  username: '',
  answer1: '',
  answer2: '',
  answer3: '',
  newPassword: '',
  confirmNewPassword: ''
})

const forgotStep = ref(1) // 1: 输入用户名, 2: 回答问题, 3: 设置新密码
const userSecurityQuestions = ref({
  question1: '',
  question2: '',
  question3: ''
})

// 预设的安全问题列表
const securityQuestions = [
  '你的第一只宠物叫什么名字？',
  '你最喜欢的一本书是什么？',
  '你出生的城市是哪里？',
  '你小学最好朋友的名字？',
  '你最喜欢的食物是什么？',
  '你的理想职业是什么？',
  '你母亲的姓氏是什么？',
  '你最喜欢的电影是什么？'
]

// 验证用户名唯一性
const validateUsername = async (rule, value) => {
  if (!value) {
    return Promise.reject('请输入用户名')
  }

  if (value.length < 3) {
    return Promise.reject('用户名至少3个字符')
  }

  if (value.length > 20) {
    return Promise.reject('用户名最多20个字符')
  }

  // 通过接口检查用户名是否已存在
  try {
    const response = await authApi.checkUsernameExists(value)
    
    // 如果接口返回 code === 0，检查 data 中的 exists 字段
    // 后端可能返回两种格式：
    // 1. { code: 0, data: { exists: false } } - 用户名可用
    // 2. { code: 0, data: { exists: true } } - 用户名已存在
    if (response.data) {
      if (response.data.exists === true) {
        return Promise.reject('用户名已存在')
      }
      if (response.data.exists === false) {
        return Promise.resolve()
      }
    }
    
    // 如果接口成功返回但没有 exists 字段，默认认为可用
    return Promise.resolve()
  } catch (error) {
    // 如果接口返回错误（code !== 0），说明用户名已存在或其他错误
    // 响应拦截器会将 code !== 0 的情况抛出错误
    const errorMessage = error.message || '用户名已存在'
    return Promise.reject(errorMessage)
  }
}

// 验证确认密码
const validateConfirmPassword = (rule, value) => {
  if (value !== registerForm.value.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 验证新密码
const validateNewPassword = (rule, value) => {
  if (value !== forgotForm.value.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 切换模式
const switchMode = (newMode) => {
  mode.value = newMode
  // 如果切换到忘记密码模式，重置步骤
  if (newMode === 'forgot') {
    forgotStep.value = 1
    forgotForm.value = {
      username: '',
      answer1: '',
      answer2: '',
      answer3: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  }
}

// 登录接口
const handleLogin = async () => {
  loading.value = true

  try {
    const response = await authApi.login({
      username: form.value.username,
      password: form.value.password,
      remember: form.value.remember
    })

    // 响应拦截器已处理，如果到这里说明 code === 0
    if (response.data && response.data.token) {
      // 保存token
      localStorage.setItem('mock_platform_token', response.data.token)
      
      // 保存用户信息
      const userInfo = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar,
        role: response.data.role,
        status: response.data.status,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      }
      localStorage.setItem('mock_platform_user', JSON.stringify(userInfo))

      message.success(response.message || '登录成功')
      
      // 上报登录埋点
      await reportTracking('user_login', {
        username: form.value.username,
        success: true
      })
      
      router.push('/home')
    } else {
      message.error(response.message || '登录失败，未返回token')
    }
  } catch (error) {
    // 错误可能来自响应拦截器（code !== 0）或网络错误
    const errorMessage = error.message || error.response?.data?.message || '登录失败'
    message.error(errorMessage)
    
    // 上报登录失败埋点
    await reportTracking('user_login', {
      username: form.value.username,
      success: false,
      error: errorMessage
    })
  } finally {
    loading.value = false
  }
}

// 注册接口
const handleRegister = async () => {
  loading.value = true

  try {
    const response = await authApi.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      securityQuestions: {
        question1: registerForm.value.question1,
        answer1: registerForm.value.answer1,
        question2: registerForm.value.question2,
        answer2: registerForm.value.answer2,
        question3: registerForm.value.question3,
        answer3: registerForm.value.answer3
      }
    })

    message.success(response.message || '注册成功，请登录')

    // 上报注册埋点
    await reportTracking('user_register', {
      username: registerForm.value.username,
      success: true
    })

    // 切换到登录模式，并填充用户名
    mode.value = 'login'
    form.value.username = registerForm.value.username
    form.value.password = ''

    // 清空注册表单
    registerForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: ''
    }
  } catch (error) {
    const errorMessage = error.message || error.response?.data?.message || '注册失败'
    message.error(errorMessage)
    
    // 上报注册失败埋点
    await reportTracking('user_register', {
      username: registerForm.value.username,
      success: false,
      error: errorMessage
    })
  } finally {
    loading.value = false
  }
}

// 忘记密码 - 步骤1：检查用户名
const checkUsername = async () => {
  if (!forgotForm.value.username) {
    message.error('请输入用户名')
    return
  }

  loading.value = true

  try {
    const response = await authApi.checkUsername(forgotForm.value.username)

    // 从响应中获取安全问题（可能在 response.data 中）
    const securityQuestions = response.data?.securityQuestions || response.securityQuestions

    if (securityQuestions) {
      // 加载用户的安全问题
      userSecurityQuestions.value = {
        question1: securityQuestions.question1,
        question2: securityQuestions.question2,
        question3: securityQuestions.question3
      }

      forgotStep.value = 2
      message.success(response.message || '找到用户，请回答安全问题')
      
      // 上报忘记密码检查用户名埋点
      await reportTracking('forgot_password_check', {
        username: forgotForm.value.username,
        success: true
      })
    } else {
      message.error(response.message || '该用户未设置安全问题，无法找回密码')
    }
  } catch (error) {
    const errorMessage = error.message || error.response?.data?.message || '用户名不存在'
    message.error(errorMessage)
    
    // 上报忘记密码检查用户名失败埋点
    await reportTracking('forgot_password_check', {
      username: forgotForm.value.username,
      success: false,
      error: errorMessage
    })
  } finally {
    loading.value = false
  }
}

// 忘记密码 - 步骤2：验证答案
const verifyAnswers = async () => {
  if (!forgotForm.value.answer1 || !forgotForm.value.answer2 || !forgotForm.value.answer3) {
    message.error('请回答所有安全问题')
    return
  }

  loading.value = true

  try {
    const response = await authApi.verifyAnswers(forgotForm.value.username, {
      answer1: forgotForm.value.answer1,
      answer2: forgotForm.value.answer2,
      answer3: forgotForm.value.answer3
    })

    forgotStep.value = 3
    message.success(response.message || '验证成功！请设置新密码')
    
    // 上报忘记密码验证答案埋点
    await reportTracking('forgot_password_verify', {
      username: forgotForm.value.username,
      success: true
    })
  } catch (error) {
    const errorMessage = error.message || error.response?.data?.message || '答案错误，请重试'
    message.error(errorMessage)
    
    // 上报忘记密码验证答案失败埋点
    await reportTracking('forgot_password_verify', {
      username: forgotForm.value.username,
      success: false,
      error: errorMessage
    })
  } finally {
    loading.value = false
  }
}

// 忘记密码 - 步骤3：重置密码
const handleForgotPassword = async () => {
  loading.value = true

  try {
    const response = await authApi.resetPassword(forgotForm.value.username, {
      newPassword: forgotForm.value.newPassword
    })

    message.success(response.message || '密码重置成功，请使用新密码登录')

    // 上报忘记密码重置埋点
    await reportTracking('forgot_password_reset', {
      username: forgotForm.value.username,
      success: true
    })

    // 切换到登录模式，并填充用户名
    mode.value = 'login'
    form.value.username = forgotForm.value.username
    form.value.password = ''

    // 清空忘记密码表单
    forgotForm.value = {
      username: '',
      answer1: '',
      answer2: '',
      answer3: '',
      newPassword: '',
      confirmNewPassword: ''
    }
    forgotStep.value = 1
  } catch (error) {
    const errorMessage = error.message || error.response?.data?.message || '重置密码失败'
    message.error(errorMessage)
    
    // 上报忘记密码重置失败埋点
    await reportTracking('forgot_password_reset', {
      username: forgotForm.value.username,
      success: false,
      error: errorMessage
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 使用系统字体栈 - 苹果和 Google 风格 */
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #f8f9fa 0%, #fafafa 100%);
  padding: 32px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰元素 - 更柔和的效果 */
.decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  filter: blur(60px);
  animation: float 8s ease-in-out infinite;
}

.decoration-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.decoration-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
  bottom: -100px;
  right: 5%;
  animation-delay: 2s;
}

.decoration-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  top: 15%;
  right: -100px;
  animation-delay: 1s;
}

.decoration-4 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
  bottom: 5%;
  left: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
  }
  50% {
    transform: translateY(-40px) translateX(30px) scale(1.1);
  }
}

/* 登录表单盒子 - Material Design 3 + 苹果风格 */
.login-box {
  width: 100%;
  max-width: 440px;
  background: rgba(250, 250, 250, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px 48px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 16px 48px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(250, 250, 250, 0.8);
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-box:hover {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 16px rgba(0, 0, 0, 0.06),
    0 24px 64px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.brand-title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #11998e;
  margin-bottom: 0;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0;
  letter-spacing: 0.3px;
}

.brand-slogan {
  font-size: 18px;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 0;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #11998e 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
  text-shadow: 0 0 30px rgba(17, 153, 142, 0.3);
  font-style: italic;
  position: relative;
}

/* 闪烁动画 */
@keyframes shimmer {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* 登录/注册/忘记密码切换标签 */
.mode-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
}

.mode-tab {
  flex: 1;
  text-align: center;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  white-space: nowrap;
}

.mode-tab:hover {
  color: #11998e;
  background: rgba(17, 153, 142, 0.05);
}

.mode-tab.active {
  color: white;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 2px 8px rgba(17, 153, 142, 0.25);
}

.login-form {
  margin-top: 0;
}

/* 优化表单元素样式 */
.login-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.ant-btn-primary) {
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-form :deep(.ant-btn-primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(17, 153, 142, 0.4);
}

.login-form :deep(.ant-checkbox-wrapper) {
  font-size: 14px;
  color: #6b7280;
}

/* 响应式设计 - 全面优化 */

/* 平板横屏 (768px - 1024px) */
@media (max-width: 1024px) {
  .login-box {
    max-width: 480px;
  }
}

/* 平板竖屏 (600px - 768px) */
@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }

  .login-box {
    max-width: 100%;
    padding: 40px 32px;
    border-radius: 20px;
  }

  .brand-title {
    font-size: 40px;
  }

  .brand-subtitle {
    font-size: 14px;
  }

  .brand-slogan {
    font-size: 16px;
    letter-spacing: 1.5px;
    margin-top: 8px;
  }

  .decoration {
    display: none;
  }
}

/* 手机横屏 (480px - 600px) */
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }

  .login-box {
    padding: 36px 28px;
    border-radius: 18px;
  }

  .login-header {
    margin-bottom: 28px;
    gap: 10px;
  }

  .brand-title {
    font-size: 36px;
  }

  .brand-subtitle {
    font-size: 13px;
  }

  .brand-slogan {
    font-size: 15px;
    letter-spacing: 1px;
    margin-top: 8px;
  }

  .mode-tabs {
    margin-bottom: 24px;
  }

  .mode-tab {
    padding: 8px 16px;
    font-size: 13px;
  }

  .login-form :deep(.ant-form-item) {
    margin-bottom: 20px;
  }

  .login-form :deep(.ant-btn-primary) {
    height: 44px;
    font-size: 14px;
  }
}

/* 小手机 (<480px) */
@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }

  .login-box {
    padding: 32px 24px;
    border-radius: 16px;
  }

  .login-header {
    margin-bottom: 24px;
    gap: 10px;
  }

  .brand-title {
    font-size: 32px;
    margin-bottom: 0;
  }

  .mode-tabs {
    margin-bottom: 20px;
  }

  .mode-tab {
    padding: 8px 14px;
    font-size: 12px;
  }

  .brand-subtitle {
    font-size: 12px;
  }

  .login-form :deep(.ant-form-item-label > label) {
    font-size: 13px;
  }

  .login-form :deep(.ant-input),
  .login-form :deep(.ant-input-password) {
    font-size: 14px;
  }

  .login-form :deep(.ant-checkbox-wrapper) {
    font-size: 13px;
  }
}

/* 超小屏幕优化 (<375px) */
@media (max-width: 375px) {
  .login-box {
    padding: 28px 20px;
  }

  .brand-title {
    font-size: 28px;
  }

  .brand-slogan {
    font-size: 13px;
    letter-spacing: 0.5px;
    margin-top: 6px;
  }

  .mode-tabs {
    margin-bottom: 16px;
    padding: 3px;
  }

  .mode-tab {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>
