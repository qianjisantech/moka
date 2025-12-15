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
            返回
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

    <!-- 内容 -->
    <a-layout-content class="content">
      <div class="container">
        <div class="page-header">
          <div class="page-header-row">
            <h2 class="page-title">{{ isEdit ? (form.name || '编辑接口') : '新建接口' }}</h2>
            <div class="page-nav">
              <a-button size="small" @click="scrollToSection('basic')">基本信息</a-button>
              <a-button
                v-for="(rule, index) in form.rules"
                :key="index"
                size="small"
                @click="scrollToSection('rule-' + index)"
              >
                规则 {{ index + 1 }}
              </a-button>
            </div>
          </div>
        </div>

        <div class="full-width-layout">
          <a-form
            :model="form"
            layout="vertical"
            @finish="handleSave"
          >
            <!-- 基本信息 - 水平布局 -->
            <a-card ref="basicSection" class="form-card horizontal-card" id="basic-section">
              <div class="card-header-row">
                <div class="card-title">基本信息</div>
              </div>
              <div class="horizontal-content">
                <div class="horizontal-left">
                  <a-form-item
                    label="API 名称"
                    name="name"
                    :rules="[{ required: true, message: '请输入 API 名称' }]"
                  >
                    <a-input
                      v-model:value="form.name"
                      placeholder="例如：获取用户信息"
                      size="large"
                    />
                  </a-form-item>

                  <a-form-item
                    label="请求方法"
                    name="method"
                    :rules="[{ required: true, message: '请选择请求方法' }]"
                  >
                    <a-select v-model:value="form.method" size="large">
                      <a-select-option value="GET">GET</a-select-option>
                      <a-select-option value="POST">POST</a-select-option>
                      <a-select-option value="PUT">PUT</a-select-option>
                      <a-select-option value="DELETE">DELETE</a-select-option>
                      <a-select-option value="PATCH">PATCH</a-select-option>
                    </a-select>
                  </a-form-item>

                  <a-form-item
                    label="接口路径"
                    name="url"
                    :rules="[
                      { required: true, message: '请输入接口路径' },
                      {
                        pattern: /^\//,
                        message: '接口路径必须以 / 开头'
                      }
                    ]"
                  >
                    <a-input
                      v-model:value="form.url"
                      placeholder="必须以 / 开头，例如：/api/user/info"
                      size="large"
                    />
                    <template #extra>
                      <span style="color: #f59e0b; font-size: 12px;">
                        ⚠️ 接口路径必须以 / 开头
                      </span>
                    </template>
                  </a-form-item>

                  <div class="form-row">
                    <a-form-item label="状态码" name="status" class="form-item-half">
                      <a-select
                        v-model:value="form.status"
                        size="large"
                        style="width: 100%"
                      >
                        <a-select-option :value="200">200 OK</a-select-option>
                        <a-select-option :value="201">201 Created</a-select-option>
                        <a-select-option :value="204">204 No Content</a-select-option>
                        <a-select-option :value="301">301 Moved Permanently</a-select-option>
                        <a-select-option :value="302">302 Found</a-select-option>
                        <a-select-option :value="304">304 Not Modified</a-select-option>
                        <a-select-option :value="400">400 Bad Request</a-select-option>
                        <a-select-option :value="401">401 Unauthorized</a-select-option>
                        <a-select-option :value="403">403 Forbidden</a-select-option>
                        <a-select-option :value="404">404 Not Found</a-select-option>
                        <a-select-option :value="500">500 Internal Server Error</a-select-option>
                        <a-select-option :value="502">502 Bad Gateway</a-select-option>
                        <a-select-option :value="503">503 Service Unavailable</a-select-option>
                      </a-select>
                    </a-form-item>

                    <a-form-item label="延迟 (ms)" name="delay" class="form-item-half">
                      <a-input-number
                        v-model:value="form.delay"
                        :min="0"
                        :max="10000"
                        size="large"
                        style="width: 100%"
                      />
                    </a-form-item>
                  </div>

                  <a-form-item label="状态" name="enabled">
                    <a-switch
                      v-model:checked="form.enabled"
                      checked-children="启用"
                      un-checked-children="禁用"
                      size="default"
                    />
                    <span class="switch-label">{{ form.enabled ? '接口已启用' : '接口已禁用' }}</span>
                  </a-form-item>
                </div>

                <!-- 基本信息的 JSON 编辑器 -->
                <div class="horizontal-right">
                  <div class="inline-json-editor">
                    <div class="inline-json-header">
                      <span class="inline-json-title">默认响应数据</span>
                      <div class="inline-json-actions">
                        <a-button size="small" @click="showFakerHelp = !showFakerHelp">
                          <template #icon><QuestionCircleOutlined /></template>
                          Mock函数语法
                        </a-button>
                        <a-button size="small" @click="formatJson">
                          <template #icon><FormatPainterOutlined /></template>
                          格式化
                        </a-button>
                        <a-button size="small" @click="copyJson">
                          <template #icon><CopyOutlined /></template>
                          复制
                        </a-button>
                      </div>
                    </div>
                    <div class="inline-json-body">
                      <textarea
                        v-model="form.responseText"
                        class="inline-json-textarea"
                        placeholder='请输入 JSON 格式的响应数据'
                        spellcheck="false"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>

            <!-- 响应规则配置 -->
            <a-card class="form-card rules-card" style="margin-top: 24px;">
              <div class="card-title-row">
                <span class="card-title">响应规则</span>
                <a-button type="primary" @click="addRule">
                  添加规则
                </a-button>
              </div>
              <p class="card-subtitle">根据请求参数返回不同的响应数据</p>

              <div v-if="form.rules.length === 0" class="empty-rules">
                <p>暂无响应规则，点击「添加规则」创建</p>
              </div>

              <!-- 每个规则都是水平布局 -->
              <div
                v-for="(rule, ruleIndex) in form.rules"
                :key="ruleIndex"
                :id="'rule-section-' + ruleIndex"
                class="rule-item-horizontal"
              >
                <div class="horizontal-content">
                  <div class="horizontal-left">
                    <div class="rule-header">
                      <span class="rule-title">规则 {{ ruleIndex + 1 }}</span>
                      <div class="rule-actions">
                        <a-switch
                          v-model:checked="rule.enabled"
                          size="small"
                          checked-children="启用"
                          un-checked-children="禁用"
                        />
                        <a-button type="text" size="small" danger @click="deleteRule(ruleIndex)">
                          删除
                        </a-button>
                      </div>
                    </div>

                    <div class="rule-body">
                      <a-form-item label="规则名称">
                        <a-input v-model:value="rule.name" placeholder="例如：管理员登录" size="large" />
                      </a-form-item>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <a-form-item label="状态码">
                          <a-select v-model:value="rule.status" size="large">
                            <a-select-option :value="200">200 OK</a-select-option>
                            <a-select-option :value="201">201 Created</a-select-option>
                            <a-select-option :value="400">400 Bad Request</a-select-option>
                            <a-select-option :value="401">401 Unauthorized</a-select-option>
                            <a-select-option :value="403">403 Forbidden</a-select-option>
                            <a-select-option :value="404">404 Not Found</a-select-option>
                            <a-select-option :value="500">500 Internal Server Error</a-select-option>
                          </a-select>
                        </a-form-item>

                        <a-form-item label="延迟(ms)">
                          <a-input-number
                            v-model:value="rule.delay"
                            :min="0"
                            :max="10000"
                            :step="100"
                            size="large"
                            style="width: 100%;"
                          />
                        </a-form-item>
                      </div>

                      <a-form-item label="匹配条件">
                        <div v-for="(condition, condIndex) in rule.conditions" :key="condIndex" class="condition-row">
                          <a-select v-model:value="condition.type" style="width: 100px;" size="default">
                            <a-select-option value="query">Query</a-select-option>
                            <a-select-option value="body">Body</a-select-option>
                            <a-select-option value="header">Header</a-select-option>
                          </a-select>
                          <a-input v-model:value="condition.key" placeholder="参数名" style="width: 120px;" size="default" />
                          <a-select v-model:value="condition.operator" style="width: 90px;" size="default">
                            <a-select-option value="equals">等于</a-select-option>
                            <a-select-option value="contains">包含</a-select-option>
                            <a-select-option value="startsWith">开头是</a-select-option>
                            <a-select-option value="endsWith">结尾是</a-select-option>
                            <a-select-option value="exists">存在</a-select-option>
                            <a-select-option value="notExists">不存在</a-select-option>
                          </a-select>
                          <a-input
                            v-if="condition.operator !== 'exists' && condition.operator !== 'notExists'"
                            v-model:value="condition.value"
                            placeholder="值"
                            style="width: 150px;"
                            size="default"
                          />
                          <a-button type="text" size="small" danger @click="deleteCondition(ruleIndex, condIndex)">
                            <template #icon><DeleteOutlined /></template>
                          </a-button>
                        </div>
                        <a-button type="dashed" size="small" @click="addCondition(ruleIndex)" style="margin-top: 8px;">
                          添加条件
                        </a-button>
                      </a-form-item>
                    </div>
                  </div>

                  <!-- 规则的 JSON 编辑器 -->
                  <div class="horizontal-right">
                    <div class="inline-json-editor">
                      <div class="inline-json-header">
                        <span class="inline-json-title">响应数据</span>
                        <div class="inline-json-actions">
                          <a-button size="small" @click="showFakerHelp = !showFakerHelp">
                            <template #icon><QuestionCircleOutlined /></template>
                            Mock函数语法
                          </a-button>
                          <a-button size="small" @click="formatRuleJson(ruleIndex)">
                            <template #icon><FormatPainterOutlined /></template>
                            格式化
                          </a-button>
                          <a-button size="small" @click="copyRuleJson(ruleIndex)">
                            <template #icon><CopyOutlined /></template>
                            复制
                          </a-button>
                        </div>
                      </div>
                      <div class="inline-json-body">
                        <textarea
                          v-model="rule.responseText"
                          class="inline-json-textarea"
                          placeholder='请输入 JSON 格式的响应数据'
                          spellcheck="false"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>

            <a-card class="form-card" style="margin-top: 24px;">
              <a-form-item class="form-actions">
                <a-space :size="12">
                  <a-button type="primary" html-type="submit" size="large" :loading="saving">
                    <template #icon><SaveOutlined /></template>
                    {{ isEdit ? '保存修改' : '创建接口' }}
                  </a-button>
                  <a-button size="large" @click="goBack">
                    取消
                  </a-button>
                </a-space>
              </a-form-item>
            </a-card>
          </a-form>
        </div>
      </div>
    </a-layout-content>

    <!-- Mock函数语法提示抽屉 -->
    <a-drawer
      v-model:open="showFakerHelp"
      title="🎲 Mock函数语法提示"
      placement="right"
      :width="600"
      :bodyStyle="{ padding: '24px' }"
    >
      <div class="faker-help-intro">
        在 JSON 中使用 <code>@faker:category.method</code> 格式来生成动态数据
      </div>

      <div class="faker-category" v-for="(examples, category) in fakerExamples" :key="category">
        <div class="faker-category-title">{{ category }}</div>
        <div class="faker-example" v-for="(syntax, name) in examples" :key="name">
          <div class="faker-example-name">{{ name }}</div>
          <div class="faker-example-syntax" @click="copyToClipboard(syntax)">
            {{ syntax }}
            <CopyOutlined class="copy-icon" />
          </div>
        </div>
      </div>
    </a-drawer>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SaveOutlined,
  FormatPainterOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import Logo from '@/components/Logo.vue'
