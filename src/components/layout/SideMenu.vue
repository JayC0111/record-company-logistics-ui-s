<template>
  <div class="sidebar">
    <div class="logo-container" :class="{'is-collapse': isCollapse}">
      <router-link to="/" class="logo-link-wrapper">
        <img v-if="logo" :src="logo" class="sidebar-logo" alt="宏博音乐 Logo" />
        <h1 v-if="!isCollapse" class="sidebar-title">宏博音乐</h1>
      </router-link>
    </div>

    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        background-color="#ffffff"
        text-color="#333333"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/home" @click="handleMenuClick('/home')" :class="{'is-in-active-group': activeTopLevelRoutePath === '/home' && activeMenu !== '/home'}">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-sub-menu index="/sales" :class="{ 'is-active-main-menu': activeTopLevelRoutePath === '/sales' }">
          <template #title>
            <el-icon><Sell /></el-icon>
            <span>销售管理</span>
          </template>
          <el-menu-item index="/sales/order/create" @click="handleMenuClick('/sales/order/create')">
            <el-icon><DocumentAdd /></el-icon>
            <template #title>新建销售单</template>
          </el-menu-item>
          <el-menu-item index="/sales/order/list" @click="handleMenuClick('/sales/order/list')">
            <el-icon><Document /></el-icon>
            <template #title>销售单管理</template>
          </el-menu-item>
          <el-menu-item index="/sales/shipment/create" @click="handleMenuClick('/sales/shipment/create')">
            <el-icon><Van /></el-icon>
            <template #title>新建发货单</template>
          </el-menu-item>
          <el-menu-item index="/sales/shipment/list" @click="handleMenuClick('/sales/shipment/list')">
            <el-icon><Postcard /></el-icon>
            <template #title>发货单管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/purchase" :class="{ 'is-active-main-menu': activeTopLevelRoutePath === '/purchase' }">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>采购管理</span>
          </template>
          <el-menu-item index="/purchase/plan/create" @click="handleMenuClick('/purchase/plan/create')">
            <el-icon><DocumentAdd /></el-icon>
            <template #title>新建采购计划单</template>
          </el-menu-item>
          <el-menu-item index="/purchase/plan/list" @click="handleMenuClick('/purchase/plan/list')">
            <el-icon><List /></el-icon>
            <template #title>采购计划单管理</template>
          </el-menu-item>
          <el-menu-item index="/purchase/order/create" @click="handleMenuClick('/purchase/order/create')">
            <el-icon><DocumentAdd /></el-icon>
            <template #title>新建采购单</template>
          </el-menu-item>
          <el-menu-item index="/purchase/order/list" @click="handleMenuClick('/purchase/order/list')">
            <el-icon><Document /></el-icon>
            <template #title>采购单管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/inventory" :class="{ 'is-active-main-menu': activeTopLevelRoutePath === '/inventory' }">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory/stock" @click="handleMenuClick('/inventory/stock')">
            <el-icon><Search /></el-icon>
            <template #title>库存查询</template>
          </el-menu-item>
          <el-menu-item index="/inventory/inbound/create" @click="handleMenuClick('/inventory/inbound/create')">
            <el-icon><DocumentAdd /></el-icon>
            <template #title>新建入库单</template>
          </el-menu-item>
          <el-menu-item index="/inventory/inbound/list" @click="handleMenuClick('/inventory/inbound/list')">
            <el-icon><TopRight /></el-icon>
            <template #title>入库单管理</template>
          </el-menu-item>
          <el-menu-item index="/inventory/outbound/create" @click="handleMenuClick('/inventory/outbound/create')">
            <el-icon><DocumentAdd /></el-icon>
            <template #title>新建出库单</template>
          </el-menu-item>
          <el-menu-item index="/inventory/outbound/list" @click="handleMenuClick('/inventory/outbound/list')">
            <el-icon><BottomLeft /></el-icon>
            <template #title>出库单管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/basedata" :class="{ 'is-active-main-menu': activeTopLevelRoutePath === '/basedata' }">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>基础数据</span>
          </template>
          <el-menu-item index="/basedata/products" @click="handleMenuClick('/basedata/products')">
            <el-icon><Goods /></el-icon>
            <template #title>商品管理</template>
          </el-menu-item>
          <el-menu-item index="/basedata/customers" @click="handleMenuClick('/basedata/customers')">
            <el-icon><UserFilled /></el-icon>
            <template #title>客户管理</template>
          </el-menu-item>
          <el-menu-item index="/basedata/suppliers" @click="handleMenuClick('/basedata/suppliers')">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>供应商管理</template>
          </el-menu-item>
          <el-menu-item index="/basedata/logistics" @click="handleMenuClick('/basedata/logistics')">
            <el-icon><Van /></el-icon>
            <template #title>物流公司</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/system" :class="{ 'is-active-main-menu': activeTopLevelRoutePath === '/system' }">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/users" @click="handleMenuClick('/system/users')">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import logoSrc from '@/assets/images/logo-text.png';

