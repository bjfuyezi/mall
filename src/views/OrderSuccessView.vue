<template>
  <div class="order-success">
    <div class="success-container">
      <div class="success-icon">
        <i class="el-icon-success"></i>
      </div>
      <h2>订单提交成功！</h2>
      <p class="order-number">订单号：{{ orderId }}</p>
      <div class="action-buttons">
        <el-button type="primary" @click="viewOrderDetail">查看订单详情</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderSuccessView',
  data() {
    return {
      orderId: this.$route.query.orderId || 'N/A'
    }
  },
  methods: {
    viewOrderDetail() {
      this.$router.push({
        name: 'user-orders',
        query: { orderId: this.orderId }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.order-success {
  background-color: #f5f5f5;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .success-container {
    background: white;
    padding: 40px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;

    .success-icon {
      font-size: 72px;
      color: #67c23a;
      margin-bottom: 20px;
    }

    h2 {
      color: #303133;
      margin-bottom: 15px;
      font-size: 24px;
    }

    .order-number {
      color: #606266;
      margin-bottom: 30px;
      font-size: 16px;
    }

    .action-buttons {
      .el-button {
        padding: 12px 30px;
        font-size: 16px;
      }
    }
  }
}
</style> 