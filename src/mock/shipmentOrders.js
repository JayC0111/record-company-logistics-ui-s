// src/mock/shipmentOrders.js
import { generateId, paginateData, filterData } from './index';
// --- 修改此处的导入语句 ---
import outboundOrdersMockDefault, { mockOutboundOrders } from './outboundOrders'; // 导入默认导出的 outboundOrdersMock，并重命名为 outboundOrdersMockDefault (或者你喜欢的其他名字)
                                                                         // 同时具名导入 mockOutboundOrders 数组
// --- 结束修改 ---
import { salesOrders as allSalesOrdersData } from './salesOrders';
import { products as allProductsData } from './products';

// 注意：mockOutboundOrders 是出库单的数据数组 (let)
// outboundOrdersMockDefault 是出库单的 mock 服务对象 (const)

const mockLogisticsCarriers = [
    { id: 'lc-001', name: '顺丰速运', contactInfo: '95338', isActive: true },
    { id: 'lc-002', name: '中通快递', contactInfo: '95311', isActive: true },
    { id: 'lc-003', name: '圆通速递', contactInfo: '95554', isActive: true },
    { id: 'lc-004', name: '韵达快递', contactInfo: '95546', isActive: true },
];

export let mockShipmentOrders = [
  {
    id: 'shp-001',
    shipmentNo: 'SHP-20240522-001',
    status: 'SHIPPED',
    shipmentDate: '2024-05-22 10:30:00',
    deliveryConfirmationTime: null,
    logisticsCarrierId: 'lc-001',
    logisticsCarrierName: '顺丰速运',
    trackingNumber: `SF${Date.now().toString().slice(-10)}1`,
    creatorId: 'user-sales-01',
    creatorName: '发货员小张',
    relatedOutboundOrderIds: ['ob-002'],
    relatedOutboundOrderNos: 'OUT-20240524-001',
    customerName: '广州流行前线音像店',
    notes: '已发货，请注意查收。内含两张专辑。',
    items: [
      {
        id: 'shpline-001',
        shipmentOrderId: 'shp-001',
        outboundOrderLineId: 'obi-002', 
        salesOrderLineId: 'generated-soi-id-for-ob-002-item1', 
        sourceOutboundOrderNo: 'OUT-20240524-001',
        productId: 'p-005',
        productCode: 'PRD-1005',
        productName: '华语经典流行合集',
        specification: 'U盘装',
        unit: '个',
        shippedQuantity: 20,
      },
      {
        id: 'shpline-002',
        shipmentOrderId: 'shp-001',
        outboundOrderLineId: 'obi-003',
        salesOrderLineId: 'generated-soi-id-for-ob-002-item2',
        sourceOutboundOrderNo: 'OUT-20240524-001',
        productId: 'p-001',
        productCode: 'PRD-1001',
        productName: '周杰伦《叶惠美》专辑',
        specification: 'CD',
        unit: '张',
        shippedQuantity: 15,
      },
    ],
    totalShippedQuantity: 35,
    totalAmount: 0,
  },
  {
    id: 'shp-002',
    shipmentNo: 'SHP-20240525-001',
    status: 'DELIVERED',
    shipmentDate: '2024-05-25 11:00:00',
    deliveryConfirmationTime: '2024-05-26 15:00:00',
    logisticsCarrierId: 'lc-002',
    logisticsCarrierName: '中通快递',
    trackingNumber: `ZT${Date.now().toString().slice(-10)}2`,
    creatorId: 'user-sales-02',
    creatorName: '发货员小李',
    relatedOutboundOrderIds: ['ob-001'],
    relatedOutboundOrderNos: 'OUT-20240523-001',
    customerName: '北京音像有限公司',
    notes: '客户已签收。',
    items: [
      {
        id: 'shpline-003',
        shipmentOrderId: 'shp-002',
        outboundOrderLineId: 'obi-001',
        salesOrderLineId: 'soitem-001',
        sourceOutboundOrderNo: 'OUT-20240523-001',
        productId: 'p-001',
        productCode: 'PRD-1001',
        productName: '周杰伦《叶惠美》专辑',
        specification: 'CD',
        unit: '张',
        shippedQuantity: 10,
      },
    ],
    totalShippedQuantity: 10,
    totalAmount: 0,
  }
];

