import request from './request'; // 引入封装的 request 实例

/**
 * 获取商品列表 (支持分页和搜索)
 * @param {Object} params 查询参数, 例如 { name: 'xxx', productCode: 'P001', specification: 'CD', page: 0, size: 10 }
 * @returns {Promise}
 */
export function getProductListAPI(params) {
  // 这里的 API 路径 '/products' 应该与您在 src/api/request.js 的 mockMethodMap 中
  // 以及未来真实后端 API 定义的路径一致。
  return request.get('/products', params);
}

/**
 * 获取商品详情 (示例，如果 ProductSelectorDialog 或其他地方需要)
 * @param {string} productId 商品ID
 * @returns {Promise}
 */
export function getProductDetailAPI(productId) {
  return request.get(`/products/${productId}`);
}

// 未来可能还会根据 ZERO.pdf 中的“商品管理”功能描述 添加:
// - createProductAPI(data)
// - updateProductAPI(id, data)
// - deleteProductAPI(id)
// - changeProductStatusAPI(id, isActive)