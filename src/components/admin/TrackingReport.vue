<template>
  <div class="dashboard-container">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            format="YYYY-MM-DD"
            style="width: 300px"
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item label="埋点名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入埋点名称"
            allow-clear
            style="width: 200px"
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-card-1">
            <div class="stat-icon">
              <EyeOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">总访问量</div>
              <div class="stat-value">{{ formatNumber(statistics.totalVisits) }}</div>
              <div class="stat-trend">
                <ArrowUpOutlined />
                <span>+12.5%</span>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-card-2">
            <div class="stat-icon">
              <FireOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">今日访问量</div>
              <div class="stat-value">{{ formatNumber(statistics.todayVisits) }}</div>
              <div class="stat-trend">
                <ArrowUpOutlined />
                <span>+8.2%</span>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-card-3">
            <div class="stat-icon">
              <AppstoreOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">埋点总数</div>
              <div class="stat-value">{{ formatNumber(statistics.totalTracking) }}</div>
              <div class="stat-trend">
                <ArrowUpOutlined />
                <span>+3</span>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-card-4">
            <div class="stat-icon">
              <ThunderboltOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">活跃埋点</div>
              <div class="stat-value">{{ formatNumber(statistics.activeTracking) }}</div>
              <div class="stat-trend">
                <ArrowUpOutlined />
                <span>+5.1%</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <a-row :gutter="[16, 16]">
        <!-- 访问趋势图 -->
        <a-col :xs="24" :lg="16">
          <div class="chart-card">
            <div class="chart-header">
              <h3>访问趋势</h3>
              <a-radio-group v-model:value="trendPeriod" size="small" @change="updateTrendChart">
                <a-radio-button value="7d">近7天</a-radio-button>
                <a-radio-button value="30d">近30天</a-radio-button>
                <a-radio-button value="90d">近90天</a-radio-button>
              </a-radio-group>
            </div>
            <div ref="trendChartRef" class="chart-container"></div>
          </div>
        </a-col>

        <!-- 埋点分布图 -->
        <a-col :xs="24" :lg="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>埋点分布</h3>
            </div>
            <div ref="distributionChartRef" class="chart-container"></div>
          </div>
        </a-col>

        <!-- 热门埋点排行 -->
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>热门埋点 TOP 10</h3>
            </div>
            <div ref="rankingChartRef" class="chart-container"></div>
          </div>
        </a-col>

        <!-- 实时数据流 -->
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>实时访问</h3>
              <a-tag :color="realtimeEnabled ? 'green' : 'default'">
                {{ realtimeEnabled ? '实时中' : '已暂停' }}
              </a-tag>
            </div>
            <div ref="realtimeChartRef" class="chart-container"></div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <div class="chart-card">
        <div class="chart-header">
          <h3>埋点详情</h3>
        </div>
        <a-table
          :columns="columns"
          :data-source="dataList"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 'max-content' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'visitCount'">
              <span class="visit-count">{{ formatNumber(record.visitCount) }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import {
  SearchOutlined,
  EyeOutlined,
  FireOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined
} from '@ant-design/icons-vue'
import { adminApi } from '@/api'

const loading = ref(false)
const dataList = ref([])
const trendPeriod = ref('7d')
const realtimeEnabled = ref(true)

// 图表引用
const trendChartRef = ref(null)
const distributionChartRef = ref(null)
const rankingChartRef = ref(null)
const realtimeChartRef = ref(null)

// 图表实例
let trendChart = null
let distributionChart = null
let rankingChart = null
let realtimeChart = null
let realtimeTimer = null

const searchForm = reactive({
  dateRange: null,
  name: ''
})

const statistics = reactive({
  totalVisits: 0,
  todayVisits: 0,
  totalTracking: 0,
  activeTracking: 0
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
  { title: '埋点名称', dataIndex: 'name', key: 'name' },
  { title: '埋点代码', dataIndex: 'code', key: 'code' },
  { title: '访问次数', dataIndex: 'visitCount', key: 'visitCount', width: 120 },
  { title: '最后访问时间', dataIndex: 'lastVisitTime', key: 'lastVisitTime', width: 180 },
  { title: '状态', key: 'status', width: 100 }
]

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 初始化趋势图
const initTrendChart = async () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  
  try {
    const requestData = {
      period: trendPeriod.value
    }
    
    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      requestData.startDate = searchForm.dateRange[0].format('YYYY-MM-DD')
      requestData.endDate = searchForm.dateRange[1].format('YYYY-MM-DD')
    }
    
    const response = await adminApi.tracking.getTrend(requestData)
    const dates = response.data?.dates || []
    const values = response.data?.values || []
    
    const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      axisLabel: {
        color: '#86868b',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#86868b',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 122, 255, 0.2)' },
          { offset: 1, color: 'rgba(0, 122, 255, 0.02)' }
        ])
      },
      lineStyle: {
        color: '#007aff',
        width: 3
      },
      itemStyle: {
        color: '#007aff'
      },
      emphasis: {
        focus: 'series'
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 12,
      textStyle: { color: '#fff', fontSize: 13 },
      padding: [12, 16]
    }
    }
    
    trendChart.setOption(option)
  } catch (error) {
    console.error('加载趋势数据失败', error)
    message.error('加载趋势数据失败')
  }
}

