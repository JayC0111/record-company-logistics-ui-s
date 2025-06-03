import request from './request';

/**
 * 获取采购计划单列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getPurchaseRequisitionList(params) {
  return request.get('/purchase/requisitions', params);
}

/**
 * 获取采购计划单详情
 * @param {string} id 采购计划单ID
 * @returns {Promise}
 */
export function getPurchaseRequisitionDetail(id) {
  return request.get(`/purchase/requisitions/${id}`);
}

/**
 * 创建采购计划单
 * @param {Object} data 采购计划单数据
 * @returns {Promise}
 */
export function createPurchaseRequisition(data) {
  return request.post('/purchase/requisitions', data);
}

/**
 * 更新采购计划单
 * @param {string} id 采购计划单ID
 * @param {Object} data 采购计划单数据
 * @returns {Promise}
 */
export function updatePurchaseRequisition(id, data) {
  return request.put(`/purchase/requisitions/${id}`, data);
}

/**
 * 删除采购计划单 (通常仅草稿状态可删)
 * @param {string} id 采购计划单ID
 * @returns {Promise}
 */
export function deletePurchaseRequisition(id) {
  return request.delete(`/purchase/requisitions/${id}`);
}

/**
 * 提交采购计划单进行审批
 * @param {string} id 采购计划单ID
 * @returns {Promise}
 */
export function submitPurchaseRequisition(id) {
  return request.post(`/purchase/requisitions/${id}/submit`);
}

/**
 * 审批采购计划单
 * @param {string} id 采购计划单ID
 * @param {Object} approvalData 包含 { approved: boolean, comment: string }
 * @returns {Promise}
 */
export function approvePurchaseRequisition(id, approvalData) {
  // approvalData 应为 { approved: true/false, comment: '审批意见' }
  return request.post(`/purchase/requisitions/${id}/approve`, approvalData);
}