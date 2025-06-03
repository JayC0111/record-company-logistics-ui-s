import { createRouter, createWebHistory } from 'vue-router'

// 布局组件
import Layout from '@/components/layout/Layout.vue'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页', icon: 'House' }
      }
    ]
  },
  // 销售管理
  {
    path: '/sales',
    component: Layout,
    redirect: '/sales/order/list',
    meta: { title: '销售管理', icon: 'Sell', roles: ['ROLE_SALES', 'ROLE_SALES_MANAGER', 'ROLE_ADMIN'] },
    children: [
      {
        path: 'order/create',
        name: 'CreateSalesOrder',
        component: () => import('@/views/sales/salesOrder/CreateSalesOrder.vue'),
        meta: { title: '新建销售单', icon: 'DocumentAdd' }
      },
      {
        path: 'order/list',
        name: 'SalesOrderList',
        component: () => import('@/views/sales/salesOrder/SalesOrderManagement.vue'),
        meta: { title: '销售单管理', icon: 'Document' }
      },
      {
        path: 'order/edit/:id',
        name: 'EditSalesOrder',
        component: () => import('@/views/sales/salesOrder/CreateSalesOrder.vue'),
        meta: { title: '编辑销售单', hidden: true },
        props: route => ({ id: route.params.id, mode: 'edit' })
      },
      {
        path: 'order/detail/:id',
        name: 'SalesOrderDetail',
        component: () => import('@/views/sales/salesOrder/CreateSalesOrder.vue'),
        meta: { title: '销售单详情', hidden: true },
        props: (route) => ({ 
          id: route.params.id, 
          mode: route.query.mode || 'view' 
        })
      },
      {
        path: 'shipment/create',
        name: 'CreateShipment',
        component: () => import('@/views/sales/shipmentOrder/CreateShipmentOrder.vue'),
        meta: { title: '新建发货单', icon: 'Van' }
      },
      {
        path: 'shipment/list',
        name: 'ShipmentList',
        component: () => import('@/views/sales/shipmentOrder/ShipmentOrderManagement.vue'),
        meta: { title: '发货单管理', icon: 'Postcard' }
      },
      {
        path: 'shipment/edit/:id',
        name: 'EditShipment',
        component: () => import('@/views/sales/shipmentOrder/CreateShipmentOrder.vue'),
        meta: { title: '编辑发货单', hidden: true },
        props: route => ({ id: route.params.id, mode: 'edit' })
      },
      {
        path: 'shipment/detail/:id',
        name: 'ShipmentDetail',
        component: () => import('@/views/sales/shipmentOrder/CreateShipmentOrder.vue'),
        meta: { title: '发货单详情', hidden: true },
        props: (route) => ({ id: route.params.id, mode: 'view' })
      }
    ]
  },
  // 采购管理
  {
    path: '/purchase',
    component: Layout,
    redirect: '/purchase/plan/list',
    meta: { title: '采购管理', icon: 'ShoppingCart', roles: ['ROLE_PURCHASER', 'ROLE_PURCHASING_MANAGER', 'ROLE_ADMIN'] },
    children: [
      // ... (采购管理的其他子路由保持不变) ...
      {
        path: 'plan/create',
        name: 'CreatePurchasePlan',
        component: () => import('@/views/purchase/purchaseRequisition/CreatePurchaseRequisition.vue'),
        meta: { title: '新建采购计划单', icon: 'DocumentAdd' } 
      },
      {
        path: 'plan/list',
        name: 'PurchasePlanList',
        component: () => import('@/views/purchase/purchaseRequisition/PurchaseRequisitionManagement.vue'),
        meta: { title: '采购计划单管理', icon: 'List' }
      },
      {
        path: 'plan/edit/:id',
        name: 'EditPurchasePlan',
        component: () => import('@/views/purchase/purchaseRequisition/CreatePurchaseRequisition.vue'),
        meta: { title: '编辑采购计划单', hidden: true },
        props: route => ({ id: route.params.id, mode: 'edit' })
      },
      {
        path: 'plan/detail/:id',
        name: 'PurchasePlanDetail',
        component: () => import('@/views/purchase/purchaseRequisition/CreatePurchaseRequisition.vue'),
        meta: { title: '采购计划单详情', hidden: true },
        props: (route) => ({ id: route.params.id, mode: route.query.mode || 'view' })
      },
      {
        path: 'order/create',
        name: 'CreatePurchaseOrder',
        component: () => import('@/views/purchase/purchaseOrder/CreatePurchaseOrder.vue'),
        meta: { title: '新建采购单', icon: 'DocumentAdd' } 
      },
      {
        path: 'order/list',
        name: 'PurchaseOrderList',
        component: () => import('@/views/purchase/purchaseOrder/PurchaseOrderManagement.vue'),
        meta: { title: '采购单管理', icon: 'Document' }
      },
      {
        path: 'order/edit/:id',
        name: 'EditPurchaseOrder',
        component: () => import('@/views/purchase/purchaseOrder/CreatePurchaseOrder.vue'),
        meta: { title: '编辑采购单', hidden: true },
        props: route => ({ id: route.params.id, mode: 'edit' })
      },
      {
        path: 'order/detail/:id',
        name: 'PurchaseOrderDetail',
        component: () => import('@/views/purchase/purchaseOrder/CreatePurchaseOrder.vue'),
        meta: { title: '采购单详情', hidden: true },
        props: (route) => ({ id: route.params.id, mode: route.query.mode || 'view' })
      }
    ]
  },
  // 库存管理
  {
    path: '/inventory',
    component: Layout,
    // MODIFIED: 根据库存子菜单的实际情况调整 redirect，例如先到库存查询或出库单列表
    redirect: '/inventory/outbound/list', 
    meta: { title: '库存管理', icon: 'Box', roles: ['ROLE_WAREHOUSE', 'ROLE_ADMIN'] },
    children: [
      {
        path: 'stock', // 原有的库存查询
        name: 'StockInquiry', // 建议给路由名称加上模块前缀或更明确的后缀
        component: () => import('@/views/inventory/inventoryInquiry/Index.vue'),
        meta: { title: '库存查询', icon: 'Search' }
      },
      {
        path: 'inbound/create',
        name: 'CreateInboundOrder', // 建议统一命名规范
        component: () => import('@/views/inventory/inboundOrder/CreateInboundOrder.vue'),
        meta: { title: '新建入库单', icon: 'DocumentAdd' }
      },
      {
        path: 'inbound/list',
        name: 'InboundOrderList', // 建议统一命名规范
        component: () => import('@/views/inventory/inboundOrder/InboundOrderManagement.vue'),
        meta: { title: '入库单管理', icon: 'TopRight' }
      },
      {
        path: 'inbound/edit/:id',
        name: 'EditInboundOrder',
        component: () => import('@/views/inventory/inboundOrder/CreateInboundOrder.vue'),
        meta: { title: '编辑入库单', hidden: true },
        props: route => ({ id: route.params.id, mode: 'edit' })
      },
      {
        path: 'inbound/detail/:id',
        name: 'InboundOrderDetail',
        component: () => import('@/views/inventory/inboundOrder/CreateInboundOrder.vue'),
        meta: { title: '入库单详情', hidden: true },
        props: (route) => ({ id: route.params.id, mode: route.query.mode || 'view' })
      },
      // --- MODIFIED: 新增出库单相关路由 ---
      {
        path: 'outbound/create',
        name: 'CreateOutboundOrder',
        component: () => import('@/views/inventory/outboundOrder/CreateOutboundOrder.vue'),
        meta: { title: '新建出库单', icon: 'DocumentAdd' }
        // props: { mode: 'create' } // 'create' 模式通常是默认，无需显式传递 mode
      },
      {
        path: 'outbound/list',
        name: 'OutboundOrderList',
        component: () => import('@/views/inventory/outboundOrder/OutboundOrderManagement.vue'),
        meta: { title: '出库单管理', icon: 'BottomLeft' }
      },
      {
        path: 'outbound/process/:id', // 用于处理（拣货）出库单
        name: 'ProcessOutboundOrder',
        component: () => import('@/views/inventory/outboundOrder/CreateOutboundOrder.vue'),
        meta: { title: '处理出库单', hidden: true },
        props: route => ({ id: route.params.id, mode: 'process' }) // 使用 'process' mode
      },
      {
        path: 'outbound/detail/:id', // 用于查看出库单详情
        name: 'OutboundOrderDetail',
        component: () => import('@/views/inventory/outboundOrder/CreateOutboundOrder.vue'),
        meta: { title: '出库单详情', hidden: true },
        props: (route) => ({ id: route.params.id, mode: route.query.mode || 'view' })
      }
      // --- 结束新增出库单相关路由 ---
    ]
  },
  // 基础数据管理
  {
    path: '/basedata',
    component: Layout,
    redirect: '/basedata/products', 
    meta: { title: '基础数据', icon: 'Files' },
    children: [ /* ... (保持不变) ... */ ]
  },
  // 系统管理
  {
    path: '/system',
    component: Layout,
    redirect: '/system/users',
    meta: { title: '系统管理', icon: 'Setting', roles: ['ROLE_ADMIN'] },
    children: [ /* ... (保持不变) ... */ ]
  },
  // 403 Forbidden 页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { title: '无权限访问', hidden: true }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面未找到', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 宏博音乐` : '宏博音乐'
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    if (to.meta.roles) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const roles = userInfo.roles || []
      if (roles.some(role => to.meta.roles.includes(role))) {
        next()
      } else {
        next({ path: '/403', replace: true })
      }
    } else {
      next()
    }
  }
})

export default router