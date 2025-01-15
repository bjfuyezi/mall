<template>
  <div class="product-page">
    <div class="product-container">
      <!-- 左侧区域 -->
      <div class="product-left">
        <!-- 商品主要信息 -->
        <div class="product-main">
          <div class="product-gallery">
            <div class="image-gallery">
              <!-- 显示大图 -->
              <div class="main-image">
                <img :src="'http://localhost:8081' + selectedImage" :alt="product.name" class="large-image" />
              </div>

              <!-- 显示缩略图列表 -->
              <div class="thumbnail-list">
                <div 
                  v-for="(image, index) in product.picture_id" 
                  :key="index" 
                  class="thumbnail"
                  :class="{'active': image === selectedImage}" 
                  @click="selectImage(image)"
                >
                  <img :src="'http://localhost:8081' + image" :alt="`Image ${index + 1}`" class="thumbnail-img" />
                </div>
              </div>
            </div>
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
              <span>销量 {{ product.salenum }}</span><br/>
              <span>评价 {{ commentNum }}</span><br/>
              <span>收藏 {{ starNum }}</span><br/>
              <span>地点 {{ product.location }}</span><br/>
              <span>所属店铺 {{ shop_name }}</span><br/>
            </div>
            <el-button type="primary" @click="toShop(product.shop_id)">查看店铺其他商品</el-button>
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

            <!-- 口味单选按钮 -->
            <div class="flavor-options">
              <el-radio-group v-model="selectedFlavor" @change="updateMaxQuantity">
                <el-radio 
                  v-for="(flavor, index) in product.quantity" 
                  :key="index" 
                  :label="flavor.flavor"
                  :value="flavor.flavor"
                >
                  {{ flavor.flavor }}
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 数量选择 -->
            <el-input-number 
              v-model="this.quantity" 
              :min="1" 
              :max="maxQuantity"
              :disabled="!selectedFlavor"
            ></el-input-number>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="addToCart()">加入购物车</el-button><!--this.quantity,this.selectedFlavor,this.product.product_id,this.product.shop_id-->
            <el-button type="danger" @click="quickBuy()">立即购买</el-button>
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
import axios from 'axios';