import axios from 'axios'
import { reportTracking } from '@/utils/tracking'

const router = useRouter()
const route = useRoute()

const projectId = computed(() => route.params.projectId)
const apiId = computed(() => route.params.apiId)
const isEdit = computed(() => !!apiId.value)

const saving = ref(false)
const baseUrl = ref('http://localhost:3000')
const showFakerHelp = ref(false)

const form = ref({
  name: '',
  method: 'GET',
  url: '',
  status: 200,
  delay: 0,
  enabled: true,
  responseText: '{\n  "code": 0,\n  "data": {},\n  "message": "success"\n}',
  rules: [] // 响应规则
})

// Faker 示例数据
const fakerExamples = ref({
  '动态数组示例': {
    '用户列表(固定5个)': JSON.stringify({
      code: 0,
      data: {
        users: ["@repeat(5)", {
          id: "@snowflake",
          name: "@faker:person.fullName",
          email: "@faker:internet.email",
          age: "@faker:number.int(18,65)"
        }]
      }
    }, null, 2),
    '商品列表(3-10个)': JSON.stringify({
      code: 0,
      data: {
        products: ["@repeat(3,10)", {
          id: "@snowflake",
          name: "@faker:commerce.productName",
          price: "@faker:commerce.price",
          description: "@faker:commerce.productDescription"
        }]
      }
    }, null, 2),
    '评论列表(10-20个)': JSON.stringify({
      code: 0,
      data: {
        comments: ["@repeat(10,20)", {
          id: "@faker:number.int(1,9999)",
          author: "@faker:person.fullName",
          content: "@faker:lorem.sentence",
          createdAt: "@faker:date.recent"
        }]
      }
    }, null, 2)
  },
  '基础数据': {
    '随机名字': '@faker:person.firstName',
    '随机姓氏': '@faker:person.lastName',
    '完整姓名': '@faker:person.fullName',
    '性别': '@faker:person.sex',
  },
  '联系方式': {
    '邮箱': '@faker:internet.email',
    '手机号': '@faker:phone.number',
    '网址': '@faker:internet.url',
    '用户名': '@faker:internet.username',
  },
  '数字相关': {
    '随机整数(0-100)': '@faker:number.int(0,100)',
    '随机小数': '@faker:number.float(0,100,2)',
    '随机布尔值': '@faker:datatype.boolean',
    'UUID': '@faker:string.uuid',
    '雪花ID': '@snowflake',
  },
  '日期时间': {
    '过去日期': '@faker:date.past',
    '未来日期': '@faker:date.future',
    '最近日期': '@faker:date.recent',
  },
  '地址信息': {
    '省份': '@faker:location.state',
    '城市': '@faker:location.city',
    '街道地址': '@faker:location.streetAddress',
    '邮编': '@faker:location.zipCode',
  },
  '商业数据': {
    '公司名称': '@faker:company.name',
    '公司口号': '@faker:company.catchPhrase',
    '产品名': '@faker:commerce.productName',
    '价格': '@faker:commerce.price',
  },
  '文本内容': {
    '句子': '@faker:lorem.sentence',
    '段落': '@faker:lorem.paragraph',
    '单词': '@faker:lorem.word',
  },
  '图片': {
    '头像': '@faker:image.avatar',
    '随机图片': '@faker:image.url',
  },
  '金融相关': {
    '信用卡号': '@faker:finance.creditCardNumber',
    '账户名': '@faker:finance.accountName',
    '金额': '@faker:finance.amount',
    '货币代码': '@faker:finance.currencyCode',
    '货币符号': '@faker:finance.currencySymbol',
    '比特币地址': '@faker:finance.bitcoinAddress',
  },
  '互联网相关': {
    'IPv4地址': '@faker:internet.ipv4',
    'IPv6地址': '@faker:internet.ipv6',
    'MAC地址': '@faker:internet.mac',
    '域名': '@faker:internet.domainName',
    '端口号': '@faker:internet.port',
    '协议': '@faker:internet.protocol',
    'User Agent': '@faker:internet.userAgent',
  },
  '颜色相关': {
    '颜色名称': '@faker:color.human',
    '十六进制颜色': '@faker:color.rgb',
    'RGB颜色': '@faker:color.rgb',
  },
  '系统相关': {
    '文件名': '@faker:system.fileName',
    '文件扩展名': '@faker:system.fileExt',
    '文件类型': '@faker:system.commonFileType',
    'MIME类型': '@faker:system.mimeType',
    '目录路径': '@faker:system.directoryPath',
    '文件路径': '@faker:system.filePath',
  },
  '车辆相关': {
    '车辆品牌': '@faker:vehicle.manufacturer',
    '车辆型号': '@faker:vehicle.model',
    '车辆类型': '@faker:vehicle.type',
    '车辆燃料': '@faker:vehicle.fuel',
    '车牌号': '@faker:vehicle.vrm',
  },
  '其他数据': {
    '随机词汇': '@faker:word.sample',
    '形容词': '@faker:word.adjective',
    '动词': '@faker:word.verb',
    '名词': '@faker:word.noun',
  }
})


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

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('mock_platform_token')
  localStorage.removeItem('mock_platform_user')
  message.success('已退出登录')
  router.push('/login')
}

