import request from './request';

/**
 * 获取供应商列表
 * @param {Object} params 查询参数，例如 { name: 'xxx', page: 0, size: 10 }
 * @returns {Promise}
 */
export function getSupplierList(params) {
  return request.get('/basedata/suppliers', params); // 路径参考ZERO.pdf基础数据管理
}

/**
 * 获取供应商详情 (如果需要)
 * @param {string} id 供应商ID
 * @returns {Promise}
 */
export function getSupplierDetail(id) {
  return request.get(`/basedata/suppliers/${id}`);
}

// 未来可能根据ZERO.pdf中的“供应商管理”功能描述添加 create, update, delete 等