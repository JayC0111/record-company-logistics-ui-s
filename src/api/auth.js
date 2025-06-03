// src/api/auth.js
import request from './request';

/**
 * 登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise} 请求结果
 */
export function login(username, password) {
  return request.post('/auth/login', { // 真实API路径，request.js中会判断是否走mock
    username,
    password
  });
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 请求结果
 */
export function getUserInfo() {
  // 这个路径 '/auth/info' 在您的 request.js 中被配置为真实API路径。
  // 如果您希望它在后端未准备好时也走 Mock，
  // 您需要在 request.js 的 realApiPaths 中移除 '/auth/info'，
  // 或者在 mockMethodMap 中为 '/auth/info' 添加 Mock 路由。
  // 为简单起见，我们先假设它能被 Mock 拦截，或者您会调整 request.js
  return request.get('/auth/info'); // 假设这个API返回当前用户信息
}

/**
 * 退出登录
 * @returns {Promise} 请求结果
 */
export function logout() {
  return request.post('/auth/logout'); // 真实API路径
}