// 初始化分布图
const initDistributionChart = async () => {
  if (!distributionChartRef.value) return
  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }
  
  try {
    const requestData = {}
    
    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      requestData.startDate = searchForm.dateRange[0].format('YYYY-MM-DD')
      requestData.endDate = searchForm.dateRange[1].format('YYYY-MM-DD')
    }
    
    const response = await adminApi.tracking.getDistribution(requestData)
    const distributionData = response.data || []
    
    // 苹果风格颜色数组
    const colors = ['#007aff', '#ff3b30', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5856d6', '#ffcc00']
    
    const chartData = distributionData.map((item, index) => ({
      value: item.value,
      name: item.name,
      itemStyle: { color: colors[index % colors.length] }
    }))
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: { color: '#fff', fontSize: 13 },
        padding: [12, 16]
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: { color: '#86868b', fontSize: 12 }
      },
      series: [{
        name: '埋点分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12,
          color: '#1d1d1f'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: '600'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: chartData
      }]
    }
    
    distributionChart.setOption(option)
  } catch (error) {
    console.error('加载分布数据失败', error)
    message.error('加载分布数据失败')
  }
}

// 初始化排行榜图
const initRankingChart = async () => {
  if (!rankingChartRef.value) return
  if (!rankingChart) {
    rankingChart = echarts.init(rankingChartRef.value)
  }
  
  try {
    const requestData = {
      limit: 10
    }
    
    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      requestData.startDate = searchForm.dateRange[0].format('YYYY-MM-DD')
      requestData.endDate = searchForm.dateRange[1].format('YYYY-MM-DD')
    }
    
    const response = await adminApi.tracking.getRanking(requestData)
    const rankingData = response.data || []
  
    const names = rankingData.map(item => item.name || item.code || '未知')
    const values = rankingData.map(item => item.visitCount || 0)
  
    const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '25%',
      right: '10%',
      top: '10%',
      bottom: '10%'
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#86868b',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#1d1d1f',
        fontSize: 12,
        formatter: (value) => {
          return value.length > 10 ? value.substring(0, 10) + '...' : value
        }
      }
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#007aff' },
          { offset: 1, color: '#5ac8fa' }
        ]),
        borderRadius: [0, 8, 8, 0]
      },
      label: {
        show: true,
        position: 'right',
        color: '#86868b',
        fontSize: 12
      }
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 12,
      textStyle: { color: '#fff', fontSize: 13 },
      padding: [12, 16]
    }
    }
    
    rankingChart.setOption(option)
  } catch (error) {
    console.error('加载排行数据失败', error)
    message.error('加载排行数据失败')
  }
}

// 初始化实时图表
const initRealtimeChart = () => {
  if (!realtimeChartRef.value) return
  realtimeChart = echarts.init(realtimeChartRef.value)
  
  const times = []
  const values = []
  const maxData = 20
  
  for (let i = maxData - 1; i >= 0; i--) {
    const date = new Date()
    date.setMinutes(date.getMinutes() - i)
    times.push(date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    values.push(Math.floor(Math.random() * 100) + 50)
  }
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      axisLabel: {
        color: '#86868b',
        fontSize: 11,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#86868b',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#34c759',
        width: 2.5
      },
      itemStyle: {
        color: '#34c759'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(52, 199, 89, 0.2)' },
          { offset: 1, color: 'rgba(52, 199, 89, 0.02)' }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 12,
      textStyle: { color: '#fff', fontSize: 13 },
      padding: [12, 16]
    }
  }
  
  realtimeChart.setOption(option)
  
  // 实时更新
  if (realtimeEnabled.value) {
    realtimeTimer = setInterval(() => {
      const now = new Date()
      times.shift()
      values.shift()
      times.push(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      values.push(Math.floor(Math.random() * 100) + 50)
      
      realtimeChart.setOption({
        xAxis: { data: times },
        series: [{ data: values }]
      })
    }, 2000)
  }
}

// 更新趋势图
const updateTrendChart = async () => {
  await initTrendChart()
}

// 窗口大小改变时调整图表
const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
  rankingChart?.resize()
  realtimeChart?.resize()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const requestData = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name
    }
    
    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      requestData.startDate = searchForm.dateRange[0].format('YYYY-MM-DD')
      requestData.endDate = searchForm.dateRange[1].format('YYYY-MM-DD')
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

// 加载统计数据
const loadStatistics = async () => {
  try {
    const requestData = {}
    
    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      requestData.startDate = searchForm.dateRange[0].format('YYYY-MM-DD')
      requestData.endDate = searchForm.dateRange[1].format('YYYY-MM-DD')
    }
    
    const response = await adminApi.tracking.getStatistics(requestData)
    if (response.data) {
      statistics.totalVisits = response.data.totalVisits || 0
      statistics.todayVisits = response.data.todayVisits || 0
      statistics.totalTracking = response.data.totalTracking || 0
      statistics.activeTracking = response.data.activeTracking || 0
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
    message.error('加载统计数据失败')
  }
}

