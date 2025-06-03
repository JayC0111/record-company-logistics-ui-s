// src/mock/outboundOrders.js
import { generateId, paginateData, filterData } from './index';
import { salesOrders as allSalesOrdersData } from './salesOrders';
import { products as allProductsData } from './products'; // 导入商品数据以便更新库存预留
// 从 users.js 导入 currentUserInfo，你需要确保 users.js 正确导出了它
// 或者导入 usersMock 并调用其方法，这里我们假设 users.js 导出了 currentUserInfo
// 如果 users.js 默认导出 usersMock 对象，并且该对象有 getCurrentUser 方法：
import usersMock from './users'; // 请确保你的 users.js 文件导出了 usersMock

export let mockOutboundOrders = [
  {
    id: 'ob-001',
    outboundOrderNo: 'OUT-20240523-001',
    relatedSalesOrderIds: ['so-001'],
    relatedSalesOrderNos: 'SO-20241001-001',
    creatorId: 'user-wh-01', // 初始mock数据可以保留仓库管理员
    creatorName: '仓库管理员A',
    creationTime: '2024-05-23 10:00:00',
    status: 'PENDING',
    customerName: '北京音像有限公司',
    notes: '示例出库单，请优先处理。',
    items: [
      {
        id: 'obi-001',
        outboundOrderId: 'ob-001',
        outboundOrderNo: 'OUT-20240523-001',
        salesOrderLineId: 'soitem-001',
        productId: 'p-001',
        productCode: 'PRD-1001',
        productName: '周杰伦《叶惠美》专辑',
        specification: 'CD',
        unit: '张',
        quantityToPick: 10,
        pickedQuantity: null
      },
    ]
  },
  {
    id: 'ob-002',
    outboundOrderNo: 'OUT-20240524-001',
    relatedSalesOrderIds: ['generated-so-id-for-ob-002'], // 确保这个ID在你的salesOrders.js中存在或能对应上
    relatedSalesOrderNos: 'SO-20240520-003',
    creatorId: 'user-wh-02',
    creatorName: '仓库管理员B',
    creationTime: '2024-05-24 09:00:00',
    status: 'READY_TO_SHIP',
    customerName: '广州流行前线音像店',
    notes: '已拣货完毕，等待发货。',
    items: [
      {
        id: 'obi-002',
        outboundOrderId: 'ob-002',
        outboundOrderNo: 'OUT-20240524-001',
        salesOrderLineId: 'generated-soi-id-for-ob-002-item1', // 确保ID对应
        productId: 'p-005',
        productCode: 'PRD-1005',
        productName: '华语经典流行合集',
        specification: 'U盘装',
        unit: '个',
        quantityToPick: 20,
        pickedQuantity: 20
      },
      {
        id: 'obi-003',
        outboundOrderId: 'ob-002',
        outboundOrderNo: 'OUT-20240524-001',
        salesOrderLineId: 'generated-soi-id-for-ob-002-item2', // 确保ID对应
        productId: 'p-001',
        productCode: 'PRD-1001',
        productName: '周杰伦《叶惠美》专辑',
        specification: 'CD',
        unit: '张',
        quantityToPick: 15,
        pickedQuantity: 15
      }
    ]
  }
];

// 辅助函数：从模拟的销售单数据中筛选出符合待出库条件的行项目 (保持不变)
const getPendingLinesFromSalesOrders = (currentSalesOrders, params) => {
  let pendingLines = [];
  if (!currentSalesOrders || !Array.isArray(currentSalesOrders)) {
    console.warn('[Mock /outboundOrders.js] getPendingLinesFromSalesOrders: currentSalesOrders is null or not an array.');
    return pendingLines;
  }
  currentSalesOrders.forEach(order => {
    if (order && order.status === 'APPROVED' && Array.isArray(order.items)) {
      order.items.forEach(line => {
        if (line) {
          const alreadyOutbound = Number(line.outboundQuantity) || 0;
          const originalOrderQty = Number(line.quantity) || 0;
          const canPick = originalOrderQty - alreadyOutbound;
          if (canPick > 0) {
            pendingLines.push({
              salesOrderLineId: line.id,
              salesOrderId: order.id,
              salesOrderNo: order.orderNo,
              customerId: order.customerId,
              customerName: order.customerName,
              productId: line.productId,
              productCode: line.productCode,
              productName: line.productName,
              specification: line.specification,
              unit: line.unit,
              originalOrderQuantity: originalOrderQty,
              alreadyOutboundQuantity: alreadyOutbound,
              quantityToPick: canPick,
              selectedQuantityToPick: canPick,
              _maxCanPick: canPick
            });
          }
        }
      });
    }
  });

  if (params) {
    const filters = {};
    if (params.salesOrderNo) filters.salesOrderNo = params.salesOrderNo;
    if (params.customerName) filters.customerName = params.customerName;
    if (params.productKeyword) {
        pendingLines = pendingLines.filter(line =>
            (line.productCode && typeof line.productCode === 'string' && line.productCode.toLowerCase().includes(params.productKeyword.toLowerCase())) ||
            (line.productName && typeof line.productName === 'string' && line.productName.toLowerCase().includes(params.productKeyword.toLowerCase()))
        );
    }
    pendingLines = filterData(pendingLines, filters);
  }
  return pendingLines;
};