const logo = ref(logoSrc);

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  },
  routes: { 
    type: Array,
    default: () => []
  }
});

const router = useRouter();
const route = useRoute();

const activeMenu = computed(() => {
  if (route.meta.activeMenu) {
    return route.meta.activeMenu;
  }
  return route.path;
});

const activeTopLevelRoutePath = computed(() => {
  const matched = route.matched;
  if (matched.length > 0) {
    if (matched[0].path === '/' && matched.length > 1) {
      return matched[1].path;
    }
    return matched[0].path;
  }
  return '';
});

const handleMenuClick = (path) => {
  router.push(path);
};
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white; 
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); 
}

.logo-container {
  height: var(--header-height, 50px); 
  line-height: var(--header-height, 50px);
  background: #ffffff; 
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid var(--border-color-lighter, #ebeef5); 
  flex-shrink: 0;
}

.logo-link-wrapper {
  display: flex;
  align-items: center;
  justify-content: center; 
  height: 100%;
  padding: 0 10px; 
  text-decoration: none; 
}

.logo-container.is-collapse .logo-link-wrapper {
  padding: 0; 
}

.sidebar-logo {
  width: 32px;  
  height: 32px; 
  vertical-align: middle;
}

.sidebar-title {
  display: inline-block;
  margin: 0 0 0 10px;
  color: var(--brand-logo-text-color, #0033FF); 
  font-weight: 600;
  font-size: 18px; 
  font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
  vertical-align: middle;
  white-space: nowrap;
}

.logo-container.is-collapse .sidebar-title {
  display: none; 
}
.logo-container.is-collapse .sidebar-logo {
  margin: 0; 
}

.el-scrollbar {
  flex: 1;
  background-color: white; 
}

.el-menu {
  border-right: none; 
}

/* 激活菜单项的左侧蓝色竖条和特定背景色 */
:deep(.el-menu-item.is-active) {
  background-color: #e6f7ff !important; 
  color: var(--primary-color, #1890ff) !important; 
  border-left: 3px solid var(--menu-active-border-color, #0056b3); 
  transition: background-color 0s, color 0s, border-left 0s !important; /* <<< 修改点：移除过渡 */
}
:deep(.el-menu-item.is-active .el-icon) {
  color: var(--primary-color, #1890ff); 
  transition: color 0s !important; /* <<< 修改点：移除过渡 */
}

/* 当主菜单激活时，其下所有子菜单项（除了当前is-active的那个）的背景色 */
:deep(.el-sub-menu.is-active-main-menu .el-menu-item:not(.is-active)) {
  background-color: var(--menu-item-active-group-bg, #f5f7fa) !important;
  transition: background-color 0s, color 0s !important; /* <<< 修改点：移除过渡 */
}
/* 如果首页是 el-menu-item 并且也想应用这个逻辑 */
:deep(.el-menu-item.is-in-active-group:not(.is-active)) {
  background-color: var(--menu-item-active-group-bg, #f5f7fa) !important;
  transition: background-color 0s, color 0s !important; /* <<< 修改点：移除过渡 */
}


/* 默认菜单项和子菜单标题 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #303133 !important; 
  height: 48px; 
  line-height: 48px; 
  transition: background-color 0s, color 0s !important; /* <<< 修改点：移除默认和悬停的过渡 */
}
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  color: #606266; 
  transition: color 0s !important; /* <<< 修改点：移除图标颜色的过渡 */
}

/* 悬停样式 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #f0f2f5 !important; 
  color: var(--primary-color, #1890ff) !important; 
  /* transition 已在上面统一设置为 none */
}
:deep(.el-menu-item:hover .el-icon),
:deep(.el-sub-menu__title:hover .el-icon) {
  color: var(--primary-color, #1890ff) !important; 
  /* transition 已在上面统一设置为 none */
}

/* 折叠状态下的图标样式 */
:deep(.el-menu--collapse .el-menu-item [class^="el-icon"]),
:deep(.el-menu--collapse .el-sub-menu__title [class^="el-icon"]) {
  margin: 0;
  vertical-align: middle;
  width: 24px;
  text-align: center;
}
:deep(.el-menu--collapse > .el-menu-item .el-tooltip__trigger), 
:deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title .el-tooltip__trigger) {
  justify-content: center;
}

/* 激活的子菜单的标题样式 */
:deep(.el-sub-menu.is-active > .el-sub-menu__title),
:deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon) {
  color: var(--primary-color, #1890ff) !important;
  transition: color 0s !important; /* <<< 修改点：移除过渡 */
}
</style>