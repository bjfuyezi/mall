<template>
  <div class="order-confirm-page">
    <div class="order-container">
      <!-- 左侧区域 -->
      <div class="order-left">
        <!-- 订单明细 -->
        <div class="order-detail">
          <h2>订单明细</h2>
          <div class="product-list">
            <el-table :data="orderProducts" style="width: 100%">
              <el-table-column label="商品名称">
                <template slot-scope="scope">
                  <div class="product-info">
                    <img :src="scope.row.image" :alt="scope.row.name">
                    <span>{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="价格" width="120">
                <template slot-scope="scope">
                  <span class="price">¥{{ scope.row.price.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数量" width="150">
                <template slot-scope="scope">
                  <el-input-number 
                    v-model="scope.row.quantity" 
                    :min="1"
                    :max="scope.row.stock"
                    @change="calculateTotal"
                  ></el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                  <el-button 
                    type="text" 
                    @click="removeProduct(scope.$index)"
                  >
                    <i class="el-icon-delete"></i>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 备注信息 -->
          <div class="order-remark">
            <h3>备注</h3>
            <el-input
              type="textarea"
              v-model="remark"
              :maxlength="100"
              show-word-limit
              placeholder="输入备注信息，100字以内"
              rows="3"
            ></el-input>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="order-right">
        <!-- 收货信息 -->
        <div class="delivery-info">
          <h3>收货信息</h3>
          <div v-if="selectedAddress" class="address-info">
            <div class="address-detail">
              <p>
                <span class="label">收货人：</span>
                {{ selectedAddress.name }}
              </p>
              <p>
                <span class="label">联系电话：</span>
                {{ selectedAddress.phone }}
              </p>
              <p>
                <span class="label">收货地址：</span>
                {{ selectedAddress.address }}
              </p>
            </div>
            <el-button type="text" @click="showAddressDialog = true">
              更换地址
            </el-button>
          </div>
          <div v-else class="no-address">
            <p>当前无地址信息</p>
            <el-button type="text" @click="showAddressDialog = true">
              请新建地址
            </el-button>
          </div>
        </div>

        <!-- 结算信息 -->
        <div class="order-summary">
          <div class="summary-item">
            <span>商品总价</span>
            <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span>商品优惠</span>
            <span class="discount">-¥{{ discount.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span>商品折扣</span>
            <span class="discount">-¥{{ promotion.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>合计</span>
            <span class="price">¥{{ finalPrice.toFixed(2) }}</span>
          </div>
          <div class="action-buttons">
            <el-button @click="$router.back()">返回</el-button>
            <el-button 
              type="primary" 
              :disabled="!selectedAddress"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 地址选择对话框 -->
    <el-dialog
      title="选择收货地址"
      :visible.sync="showAddressDialog"
      width="50%"
    >
      <div class="address-list">
        <div 
          v-for="address in addressList" 
          :key="address.id"
          class="address-item"
          :class="{ active: selectedAddress && selectedAddress.id === address.id }"
          @click="selectAddress(address)"
        >
          <div class="address-content">
            <p class="name">{{ address.name }} {{ address.phone }}</p>
            <p class="address">{{ address.address }}</p>
          </div>
          <div class="address-actions">
            <el-button type="text" @click.stop="editAddress(address)">
              编辑
            </el-button>
            <el-button type="text" @click.stop="deleteAddress(address)">
              删除
            </el-button>
          </div>
        </div>
        <div class="add-address">
          <el-button type="dashed" @click="addNewAddress">+ 新增收货地址</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'OrderConfirmView',
  data() {
    return {
      orderProducts: [
        {
          id: 1,
          name: '示例商品',
          price: 999,
          quantity: 1,
          stock: 10,
          image: 'https://via.placeholder.com/80'
        }
      ],
      orderid:1,
      remark: '',
      userid:2,
      productid:3,
      addressid:1,
      status:'待支付',
      shopid:5,
      selectedAddress: null,
      showAddressDialog: false,
      addressList: [
        {
          id: 1,
          name: '张三',
          phone: '13800138000',
          address: '北京市朝阳区xxx街道xxx号'
        }
      ],
      discount: 0,
      promotion: 0
    }
  },
  computed: {
    totalPrice() {
      return this.orderProducts.reduce((total, product) => {
        return total + product.price * product.quantity
      }, 0)
    },
    finalPrice() {
      return this.totalPrice - this.discount - this.promotion
    },
  },
  methods: {
    calculateTotal() {
      // 重新计算总价
    },
    removeProduct(index) {
      this.orderProducts.splice(index, 1)
    },
    selectAddress(address) {
      this.selectedAddress = address
      this.showAddressDialog = false
    },
    addNewAddress() {
      // 实现新增地址
    },
    editAddress() {
      // 实现编辑地址
    },
    deleteAddress() {
      // 实现删除地址
    },
    async submitOrder() {
      if (!this.selectedAddress) {
        this.$message.warning('请选择收货地址')
        return
      }
      
      try {
        // 这里应该调用后端API提交订单
        // const response = await this.$axios.post('/api/orders', orderData);
        // const orderId = response.data.orderId;
        
        // 模拟订单ID
        const orderId = 'ORDER' + Date.now();
        
        this.$message.success('订单提交成功');
        this.$router.push({
          name: 'order-success',
          query: { orderId }
        });
      } catch (error) {
        this.$message.error('订单提交失败，请重试');
        console.error('提交订单失败:', error);
      }
    }
   /* async submitOrder() {
      if (!this.selectedAddress) {
        this.$message.warning('请选择收货地址')
        return
      }
      
      try {
        const now = new Date()
        const or_bianhao = parseInt(
    now.getFullYear().toString().slice(-2) +    // 年份后两位
    ('0' + (now.getMonth() + 1)).slice(-2) +    // 月份（补零）
    ('0' + now.getDate()).slice(-2) +           // 日期（补零）
    ('0' + now.getHours()).slice(-2) +          // 小时（补零）
    ('0' + now.getMinutes()).slice(-2) +        // 分钟（补零）
    ('0' + now.getSeconds()).slice(-2) +        // 秒数（补零）
    ('00' + now.getMilliseconds()).slice(-3)    // 毫秒（补零）
  )
  
  const orderData = {
    order_id:this.orderid,                   // 订单号
    user_id:this.userid,
    product_id:this.productid,
    address_id:this.addressid,
    status:this.status,
    quantity:this.orderProducts[0].quantity,
    shop_id:this.shopid,
    /*products: this.orderProducts.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    address: {                  // 收货地址信息
      name: this.selectedAddress.name,
      phone: this.selectedAddress.phone,
      address: this.selectedAddress.address
    },
    price: this.totalPrice,     // 商品总价
    discount: this.discount,          // 优惠金额
    promotion: this.promotion,        // 促销金额
    finalPrice: this.finalPrice,      // 最终支付金额
    remark: this.remark,             // 订单备注
  }


  // 发送订单数据到后端
  const response = await this.$axios.post('http://localhost:8081/order/create', orderData)
  this.$message.success('订单提交成功');
        this.$router.push({
          name: 'order-success',
          query: { or_bianhao }
        });
  if (response.status === 201) {
    this.$message.success('订单提交成功')
    this.$router.push({
      name: 'order-success',
      query: { or_bianhao }
    })
  } else {
    throw new Error(response.data.message || '订单提交失败')
  }

} catch (error) {
  this.$message.error(error.message || '订单提交失败，请重试')
  console.error('提交订单失败:', error)
}
    }*/
  },
  created() {
    // 获取路由参数中的商品信息
    const { productId, quantity } = this.$route.query
    if (productId) {
      // 这里应该根据productId获取商品信息
      this.orderProducts[0].quantity = parseInt(quantity) || 1
    }
  }
}
</script>

<style lang="scss" scoped>
.order-confirm-page {
  background-color: #f5f5f5;
  padding: 20px 0;
  min-height: calc(100vh - 120px);
}

.order-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
}

.order-left {
  flex: 1;
  min-width: 0;
}

.order-detail {
  background: white;
  padding: 20px;
  border-radius: 8px;

  h2 {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: normal;
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
  }

  .price {
    color: #ff6700;
    font-weight: bold;
  }
}

.order-remark {
  margin-top: 20px;

  h3 {
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: normal;
  }
}

.order-right {
  width: 300px;
}

.delivery-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: normal;
  }

  .address-info {
    .address-detail {
      margin-bottom: 10px;

      p {
        margin: 5px 0;
        
        .label {
          color: #666;
        }
      }
    }
  }

  .no-address {
    text-align: center;
    color: #999;

    p {
      margin-bottom: 10px;
    }
  }
}

.order-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    &.total {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 18px;

      .price {
        font-size: 24px;
      }
    }

    .price {
      color: #ff6700;
      font-weight: bold;
    }

    .discount {
      color: #52c41a;
    }
  }

  .action-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;

    .el-button {
      flex: 1;
    }
  }
}

.address-list {
  .address-item {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      border-color: #ff6700;
    }

    &.active {
      border-color: #ff6700;
      background-color: #fff1f0;
    }

    .address-content {
      .name {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .address {
        color: #666;
      }
    }
  }

  .add-address {
    text-align: center;
    margin-top: 20px;
  }
}
</style> 