<template>
  <div class="register-page">
    <div class="register-container">
      <h2>用户注册</h2>
      <el-form 
        ref="registerForm" 
        :model="registerForm" 
        :rules="rules"
        label-width="100px"
        class="register-form"
      >
        <!-- 用户名输入框 -->
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username"
            placeholder="请输入用户名"
          ></el-input>
          <span class="form-tip">用户名长度为4-16个字符，只能包含字母、数字和下划线</span>
        </el-form-item>
        
        <!-- 手机号输入框 -->
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="registerForm.phone"
            placeholder="请输入手机号"
          ></el-input>
        </el-form-item>

        <!-- 短信验证码 -->
        <el-form-item label="短信验证码" prop="smsCode">
          <div class="verification-input">
            <el-input 
              v-model="registerForm.smsCode"
              placeholder="请输入验证码"
            ></el-input>
            <el-button 
              type="primary"
              :disabled="countdown > 0"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重新发送` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item label="设置密码" prop="password">
          <el-input 
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
          <span class="form-tip">密码长度8-20个字符，必须包含字母和数字</span>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          ></el-input>
        </el-form-item>

        <!-- 图形验证码 -->
        <el-form-item label="图形验证码" prop="captcha">
          <div class="verification-input">
            <el-input 
              v-model="registerForm.captcha"
              placeholder="请输入图形验证码"
            ></el-input>
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码">
            </div>
          </div>
        </el-form-item>

        <!-- 用户协议 -->
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary" href="#">《用户协议》</el-link>
            和
            <el-link type="primary" href="#">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            class="register-btn"
            :disabled="!registerForm.agreement"
            @click="handleRegister"
          >
            立即注册
          </el-button>
          <div class="login-link">
            已有账号？<el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    // 确认密码的验证规则
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        phone: '',
        smsCode: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        agreement: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名格式不正确', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, message: '密码格式不正确', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请���次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入图形验证码', trigger: 'blur' }
        ],
        agreement: [
          { validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('请阅读并同意用户协议'))
            } else {
              callback()
            }
          }, trigger: 'change' }
        ]
      },
      countdown: 0,
      captchaUrl: 'data:image/png;base64,xxx' // 这里替换为实际的验证码图片URL
    }
  },
  methods: {
    // 发送短信验证码
    sendVerificationCode() {
      this.$refs.registerForm.validateField('phone', (valid) => {
        if (!valid) {
          // 开始倒计时
          this.countdown = 60
          const timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(timer)
            }
          }, 1000)

          // 这里调用发送验证码的API
          console.log('发送验证码到：', this.registerForm.phone)
        }
      })
    },

    // 刷新图形验证码
    refreshCaptcha() {
      this.captchaUrl = `data:image/png;base64,xxx?t=${Date.now()}`
    },

    // 处理注册
    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          console.log('表单提交：', this.registerForm)
          // 这里处理注册逻辑
        } else {
          return false
        }
      })
    }
  }
}
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
  max-width: 600px;

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
}

.register-form {
  .form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    display: block;
  }

  .verification-input {
    display: flex;
    gap: 10px;

    .el-input {
      flex: 1;
    }

    .el-button {
      width: 120px;
    }

    .captcha-image {
      width: 120px;
      height: 40px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .register-btn {
    width: 100%;
  }

  .login-link {
    text-align: center;
    margin-top: 15px;
  }
}

// 覆盖 Element UI 的一些默认样式
:deep(.el-form-item__label) {
  font-weight: normal;
}

:deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
}

:deep(.el-checkbox) {
  display: flex;
  align-items: center;
  height: 40px;

  .el-checkbox__input {
    display: flex;
    align-items: center;
  }
}

:deep(.el-link) {
  vertical-align: baseline;
  margin: 0 4px;
}
</style> 