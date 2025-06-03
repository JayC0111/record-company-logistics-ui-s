import request from './request'

/**
 * 获取销售单列表
 * @param {Object} params 查询参数
 * @returns {Promise} 请求结果
 */
export function getSalesOrderList(params) {
  return request.get('/sales/orders', params)
}

/**
 * 获取销售单详情
 * @param {string} id 销售单ID
 * @returns {Promise} 请求结果
 */
export function getSalesOrderDetail(id) {
  return request.get(`/sales/orders/${id}`)
}

/**
 * 创建销售单
 * @param {Object} data 销售单数据
 * @returns {Promise} 请求结果
 */
export function createSalesOrder(data) {
  return request.post('/sales/orders', data)
}

/**
 * 更新销售单
 * @param {string} id 销售单ID
 * @param {Object} data 销售单数据
 * @returns {Promise} 请求结果
 */
export function updateSalesOrder(id, data) {
  return request.put(`/sales/orders/${id}`, data)
}

/**
 * 删除销售单
 * @param {string} id 销售单ID
 * @returns {Promise} 请求结果
 */
export function deleteSalesOrder(id) {
  return request.delete(`/sales/orders/${id}`)
}

/**
 * 提交销售单审核
 * @param {string} id 销售单ID
 * @returns {Promise} 请求结果
 */
export function submitSalesOrder(id) {
  return request.post(`/sales/orders/${id}/submit`)
}

/**
 * 审核销售单
 * @param {string} id 销售单ID
 * @param {boolean} approved 是否通过
 * @param {string} comment 审核意见
 * @returns {Promise} 请求结果
 */
export function approveSalesOrder(id, approved, comment) {
  return request.post(`/sales/orders/${id}/approve`, {
    approved,
    comment
  })
}