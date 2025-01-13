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
            <el-tab-pane label="待收货" name="unreceive"></el-tab-pane>
            <el-tab-pane label="已完成" name="completed"></el-tab-pane>
            <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
          </el-tabs>
        </div>
  
        <!-- 订单列表 -->
        <div class="order-list">
          <div v-for="order in orders" :key="order.order_id" :id="`order-${order.order_id}`" class="order-item">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号：{{ order.order_id }}</span>
                <span class="order-date">{{ new Date(order.date).toLocaleString() }}</span>
              </div>
              <div class="order-status">{{ getStatusText(order.status) }}</div>
            </div>
  
            <div class="order-products">
              <div class="product-item">
                <img :src="`http://localhost:8081${order.url}`" :alt="order.product_name">
                <div class="product-info">
                  <h4>{{ order.product_name }}</h4>
                  <div class="product-price">
                    <span class="price">¥{{ order.product_price.toFixed(2) }}</span>
                    <span class="quantity">x{{ order.totalQuantity }}</span>
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
                  v-if="order.status === 'pending'" 
                  type="primary"
                  size="small"
                  @click="payOrder(order)"
                >
                  立即付款
                </el-button>
                <el-button 
                  v-if="order.status === 'delivered'" 
                  type="success"
                  size="small"
                  @click="confirmReceive(order)"
                >
                  确认收货
                </el-button>
                <el-button 
                  v-if="order.status === 'completed'" 
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
                  @click="addToCart(order)"
                >
                  加入购物车
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

    <!-- 选择支付方式对话框 -->
    <el-dialog
      title="选择支付方式"
      :visible.sync="showPayMethodDialog"
      width="300px"
      center
      :close-on-click-modal="false"
    >
      <div class="pay-method-content">
        <el-button class="pay-method-btn" @click="selectPayMethod('wechat')">
          <i class="el-icon-goods"></i>
          微信支付
        </el-button>
        <el-button class="pay-method-btn" @click="selectPayMethod('alipay')">
          <i class="el-icon-goods"></i>
          支付宝支付
        </el-button>
      </div>
    </el-dialog>

    <!-- 添加支付二维码对话框 -->
    <el-dialog
      :title="payTypeText"
      :visible.sync="showPayDialog"
      width="300px"
      center
      :close-on-click-modal="false"
    >
      <div class="pay-dialog-content">
        <p class="pay-type-text">{{ payTypeText }}扫码支付</p>
        <div class="qr-code" ref="qrCode"></div>
        <div class="pay-amount">
          支付金额：<span class="price">¥{{ currentPayAmount }}</span>
        </div>
        <div class="pay-tips">
          <p>请使用{{ payTypeText }}扫描二维码完成支付</p>
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
import QRCode from 'qrcodejs2';
import axios from 'axios';
export default {
  name: 'UserOrdersView',
  data() {
    return {
      activeTab: 'all',
      orders: [
        /*{
          id: '4',
          date: '2024-03-20 15:30:00',
          status: 'pending',
          products: [
            {
              id: 1,
              name: '示例商品1',
              price: 999,
              image: 'https://via.placeholder.com/120'
            }
          ],
          totalQuantity: 1,
          totalAmount: 999
        },
        {
          id: '2',
          date: '2024-03-20 14:30:00',
          status: 'completed',
          products: [
            {
              id: 2,
              name: '示例商品2',
              price: 299,
              image: 'https://via.placeholder.com/120'
            }
          ],
          totalQuantity: 2,
          totalAmount: 598
        }*/
      ],
      showPayMethodDialog: false,
      showPayDialog: false,
      payMethod: '',
      payTypeText: '',
      qrCodeInstance: null,
      currentPayAmount: 0,
      currentPayOrder: null
    }
  },
  
  created() {
    const userid = this.$store.getters.userId;
    // 获取所有订单
    axios.post('http://localhost:8081/order/getOrdervo', {
      user_id: userid
    })
    .then(response => {
      this.orders = response.data;
    })
    .catch(error => {
      this.$message.error('获取订单列表失败');
      console.error('Error fetching orders:', error);
    });

    // 获取路由中的订单ID
    const orderId = this.$route.query.orderId;
    if (orderId) {
      // 如果有订单ID，可以直接定位到该订单
      this.scrollToOrder(orderId);
    }
  },
  methods: {
    
    handleTabClick(tab) {
      const status = tab.name;
      const userid = this.$store.getters.userId;
      
      // 先获取所有订单
      axios.post('http://localhost:8081/order/getOrdervo', {
        user_id: userid
      })
      .then(response => {
        if (response.data) {
          // 根据标签名筛选订单
          if (status === 'all') {
            this.orders = response.data;
          } else {
            // 根据不同状态筛选
            this.orders = response.data.filter(order => {
              switch(status) {
                case 'unpaid':
                  return order.status === 'pending';
                case 'unreceive':
                  return order.status === 'delivered';
                case 'completed':
                  return order.status === 'completed';
                case 'cancelled':
                  return order.status === 'cancelled';
                default:
                  return true;
              }
            });
          }
        }
      })
      .catch(error => {
        this.$message.error('获取订单列表失败');
        console.error('Error fetching orders:', error);
      });
    },
    async payOrder(order) {
      this.currentPayOrder = order;
      this.currentPayAmount = order.totalAmount;
      this.showPayMethodDialog = true;
    },
    async selectPayMethod(method) {
      this.payMethod = method;
      this.payTypeText = method === 'wechat' ? '微信' : '支付宝';
      this.showPayMethodDialog = false;
      try {
        /*// 调用后端接口获取支付链接
        const response = await this.$axios.post('/order/pay', {
          orderId: this.currentPayOrder.order_id,
          amount: this.currentPayAmount,
          payMethod: method
        });
        
        // 显示支付二维码
        this.showPayDialog = true;
        this.$nextTick(() => {
          this.generateQRCode(response.data.payUrl || 'https://example.com/pay');
        });
        
        // 开始轮询支付状态
        this.startCheckPayStatus(this.currentPayOrder.order_id);*/
        this.showPayDialog = true;
        const testPayUrl = method === 'wechat' 
          ? `weixin://wxpay/bizpayurl?pr=order_${this.currentPayOrder.order_id}_${this.currentPayAmount}` 
          : `https://qr.alipay.com/pay?order=${this.currentPayOrder.order_id}&amount=${this.currentPayAmount}`;

        // 在对话框显示后生成二维码，并设置不同的颜色
        this.$nextTick(() => {
          this.generateQRCode(testPayUrl, method);
        });
        
      } catch (error) {
        this.$message.error('创建支付订单失败，请重试');
        console.error('创建支付订单失败:', error);
      }
    },
    generateQRCode(url, payMethod) {
      // 清除已存在的二维码
      if (this.qrCodeInstance) {
        this.qrCodeInstance.clear();
      }
      const qrContainer = this.$refs.qrCode;
      if (qrContainer) {
        qrContainer.innerHTML = '';
        this.qrCodeInstance = new QRCode(qrContainer, {
          text: url,
          width: 200,
          height: 200,
          colorDark: payMethod === 'wechat' ? '#2C8722' : '#00A0E9',  // 微信绿色 vs 支付宝蓝色
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
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
        const response = await this.$axios.post('http://localhost:8081/order/pay', {
          order_id: this.currentPayOrder.order_id,
          payment_method:this.payTypeText
        });
        /*
        if (response.data.paid) {
          this.$message.success('支付成功！');
          this.showPayDialog = false;
          // 更新订单状态
          this.currentPayOrder.status = '待发货';
          this.stopCheckPayStatus();
        } else {
          this.$message.warning('未检测到支付，请确认是否已完成支付');
        }*/
        if (response.status === 201) {
          this.$message.success('支付成功！');
          this.showPayDialog = false;
          
          // 更新当前订单的状态
          const orderIndex = this.orders.findIndex(o => o.order_id === this.currentPayOrder.order_id);
          if (orderIndex !== -1) {
            // 使用 Vue.set 确保视图更新
            this.$set(this.orders[orderIndex], 'status', 'delivered');
          }
          
          // 重新获取最新的订单列表
          const ordersResponse = await this.$axios.post('http://localhost:8081/order/getOrdervo');
          if (ordersResponse.data) {
            this.orders = ordersResponse.data;
          }
          
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
    async confirmReceive(order) {
      try {
        // 弹出确认对话框
        await this.$confirm('是否确认收到商品？', '确认收货', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 用户点击确认后，发送请求
        const response = await axios.post('http://localhost:8081/order/received', {
          order_id: order.order_id
        });
        
        if (response.status === 201) {
          this.$message.success('确认收货成功');
          
          // 更新订单状态
          const orderIndex = this.orders.findIndex(o => o.order_id === order.order_id);
          if (orderIndex !== -1) {
            this.$set(this.orders[orderIndex], 'status', 'completed');
          }
          
          // 重新获取订单列表
          const ordersResponse = await axios.post('http://localhost:8081/order/getOrdervo', {
            user_id: this.$store.getters.userId
          });
          if (ordersResponse.data) {
            this.orders = ordersResponse.data;
          }
        }
      } catch (error) {
        if (error === 'cancel') {
          // 用户点击取消，不做处理
          return;
        }
        this.$message.error('确认收货失败，请稍后重试');
        console.error('确认收货失败:', error);
      }
    },
    reviewOrder(order) {
      this.$router.push({
        name: 'user-review',
        query: {
          orderId: order.order_id,
          productId: order.product_id
        }
      });
    },
    viewOrderDetail(order) {
      this.$router.push(`/user/orders/${order.id}`);
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
    },
    /*async addToCart(order) {
      try {
        // 获取订单中的第一个商品
        const product = order.products[0];
        
        const cartData = {
          user_id: 1, // 应该从用户状态中获取
          product_id: product.id,
          quantity: product.quantity,
          shop_id: order.shop_id || 1 // 如果订单中有店铺ID就使用，否则默认为1
        };

        const response = await this.$axios.post('http://localhost:8081/cart/add', cartData);
        
        if (response.status === 201) {
          this.$message.success('已添加到购物车');
        } else {
          throw new Error(response.data.message || '添加失败');
        }
      } catch (error) {
        this.$message.error(error.message || '添加到购物车失败，请重试');
        console.error('添加到购物车失败:', error);
      }
    }*/
    getStatusText(status) {
      const statusMap = {
        'pending': '待付款',
        'delivered': '待收货',
        'cancelled': '已取消',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }
  },
  beforeDestroy() {
    this.stopCheckPayStatus();
    // 清除二维码实例
    if (this.qrCodeInstance) {
      this.qrCodeInstance.clear();
    }
  },
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

.pay-method-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;

  .pay-method-btn {
    height: 50px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    i {
      font-size: 20px;
    }
  }
}

.pay-dialog-content {
  text-align: center;
  padding: 20px 0;

  .pay-type-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }

  .qr-code {
    width: 200px;
    height: 200px;
    margin: 0 auto 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 100%;
      max-height: 100%;
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