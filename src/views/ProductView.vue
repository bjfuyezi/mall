<template>
  <div class="product-page">
    <div class="product-container">
      <!-- 左侧区域 -->
      <div class="product-left">
        <!-- 商品主要信息 -->
        <div class="product-main">
          <div class="product-gallery">
            <img :src="product.mainImage" :alt="product.name">
          </div>
          <div class="product-info">
            <h1>{{ product.name }}</h1>
            <div class="product-price">
              <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
              <span class="original-price" v-if="product.originalPrice">
                ¥{{ product.originalPrice.toFixed(2) }}
              </span>
            </div>
            <div class="product-stats">
              <span>销量 {{ product.sales }}</span>
              <span>评价 {{ product.reviews }}</span>
              <span>收藏 {{ product.favorites }}</span>
            </div>
            <el-button 
              type="danger" 
              class="quick-buy-btn"
              size="large"
              @click="quickBuy"
            >
              立即购买
            </el-button>
          </div>
        </div>

        <!-- 商品详情标签页 -->
        <div class="product-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="商品介绍" name="description">
              <div class="product-description">
                <div v-html="product.description"></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="商品评价" name="reviews">
              <div class="product-reviews">
                <div class="review-item" v-for="review in product.reviewList" :key="review.id">
                  <div class="review-header">
                    <img :src="review.userAvatar" :alt="review.userName">
                    <span class="user-name">{{ review.userName }}</span>
                    <el-rate v-model="review.rating" disabled></el-rate>
                  </div>
                  <div class="review-content">{{ review.content }}</div>
                  <div class="review-images" v-if="review.images && review.images.length">
                    <img v-for="(img, index) in review.images" 
                         :key="index" 
                         :src="img" 
                         @click="previewImage(img)"
                    >
                  </div>
                  <div class="review-time">{{ review.time }}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="product-right">
        <!-- 购买操作区 -->
        <div class="product-action">
          <div class="quantity-selector">
            <span>购买数量：</span>
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="product.stock"
            ></el-input-number>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="addToCart">加入购物车</el-button>
            <el-button @click="toggleFavorite">
              <i :class="isFavorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
              {{ isFavorite ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </div>

        <!-- 热门商品推荐 -->
        <div class="hot-products">
          <h3>热门商品</h3>
          <div class="hot-product-list">
            <div 
              v-for="item in hotProducts" 
              :key="item.id"
              class="hot-product-item"
              @click="$router.push(`/product/${item.id}`)"
            >
              <img :src="item.image" :alt="item.name">
              <div class="hot-product-info">
                <p class="name">{{ item.name }}</p>
                <p class="price">¥{{ item.price.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductView',
  data() {
    return {
      activeTab: 'description',
      quantity: 1,
      isFavorite: false,
      product: {
        id: 1,
        name: '示例商品',
        price: 999,
        originalPrice: 1299,
        mainImage: 'https://via.placeholder.com/400x400',
        sales: 1000,
        reviews: 500,
        favorites: 200,
        stock: 100,
        description: '<p>这里是商品详细介绍...</p>',
        reviewList: [
          {
            id: 1,
            userName: '用户1',
            userAvatar: 'https://via.placeholder.com/40',
            rating: 5,
            content: '商品很好，很满意！',
            images: ['https://via.placeholder.com/100x100'],
            time: '2024-03-20'
          }
        ]
      },
      hotProducts: []
    }
  },
  created() {
    // 获取路由传递的商品数据
    const routeProduct = this.$route.state?.product;
    if (routeProduct) {
      // 合并路由传递的数据和默认数据
      this.product = {
        ...this.product,
        id: routeProduct.id,
        name: routeProduct.name,
        price: Number(routeProduct.price),
        mainImage: routeProduct.imagePath || this.product.mainImage,
      };
    }
    // 如果需要，可以再次请求完整的商品数据
    this.fetchProductDetail();
  },
  methods: {
    async fetchProductDetail() {
      try {
        const response = await this.$axios.get(`/api/products/${this.$route.params.id}`);
        // 合并API返回的数据
        this.product = {
          ...this.product,
          ...response.data
        };
      } catch (error) {
        console.error('获取商品详情失败:', error);
      }
    },
    addToCart() {
      this.$message.success('已添加到购物车')
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      this.$message.success(this.isFavorite ? '收藏成功' : '已取消收藏')
    },
    quickBuy() {
      this.$router.push({
        name: 'order-confirm',
        query: {
          productId: this.product.id,
          quantity: this.quantity
        }
      });
    },
    previewImage(_url) {
      this.$msgbox({
        title: '图片预览',
        message: ('img', {
          attrs: {
            src: _url,
            style: 'max-width: 100%'
          }
        }),
        showCancelButton: false,
        confirmButtonText: '关闭'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.product-page {
  background-color: #f5f5f5;
  padding: 20px 0;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
}

.product-left {
  flex: 1;
  min-width: 0;
}

.product-main {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.product-gallery {
  width: 400px;
  position: relative;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 4px;
  }
}

.product-info {
  flex: 1;

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .product-price {
    margin-bottom: 20px;

    .current-price {
      font-size: 28px;
      color: #ff6700;
      margin-right: 10px;
    }

    .original-price {
      color: #999;
      text-decoration: line-through;
    }
  }

  .product-stats {
    color: #666;
    margin-bottom: 20px;
    
    span {
      margin-right: 20px;
    }
  }

  .quick-buy-btn {
    width: 180px;
    height: 48px;
    font-size: 18px;
    margin-top: 10px;
  }
}

.product-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;

  .product-description {
    padding: 20px 0;
  }

  .review-item {
    padding: 20px 0;
    border-bottom: 1px solid #eee;

    .review-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
    }

    .review-images {
      display: flex;
      gap: 10px;
      margin: 10px 0;

      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        cursor: pointer;
      }
    }

    .review-time {
      color: #999;
      font-size: 12px;
    }
  }
}

.product-right {
  width: 300px;
}

.product-action {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .quantity-selector {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .el-button {
      width: 100%;
    }
  }
}

.hot-products {
  background: white;
  padding: 20px;
  border-radius: 8px;

  h3 {
    margin-bottom: 15px;
    font-size: 16px;
  }

  .hot-product-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    cursor: pointer;

    &:hover {
      background: #f9f9f9;
    }

    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .hot-product-info {
      flex: 1;

      .name {
        margin-bottom: 5px;
        font-size: 14px;
      }

      .price {
        color: #ff6700;
      }
    }
  }
}
</style> 