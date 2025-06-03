import request from './request';

/**
 * 获取入库单列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getInboundOrderList(params) {
  return request.get('/inventory/inbound-orders', params);
}

/**
 * 获取入库单详情
 * @param {string} id 入库单ID
 * @returns {Promise}
 */
export function getInboundOrderDetail(id) {
  return request.get(`/inventory/inbound-orders/${id}`);
}

/**
 * 创建入库单
 * @param {Object} data 入库单数据
 * @returns {Promise}
 */
export function createInboundOrder(data) {
  return request.post('/inventory/inbound-orders', data);
}

/**
 * 更新入库单状态 (例如：确认入库完成)
 * @param {string} id 入库单ID
 * @param {Object} data 更新的数据，可能只包含状态或特定操作的标识
 * @returns {Promise}
 */
export function updateInboundOrder(id, data) {
  return request.put(`/inventory/inbound-orders/${id}`, data);
}

/**
 * (可选) 取消入库单
 * @param {string} id 入库单ID
 * @returns {Promise}
 */
export function cancelInboundOrder(id) {
    // 实际API路径可能为 /inventory/inbound-orders/{id}/cancel
    return request.post(`/inventory/inbound-orders/${id}/cancel`);
}