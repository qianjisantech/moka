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
          <a-form-item label="项目名称">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入项目名称"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="创建人">
            <a-input
              v-model:value="searchForm.username"
              placeholder="请输入创建人"
              allow-clear
              style="width: 150px"
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
          <template v-if="column.key === 'name'">
            <a-space>
              <span v-if="record.icon" style="font-size: 20px">{{ record.icon }}</span>
              <span>{{ record.name }}</span>
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
  name: '',
  username: ''
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
  { title: '项目名称', key: 'name' },
  { title: '创建人', dataIndex: 'username', key: 'username', width: 120 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180 }
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
    const response = await adminApi.projects.getList(requestData)
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
  searchForm.name = ''
  searchForm.username = ''
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

