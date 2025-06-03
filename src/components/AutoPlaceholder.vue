<template>
    <PlaceholderPage
      :title="pageTitle"
      :path="pagePath"
      :module="pageModule"
      :feature="pageFeature"
    />
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import PlaceholderPage from './PlaceholderPage.vue';
  
  const route = useRoute();
  
  // 模块映射表
  const moduleMap = {
    'dashboard': '工作台',
    'sales': '销售中心',
    'purchase': '采购中心',
    'inventory': '库存中心',
    'basedata': '基础数据',
    'system': '系统运维'
  };
  
  // 功能映射表
  const featureMap = {
    'salesOrder': '销售单',
    'shipmentOrder': '发货单',
    'purchaseRequisition': '采购计划',
    'purchaseOrder': '采购单',
    'inboundOrder': '入库单',
    'outboundOrder': '出库单',
    'inventoryInquiry': '库存查询',
    'product': '商品',
    'customer': '客户',
    'supplier': '供应商',
    'logistics': '物流公司',
    'userAccounts': '用户账户',
    'rolesPermissions': '角色权限',
    'auditLogs': '系统日志'
  };
  
  // 操作映射表
  const actionMap = {
    'create': '新建',
    'management': '管理',
    'detail': '详情',
    'edit': '编辑'
  };
  
  // 自动提取路由信息
  const pathSegments = computed(() => route.path.split('/').filter(Boolean));
  
  // 自动生成页面标题
  const pageTitle = computed(() => {
    // 获取路由元数据中的标题
    if (route.meta.title) {
      return route.meta.title;
    }
    
    // 如果没有元数据标题，则根据路径生成标题
    const segments = pathSegments.value;
    const lastSegment = segments[segments.length - 1];
    const secondLastSegment = segments.length > 1 ? segments[segments.length - 2] : '';
    
    // 处理操作类型（如create, management等）
    if (actionMap[lastSegment]) {
      const feature = featureMap[secondLastSegment] || secondLastSegment;
      return `${actionMap[lastSegment]}${feature}`;
    }
    
    // 处理功能类型
    if (featureMap[lastSegment]) {
      return featureMap[lastSegment];
    }
    
    return '未命名页面';
  });
  
  // 当前页面路径
  const pagePath = computed(() => route.path);
  
  // 当前模块
  const pageModule = computed(() => {
    const firstSegment = pathSegments.value[0];
    return moduleMap[firstSegment] || firstSegment;
  });
  
  // 当前功能
  const pageFeature = computed(() => {
    if (pathSegments.value.length > 1) {
      const secondSegment = pathSegments.value[1];
      return featureMap[secondSegment] || secondSegment;
    }
    return '未指定';
  });
  </script>