const shipmentOrdersMock = {
  getShipmentOrderList(params) {
    console.log('[Mock /shipmentOrders.js] getShipmentOrderList called with params:', params);
    let result = JSON.parse(JSON.stringify(mockShipmentOrders));
    const filters = {};
    if (params) {
        if (params.shipmentNo) filters.shipmentNo = params.shipmentNo;
        if (params.relatedOutboundOrderNo) filters.relatedOutboundOrderNos = params.relatedOutboundOrderNo;
        if (params.customerName) filters.customerName = params.customerName;
        if (params.status) filters.status = params.status;
        if (params.logisticsCarrierId) filters.logisticsCarrierId = params.logisticsCarrierId;
        if (params.startDate && params.endDate) {
            result = result.filter(order => {
                if (!order.shipmentDate) return false;
                const orderDate = new Date(order.shipmentDate.split(' ')[0]);
                const startDate = new Date(params.startDate);
                const endDate = new Date(params.endDate);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }
    }
    result = filterData(result, filters);
    result.sort((a,b) => new Date(b.shipmentDate) - new Date(a.shipmentDate));
    return Promise.resolve({
      code: 200,
      message: '获取成功',
      data: paginateData(result, params?.page, params?.size)
    });
  },

  getShipmentOrderDetail(id) {
    console.log('[Mock /shipmentOrders.js] getShipmentOrderDetail called for ID:', id);
    const order = mockShipmentOrders.find(o => o.id === id);
    if (order) {
      return Promise.resolve({ code: 200, message: '获取成功', data: JSON.parse(JSON.stringify(order)) });
    } else {
      return Promise.resolve({ code: 404, message: '发货单不存在', data: null });
    }
  },

  createShipmentOrder(data) {
    console.log('[Mock /shipmentOrders.js] createShipmentOrder called with data:', JSON.parse(JSON.stringify(data)));
    const now = new Date();
    const newShipmentId = generateId('shp');
    const newShipmentNo = `SHP-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${String(mockShipmentOrders.length + 1).padStart(3, '0')}`;

    const relatedOutboundOrderIds = [...new Set((data.items || []).map(item => item.outboundOrderId).filter(Boolean))]; // 从提交的发货行获取outboundOrderId
    const relatedOutboundOrderNosSet = new Set();
    const customerNamesSet = new Set();

    // 从提交的发货行的 sourceOutboundOrderNo 和 customerName (这些应由前端从选择的出库明细带过来) 聚合信息
     (data.items || []).forEach(item => {
        if(item.sourceOutboundOrderNo) relatedOutboundOrderNosSet.add(item.sourceOutboundOrderNo);
        if(item.customerName) customerNamesSet.add(item.customerName); // 假设发货单的 customerName 来自其明细关联的客户
    });
    const relatedOutboundOrderNos = Array.from(relatedOutboundOrderNosSet).join(', ');
    const customerName = customerNamesSet.size > 0 ? Array.from(customerNamesSet).join(', ') : (data.customerName || '未知客户');


    const newShipmentOrder = {
      id: newShipmentId,
      shipmentNo: newShipmentNo,
      status: 'SHIPPED',
      shipmentDate: data.shipmentDate || now.toISOString().replace('T', ' ').substring(0, 19),
      deliveryConfirmationTime: null,
      logisticsCarrierId: data.logisticsCarrierId,
      logisticsCarrierName: mockLogisticsCarriers.find(lc => lc.id === data.logisticsCarrierId)?.name || '未知物流',
      trackingNumber: data.trackingNumber || `TRACK${now.getTime().toString().slice(-8)}`,
      creatorId: data.creatorId || 'user-mock-shipper',
      creatorName: data.creatorName || 'Mock发货员',
      relatedOutboundOrderIds: relatedOutboundOrderIds,
      relatedOutboundOrderNos: relatedOutboundOrderNos,
      customerName: customerName,
      notes: data.notes || '',
      items: (data.items || []).map(item => ({
        id: generateId('shpline'),
        shipmentOrderId: newShipmentId,
        outboundOrderLineId: item.outboundOrderLineId,
        salesOrderLineId: item.salesOrderLineId, 
        sourceOutboundOrderNo: item.sourceOutboundOrderNo,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        specification: item.specification,
        unit: item.unit,
        shippedQuantity: Number(item.shippedQuantity) || 0,
      })),
      totalShippedQuantity: (data.items || []).reduce((sum, item) => sum + (Number(item.shippedQuantity) || 0), 0),
      totalAmount: 0,
    };
    mockShipmentOrders.unshift(newShipmentOrder);
    console.log('[Mock createShipmentOrder] New shipment order created:', JSON.parse(JSON.stringify(newShipmentOrder)));

    if (Array.isArray(newShipmentOrder.items)) {
      newShipmentOrder.items.forEach(shipmentLine => {
        const shippedQty = Number(shipmentLine.shippedQuantity);
        if (shippedQty <= 0) return;

        if (shipmentLine.productId && Array.isArray(allProductsData)) {
          const productIndex = allProductsData.findIndex(p => p.id === shipmentLine.productId);
          if (productIndex !== -1) {
            const product = allProductsData[productIndex];
            const oldOnHand = Number(product.onHandQuantity) || 0;
            const oldReserved = Number(product.reservedQuantity) || 0;
            allProductsData[productIndex].onHandQuantity = Math.max(0, oldOnHand - shippedQty);
            allProductsData[productIndex].reservedQuantity = Math.max(0, oldReserved - shippedQty);
            console.log(`[Mock createShipmentOrder] Product ${product.name} (ID: ${product.id}) stock updated: onHand to ${allProductsData[productIndex].onHandQuantity}, reserved to ${allProductsData[productIndex].reservedQuantity}.`);
          }
        }

        if (shipmentLine.salesOrderLineId && Array.isArray(allSalesOrdersData)) {
          let salesOrderToUpdate = null;
          allSalesOrdersData.forEach(so => {
            if (so && Array.isArray(so.items)) {
              const soLine = so.items.find(sol => sol && sol.id === shipmentLine.salesOrderLineId);
              if (soLine) {
                salesOrderToUpdate = so;
                const oldShippedQty = Number(soLine.shippedQuantity) || 0;
                soLine.shippedQuantity = oldShippedQty + shippedQty;
                console.log(`[Mock createShipmentOrder] Updated SalesOrderLine ${soLine.id} (SO: ${so.orderNo}): shippedQuantity to ${soLine.shippedQuantity}.`);
              }
            }
          });

          if (salesOrderToUpdate) {
            let allLinesFullyShipped = true;
            let totalOrderedQty = 0;
            let totalOverallShippedQty = 0;
            salesOrderToUpdate.items.forEach(sol => {
              totalOrderedQty += (Number(sol.quantity) || 0);
              totalOverallShippedQty += (Number(sol.shippedQuantity) || 0);
              if ((Number(sol.shippedQuantity) || 0) < (Number(sol.quantity) || 0)) {
                allLinesFullyShipped = false;
              }
            });
            if (allLinesFullyShipped && totalOverallShippedQty >= totalOrderedQty) {
              salesOrderToUpdate.status = 'SHIPPED';
              console.log(`[Mock createShipmentOrder] SalesOrder ${salesOrderToUpdate.orderNo} status updated to SHIPPED.`);
            } else if (totalOverallShippedQty > 0) {
              salesOrderToUpdate.status = 'PARTIALLY_SHIPPED';
              console.log(`[Mock createShipmentOrder] SalesOrder ${salesOrderToUpdate.orderNo} status updated to PARTIALLY_SHIPPED.`);
            }
          }
        }
        // 更新出库单明细的“已发货数量”和出库单头的状态 (可选，如果业务需要)
        if (shipmentLine.outboundOrderLineId && Array.isArray(mockOutboundOrders)) {
            const outboundOrderIndex = mockOutboundOrders.findIndex(ob => ob.items && ob.items.some(item => item.id === shipmentLine.outboundOrderLineId));
            if (outboundOrderIndex !== -1) {
                const outboundOrder = mockOutboundOrders[outboundOrderIndex];
                const obLineIndex = outboundOrder.items.findIndex(item => item.id === shipmentLine.outboundOrderLineId);
                if (obLineIndex !== -1) {
                    // 假设出库单明细上有一个字段叫 actualShippedQuantity
                    // mockOutboundOrders[outboundOrderIndex].items[obLineIndex].actualShippedQuantity = (Number(mockOutboundOrders[outboundOrderIndex].items[obLineIndex].actualShippedQuantity) || 0) + shippedQty;
                    console.log(`[Mock createShipmentOrder] OutboundOrderLine ${shipmentLine.outboundOrderLineId} processed for ${shippedQty}.`);
                    // 检查是否整个出库单都已发货完毕
                    let allObLinesShipped = true;
                    mockOutboundOrders[outboundOrderIndex].items.forEach(line => {
                        // 假设：如果一个出库明细的pickedQuantity 等于通过各发货单发掉的总数，则此行完成
                        // 这个逻辑比较复杂，需要追踪每条出库单明细通过不同发货单发货的总量
                        // 简化：如果创建发货单时，是针对整个出库单或其所有可发货项，可以简单标记出库单状态
                        // 此处暂不修改出库单状态，除非有明确要求，因为ZERO.pdf中出库单在READY_TO_SHIP后流程结束。
                    });
                    // if (allObLinesShipped) {
                    // mockOutboundOrders[outboundOrderIndex].status = 'COMPLETED_OUTBOUND'; // 自定义状态
                    // }
                }
            }
        }
      });
    }
    return Promise.resolve({ code: 200, message: '发货单创建成功 (已发货)', data: JSON.parse(JSON.stringify(newShipmentOrder)) });
  },

  updateShipmentOrder(id, data) {
    console.log('[Mock /shipmentOrders.js] updateShipmentOrder called for ID:', id, 'with data:', JSON.parse(JSON.stringify(data)));
    const index = mockShipmentOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      const originalOrder = mockShipmentOrders[index];
      mockShipmentOrders[index] = {
        ...originalOrder,
        ...data, // 传入的数据会覆盖原始数据
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      
      if (data.status === 'DELIVERED' && originalOrder.status === 'SHIPPED') {
        console.log(`[Mock updateShipmentOrder] Shipment ${id} status updated to DELIVERED.`);
        if (Array.isArray(mockShipmentOrders[index].items)) {
          mockShipmentOrders[index].items.forEach(shipmentLine => {
            if (shipmentLine.salesOrderLineId && Array.isArray(allSalesOrdersData)) {
              const salesOrder = allSalesOrdersData.find(so => so && Array.isArray(so.items) && so.items.some(sol => sol && sol.id === shipmentLine.salesOrderLineId));
              if (salesOrder) {
                let allLinesFullyShippedAndDelivered = true; // 需要更复杂的检查，当前简化
                let totalOrderedQty = 0;
                let totalShippedAndConfirmedDeliveredQty = 0; // 需要追踪所有相关发货单的签收状态和数量

                // 遍历销售单的所有行
                salesOrder.items.forEach(sol => {
                    totalOrderedQty += (Number(sol.quantity) || 0);
                    // 假设 shippedQuantity 是最新的总发货数量，我们需要确认这些是否都签收了
                    // 这是一个简化逻辑：如果当前发货单签收，且销售单已经是SHIPPED，则认为可以完成
                    // 真实情况需要检查所有关联此销售单明细的发货单是否都签收了
                });

                // 简化的完成逻辑：如果销售单状态是SHIPPED (表示所有东西都发了)，且当前发货单签收了，就认为销售单完成。
                // 更准确的做法是检查销售单所有明细的 quantity 是否等于其累计的已签收发货数量。
                if (salesOrder.status === 'SHIPPED') { // 只有当销售单是“已发货”状态时，签收才能触发“已完成”
                    // 假设这个签收动作意味着这个销售单的所有发货都完成了
                    let allQuantitiesMet = true;
                    for (const sol of salesOrder.items) {
                        if ((Number(sol.shippedQuantity) || 0) < (Number(sol.quantity) || 0)) {
                            allQuantitiesMet = false;
                            break;
                        }
                    }
                    if (allQuantitiesMet) {
                         salesOrder.status = 'COMPLETED';
                         console.log(`[Mock updateShipmentOrder/confirmDelivery] SalesOrder ${salesOrder.orderNo} status updated to COMPLETED.`);
                    } else {
                        console.log(`[Mock updateShipmentOrder/confirmDelivery] SalesOrder ${salesOrder.orderNo} is SHIPPED but not all quantities met for COMPLETED status.`);
                    }
                }
              }
            }
          });
        }
      }
      return Promise.resolve({ code: 200, message: '发货单更新成功', data: JSON.parse(JSON.stringify(mockShipmentOrders[index])) });
    }
    return Promise.resolve({ code: 404, message: '发货单不存在', data: null });
  },
  
  deleteShipmentOrder(id) {
    console.warn(`[Mock /shipmentOrders.js] deleteShipmentOrder called for ID: ${id}. Mock does not implement rollback logic.`);
    const index = mockShipmentOrders.findIndex(o => o.id === id);
    if (index !== -1) {
        mockShipmentOrders.splice(index, 1);
        return Promise.resolve({ code: 200, message: '发货单删除成功（Mock，未处理关联数据回滚）', data: null });
    }
    return Promise.resolve({ code: 404, message: '发货单不存在或无法删除', data: null });
  },

  confirmShipmentDelivery(id) {
    console.log(`[Mock /shipmentOrders.js] confirmShipmentDelivery called for ID: ${id}`);
    // 此逻辑与 updateShipmentOrder 中将 status 更新为 'DELIVERED' 的部分类似
    // 调用 updateShipmentOrder 来处理
    return shipmentOrdersMock.updateShipmentOrder(id, { status: 'DELIVERED', deliveryConfirmationTime: new Date().toISOString().replace('T', ' ').substring(0, 19) });
  },

  getReadyToShipOutboundOrders(params) {
    console.log('[Mock /shipmentOrders.js] getReadyToShipOutboundOrders called with params:', params);
    let allReadyOutboundLines = [];
    if (Array.isArray(mockOutboundOrders)) { // 使用从 outboundOrders.js 导入的 mockOutboundOrders
      mockOutboundOrders.forEach(order => {
          if (order && order.status === 'READY_TO_SHIP' && Array.isArray(order.items)) {
              order.items.forEach(line => {
                  // 确保 line 和 line.pickedQuantity 有效
                  if (line && (Number(line.pickedQuantity) || 0) > 0) {
                      // **确保此处的 line 对象包含了 salesOrderLineId**
                      // 这个 salesOrderLineId 应该在创建出库单明细时就从销售单明细带过来了
                      if (!line.salesOrderLineId) {
                          console.warn(`[Mock getReadyToShipOutboundOrders] Outbound line (ID: ${line.id}, OBNo: ${order.outboundOrderNo}) is missing salesOrderLineId. This will cause issues in shipment creation.`);
                      }
                      allReadyOutboundLines.push({
                          ...line, // 展开出库单明细的所有属性
                          id: line.id, // 这是出库单明细的ID (outbound_order_line_id)
                          outboundOrderId: order.id,
                          outboundOrderNo: order.outboundOrderNo,
                          displaySalesOrderNo: line.salesOrderNo || order.relatedSalesOrderNos, // 优先用行上的，其次用头上的
                          customerName: line.customerName || order.customerName, // 优先用行上的，其次用头上的
                          pickedQuantity: Number(line.pickedQuantity) || 0, // 确保是数字
                          // salesOrderLineId 应该通过 ...line 展开得到
                      });
                  }
              });
          }
      });
    } else {
        console.warn('[Mock /shipmentOrders.js] mockOutboundOrders is not an array or is undefined.');
    }

    let filteredLines = allReadyOutboundLines;
    if (params) {
        const filters = {};
        if (params.outboundOrderNo) filters.outboundOrderNo = params.outboundOrderNo;
        if (params.salesOrderNo) { // 筛选关联销售单号
            filteredLines = filteredLines.filter(line => 
                (line.salesOrderNo && line.salesOrderNo.includes(params.salesOrderNo)) ||
                (line.displaySalesOrderNo && line.displaySalesOrderNo.includes(params.salesOrderNo))
            );
        }
        if (params.productKeyword) {
            filteredLines = filteredLines.filter(line =>
                (line.productCode && typeof line.productCode === 'string' && line.productCode.toLowerCase().includes(params.productKeyword.toLowerCase())) ||
                (line.productName && typeof line.productName === 'string' && line.productName.toLowerCase().includes(params.productKeyword.toLowerCase()))
            );
        }
        filteredLines = filterData(filteredLines, filters); // filterData 通常处理顶层字段
    }
    return Promise.resolve({
        code: 200,
        message: '获取待发货出库明细成功',
        data: paginateData(filteredLines, params?.page, params?.size)
    });
  },

  getLogisticsCarriers(params) {
    console.log('[Mock /shipmentOrders.js] getLogisticsCarriers called with params:', params);
    let result = mockLogisticsCarriers.filter(lc => lc.isActive);
    if (params && params.name) {
        result = result.filter(lc => lc.name.toLowerCase().includes(params.name.toLowerCase()));
    }
    return Promise.resolve({
        code: 200,
        message: '获取物流公司列表成功',
        data: { content: result, totalElements: result.length } 
    });
  }
};

export default shipmentOrdersMock; // 默认导出 mock 服务对象