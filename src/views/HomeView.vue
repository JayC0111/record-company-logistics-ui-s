<template>
  <div class="home-container">
    <div class="welcome-section">
      <h2>欢迎使用唱片公司物流信息管理系统</h2>
      <p>今天是 {{ currentDate }}，{{ greeting }}！</p>
    </div>

    <!-- 快捷操作卡片 -->
    <div class="shortcut-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(card, index) in shortcutCards" :key="index">
          <el-card shadow="hover" class="shortcut-card" @click="navigateTo(card.route)">
            <div class="card-content">
              <el-icon :size="32" :color="card.color">
                <component :is="card.icon"></component>
              </el-icon>
              <div class="card-info">
                <div class="card-title">{{ card.title }}</div>
                <div class="card-desc">{{ card.description }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="8" v-for="(stat, index) in stats" :key="index">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
              <el-icon :size="24" color="#fff">
                <component :is="stat.icon"></component>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-trend" :class="{ 'up': stat.trend > 0, 'down': stat.trend < 0 }">
                <el-icon v-if="stat.trend > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="stat.trend < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(stat.trend) }}%</span>
                <span>相比上周</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 待办事项 -->
    <div class="todo-section">
      <el-card shadow="hover">
        <template #header>
          <div class="todo-header">
            <span>待办事项</span>
            <el-button type="primary" text>查看全部</el-button>
          </div>
        </template>
        <el-table :data="todoList" stripe style="width: 100%">
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-tag :type="getTaskTypeColor(scope.row.type)">{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="date" label="日期" width="180" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === '待处理' ? 'danger' : 'warning'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="handleTodoAction(scope.row, 'view')">
                查看
              </el-button>
              <el-button type="success" link size="small" @click="handleTodoAction(scope.row, 'handle')">
                处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 当前日期和问候语
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
})

// 快捷操作卡片
const shortcutCards = ref([
  {
    title: '创建销售单',
    description: '新建销售订单',
    icon: 'DocumentAdd',
    color: '#409EFF',
    route: '/sales/order/edit'
  },
  {
    title: '库存查询',
    description: '查看商品库存',
    icon: 'Search',
    color: '#67C23A',
    route: '/inventory/stock'
  },
  {
    title: '创建采购单',
    description: '新建采购订单',
    icon: 'ShoppingCart',
    color: '#E6A23C',
    route: '/purchase/orders'
  },
  {
    title: '发货管理',
    description: '处理待发货订单',
    icon: 'Van',
    color: '#F56C6C',
    route: '/sales/shipments'
  }
])

// 统计数据
const stats = ref([
  {
    title: '本月销售额',
    value: '￥152,250',
    icon: 'Money',
    trend: 12.5,
    bgColor: '#409EFF'
  },
  {
    title: '本月采购额',
    value: '￥89,320',
    icon: 'ShoppingCart',
    trend: -5.2,
    bgColor: '#E6A23C'
  },
  {
    title: '本月出库量',
    value: '1,253件',
    icon: 'Goods',
    trend: 8.3,
    bgColor: '#67C23A'
  }
])

// 待办事项
const todoList = ref([
  {
    id: 1,
    type: '销售单',
    title: 'SO-20240315-001 待审核',
    date: '2024-03-15 09:30:45',
    status: '待处理'
  },
  {
    id: 2,
    type: '出库单',
    title: 'OUT-20240316-002 待处理',
    date: '2024-03-16 14:22:38',
    status: '待处理'
  },
  {
    id: 3,
    type: '采购单',
    title: 'PO-20240314-005 已到货待入库',
    date: '2024-03-14 10:15:22',
    status: '进行中'
  },
  {
    id: 4,
    type: '库存预警',
    title: '3件商品库存低于安全库存',
    date: '2024-03-17 00:00:00',
    status: '待处理'
  }
])

// 跳转到指定路由
const navigateTo = (route) => {
  router.push(route)
}

// 获取任务类型对应的颜色
const getTaskTypeColor = (type) => {
  const colorMap = {
    '销售单': 'primary',
    '出库单': 'success',
    '采购单': 'warning',
    '库存预警': 'danger'
  }
  return colorMap[type] || 'info'
}

// 处理待办事项操作
const handleTodoAction = (item, action) => {
  console.log(`对待办事项 ${item.id} 执行 ${action} 操作`)
  
  // 根据待办事项类型和操作类型进行不同处理
  if (action === 'view') {
    if (item.type === '销售单') {
      // 提取销售单号中的ID部分
      const orderId = item.title.split(' ')[0].split('-').pop()
      router.push(`/sales/order/detail/${orderId}`)
    } else if (item.type === '出库单') {
      router.push('/inventory/outbound')
    } else if (item.type === '采购单') {
      router.push('/purchase/orders')
    } else if (item.type === '库存预警') {
      router.push('/inventory/stock')
    }
  } else if (action === 'handle') {
    // 处理操作的路由跳转逻辑与查看类似
    if (item.type === '销售单') {
      const orderId = item.title.split(' ')[0].split('-').pop()
      router.push(`/sales/order/edit/${orderId}`)
    } else if (item.type === '出库单') {
      router.push('/inventory/outbound')
    } else if (item.type === '采购单') {
      router.push('/purchase/orders')
    } else if (item.type === '库存预警') {
      router.push('/purchase/plans')
    }
  }
}

// 组件挂载
onMounted(() => {
  // 可以在这里调用API获取首页数据
  console.log('首页组件挂载完成')
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-section h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.welcome-section p {
  font-size: 16px;
  color: #606266;
}

.shortcut-cards {
  margin-bottom: 24px;
}

.shortcut-card {
  cursor: pointer;
  transition: all 0.3s;
}

.shortcut-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  align-items: center;
}

.card-info {
  margin-left: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 13px;
  color: #909399;
}

.overview-section {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #909399;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.stat-trend span {
  margin-right: 4px;
}

.todo-section {
  margin-bottom: 24px;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>