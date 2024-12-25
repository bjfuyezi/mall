<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- 购物车头部 -->
      <div class="cart-header">
        <h2>我的购物车</h2>
        <el-button type="text" @click="clearInvalidItems">
          <i class="el-icon-delete"></i> 清除失效商品
        </el-button>
      </div>

      <!-- 购物车主体 -->
      <div class="cart-main" v-if="cartItems.length > 0">
        <!-- 表头 -->
        <div class="cart-table-header">
          <el-checkbox 
            v-model="selectAll"
            @change="handleSelectAll"
          >全选</el-checkbox>
          <span class="column-product">商品信息</span>
          <span class="column-price">单价</span>
          <span class="column-quantity">数量</span>
          <span class="column-total">小计</span>
          <span class="column-action">操作</span>
        </div>

        <!-- 商品列表 -->
        <div class="cart-items">
          <div 
            v-for="item in cartItems" 
            :key="item.id"
            class="cart-item"
            :class="{ 'item-invalid': !item.available }"
          >
            <el-checkbox 
              v-model="item.selected"
              :disabled="!item.available"
              @change="handleItemSelect(item)"
            ></el-checkbox>
            
            <div class="item-product">
              <img :src="item.image" :alt="item.name">
              <div class="product-info">
                <h3>{{ item.name }}</h3>
                <p class="specs">{{ item.specs }}</p>
                <p class="status" v-if="!item.available">该商品已下架</p>
              </div>
            </div>

            <div class="item-price">
              <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
              <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice.toFixed(2) }}</span>
            </div>

            <div class="item-quantity">
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="item.stock"
                :disabled="!item.available"
                @change="handleQuantityChange(item)"
              ></el-input-number>
            </div>

            <div class="item-total">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>

            <div class="item-action">
              <el-button type="text" @click="removeItem(item)">删除</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空购物车提示 -->
      <div v-else class="empty-cart">
        <i class="el-icon-shopping-cart-2"></i>
        <p>购物车还是空的</p>
        <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
      </div>

      <!-- 购物车底部 -->
      <div class="cart-footer" v-if="cartItems.length > 0">
        <div class="footer-left">
          <el-checkbox 
            v-model="selectAll"
            @change="handleSelectAll"
          >全选</el-checkbox>
          <el-button type="text" @click="batchDelete">删除选中商品</el-button>
          <el-button type="text" @click="batchMoveToFavorite">移入收藏夹</el-button>
        </div>
        <div class="footer-right">
          <div class="selected-info">
            已选择 <span>{{ selectedCount }}</span> 件商品
            <div class="total-price">
              合计：<span>¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <el-button 
            type="primary" 
            size="large"
            :disabled="selectedCount === 0"
            @click="checkout"
          >
            立即结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartView',
  data() {
    return {
      cartItems: [
        {
          id: 1,
          name: '商品名称1',
          specs: '规格：默认',
          price: 199.00,
          originalPrice: 299.00,
          quantity: 1,
          stock: 15,
          image: 'https://via.placeholder.com/120',
          selected: false,
          available: true
        },
        {
          id: 2,
          name: '商品名称2',
          specs: '规格：默认',
          price: 299.00,
          quantity: 2,
          stock: 5,
          image: 'https://via.placeholder.com/120',
          selected: false,
          available: true
        },
        {
          id: 3,
          name: '商品名称3（已下架）',
          specs: '规格：默认',
          price: 99.00,
          quantity: 1,
          stock: 0,
          image: 'https://via.placeholder.com/120',
          selected: false,
          available: false
        }
      ]
    }
  },
  computed: {
    selectAll: {
      get() {
        return this.cartItems.length > 0 && 
               this.cartItems.every(item => !item.available || item.selected)
      },
      set(value) {
        this.cartItems.forEach(item => {
          if (item.available) {
            item.selected = value
          }
        })
      }
    },
    selectedCount() {
      return this.cartItems.filter(item => item.selected).length
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => {
        if (item.selected) {
          return total + item.price * item.quantity
        }
        return total
      }, 0)
    }
  },
  methods: {
    handleSelectAll() {
      
    },
    handleItemSelect() {
      
    },
    handleQuantityChange(item) {
      // 处理数量变化
      console.log('数量变化：', item)
    },
    removeItem() {
      
    },
    batchDelete() {
      
    },
    batchMoveToFavorite() {
      // 批量移入收藏夹
    },
    clearInvalidItems() {
      // 清除失效商品
    },
    checkout() {
      // 结算
      console.log('结算商品：', this.cartItems.filter(item => item.selected))
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  background-color: #f5f5f5;
  padding: 20px 0;
  min-height: calc(100vh - 120px);
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;

  h2 {
    font-size: 20px;
    font-weight: normal;
  }
}

.cart-table-header {
  display: grid;
  grid-template-columns: 60px 400px 150px 150px 150px 100px;
  align-items: center;
  padding: 15px 0;
  background-color: #f8f8f8;
  margin: 20px 0;
  border-radius: 4px;

  span {
    text-align: center;
    color: #666;
  }
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 400px 150px 150px 150px 100px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;

  &.item-invalid {
    opacity: 0.5;
  }

  .item-product {
    display: flex;
    gap: 15px;

    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      h3 {
        font-size: 14px;
        margin: 0;
      }

      .specs {
        color: #999;
        font-size: 12px;
      }

      .status {
        color: #ff4d4f;
        font-size: 12px;
      }
    }
  }

  .item-price {
    text-align: center;

    .current-price {
      color: #ff6700;
      font-size: 16px;
    }

    .original-price {
      color: #999;
      font-size: 12px;
      text-decoration: line-through;
      margin-left: 5px;
    }
  }

  .item-quantity {
    text-align: center;

    .stock {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 5px;
    }
  }

  .item-total {
    text-align: center;
    color: #ff6700;
    font-size: 16px;
    font-weight: bold;
  }

  .item-action {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #eee;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .selected-info {
      text-align: right;

      span {
        color: #ff6700;
        font-weight: bold;
      }

      .total-price {
        margin-top: 5px;
        font-size: 16px;

        span {
          color: #ff6700;
          font-size: 24px;
        }
      }
    }

    .el-button {
      padding: 15px 40px;
    }
  }
}

.empty-cart {
  text-align: center;
  padding: 60px 0;
  color: #999;

  i {
    font-size: 60px;
    margin-bottom: 20px;
  }

  .el-button {
    margin-top: 20px;
  }
}
</style> 