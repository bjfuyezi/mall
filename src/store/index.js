import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user')
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    userId: state => state.user ? parseInt(state.user.user_id) : null,
    username: state => state.user ? state.user.username : null
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        // 创建登录参数
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        // 先进行登录验证
        const loginResponse = await fetch('http://localhost:8081/users/login', {
          method: 'POST',
          body: formData
        });

        if (!loginResponse.ok) {
          throw new Error('Login failed');
        }

        const loginData = await loginResponse.json();
        
        if (loginData.status === 'success' && loginData.userId) {
          try {
            // 使用用户ID获取详细信息
            const detailResponse = await fetch(`http://localhost:8081/users/${loginData.userId}`);
            
            if (!detailResponse.ok) {
              throw new Error('Failed to fetch user details');
            }

            const detailData = await detailResponse.json();
            
            if (detailData.status === 'success' && detailData.data) {
              commit('setUser', detailData.data);
              return true;
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
            return false;
          }
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    logout({ commit }) {
      commit('setUser', null);
    },
    updateUserProfile({ commit, state }, updatedProfile) {
      const updatedUser = { ...state.user, ...updatedProfile };
      commit('setUser', updatedUser);
    }
  }
})
