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
          <a-form-item label="事件名称">
            <a-input
              v-model:value="searchForm.event_name"
              placeholder="请输入事件名称"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="事件类型">
            <a-select
              v-model:value="searchForm.event_type"
              placeholder="请选择事件类型"
              allow-clear
              style="width: 150px"
            >
              <a-select-option value="custom">自定义</a-select-option>
              <a-select-option value="system">系统</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input
              v-model:value="searchForm.user_id"
              placeholder="请输入用户ID"
              allow-clear
              style="width: 200px"
            />
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
          <template v-if="column.key === 'event_type'">
            <a-tag :color="record.event_type === 'custom' ? 'blue' : 'purple'">
              {{ record.event_type === 'custom' ? '自定义' : '系统' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'properties'">
            <a-tooltip>
              <template #title>
                <pre style="max-width: 400px; white-space: pre-wrap; word-break: break-all;">{{ JSON.stringify(record.properties, null, 2) }}</pre>
              </template>
              <span style="cursor: pointer; color: #1890ff;">查看详情</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
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
  event_name: '',
  event_type: undefined,
  user_id: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 120 },
  { title: '事件名称', dataIndex: 'event_name', key: 'event_name', width: 150 },
  { title: '事件类型', key: 'event_type', width: 100 },
  { title: '用户ID', dataIndex: 'user_id', key: 'user_id', width: 120 },
  { title: '项目ID', dataIndex: 'project_id', key: 'project_id', width: 120 },
  { title: '属性', key: 'properties', width: 100 },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 120 },
  { title: '来源', dataIndex: 'referer', key: 'referer', width: 200, ellipsis: true },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const requestData = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await adminApi.tracking.getList(requestData)
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
  searchForm.event_name = ''
  searchForm.event_type = undefined
  searchForm.user_id = ''
  handleSearch()
}

// 删除
const handleDelete = async (record) => {
  try {
    await adminApi.tracking.delete(record.id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
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

