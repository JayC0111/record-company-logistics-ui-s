import request from './request'

/**
 * 获取用户列表
 * @param {Object} params 查询参数
 * @returns {Promise} 请求结果
 */
export function getUserList(params) {
  return request.get('/system/users', params)
}

/**
 * 创建用户
 * @param {Object} data 用户数据
 * @returns {Promise} 请求结果
 */
export function createUser(data) {
  return request.post('/system/users', data)
}

/**
 * 更新用户
 * @param {number} userId 用户ID
 * @param {Object} data 用户数据
 * @returns {Promise} 请求结果
 */
export function updateUser(userId, data) {
  return request.put(`/system/users/${userId}`, data)
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise} 请求结果
 */
export function deleteUser(userId) {
  return request.delete(`/system/users/${userId}`)
}

/**
 * 启用或禁用用户
 * @param {number} userId 用户ID
 * @param {boolean} enabled 是否启用
 * @returns {Promise} 请求结果
 */
export function changeUserStatus(userId, enabled) {
  return request.put(`/system/users/${userId}/status`, null, { enabled })
}

/**
 * 为用户分配角色
 * @param {number} userId 用户ID
 * @param {Array} roleIds 角色ID列表
 * @returns {Promise} 请求结果
 */
export function assignRolesToUser(userId, roleIds) {
  return request.post(`/system/users/${userId}/roles`, roleIds)
}