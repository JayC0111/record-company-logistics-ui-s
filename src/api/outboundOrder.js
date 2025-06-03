import request from './request';

/**
 * 获取待出库的销售单明细列表 (用于创建出库单时选择)
 * @param {Object} params 查询参数 (如分页, salesOrderNo, customerName, productKeyword)
 * @returns {Promise}
 */
export function getPendingOutboundSalesOrderLines(params) {
  // 路径与 request.js 中的 Mock 路由对应
  return request.get('/inventory/pending-outbound-lines', params);
}

/**
 * 创建出库单
 * @param {Object} data 出库单数据
 * @returns {Promise}
 */
export function createOutboundOrder(data) {
  return request.post('/inventory/outbound-orders', data);
}

/**
 * 获取出库单列表
 * @param {Object} params 查询参数 (如分页, outboundOrderNo, status, salesOrderNo)
 * @returns {Promise}
 */
export function getOutboundOrderList(params) {
  return request.get('/inventory/outbound-orders', params);
}

/**
 * 获取出库单详情
 * @param {string} id 出库单ID
 * @returns {Promise}
 */
export function getOutboundOrderDetail(id) {
  return request.get(`/inventory/outbound-orders/${id}`);
}

/**
 * 更新出库单 (例如，确认拣货完成，录入实拣数量)
 * @param {string} id 出库单ID
 * @param {Object} data 包含实拣数量等更新信息
 * @returns {Promise}
 */
export function updateOutboundOrder(id, data) {
  // 根据 ZERO.pdf，确认出库完成是将状态更新为 READY_TO_SHIP
  // 后端可能设计为 PUT /inventory/outbound-orders/{id} 直接更新整个对象
  // 或者一个特定的动作路径如 /inventory/outbound-orders/{id}/complete-picking
  // 这里我们用一个通用更新路径，具体动作通过 data 中的 status 或特定字段区分
  return request.put(`/inventory/outbound-orders/${id}`, data);
}

/**
 * (可选) 删除出库单 - 如果业务允许在特定状态下删除
 * @param {string} id 出库单ID
 * @returns {Promise}
 */
export function deleteOutboundOrder(id) {
  return request.delete(`/inventory/outbound-orders/${id}`);
}