// 返回
const goBack = () => {
  router.push(`/project/${projectId.value}`)
}

// 复制 Faker 语法到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

// 加载基础 URL
const loadBaseUrl = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/config/base-url')
    baseUrl.value = res.data.data.baseUrl
  } catch (error) {
    console.error('加载基础 URL 失败', error)
  }
}

// 加载 API 详情
const loadApiDetail = async () => {
  if (!isEdit.value) return

  try {
    const res = await axios.get(`http://localhost:3000/api/mocks/${apiId.value}`)
    const api = res.data.data

    // 处理规则数据
    const rules = (api.rules || []).map(rule => ({
      ...rule,
      delay: rule.delay || 0,
      responseText: JSON.stringify(rule.response, null, 2)
    }))

    form.value = {
      name: api.name,
      method: api.method,
      url: api.url,
      status: api.status,
      delay: api.delay,
      enabled: api.enabled,
      responseText: JSON.stringify(api.response, null, 2),
      rules: rules
    }
  } catch (error) {
    message.error('加载失败')
    goBack()
  }
}

// 保存
const handleSave = async () => {
  // 验证接口路径必须以 / 开头
  if (!form.value.url || !form.value.url.startsWith('/')) {
    message.error('接口路径必须以 / 开头')
    return
  }

  // 验证 JSON
  let response
  try {
    response = JSON.parse(form.value.responseText)
  } catch {
    message.error('响应数据不是有效的 JSON 格式')
    return
  }

  // 验证并处理规则
  const rules = []
  for (const rule of form.value.rules) {
    // 验证规则的 JSON
    let ruleResponse
    try {
      ruleResponse = JSON.parse(rule.responseText)
    } catch {
      message.error(`规则"${rule.name}"的响应数据不是有效的 JSON 格式`)
      return
    }

    rules.push({
      name: rule.name,
      enabled: rule.enabled !== false,
      status: rule.status,
      delay: rule.delay || 0,
      conditions: rule.conditions || [],
      response: ruleResponse
    })
  }

  const data = {
    name: form.value.name,
    method: form.value.method,
    url: form.value.url,
    status: form.value.status,
    delay: form.value.delay,
    enabled: form.value.enabled,
    response,
    rules,
    project_id: projectId.value
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await axios.put(`http://localhost:3000/api/mocks/${apiId.value}`, data)
      message.success('更新成功')
      
      // 上报更新接口埋点
      await reportTracking('api_update', {
        apiId: apiId.value,
        apiName: form.value.name,
        method: form.value.method,
        url: form.value.url,
        projectId: projectId.value,
        success: true
      })
    } else {
      await axios.post('http://localhost:3000/api/mocks', data)
      message.success('创建成功')
      
      // 上报创建接口埋点
      await reportTracking('api_create', {
        apiName: form.value.name,
        method: form.value.method,
        url: form.value.url,
        projectId: projectId.value,
        success: true
      })
    }
    goBack()
  } catch (error) {
    message.error('保存失败')
    
    // 上报接口操作失败埋点
    await reportTracking(isEdit.value ? 'api_update' : 'api_create', {
      apiId: apiId.value,
      apiName: form.value.name,
      method: form.value.method,
      url: form.value.url,
      projectId: projectId.value,
      success: false,
      error: '保存失败'
    })
  } finally {
    saving.value = false
  }
}

