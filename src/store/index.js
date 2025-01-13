import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用于存储用户信息，从 localStorage 获取初始值。如果没有用户信息，则为 null。
    user: JSON.parse(localStorage.getItem('user')) || null,
    // 用于判断用户是否已登录，通过检查 localStorage 中是否存在用户信息来初始化。
    isAuthenticated: !!localStorage.getItem('user')
  },
  getters: {
    // 返回用户的登录状态
    isAuthenticated: state => state.isAuthenticated,
    // 返回当前用户对象
    currentUser: state => state.user,
    // 返回用户 ID，如果用户未登录，则返回 null
    userId: state => state.user ? parseInt(state.user.user_id) : null,
    // 返回用户名，如果用户未登录，则返回 null
    username: state => state.user ? state.user.username : null
  },
  mutations: {
    // 设置用户信息和登录状态，同时将用户信息存储到 localStorage 中
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      if (user) {
        // 将用户信息序列化为 JSON 字符串后存储到 localStorage 中
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // 如果用户信息为空，则清除 localStorage 中的用户信息
        localStorage.removeItem('user');
      }
    },
    // 清除用户信息和登录状态，同时从 localStorage 中删除用户信息
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    }
  },
  actions: {
    /**
     * 用户登录的异步操作：
     * - 向后端发送登录请求验证用户名和密码。
     * - 如果验证通过，获取用户详细信息并更新状态。
     *
     * @param {Object} context - Vuex 提供的上下文对象，包含 commit 等方法。
     * @param {Object} credentials - 包含用户名和密码的对象。
     * @returns {Promise<boolean>} 返回登录是否成功。
     */
    async login({ commit }, credentials) {
      try {
        // 创建 FormData，用于传递用户名和密码参数
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        // 发送登录请求到后端
        const loginResponse = await fetch('http://localhost:8081/users/login', {
          method: 'POST',
          body: formData
        });

        // 如果登录请求失败，抛出错误
        if (!loginResponse.ok) {
          throw new Error('Login failed');
        }

        // 获取登录响应数据
        const loginData = await loginResponse.json();

        // 如果登录成功且返回了用户 ID，则获取用户详细信息
        if (loginData.status === 'success' && loginData.userId) {
          try {
            // 根据用户 ID 发送请求获取用户详细信息
            const detailResponse = await fetch(`http://localhost:8081/users/${loginData.userId}`);

            // 如果请求失败，抛出错误
            if (!detailResponse.ok) {
              throw new Error('Failed to fetch user details');
            }

            // 获取用户详细信息数据
            const detailData = await detailResponse.json();

            // 如果成功获取到用户详细信息，则更新状态
            if (detailData.status === 'success' && detailData.data) {
              commit('setUser', detailData.data); // 更新 Vuex 的 user 状态
              return true; // 返回登录成功
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
            return false; // 返回登录失败
          }
        }
        return false; // 如果未获取到用户 ID，返回登录失败
      } catch (error) {
        console.error('Login error:', error);
        return false; // 捕获异常并返回登录失败
      }
    },
    /**
     * 用户登出的操作：
     * - 清除用户信息和登录状态。
     * @param {Object} context - Vuex 提供的上下文对象。
     */
    logout({ commit }) {
      commit('clearUser'); // 调用 mutation 清除用户信息
    },
    /**
     * 更新用户个人信息：
     * - 使用新的用户信息更新状态，同时更新 localStorage 中的用户信息。
     * @param {Object} context - Vuex 提供的上下文对象。
     * @param {Object} updatedProfile - 更新后的用户信息对象。
     */
    updateUserProfile({ commit, state }, updatedProfile) {
      // 合并当前用户信息和更新后的信息
      const updatedUser = { ...state.user, ...updatedProfile };
      commit('setUser', updatedUser); // 更新 Vuex 的 user 状态
    }
  }
})