// 搜索
const handleSearch = async () => {
  pagination.current = 1
  await Promise.all([
    loadData(),
    loadStatistics(),
    initTrendChart(),
    initDistributionChart(),
    initRankingChart()
  ])
}

// 重置
const handleReset = () => {
  searchForm.dateRange = null
  searchForm.name = ''
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

onMounted(async () => {
  // 初始化图表容器
  await nextTick()
  
  // 并行加载所有数据
  await Promise.all([
    loadData(),
    loadStatistics(),
    initTrendChart(),
    initDistributionChart(),
    initRankingChart()
  ])
  
  // 初始化实时图表（使用模拟数据）
  initRealtimeChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理定时器
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
  }
  
  // 销毁图表
  trendChart?.dispose()
  distributionChart?.dispose()
  rankingChart?.dispose()
  realtimeChart?.dispose()
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 苹果风格设计系统 */
.dashboard-container {
  padding: 32px;
  background: #f8f8f8;
  min-height: 100vh;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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

/* 筛选栏 - 苹果风格毛玻璃效果 */
.filter-bar {
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  padding: 20px 28px;
  border-radius: 20px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-bar:hover {
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.08);
}

/* 统计卡片 - 苹果风格简洁设计 */
.statistics-cards {
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 140px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.3;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 苹果风格配色 - 柔和、优雅 */
.stat-card-1 {
  color: #1d1d1f;
  border-left: 4px solid #007aff;
}

.stat-card-1::before {
  color: #007aff;
}

.stat-card-2 {
  color: #1d1d1f;
  border-left: 4px solid #ff3b30;
}

.stat-card-2::before {
  color: #ff3b30;
}

.stat-card-3 {
  color: #1d1d1f;
  border-left: 4px solid #34c759;
}

.stat-card-3::before {
  color: #34c759;
}

.stat-card-4 {
  color: #1d1d1f;
  border-left: 4px solid #ff9500;
}

.stat-card-4::before {
  color: #ff9500;
}

.stat-icon {
  font-size: 44px;
  margin-right: 20px;
  opacity: 0.8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card-1 .stat-icon {
  color: #007aff;
}

.stat-card-2 .stat-icon {
  color: #ff3b30;
}

.stat-card-3 .stat-icon {
  color: #34c759;
}

.stat-card-4 .stat-icon {
  color: #ff9500;
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
  opacity: 1;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 10px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

.stat-trend {
  font-size: 12px;
  color: #34c759;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

/* 图表区域 - 苹果风格卡片 */
.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-card:hover {
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.chart-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.chart-container {
  flex: 1;
  min-height: 300px;
  width: 100%;
}

/* 表格区域 */
.table-section {
  margin-bottom: 32px;
}

.visit-count {
  font-weight: 600;
  color: #007aff;
}

/* 优化图标颜色 */
.stat-card-1 .stat-trend {
  color: #34c759;
}

.stat-card-2 .stat-trend {
  color: #34c759;
}

.stat-card-3 .stat-trend {
  color: #34c759;
}

.stat-card-4 .stat-trend {
  color: #34c759;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px 16px;
  }
  
  .stat-card {
    height: 120px;
    padding: 24px;
  }
  
  .stat-icon {
    font-size: 36px;
    margin-right: 16px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .chart-container {
    min-height: 250px;
  }
  
  .chart-card {
    padding: 20px;
  }
}

/* 苹果风格滚动条 */
:deep(.ant-table-body) {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

:deep(.ant-table-body)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.ant-table-body)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.ant-table-body)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

:deep(.ant-table-body)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 优化 Ant Design 组件样式 */
:deep(.ant-input),
:deep(.ant-picker) {
  border-radius: 12px;
  border-color: rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input:hover),
:deep(.ant-picker:hover) {
  border-color: rgba(0, 0, 0, 0.2);
}

:deep(.ant-input:focus),
:deep(.ant-picker:focus) {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

:deep(.ant-btn) {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

:deep(.ant-btn-primary) {
  background: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: #0051d5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

:deep(.ant-btn-default) {
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

:deep(.ant-btn-default:hover) {
  background: rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
  border-color: transparent;
}

:deep(.ant-radio-button-wrapper) {
  border-radius: 8px;
  border-color: rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-radio-button-wrapper-checked) {
  background: #007aff;
  border-color: #007aff;
  color: #fff;
}

:deep(.ant-tag) {
  border-radius: 8px;
  border: none;
  padding: 4px 12px;
  font-weight: 500;
}

:deep(.ant-table) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.ant-table-thead > tr > th) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-weight: 600;
  color: #1d1d1f;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(0, 0, 0, 0.02);
}
</style>

