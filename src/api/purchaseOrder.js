import request from './request';

/**
 * 获取采购单列表
 * @param {Object} params 查询参数，参考 purchase_order 表 [cite: 1]
 * @returns {Promise}
 */
export function getPurchaseOrderList(params) {
  return request.get('/purchase/orders', params);
}

/**
 * 获取采购单详情
 * @param {string} id 采购单ID
 * @returns {Promise}
 */
export function getPurchaseOrderDetail(id) {
  return request.get(`/purchase/orders/${id}`);
}

/**
 * 创建采购单
 * @param {Object} data 采购单数据
 * @returns {Promise}
 */
export function createPurchaseOrder(data) {
  return request.post('/purchase/orders', data);
}

/**
 * 更新采购单
 * @param {string} id 采购单ID
 * @param {Object} data 采购单数据
 * @returns {Promise}
 */
export function updatePurchaseOrder(id, data) {
  return request.put(`/purchase/orders/${id}`, data);
}

/**
 * 删除采购单
 * @param {string} id 采购单ID
 * @returns {Promise}
 */
export function deletePurchaseOrder(id) {
  return request.delete(`/purchase/orders/${id}`);
}

/**
 * 确认收货 (此为业务操作，API路径需与后端商定)
 * @param {string} id 采购单ID
 * @param {Object} receivingData 收货数据
 * @returns {Promise}
 */
export function confirmReceipt(id, receivingData) {
    // 示例: 后端可能设计为更新采购单明细的收货数量
    return request.post(`/purchase/orders/${id}/receive`, receivingData);
}