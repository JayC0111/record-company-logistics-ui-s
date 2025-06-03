import { defineStore } from 'pinia';
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'; //
import router from '@/router'; //

export const useUserStore = defineStore('user', { // 确保这里的 'user' 是您store的唯一ID
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    // userInfo 的结构应该包含id, username, fullName, roles等，例如：
    // {
    //   id: 'user-001',
    //   userId: 'user-001', 
    //   username: 'zhangsan',
    //   fullName: '张三', 
    //   roles: ['ROLE_SALES'], 
    // }
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.userInfo,
    userRoles: (state) => state.userInfo?.roles || [],
  },
  actions: {
    async login(credentials) {
      try {
        const response = await loginApi(credentials.username, credentials.password);
        if (response.code === 200 && response.data.token) {
          this.token = response.data.token;
          localStorage.setItem('token', this.token);
          // 登录成功后立即获取用户信息
          await this.fetchUserInfo(); 
          return true;
        } else {
          throw new Error(response.message || '登录失败');
        }
      } catch (error) {
        this.logout(); // 确保出错时清除状态
        console.error('Login action failed:', error);
        throw error; // 将错误继续抛出，以便登录页面可以捕获并显示
      }
    },
    async fetchUserInfo() {
      if (!this.token) return; // 如果没有token，不执行获取
      try {
        const response = await getUserInfoApi(); // 调用您 src/api/auth.js 中的 getUserInfo
        if (response.code === 200 && response.data) {
          this.userInfo = response.data;
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        } else {
          throw new Error(response.message || '获取用户信息失败');
        }
      } catch (error) {
        console.error('Fetch user info failed:', error);
        // 获取用户信息失败可能意味着token无效，此时也应登出
        this.logout(); 
        // 可以选择是否将错误抛出给外层，取决于是否需要在其他地方处理此错误
        // throw error; 
      }
    },
    logout() {
      // 无论后端登出是否成功，前端都应清除状态并重定向
      this.token = null;
      this.userInfo = {};
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 调用后端登出接口（可选，但推荐）
      logoutApi().catch(error => {
        console.error('Backend logout failed:', error);
      });
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    },
    // 可以添加一个action来手动设置userInfo，例如从非API源获取时
    setUserInfo(userInfoData) {
        this.userInfo = userInfoData;
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    },
    clearUserInfo() { // 作为logout的一部分，但也可单独调用
        this.userInfo = {};
        localStorage.removeItem('userInfo');
    }
  },
});