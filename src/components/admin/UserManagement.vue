<template>
  <div class="admin-page">
    <a-card>
      <!-- 操作按钮 -->
      <div class="action-bar">
        <a-space>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
        </a-space>
      </div>

      <!-- 查询条件 -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="用户名">
            <a-input
              v-model:value="searchForm.username"
              placeholder="请输入用户名"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="角色">
            <a-select
              v-model:value="searchForm.role"
              placeholder="请选择角色"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="user">普通用户</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="active">启用</a-select-option>
              <a-select-option value="inactive">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>

      <!-- 列表 -->
      <a-table
        :columns="columns"
        :data-source="dataList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'created_at'">
            {{ formatDateTime(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'last_login_time'">
            <span v-if="record.last_login_time || record.lastLoginTime">
              {{ formatDateTime(record.last_login_time || record.lastLoginTime) }}
            </span>
            <span v-else style="color: #999;">从未登录</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined
} from '@ant-design/icons-vue'
import { adminApi } from '@/api'

const loading = ref(false)
const dataList = ref([])

const searchForm = reactive({
  username: '',
  role: undefined,
  status: undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', key: 'role', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '注册时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
  { title: '最后登录时间', key: 'last_login_time', width: 180 }
]

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return dateTime
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return dateTime
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const requestData = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await adminApi.users.getList(requestData)
    if (response.data) {
      dataList.value = response.data.list || []
      pagination.total = response.data.total || 0
    }
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.role = undefined
  searchForm.status = undefined
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-page {
  animation: fadeIn 0.3s ease-in;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admin-page :deep(.ant-card) {
  border-radius: 0;
  border: none;
}

.admin-page :deep(.ant-card-body) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.action-bar {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  flex-shrink: 0;
}

.admin-page :deep(.ant-table-wrapper) {
  flex: 1;
  overflow: auto;
}
</style>

