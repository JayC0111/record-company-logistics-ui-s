// src/mock/users.js
import { generateId } from './index'; // 假设 generateId 在 src/mock/index.js 中

// 模拟当前登录用户信息
const currentUserInfo = {
  id: 'user-001', // 假设当前用户的ID
  userId: 'user-001', // 也可以用 userId
  username: 'zhangsan',
  fullName: '张三', // 销售员姓名
  roles: ['ROLE_SALES'], // 假设的角色
  // 您可以根据需要添加其他用户信息，例如部门等
};

const usersMock = {
  // 获取当前登录用户信息
  getCurrentUser() {
    // 实际应用中，这里可能是从 token 解析或后端直接返回
    return {
      code: 200,
      message: '获取用户信息成功',
      data: { ...currentUserInfo }
    };
  },

  // (您可以保留或扩展您 src/api/user.js 中已有的其他用户管理Mock函数，例如 getUserList 等)
  // 为了本次“新建销售单”功能，我们主要关注 getCurrentUser
};

export default usersMock;