export default {
  name: 'ProductView',
  data() {
    return {
      user_id:'',
      starNum: '',
      commentNum:'',
      shop_name:'',
      selectedImage:'',
      product_id: '',
      activeTab: 'description',
      quantity: 1, // 默认购买数量
      selectedFlavor: '', // 当前选中的口味
      maxQuantity: 0, // 当前选中口味的最大购买数量
      isFavorite: false,
      product: {},
      hotProducts: []
    }
  },
  async created() {
    try {
      // 从路由获取商品ID
      this.product_id = this.$route.params.id;
      this.user_id=this.$store.getters.userId;
      
      // 请求商品详情
      const response = await axios.post(`http://localhost:8081/product/selectById`,{id:this.product_id});

      if (response.data != null) {
        // 合并API返回的数据和默认数据
        this.product = response.data;
        this.product.quantity = JSON.parse(this.product.quantity);
        const picResponse = await axios.post('http://localhost:8081/pic/getManyUrl', {id:this.product.picture_id});
          if ( picResponse.data != null ) {
            this.product.picture_id = picResponse.data;
            this.selectedImage=this.product.picture_id[0];
          }
        const shopResponse = await axios.post('http://localhost:8081/shop/getById', {id:this.product.shop_id});
        if ( shopResponse.data != null ) {
            this.shop_name = shopResponse.data.shop_name;
          }
        const starResponse = await axios.post('http://localhost:8081/product/getStarById', {id:this.product.product_id});
        if ( starResponse.data != null ) {
            this.starNum = starResponse.data;
          }
        const comResponse = await axios.post('http://localhost:8081/product/getCommentById', {id:this.product.product_id});
        if ( comResponse.data != null ) {
            this.commentNum = comResponse.data;
          }
        const sResponse = await axios.post('http://localhost:8081/product/isStar', {pid:this.product.product_id, uid:this.user_id});
        if ( sResponse.data != null ) {
          this.isFavorite = sResponse.data?true:false;
        }
      } else {
        throw new Error(response.data.message || '获取商品信息失败');
      }
    } catch (error) {
      this.$message.error(error.message || '获取商品信息失败，请重试');
      console.error('获取商品详情失败:', error);
    }
  },
  methods: {
    toShop(shop_id){
      this.$router.push({
          name: 'shop-show',
          params: { id: shop_id }
        });
    },
    // 更新购买数量的最大值
    updateMaxQuantity() {
      const selectedFlavorObj = this.product.quantity.find(flavor => flavor.flavor === this.selectedFlavor);
      this.maxQuantity = selectedFlavorObj ? selectedFlavorObj.quantity : 0;
      this.maxQuantity = Number(this.maxQuantity);
      this.quantity = 1;
    },
    selectImage(image) {
      this.selectedImage = image;  // 点击缩略图时更新大图
    },
    addToCart() {//quantity,selectedFlavor,product_id,shop_id
      console.log("addToCart",this.quantity, this.selectedFlavor, this.product.product_id,this.product.shop_id);
      const userId = this.$store.getters.userId; // 获取用户ID
      axios.post('http://localhost:8081/cart/add', {
        user_id: userId,
        product_id: this.product.product_id,
        quantity: this.quantity,
        shop_id: this.product.shop_id,
        flavor: this.selectedFlavor
      })
          .then(response => {
            if (response.data === "商品加入购物车成功") {
              this.$message.success('已添加到购物车');
            }
            else if (response.data === "该商品规格已经加入用户购物车") {
              this.$message.error('该商品规格已经加入购物车');
            }
            else {
              this.$message.error('加入购物车失败');
            }
          })
          .catch(error => {
            this.$message.error('添加到购物车失败：' + error.message);
          });
    },
    async toggleFavorite() {
      this.user_id=this.$store.getters.userId;
      const sResponse = await axios.post('http://localhost:8081/product/changeStar', {pid:this.product.product_id, uid:this.user_id});
      if ( sResponse.data != null ) {
        this.isFavorite = !this.isFavorite
      }
      this.$message.success(this.isFavorite ? '收藏成功' : '已取消收藏')
      window.location.reload();
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
    },
    quickBuy() {
      if (!this.selectedFlavor) {
        this.$message.warning('请先选择商品规格');
        return;
      }
      
      // 打印检查传递的参数
      console.log('传递的参数:', {
        productid: this.product.product_id,
        price: this.product.price,
        shopid: this.product.shop_id,
        image: this.selectedImage
      });

      this.$router.push({
        name: 'order-confirm',
        query: {
          productid: this.product.product_id,
          price: this.product.price,
          shopid: this.product.shop_id,
          image: this.selectedImage
        }
      });
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

.image-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.large-image {
  max-width: 600px;
  max-height: 400px;
}

.thumbnail-list {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.thumbnail {
  cursor: pointer;
  transition: transform 0.3s;
  width: 80px;   /* 统一宽度 */
  height: 80px;  /* 统一高度 */
  border-radius: 4px; /* 可选的圆角效果 */
  overflow: hidden;
  border: 2px solid transparent; /* 默认无边框 */
}

.thumbnail:hover {
  transform: scale(1.1); /* 鼠标悬停时缩略图稍微放大 */
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片填充容器，保持比例 */
}

.thumbnail.active {
  border: 2px solid #409EFF; /* 给选中的缩略图加边框 */
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flavor-options {
  display: flex;
  gap: 15px;
}

.el-radio {
  display: inline-block;
  margin-right: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: #f7f7f7;
  cursor: pointer;
}

.el-radio.is-checked {
  background-color: #409EFF;
  color: #fff;
}

.el-input-number {
  width: 200px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;

  .el-button {
    flex: 1;
  }
}
</style> 