const outboundOrdersMock = {
  getPendingOutboundSalesOrderLines(params) {
    console.log('[Mock /outboundOrders.js] getPendingOutboundSalesOrderLines called with params:', params);
    const allPendingRawLines = getPendingLinesFromSalesOrders(allSalesOrdersData, params);
    return Promise.resolve({
        code: 200,
        message: '获取成功',
        data: paginateData(allPendingRawLines, params?.page, params?.size)
    });
  },

  createOutboundOrder(data) {
    console.log('[Mock /outboundOrders.js] createOutboundOrder called with data:', JSON.parse(JSON.stringify(data)));
    const now = new Date();
    const newId = generateId('ob');
    const newOrderNo = `OUT-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${String(mockOutboundOrders.length + 1).padStart(3, '0')}`;
    
    const salesOrderIdsFromItems = [...new Set((data.items || []).map(item => item.salesOrderId).filter(Boolean))];
    const salesOrderNosFromItems = [...new Set((data.items || []).map(item => item.salesOrderNo).filter(Boolean))];
    const customerNamesFromItems = [...new Set((data.items || []).map(item => item.customerName).filter(Boolean))];

    // --- MODIFICATION START: Determine creatorName ---
    let determinedCreatorName = 'Mock仓库管理员'; // Default
    const currentUserIdFromFrontend = data.creatorId;
    
    // Attempt to get current user info from usersMock
    // usersMock.getCurrentUser() returns { code, message, data: { id, userId, username, fullName, roles } }
    const currentUserData = usersMock.getCurrentUser()?.data;

    if (currentUserIdFromFrontend && currentUserData && currentUserIdFromFrontend === currentUserData.id) {
        determinedCreatorName = currentUserData.fullName || '未知用户'; // Use fullName if available
    } else if (data.creatorName) {
        determinedCreatorName = data.creatorName; // Fallback to name provided in data
    }
    // --- MODIFICATION END ---

    const newOutboundOrder = {
      id: newId,
      outboundOrderNo: newOrderNo,
      relatedSalesOrderIds: data.relatedSalesOrderIds || salesOrderIdsFromItems,
      relatedSalesOrderNos: data.relatedSalesOrderNos || salesOrderNosFromItems.join(', '),
      creatorId: currentUserIdFromFrontend || currentUserData?.id || 'user-mock-default-admin', // Use ID from data or current user, then default
      creatorName: determinedCreatorName, // Use the determined name
      creationTime: data.creationTime || now.toISOString().replace('T', ' ').substring(0, 19),
      status: 'PENDING',
      customerName: data.customerName || (customerNamesFromItems.length > 0 ? customerNamesFromItems.join(', ') : '未知客户'),
      notes: data.notes || '',
      items: (data.items || []).map(item => ({
        id: generateId('obi'),
        outboundOrderId: newId,
        outboundOrderNo: newOrderNo,
        salesOrderLineId: item.salesOrderLineId,
        salesOrderNo: item.salesOrderNo,
        productId: item.productId,
        productCode: item.productCode || '',
        productName: item.productName || '',
        specification: item.specification || '',
        unit: item.unit || '',
        quantityToPick: Number(item.quantityToPick) || 0,
        pickedQuantity: null,
      }))
    };
    mockOutboundOrders.unshift(newOutboundOrder);

    // Update related sales order line's outboundQuantity (logic remains the same)
    if (newOutboundOrder.items && Array.isArray(allSalesOrdersData)) {
        newOutboundOrder.items.forEach(obItem => {
            if (obItem.salesOrderLineId) {
                allSalesOrdersData.forEach(so => {
                    if (so && Array.isArray(so.items)) {
                        const line = so.items.find(sol => sol && sol.id === obItem.salesOrderLineId);
                        if (line) {
                            const prevOutboundQty = Number(line.outboundQuantity) || 0;
                            line.outboundQuantity = prevOutboundQty + (Number(obItem.quantityToPick) || 0);
                            console.log(`[Mock createOutboundOrder] Updated salesOrderLine ${line.id} (SO: ${so.orderNo}): outboundQuantity from ${prevOutboundQty} to ${line.outboundQuantity}`);
                        }
                    }
                });
            }
        });
    }
    return Promise.resolve({ code: 200, message: '出库单创建成功', data: JSON.parse(JSON.stringify(newOutboundOrder)) });
  },

  getOutboundOrderList(params) {
    // (This function remains unchanged from your provided version)
    console.log('[Mock /outboundOrders.js] getOutboundOrderList called with params:', params);
    let result = JSON.parse(JSON.stringify(mockOutboundOrders));
    if (params) {
        const filters = {};
        if (params.outboundOrderNo) filters.outboundOrderNo = params.outboundOrderNo;
        if (params.status) filters.status = params.status;
        if (params.relatedSalesOrderNos) filters.relatedSalesOrderNos = params.relatedSalesOrderNos; 
        if (params.customerName) filters.customerName = params.customerName; 
        if (params.creatorName) filters.creatorName = params.creatorName;
        if (params.startDate && params.endDate) {
            result = result.filter(order => {
                if (!order.creationTime) return false;
                const orderDate = new Date(order.creationTime.split(' ')[0]);
                const startDate = new Date(params.startDate);
                const endDate = new Date(params.endDate);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }
        result = filterData(result, filters);
    }
    result.sort((a,b) => new Date(b.creationTime) - new Date(a.creationTime));

    return Promise.resolve({
        code: 200,
        message: '获取成功',
        data: paginateData(result, params?.page, params?.size)
    });
  },

  getOutboundOrderDetail(id) {
    // (This function remains unchanged from your provided version)
    console.log('[Mock /outboundOrders.js] getOutboundOrderDetail called for ID:', id);
    const order = mockOutboundOrders.find(o => o.id === id);
    if (order) {
      const orderDetail = JSON.parse(JSON.stringify(order));
      orderDetail.items = orderDetail.items.map(item => ({
          ...item,
          pickedQuantity: (item.pickedQuantity === null || item.pickedQuantity === undefined) ? null : Number(item.pickedQuantity)
      }));
      return Promise.resolve({ code: 200, message: '获取成功', data: orderDetail });
    } else {
      return Promise.resolve({ code: 404, message: '出库单不存在', data: null });
    }
  },

  updateOutboundOrder(id, data) {
    // (This function remains largely unchanged from your provided version, only JSON.parse(JSON.stringify()) for logging)
    console.log('[Mock /outboundOrders.js] updateOutboundOrder called for ID:', id, 'with data:', JSON.parse(JSON.stringify(data)));
    const index = mockOutboundOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return Promise.resolve({ code: 404, message: '出库单不存在', data: null });
    }

    const originalOrder = mockOutboundOrders[index];
    let updatedOrderData = JSON.parse(JSON.stringify(originalOrder));

    if (data.notes !== undefined) updatedOrderData.notes = data.notes;
    if (data.status !== undefined) updatedOrderData.status = data.status;

    if (Array.isArray(data.items)) {
        updatedOrderData.items = data.items.map(itemData => {
            const originalItem = originalOrder.items.find(oi => oi.id === itemData.id);
            if (originalItem) {
                return {
                    ...originalItem,
                    pickedQuantity: (itemData.pickedQuantity !== null && itemData.pickedQuantity !== undefined)
                                    ? Number(itemData.pickedQuantity)
                                    : null,
                };
            }
            return itemData;
        });
    }

    if (data.status === 'READY_TO_SHIP' && originalOrder.status === 'PENDING') {
      console.log(`[Mock updateOutboundOrder] Processing 'Confirm Picking' for order ${id}.`);
      for (const item of updatedOrderData.items) {
        const pickedQty = Number(item.pickedQuantity);
        const toPickQty = Number(item.quantityToPick);
        if (item.pickedQuantity === null || item.pickedQuantity === undefined || pickedQty < 0) {
          return Promise.resolve({ code: 400, message: `拣货失败：商品 ${item.productName} 的实拣数量未填写或无效。`, data: null });
        }
        if (pickedQty > toPickQty) {
          return Promise.resolve({ code: 400, message: `拣货失败：商品 ${item.productName} 的实拣数量 (${pickedQty}) 不能大于应拣数量 (${toPickQty})。`, data: null });
        }
      }
      if (Array.isArray(allProductsData)) {
        updatedOrderData.items.forEach(item => {
          const shortPickedQuantity = Number(item.quantityToPick) - Number(item.pickedQuantity);
          if (shortPickedQuantity > 0) {
            const productIndex = allProductsData.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
              const product = allProductsData[productIndex];
              const oldReserved = Number(product.reservedQuantity) || 0;
              allProductsData[productIndex].reservedQuantity = Math.max(0, oldReserved - shortPickedQuantity);
              console.log(`[Mock updateOutboundOrder] Product ${product.name} (ID: ${product.id}) short-picked by ${shortPickedQuantity}. Reserved quantity adjusted from ${oldReserved} to ${allProductsData[productIndex].reservedQuantity}.`);
            } else {
              console.warn(`[Mock updateOutboundOrder] Product with ID ${item.productId} not found in allProductsData for reserved quantity adjustment.`);
            }
          }
        });
      }
      updatedOrderData.status = 'READY_TO_SHIP';
      console.log(`[Mock updateOutboundOrder] Order ${id} status changed to READY_TO_SHIP.`);
    }
    else if (data.status === 'CANCELLED' && (originalOrder.status === 'PENDING' || originalOrder.status === 'READY_TO_SHIP')) {
      console.log(`[Mock updateOutboundOrder] Processing 'Cancel Outbound Order' for order ${id}.`);
      if (updatedOrderData.items && Array.isArray(allSalesOrdersData)) {
        updatedOrderData.items.forEach(obItem => {
          if (obItem.salesOrderLineId) {
            allSalesOrdersData.forEach(so => {
              if (so && Array.isArray(so.items)) {
                const line = so.items.find(sol => sol && sol.id === obItem.salesOrderLineId);
                if (line) {
                  const oldOutboundQty = Number(line.outboundQuantity) || 0;
                  line.outboundQuantity = Math.max(0, oldOutboundQty - (Number(obItem.quantityToPick) || 0));
                  console.log(`[Mock updateOutboundOrder] Outbound order ${id} cancelled. Reverted salesOrderLine ${line.id} (SO: ${so.orderNo}) outboundQuantity from ${oldOutboundQty} to ${line.outboundQuantity}.`);
                }
              }
            });
          }
        });
      }
      updatedOrderData.status = 'CANCELLED';
    }
    else {
        updatedOrderData.status = data.status !== undefined ? data.status : originalOrder.status;
        console.log(`[Mock updateOutboundOrder] Updating general info for order ${id}. New status: ${updatedOrderData.status}.`);
    }

    updatedOrderData.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    mockOutboundOrders[index] = updatedOrderData;

    return Promise.resolve({ code: 200, message: '出库单更新成功', data: JSON.parse(JSON.stringify(mockOutboundOrders[index])) });
  },

  deleteOutboundOrder(id) {
    // (This function remains largely unchanged from your provided version)
    console.log('[Mock /outboundOrders.js] deleteOutboundOrder called for ID:', id);
    const index = mockOutboundOrders.findIndex(o => o.id === id);
    if (index !== -1) {
        const orderToDelete = mockOutboundOrders[index];
        if ((orderToDelete.status === 'PENDING' || orderToDelete.status === 'READY_TO_SHIP') && Array.isArray(orderToDelete.items) && Array.isArray(allSalesOrdersData)) {
            orderToDelete.items.forEach(obItem => {
                if (obItem.salesOrderLineId) {
                    allSalesOrdersData.forEach(so => {
                        if (so && Array.isArray(so.items)) {
                            const line = so.items.find(sol => sol && sol.id === obItem.salesOrderLineId);
                            if (line) {
                                const oldOutboundQty = Number(line.outboundQuantity) || 0;
                                line.outboundQuantity = Math.max(0, oldOutboundQty - (Number(obItem.quantityToPick) || 0));
                                console.log(`[Mock deleteOutboundOrder] Deleted outbound order ${id}. Reverted salesOrderLine ${line.id} (SO: ${so.orderNo}) outboundQuantity to ${line.outboundQuantity}.`);
                            }
                        }
                    });
                }
            });
        }
        mockOutboundOrders.splice(index, 1);
        return Promise.resolve({ code: 200, message: '出库单删除成功', data: null });
    }
    return Promise.resolve({ code: 404, message: '出库单不存在或无法删除', data: null });
  }
};

export default outboundOrdersMock;