// 格式化默认响应 JSON
const formatJson = () => {
  try {
    const parsed = JSON.parse(form.value.responseText)
    form.value.responseText = JSON.stringify(parsed, null, 2)
    message.success('格式化成功')
  } catch (e) {
    message.error('JSON 格式错误：' + e.message)
  }
}

// 复制默认响应 JSON
const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(form.value.responseText)
    message.success('已复制到剪贴板')
  } catch (e) {
    message.error('复制失败')
  }
}

// 格式化规则 JSON
const formatRuleJson = (ruleIndex) => {
  try {
    const parsed = JSON.parse(form.value.rules[ruleIndex].responseText)
    form.value.rules[ruleIndex].responseText = JSON.stringify(parsed, null, 2)
    message.success('格式化成功')
  } catch (e) {
    message.error('JSON 格式错误：' + e.message)
  }
}

// 复制规则 JSON
const copyRuleJson = async (ruleIndex) => {
  try {
    await navigator.clipboard.writeText(form.value.rules[ruleIndex].responseText)
    message.success('已复制到剪贴板')
  } catch (e) {
    message.error('复制失败')
  }
}

// 添加规则
const addRule = () => {
  form.value.rules.push({
    name: `规则 ${form.value.rules.length + 1}`,
    enabled: true,
    status: 200,
    delay: 0,
    conditions: [],
    responseText: '{\n  "code": 0,\n  "data": {},\n  "message": "success"\n}'
  })
}

