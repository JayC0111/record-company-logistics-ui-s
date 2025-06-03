import request from './request'; //

/**
 * 获取客户列表 (支持分页和搜索)
 * @param {Object} params 查询参数, 例如 { name: 'xxx', phone: '138', page: 0, size: 10 }
 * @returns {Promise}
 */
export function getCustomerListAPI(params) {
  return request.get('/customers', params); // 假设API路径是 /customers
}

// 未来可能还会添加其他客户相关的API函数，如 getCustomerDetailAPI, createCustomerAPI 等