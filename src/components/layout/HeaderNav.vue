<template>
  <div class="header-container">
    <div class="left-area">
      <div class="hamburger-container" @click="toggleSidebar">
        <el-icon :size="20">
          <component :is="isCollapse ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>

      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item
          v-for="item in breadcrumbItems"
          :key="item.path || item.title"
          :to="item.path ? { path: item.path } : undefined"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right-area">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-dropdown">
          <el-avatar :size="30" class="user-avatar">
            {{ userInfo.fullName?.charAt(0) || userInfo.username?.charAt(0) || 'U' }}
          </el-avatar>
          <span class="user-name">{{ userInfo.fullName || userInfo.username || '未登录' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
// 假设图标已全局注册或在此按需导入
// import { Expand, Fold, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue';

// 定义属性
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['toggle-sidebar'])

// 路由和当前路由实例
const router = useRouter()
const route = useRoute()

// 用户信息
const userInfo = ref({})

// 面包屑生成逻辑
const breadcrumbItems = computed(() => {
  const matched = route.matched;
  const items = [];

  for (let i = 0; i < matched.length; i++) {
    const record = matched[i];

    // 跳过没有标题的路由记录
    if (!record.meta || !record.meta.title) {
      continue;
    }

    // 跳过根布局路由 (path: '/'),除非当前就是首页(name:'Home')或者根路由本身有特殊标题要显示
    // 并且它是唯一的匹配项（通常不会是这种情况，因为总有子路由）
    // 或者它是 'Home' 路由的直接父级，且没有自己的独立标题。
    // 您的配置中，根路由 '/' 重定向到 '/home', 'home' 是它的子路由。
    // 而其他主菜单如 '/sales' 是独立的顶级路由（与 '/' 平级，都使用 Layout 组件）。
    // 所以，我们需要确保只从定义了主菜单的那一级开始显示。
    // `route.matched` 的第一个元素通常是 Layout 应用的根路由 `/`。
    // 如果 `record.path` 为 `/` 并且它有子路由 (通常是重定向或实际的 `home` 子路由)
    // 并且当前路由不是 `Home`，那么我们通常不把这个根路径 `/` 本身作为面包屑的第一项。
    if (record.path === '/' && record.redirect && route.name !== 'Home' && matched.length > 1) {
        // 如果根路由只是一个包装器并且当前不在首页，则跳过它
        // 如果根路由有自己的标题且希望显示（比如就叫“首页”），则不跳过
        // 根据您的路由配置，根路由 '/' 下有 'home' 子路由，其 meta.title 为 '首页'
        // 其他主菜单如 '/sales' 的 meta.title 为 '销售管理'
        // 这样设计，当访问 /sales/order/list 时，matched[0] 是 '/'，matched[1] 是 '/sales'
        // 我们不希望显示 path 为 '/' 的那个记录。
      continue;
    }
    
    const path = (record.path === route.path || i === matched.length - 1) ? undefined : record.path;
    items.push({
      title: record.meta.title,
      path: path,
    });
  }
  return items;
});


// 切换侧边栏
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'profile') {
    // 假设有个人中心路由 /profile
    router.push('/profile').catch(err => { if(err.name !== 'NavigationDuplicated') console.error(err) });
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 调用您 src/api/auth.js 中的 logout 方法
      // await logoutApi(); // 假设您有封装的 logout API 调用
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.success('退出成功')
      router.push('/login')
    } catch(error) {
      if (error !== 'cancel') {
        ElMessage.info('已取消退出');
      }
    }
  }
}

// 组件挂载时加载用户信息
onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
  }
})
</script>

<style scoped>
.header-container {
  height: var(--header-height, 50px);
  padding: 0 15px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center; /* 确保容器内的子元素垂直居中 */
  justify-content: space-between;
}

.left-area {
  display: flex;
  align-items: center; /* 确保汉堡按钮和面包屑在 .left-area 内垂直居中 */
  flex-grow: 1; /* 让左侧区域占据尽可能多的空间，将右侧推到最右 */
  overflow: hidden; /* 防止面包屑过长时溢出 */
}

.hamburger-container {
  display: flex;
  align-items: center;
  justify-content: center;
  /* height: 100%; */ /* 使用与header-container一致的高度或确保内容垂直居中 */
  height: var(--header-height, 50px); /* 明确高度 */
  padding: 0 15px;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0; /* 防止被压缩 */
}

.hamburger-container:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.breadcrumb {
  margin-left: 10px;
  display: flex; /* 确保面包屑自身也参与到flex对齐 */
  align-items: center; /* 确保面包屑内的项也垂直居中 */
  white-space: nowrap; /* 防止面包屑换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 对溢出文本显示省略号 */
}

/* Element Plus 面包屑项目样式调整 */
:deep(.el-breadcrumb__item .el-breadcrumb__inner),
:deep(.el-breadcrumb__item .el-breadcrumb__separator) {
  color: var(--font-color-secondary); /* 默认项颜色 */
  font-size: 14px; /* 确保字体大小 */
  /* line-height: var(--header-height, 50px); */ /* Flex布局下通常不需要强制行高对齐 */
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--font-color-primary); /* 当前页面面包屑颜色 */
  font-weight: 500; /* 可以加粗当前项 */
}
/* 对于可点击的面包屑项 */
:deep(.el-breadcrumb__item .el-breadcrumb__inner.is-link:hover) {
  color: var(--primary-color);
}


.right-area {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 防止被压缩 */
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: var(--header-height, 50px); /* 确保下拉菜单触发区域高度与头部一致 */
}

.user-avatar {
  background-color: var(--primary-color, #1890ff);
  margin-right: 8px; /* 头像与用户名间距 */
}

.user-name {
  /* margin: 0 8px; */ /* 调整与头像和下拉箭头的间距 */
  font-size: 14px;
  color: var(--font-color-primary, #333);
  margin-right: 5px; /* 用户名与下拉箭头间距 */
}
</style>