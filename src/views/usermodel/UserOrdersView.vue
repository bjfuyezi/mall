<template>
  <div class="user-orders-container">
    <div class="user-orders-page">
      <div class="orders-container">
        <h2>我的订单</h2>
        
        <!-- 订单状态标签 -->
        <div class="order-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="全部" name="all"></el-tab-pane>
            <el-tab-pane label="待付款" name="unpaid"></el-tab-pane>
            <el-tab-pane label="待发货" name="unshipped"></el-tab-pane>
            <el-tab-pane label="待收货" name="shipped"></el-tab-pane>
            <el-tab-pane label="已完成" name="completed"></el-tab-pane>
          </el-tabs>
        </div>
  
        <!-- 订单列表 -->
        <div class="order-list">
          <div v-for="order in orders" :key="order.id" :id="`order-${order.id}`" class="order-item">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号：{{ order.id }}</span>
                <span class="order-date">{{ order.date }}</span>
              </div>
              <div class="order-status">{{ order.status }}</div>
            </div>
  
            <div class="order-products">
              <div v-for="product in order.products" :key="product.id" class="product-item">
                <img :src="product.image" :alt="product.name">
                <div class="product-info">
                  <h4>{{ product.name }}</h4>
                  <p class="product-spec">{{ product.spec }}</p>
                  <div class="product-price">
                    <span class="price">¥{{ product.price.toFixed(2) }}</span>
                    <span class="quantity">x{{ product.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="order-footer">
              <div class="order-total">
                共 {{ order.totalQuantity }} 件商品，
                实付款：<span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button 
                  v-if="order.status === '待付款'" 
                  type="primary"
                  size="small"
                  @click="payOrder(order)"
                >
                  立即付款
                </el-button>
                <el-button 
                  v-if="order.status === '待收货'" 
                  type="success"
                  size="small"
                  @click="confirmReceive(order)"
                >
                  确认收货
                </el-button>
                <el-button 
                  v-if="order.status === '已完成'" 
                  type="primary"
                  plain
                  size="small"
                  @click="reviewOrder(order)"
                >
                  评价
                </el-button>
                <el-button 
                  type="text"
                  size="small"
                  @click="viewOrderDetail(order)"
                >
                  订单详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 空状态 -->
        <div v-if="orders.length === 0" class="empty-state">
          <i class="el-icon-document"></i>
          <p>暂无相关订单</p>
        </div>
      </div>
    </div>

    <!-- 支付确认对话框 -->
    <el-dialog
      title="微信支付"
      :visible.sync="showPayDialog"
      width="300px"
      center
      :close-on-click-modal="false"
    >
      <div class="pay-dialog-content">
        <div class="qr-code">
          <img :src="payQRCode" alt="微信支付二维码">
        </div>
        <div class="pay-amount">
          支付金额：<span class="price">¥{{ currentPayAmount }}</span>
        </div>
        <div class="pay-tips">
          <p>请使用微信扫描二维码完成支付</p>
          <p class="small">支付完成前请不要关闭窗口</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPay">取消支付</el-button>
        <el-button type="primary" @click="confirmPay">确认已支付</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserOrdersView',
  data() {
    return {
      activeTab: 'all',
      orders: [
        {
          id: '202403200001',
          date: '2024-03-20 15:30:00',
          status: '待付款',
          products: [
            {
              id: 1,
              name: '示例商品1',
              spec: '默认规格',
              price: 999,
              quantity: 1,
              image: 'https://via.placeholder.com/120'
            }
          ],
          totalQuantity: 1,
          totalAmount: 999
        },
        {
          id: '202403200002',
          date: '2024-03-20 14:30:00',
          status: '已完成',
          products: [
            {
              id: 2,
              name: '示例商品2',
              spec: '默认规格',
              price: 299,
              quantity: 2,
              image: 'https://via.placeholder.com/120'
            }
          ],
          totalQuantity: 2,
          totalAmount: 598
        }
      ],
      showPayDialog: false,
      payQRCode: 'path/to/qr-code.png', // 微信支付二维码图片路径
      currentPayAmount: 0,
      currentPayOrder: null
    }
  },
  created() {
    // 获取路由中的订单ID
    const orderId = this.$route.query.orderId;
    if (orderId) {
      // 如果有订单ID，可以直接定位到该订单
      this.scrollToOrder(orderId);
    }
  },
  methods: {
    handleTabClick(tab) {
      console.log('切换标签：', tab.name)
      // 这里可以根据标签筛选订单
    },
    async payOrder(order) {
      this.currentPayOrder = order;
      this.currentPayAmount = order.totalAmount;
      
      try {
        // 调用后端接口获取支付二维码
        const response = await this.$axios.post('/order/pay', {
          orderId: order.id,
          amount: order.totalAmount
        });
        
        // 设置支付二维码
        this.payQRCode = response.data.qrCode || 'path/to/qr-code.png';
        
        // 显示支付对话框
        this.showPayDialog = true;
        
        // 开始轮询支付状态
        this.startCheckPayStatus(order.id);
      } catch (error) {
        this.$message.error('创建支付订单失败，请重试');
        console.error('创建支付订单失败:', error);
      }
    },
    cancelPay() {
      this.$confirm('确定要取消支付吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.showPayDialog = false;
        this.stopCheckPayStatus();
      }).catch(() => {});
    },
    async confirmPay() {
      try {
        // 调用后端验证支付状态
        const response = await this.$axios.post('/order/pay', {
          orderId: this.currentPayOrder.id
        });

        if (response.data.paid) {
          this.$message.success('支付成功！');
          this.showPayDialog = false;
          // 更新订单状态
          this.currentPayOrder.status = '待发货';
          this.stopCheckPayStatus();
        } else {
          this.$message.warning('未检测到支付，请确认是否已完成支付');
        }
      } catch (error) {
        this.$message.error('验证支付状态失败，请稍后重试');
        console.error('验证支付失败:', error);
      }
    },
    startCheckPayStatus(orderId) {
      this.payStatusTimer = setInterval(async () => {
        try {
          const response = await this.$axios.get(`/api/payment/status/${orderId}`);
          if (response.data.paid) {
            this.$message.success('支付成功！');
            this.showPayDialog = false;
            // 更新订单状态
            this.currentPayOrder.status = '待发货';
            this.stopCheckPayStatus();
          }
        } catch (error) {
          console.error('检查支付状态失败:', error);
        }
      }, 3000); // 每3秒检查一次
    },
    stopCheckPayStatus() {
      if (this.payStatusTimer) {
        clearInterval(this.payStatusTimer);
        this.payStatusTimer = null;
      }
    },
    confirmReceive(order) {
      console.log('确认收货：', order.id)
    },
    reviewOrder(order) {
      this.$router.push({
        name: 'user-review',
        query: {
          orderId: order.id,
          productId: order.products[0].id // 如果一个订单只有一个商品
        }
      });
    },
    viewOrderDetail(order) {
      this.$router.push(`/user/orders/${order.id}`)
    },
    scrollToOrder(orderId) {
      // 可以添加一些视觉效果，比如高亮显示该订单
      this.$nextTick(() => {
        const orderElement = document.getElementById(`order-${orderId}`);
        if (orderElement) {
          orderElement.scrollIntoView({ behavior: 'smooth' });
          // 可以添加临时的高亮效果
          orderElement.classList.add('highlight');
          setTimeout(() => {
            orderElement.classList.remove('highlight');
          }, 3000);
        }
      });
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    this.stopCheckPayStatus();
  }
}
</script>

<style lang="scss" scoped>
.user-orders-container {
  width: 100%;
}

.user-orders-page {
  background-color: #f5f5f5;
  padding: 20px 0;
  min-height: calc(100vh - 120px);
}

.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: normal;
  }
}