// 删除规则
const deleteRule = (index) => {
  form.value.rules.splice(index, 1)
}

// 添加条件
const addCondition = (ruleIndex) => {
  if (!form.value.rules[ruleIndex].conditions) {
    form.value.rules[ruleIndex].conditions = []
  }
  form.value.rules[ruleIndex].conditions.push({
    type: 'query',
    key: '',
    operator: 'equals',
    value: ''
  })
}

// 删除条件
const deleteCondition = (ruleIndex, condIndex) => {
  form.value.rules[ruleIndex].conditions.splice(condIndex, 1)
}

// 滚动到指定区域
const scrollToSection = (sectionId) => {
  let element
  if (sectionId === 'basic') {
    element = document.getElementById('basic-section')
  } else {
    const index = sectionId.split('-')[1]
    element = document.getElementById('rule-section-' + index)
  }

  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

onMounted(() => {
  loadBaseUrl()
  loadApiDetail()
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

/* 内容区域 */
.content {
  padding: 32px;
  min-height: calc(100vh - 64px);
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 32px;
  position: sticky;
  top: 64px;
  z-index: 50;
  background: linear-gradient(to bottom, #f8f9fa 0%, #fafafa 100%);
  padding: 24px 0;
  margin-left: -32px;
  margin-right: -32px;
  padding-left: 32px;
  padding-right: 32px;
  margin-top: -8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.5px;
}

.page-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.page-nav :deep(.ant-btn) {
  background: #fafafa;
  border: 1.5px solid #e5e7eb;
  color: #6b7280;
  font-weight: 500;
  border-radius: 8px;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-nav :deep(.ant-btn:hover) {
  border-color: #11998e;
  color: #11998e;
  background: rgba(17, 153, 142, 0.05);
  transform: translateY(-1px);
}

/* 全宽布局 */
.full-width-layout {
  max-width: 100%;
}

/* 水平布局卡片 */
.horizontal-card {
  overflow: visible;
}

.card-header-row {
  margin-bottom: 24px;
}

.horizontal-content {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 24px;
}

.horizontal-left {
  display: flex;
  flex-direction: column;
}

.horizontal-right {
  display: flex;
  flex-direction: column;
}

/* 表单卡片 */
.form-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-card :deep(.ant-card-body) {
  padding: 32px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* 表单样式优化 */
:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

:deep(.ant-form-item-label > label::before) {
  display: none !important;
}

:deep(.ant-form-item-required::after) {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-item-half {
  margin-bottom: 24px;
}

.form-extra {
  color: #6b7280;
  font-size: 13px;
}

.switch-label {
  margin-left: 12px;
  color: #6b7280;
  font-size: 14px;
}

.form-actions {
  margin-top: 32px;
  margin-bottom: 0;
}

:deep(.ant-input),
:deep(.ant-input-number),
:deep(.ant-select-selector),
:deep(.ant-textarea) {
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input:hover),
:deep(.ant-input-number:hover),
:deep(.ant-select-selector:hover),
:deep(.ant-textarea:hover) {
  border-color: #11998e;
}

:deep(.ant-input:focus),
:deep(.ant-input-number-focused),
:deep(.ant-select-focused .ant-select-selector),
:deep(.ant-textarea:focus) {
  border-color: #11998e;
  box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
}

:deep(.ant-input-number) {
  width: 100%;
}

:deep(.ant-input-number-input) {
  border: none;
}

/* 按钮样式 */
:deep(.ant-btn) {
  border-radius: 10px;
  font-weight: 600;
  height: 44px;
  padding: 0 24px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-btn-lg) {
  height: 48px;
  padding: 0 32px;
  font-size: 15px;
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

/* Switch 样式 */
:deep(.ant-switch-checked) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

/* 内联 JSON 编辑器 */
.inline-json-editor {
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.inline-json-header {
  background: #2d2d2d;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3d3d3d;
}

.inline-json-title {
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 600;
}

.inline-json-actions {
  display: flex;
  gap: 8px;
}

.inline-json-actions :deep(.ant-btn) {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e0e0e0;
  height: 28px;
  font-size: 12px;
  padding: 0 10px;
}

.inline-json-actions :deep(.ant-btn:hover) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.inline-json-body {
  flex: 1;
  padding: 16px;
  min-height: 360px;
}

.inline-json-textarea {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  resize: none;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 0;
  tab-size: 2;
  min-height: 340px;
}

.inline-json-textarea::placeholder {
  color: #666;
}

.inline-json-textarea::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.inline-json-textarea::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.inline-json-textarea::-webkit-scrollbar-thumb {
  background: #4d4d4d;
  border-radius: 4px;
}

.inline-json-textarea::-webkit-scrollbar-thumb:hover {
  background: #5d5d5d;
}

/* Faker 帮助抽屉内容样式 */
.faker-help-intro {
  background: rgba(17, 153, 142, 0.08);
  border-left: 3px solid #11998e;
  padding: 12px 16px;
  margin-bottom: 24px;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}

.faker-help-intro code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #11998e;
  font-weight: 600;
}

.faker-category {
  margin-bottom: 24px;
}

.faker-category-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(17, 153, 142, 0.2);
}

.faker-example {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: 8px;
  transition: all 0.2s;
  background: #f9fafb;
}

.faker-example:hover {
  background: rgba(17, 153, 142, 0.08);
}

.faker-example-name {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.faker-example-syntax {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: #11998e;
  background: #fafafa;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid rgba(17, 153, 142, 0.2);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.faker-example-syntax:hover {
  background: #11998e;
  color: white;
  border-color: #11998e;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(17, 153, 142, 0.25);
}

.faker-example-syntax .copy-icon {
  font-size: 11px;
  opacity: 0.7;
  margin-left: auto;
  flex-shrink: 0;
}

.faker-example-syntax:hover .copy-icon {
  opacity: 1;
}

/* 滚动条样式优化 */
.faker-example-syntax::-webkit-scrollbar {
  width: 6px;
}

.faker-example-syntax::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.faker-example-syntax::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.faker-example-syntax::-webkit-scrollbar-thumb:hover {
  background: #11998e;
}

/* 响应规则样式 */
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
}

.empty-rules {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 14px;
}

.rule-item-horizontal {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.2s;
}

.rule-item-horizontal:hover {
  border-color: #11998e;
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.1);
}

.rule-header {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.rule-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.rule-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rule-body {
  padding: 24px 20px;
  background: #fafafa;
}

.condition-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .horizontal-content {
    grid-template-columns: 440px 1fr;
  }
}

@media (max-width: 1200px) {
  .horizontal-content {
    grid-template-columns: 400px 1fr;
  }
}

@media (max-width: 1024px) {
  .container {
    max-width: 100%;
  }

  .horizontal-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .inline-json-editor {
    min-height: 500px;
  }
}

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
    padding: 24px 16px;
  }

  .page-header {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .page-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-nav {
    width: 100%;
    justify-content: flex-start;
  }

  .form-card :deep(.ant-card-body) {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .horizontal-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .header {
    height: 56px;
  }

  .header-content {
    height: 56px;
    padding: 0 12px;
  }

  .content {
    padding: 20px 12px;
    min-height: calc(100vh - 56px);
  }

  .page-header {
    margin-bottom: 20px;
    margin-left: -12px;
    margin-right: -12px;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    top: 56px;
  }

  .page-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-nav :deep(.ant-btn) {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
  }

  .form-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .card-title {
    font-size: 15px;
    margin-bottom: 20px;
  }

  :deep(.ant-btn-lg) {
    height: 44px;
    padding: 0 24px;
  }

  .inline-json-editor {
    min-height: 450px;
  }
}

@media (max-width: 480px) {
  .back-button {
    padding: 6px 8px;
    margin-right: 4px;
  }

  .content {
    padding: 16px 8px;
  }

  .form-card :deep(.ant-card-body) {
    padding: 16px;
  }

  :deep(.ant-btn-lg) {
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
  }

  .inline-json-actions {
    gap: 6px;
  }

  .inline-json-actions :deep(.ant-btn) {
    height: 26px;
    font-size: 11px;
    padding: 0 8px;
  }

  .inline-json-actions :deep(.ant-btn span:not(.anticon)) {
    display: none;
  }
}
</style>
