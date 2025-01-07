<template>
  <div class="login-page">
    <div class="login-container">
      <h2>用户登录</h2>
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- 用户名输入框 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username"
            placeholder="请输入用户名/手机号/邮箱"
          >
        </div>
        
        <!-- 密码输入框 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password"
            placeholder="请输入密码"
          >
        </div>

        <!-- 记住密码和忘记密码 -->
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="loginForm.remember">
            <span>记住密码</span>
          </label>
          <router-link to="/forget-password" class="forget-password">
            忘记密码？
          </router-link>
        </div>

        <!-- 登录按钮 -->
        <button type="submit" class="login-btn">登录</button>

        <!-- 其他登录方式 -->
        <div class="other-login">
          <p class="divider">其他登录方式</p>
          <div class="social-login">
            <span class="social-icon wechat">微信</span>
            <span class="social-icon qq">QQ</span>
            <span class="social-icon weibo">微博</span>
          </div>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginView',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        remember: false
      }
    }
  },
  methods: {
    async handleLogin() {
      try {
        const formData = new FormData();
        formData.append('username', this.loginForm.username);
        formData.append('password', this.loginForm.password);

        const response = await axios.post('http://localhost:8081/users/login', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.status === 'success') {
          const userData = response.data.user;
          this.$store.commit('setUser', userData);
          this.$message.success('登录成功');
          
          // 根据用户角色跳转
          if (userData.role === 'admin') {
            this.$router.push('/admin');
          } else {
            const redirectPath = this.$route.query.redirect || '/';
            this.$router.push(redirectPath);
          }
        } else {
          this.$message.error(response.data.message || '登录失败');
        }
      } catch (error) {
        console.error('Login error:', error);
        this.$message.error(error.response?.data?.message || '服务器错误');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: calc(100vh - 120px); // 减去头部导航的高度
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
}

.login-form {
  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        border-color: #ff6700;
        outline: none;
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .remember-me {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
    }

    .forget-password {
      color: #ff6700;
      text-decoration: none;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    background-color: #ff6700;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 20px;

    &:hover {
      background-color: #f85000;
    }
  }

  .other-login {
    margin-top: 30px;

    .divider {
      text-align: center;
      position: relative;
      color: #999;
      margin-bottom: 20px;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 30%;
        height: 1px;
        background-color: #ddd;
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
      }
    }

    .social-login {
      display: flex;
      justify-content: center;
      gap: 30px;

      .social-icon {
        cursor: pointer;
        color: #666;
        
        &:hover {
          color: #ff6700;
        }
      }
    }
  }

  .register-link {
    text-align: center;
    margin-top: 20px;
    color: #666;

    a {
      color: #ff6700;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style> 