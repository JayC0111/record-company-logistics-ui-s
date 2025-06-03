const fs = require('fs');
const path = require('path');

// 需要生成占位页面的路径配置
const placeholderPaths = [
  // 销售中心
  'src/views/sales/salesOrder/CreateSalesOrder.vue',
  'src/views/sales/salesOrder/SalesOrderManagement.vue',
  'src/views/sales/shipmentOrder/CreateShipmentOrder.vue',
  'src/views/sales/shipmentOrder/ShipmentOrderManagement.vue',
  
  // 采购中心
  'src/views/purchase/purchaseRequisition/CreatePurchaseRequisition.vue',
  'src/views/purchase/purchaseRequisition/PurchaseRequisitionManagement.vue',
  'src/views/purchase/purchaseOrder/CreatePurchaseOrder.vue',
  'src/views/purchase/purchaseOrder/PurchaseOrderManagement.vue',
  
  // 库存中心
  'src/views/inventory/inboundOrder/CreateInboundOrder.vue',
  'src/views/inventory/inboundOrder/InboundOrderManagement.vue',
  'src/views/inventory/outboundOrder/CreateOutboundOrder.vue',
  'src/views/inventory/outboundOrder/OutboundOrderManagement.vue',
  'src/views/inventory/inventoryInquiry/Index.vue',
  
  // 系统管理
  'src/views/system/userAccounts/Index.vue',
  'src/views/system/rolesPermissions/Index.vue',
  'src/views/system/auditLogs/Index.vue',
];

// 占位页面模板
const placeholderTemplate = `<template>
  <AutoPlaceholder />
</template>

<script setup>
import AutoPlaceholder from '@/components/AutoPlaceholder.vue';
</script>
`;

// 创建目录函数
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// 生成占位页面
placeholderPaths.forEach(filePath => {
  try {
    ensureDirectoryExistence(filePath);
    fs.writeFileSync(filePath, placeholderTemplate);
    console.log(`Created placeholder: ${filePath}`);
  } catch (error) {
    console.error(`Error creating ${filePath}:`, error);
  }
});

console.log('All placeholder pages generated successfully!');