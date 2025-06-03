<template>
  <div class="app-wrapper">
    <SideMenu
      :is-collapse="isCollapse"
      :routes="permissionRoutes"
      class="sidebar-container"
      :class="{ 'is-collapse': isCollapse }"
    />

    <div class="main-container">
      <HeaderNav
        :is-collapse="isCollapse"
        @toggle-sidebar="toggleSidebar"
      />

      <div class="app-main">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.path" />
            </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from './SideMenu.vue'
import HeaderNav from './HeaderNav.vue'

const router = useRouter()
const isCollapse = ref(false)

// --- 关键修改：填充 cachedViews 数组 ---
// 这些名称必须与你在对应 Vue 组件的 <script setup> 中使用 defineOptions({ name: 'ComponentName' })
// 或者在组件的 name 选项中定义的名称完全一致。
const cachedViews = ref([
  'SalesOrderManagement',   // 确保 SalesOrderManagement.vue 中定义了 name: 'SalesOrderManagement'
  'CreateSalesOrder',       // 确保 CreateSalesOrder.vue 中定义了 name: 'CreateSalesOrder'
                              // 这个 name 会用于其作为新建、编辑、详情、审核等多种模式的组件缓存
  // 如果其他列表页或需要缓存的页面也希望在返回时通过 onActivated 刷新，将它们的组件名也加入进来：
  // 'OutboundOrderManagement',
  // 'ShipmentOrderManagement',
  // 'PurchaseRequisitionManagement',
  // 'PurchaseOrderManagement',
  // 'InboundOrderManagement',
  // 'InventoryInquiryPage', // 假设库存查询页的组件名为 InventoryInquiryPage
]);
// --- 结束关键修改 ---

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('sidebarStatus', isCollapse.value ? 'collapsed' : 'expanded')
}

// permissionRoutes, filterRoutes, hasPermission 的逻辑保持你原来的不变
const permissionRoutes = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userRoles = userInfo.roles || []
  // 确保 router.options.routes 是响应式的，或者在需要时能获取到最新的路由表
  // 如果路由是动态添加的，这里的 router.options.routes 可能不是最终的完整路由表
  // 但通常在应用初始化时，静态路由已经定义好了。
  return filterRoutes(router.options.routes, userRoles)
})

const filterRoutes = (routes, userRoles) => {
  const filteredRoutes = []
  routes.forEach(route => {
    // 过滤掉登录页和隐藏的路由
    if (route.path === '/login' || route.meta?.hidden) {
      return
    }
    const tmp = { ...route }
    if (hasPermission(userRoles, tmp)) {
      if (tmp.children) {
        tmp.children = filterRoutes(tmp.children, userRoles)
      }
      // 修改这里的逻辑：如果路由有子路由且子路由有内容，或者路由本身没有子路由（是叶子节点），
      // 或者路由虽然有子路由但子路由为空（可能是动态权限导致子路由被过滤完了，但父级菜单仍需显示）
      // 并且该路由本身不是一个纯粹的重定向路由（有些重定向父路由可能不需要在菜单中显示）
      // 一个更简单的规则是：只要有权限，且不是纯粹为了组织结构的不可见父路由，就显示。
      // 如果一个父路由没有component，并且它的所有可访问子路由都被过滤掉了，那么它可能也不应该显示。
      // 这里的逻辑需要根据你的菜单生成策略来精确调整。
      // 一个更直接的判断可能是：如果它有可显示的子路由，或者它本身是一个可直接访问的叶子节点路由。
      if ((tmp.children && tmp.children.length > 0) || (!tmp.children && tmp.component) || (tmp.path === '/' && tmp.redirect && (!tmp.children || tmp.children.length === 0))) {
        filteredRoutes.push(tmp)
      } else if (tmp.children && tmp.children.length === 0 && !tmp.component && tmp.redirect) {
        // 如果一个父路由没有组件，子路由也被过滤完了，但有重定向，通常不显示在菜单里，但这里保留了你的原始逻辑分支
         // 针对你的原始逻辑中对根路径重定向的处理：
         if (tmp.path ==='/' && tmp.redirect) {
            filteredRoutes.push(tmp)
         }
      }
    }
  })
  return filteredRoutes
}

const hasPermission = (roles, route) => {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    // 如果路由没有定义 meta.roles，则默认所有用户都有权限
    return true 
  }
}

onMounted(() => {
  const savedState = localStorage.getItem('sidebarStatus')
  isCollapse.value = savedState === 'collapsed'
})
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar-container {
  width: var(--sidebar-width, 210px); /* 使用你在 global.css 中定义的变量，或提供默认值 */
  height: 100%;
  background-color: white; /* 或者你的侧边栏背景色 */
  transition: width 0.28s;
  overflow-y: auto; /* 允许侧边栏内容滚动 */
  border-right: 1px solid var(--border-color-lighter, #ebeef5); /* 使用变量或默认值 */
  flex-shrink: 0; /* 防止侧边栏在空间不足时被压缩 */
}

.sidebar-container.is-collapse {
  width: var(--sidebar-collapsed-width, 64px); /* 使用变量或默认值 */
}

/* 隐藏侧边栏滚动条 (保持你的样式) */
.sidebar-container::-webkit-scrollbar {
    display: none;
}
.sidebar-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.main-container {
  flex: 1; /* 让主内容区占据剩余空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内部滚动条影响整体布局 */
  background-color: var(--bg-color); /* 使用你在 global.css 中定义的变量 */
}

.app-main {
  flex-grow: 1; /* 让 app-main 填满 main-container 中 HeaderNav 以下的区域 */
  padding: 20px;
  overflow-y: auto; /* 如果主内容区超出高度，则显示滚动条 */
  /* 使用你在 global.css 中定义的 --header-height 变量，并提供一个回退值 */
  height: calc(100vh - var(--header-height, 50px)); 
}
</style>