.order-list {
  .order-item {
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;

    .order-header {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-info {
        .order-id {
          margin-right: 20px;
          color: #666;
        }

        .order-date {
          color: #999;
        }
      }

      .order-status {
        color: #ff6700;
        font-weight: bold;
      }
    }

    .order-products {
      padding: 20px;

      .product-item {
        display: flex;
        gap: 15px;
        padding: 10px 0;

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-info {
          flex: 1;

          h4 {
            margin: 0 0 5px;
            font-size: 14px;
          }

          .product-spec {
            color: #999;
            font-size: 12px;
            margin-bottom: 5px;
          }

          .product-price {
            .price {
              color: #ff6700;
              font-weight: bold;
              margin-right: 10px;
            }

            .quantity {
              color: #999;
            }
          }
        }
      }
    }

    .order-footer {
      padding: 15px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-total {
        color: #666;

        .total-price {
          color: #ff6700;
          font-weight: bold;
          font-size: 18px;
        }
      }

      .order-actions {
        display: flex;
        gap: 10px;
      }
    }

    &.highlight {
      animation: highlight 3s;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;

  i {
    font-size: 60px;
    margin-bottom: 20px;
  }
}

@keyframes highlight {
  0% {
    background-color: #fff1f0;
  }
  100% {
    background-color: white;
  }
}

.pay-dialog-content {
  text-align: center;
  padding: 20px 0;

  .qr-code {
    width: 200px;
    height: 200px;
    margin: 0 auto 20px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .pay-amount {
    font-size: 18px;
    margin-bottom: 15px;

    .price {
      color: #ff6700;
      font-weight: bold;
    }
  }

  .pay-tips {
    color: #666;
    
    p {
      margin: 5px 0;
      
      &.small {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style> 