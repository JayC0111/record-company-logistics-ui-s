import request from './request'; //

/**
 * 获取发货单列表
 * @param {Object} params 查询参数 (如分页, shipmentNo, salesOrderNo, customerName, status, logisticsCarrierId, dateRange)
 * @returns {Promise}
 */
export function getShipmentOrderList(params) {
  // 假设API路径为 /sales/shipments 或 /inventory/shipments，根据实际后端定
  // ZERO.pdf 中发货单管理在“销售管理”模块下，所以用 /sales/shipments 可能更合适
  return request.get('/sales/shipments', params);
}

/**
 * 获取发货单详情
 * @param {string} id 发货单ID
 * @returns {Promise}
 */
export function getShipmentOrderDetail(id) {
  return request.get(`/sales/shipments/${id}`);
}

/**
 * 创建发货单 (通常也代表了“确认发货”的动作)
 * 根据 ZERO.pdf，创建发货单时会包含关联的出库单信息、物流信息，并触发后续库存和状态更新
 * @param {Object} data 发货单数据
 * @returns {Promise}
 */
export function createShipmentOrder(data) {
  return request.post('/sales/shipments', data);
}

/**
 * 更新发货单信息 (如果业务允许，例如在发货后补充或修改运单号，或更新状态为“已签收”)
 * @param {string} id 发货单ID
 * @param {Object} data 更新的数据
 * @returns {Promise}
 */
export function updateShipmentOrder(id, data) {
  return request.put(`/sales/shipments/${id}`, data);
}

/**
 * (可选) 删除发货单 - 如果业务允许在特定状态下删除
 * @param {string} id 发货单ID
 * @returns {Promise}
 */
export function deleteShipmentOrder(id) {
  return request.delete(`/sales/shipments/${id}`);
}

/**
 * (可选) 手动确认签收 - 如果不由物流接口自动更新，或需要人工干预
 * @param {string} id 发货单ID
 * @returns {Promise}
 */
export function confirmShipmentDelivery(id) {
    // 实际API路径可能不同，例如 /sales/shipments/{id}/delivered
    return request.post(`/sales/shipments/${id}/delivered`);
}

/**
 * (可选) 获取待创建发货的出库单列表
 * 用于在创建发货单时，选择状态为 READY_TO_SHIP 的出库单
 * @param {Object} params 查询参数 (如分页, outboundOrderNo, salesOrderNo)
 * @returns {Promise}
 */
export function getReadyToShipOutboundOrders(params) {
    // 这个API路径需要和后端商定，例如
    return request.get('/inventory/outbound-orders/ready-to-ship', params);
}

/**
 * (可选) 获取物流公司列表 (如果物流公司是基础数据，通常会有单独的API)
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getLogisticsCarriers(params) {
    // 假设API路径是 /basedata/logistics-carriers
    return request.get('/basedata/logistics-carriers', params);
}