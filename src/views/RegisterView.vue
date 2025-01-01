<template>
  <div class="register-page">
    <div class="register-container">
      <h2>用户注册</h2>
      <form class="register-form" @submit.prevent="handleRegister">
        <!-- 邮箱输入框 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email"
            placeholder="请输入邮箱"
          >
          <button 
            class="send-code-btn"
            @click.prevent="sendVerificationCode"
            :disabled="!registerForm.email || sendingCode"
          >
            {{ sendingCode ? '发送中...' : '发送验证码' }}
          </button>
        </div>

        <!-- 验证码输入框 -->
        <div class="form-group">
          <label for="verificationCode">验证码</label>
          <input 
            type="text" 
            id="verificationCode" 
            v-model="registerForm.verificationCode"
            placeholder="请输入验证码"
          >
        </div>

        <!-- 用户名输入框 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username"
            placeholder="请输入用户名"
          >
        </div>

        <!-- 密码输入框 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password"
            placeholder="请输入密码"
          >
        </div>

        <!-- 确认密码输入框 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
          >
        </div>

        <!-- 用户协议 -->
        <div class="form-options">
          <label class="agreement">
            <input type="checkbox" v-model="registerForm.agreement">
            <span>我已阅读并同意</span>
            <router-link to="#">《用户协议》</router-link>
            和
            <router-link to="#">《隐私政策》</router-link>
          </label>
        </div>

        <!-- 注册按钮 -->
        <button 
          type="submit" 
          class="register-btn" 
          :disabled="!registerForm.agreement"
        >
          立即注册
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterView',
  data() {
    return {
      registerForm: {
        email: '',
        verificationCode: '',
        username: '',
        password: '',
        confirmPassword: '',
        agreement: false,
      },
      sendingCode: false,
    };
  },
  methods: {
    sendVerificationCode() {
        this.sendingCode = true;
        axios.post('http://localhost:8081/users/sendCode', { email: this.registerForm.email })
            .then(() => {
                this.$message.success('验证码已发送');
            })
            .catch(() => {
                this.$message.error('验证码发送失败');
            })
            .finally(() => {
                this.sendingCode = false;
            });
    },

    handleRegister() {
        // 校验注册表单后提交注册请求
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
            this.$message.error('两次输入的密码不一致');
            return;
        }

        // Send the registration data with 'code' as a query parameter
        axios.post(`http://localhost:8081/users/register?code=${this.registerForm.verificationCode}`, this.registerForm)
            .then(() => {
                this.$message.success('注册成功，请登录');
                this.$router.push('/login');
            })
            .catch((error) => {
                const errorMessage = error.response.data;
                if (errorMessage.includes('验证码错误')) {
                    this.$message.error('验证码错误，请重新输入');
                } else if (errorMessage.includes('用户名已存在')) {
                    this.$message.error('用户名已存在，请选择其他用户名');
                } else if (errorMessage.includes('邮箱已存在')) {
                    this.$message.error('该邮箱已被注册，请选择其他邮箱');
                } else {
                    this.$message.error('注册失败，请稍后重试');
                }
            });
    }
},
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.register-container {
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

.register-form {
  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }

    input {
      width: calc(100% - 120px);
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        border-color: #ff6700;
        outline: none;
      }
    }

    .send-code-btn {
      width: 100px;
      padding: 10px;
      margin-left: 10px;
      background-color: #ff6700;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: #f85000;
      }

      &:disabled {
        background-color: #ddd;
        cursor: not-allowed;
      }
    }
  }

  .form-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;

    .agreement {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }

  .register-btn {
    width: 100%;
    padding: 12px;
    background-color: #ff6700;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background-color: #f85000;
    }

    &:disabled {
      background-color: #ddd;
      cursor: not-allowed;
    }
  }
}
</style>
