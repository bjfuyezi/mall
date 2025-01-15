<template>
    <div class="shop-page">
      <!-- 左边栏 -->
      <aside class="shop-sidebar">
        <div class="shop-info">
          <!-- 店铺名称 -->
          <h2 class="shop-name">{{ shop.shop_name }}</h2>
          <!-- 店铺等级 -->
          <div class="shop-rating">
            <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= Math.round(shop.level) }">★</span>
            <span class="level-text">({{ shop.level.toFixed(1) }} 分)</span>
          </div>
          <!-- 所在地 -->
          <div class="shop-location">{{ shop.location }}</div>
          <!-- 店铺描述 -->
          <div class="shop-description">
            <p>{{ shop.shop_description }}</p>
          </div>
          <!-- 收藏/取消收藏 -->
          <el-button
            size="mini"
            type="primary"
            @click="toggleFavorite"
            :disabled="this.isBlocked"
          >
            {{ this.isFavorite ? '取消收藏' : '收藏' }}
          </el-button>
          <!-- 拉黑/取消拉黑 -->
          <el-button
            size="mini"
            type="danger"
            @click="toggleBlock"
          >
            {{ this.isBlocked ? '取消拉黑' : '拉黑' }}
          </el-button>
        </div>
      </aside>
  
      <!-- 页面主体 -->
      <main class="shop-main">
        <!-- 顶部搜索栏 -->
        <div class="search-bar">
            <el-select
                v-model="searchType"
                placeholder="请选择搜索方式"
                style="width: 150px; margin-right: 10px;">
                <el-option label="名称" value="name" />
                <el-option label="类别" value="category" />
            </el-select>
            <!-- 搜索框 -->
            <el-input
                v-model="searchKeyword"
                placeholder="请输入商品名称或类别"
                style="width: 200px; margin-right: 10px;"
            />
    
            <!-- 搜索按钮 -->
            <el-button @click="searchProducts" type="primary">搜索</el-button>
        </div>
  
        <!-- 商品展示区域 -->
        <div class="product-grid">
          <div v-for="product in displayedProducts" :key="product.id" class="product-card">
            <img :src="'http://localhost:8081'+product.picture_id[0]" alt="商品图片" class="product-image" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">￥{{ product.price }}</div>
              <button class="buy-now" @click="goToDetail(product)">立即购买</button>
            </div>
          </div>
        </div>
  
        <!-- 分页器 -->
        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="products.length"
          @current-change="changePage"
        />
      </main>
    </div>
  </template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      shop_id:'',
      user_id:'',
      isFavorite: false,
      isBlocked: false,
      shop: {},
      searchKeyword: '',
      searchType: 'name',  // 默认为根据名称搜索
      searchKeywordNow:'',
      searchTypeNow: '',  // 搜索用
      categoryMap: {
          'fresh': '生鲜食品',
          'snack': '零食小吃',
          'drink': '酒水饮料',
          'dry': '干货腌货',
          'instant': '即食食品',
          'green': '农产品'
        },
      products: [],
      pageSize: 6,
      currentPage: 1,
    };
  },
  computed: {
    displayedProducts() {
      let showproducts = this.filteredProducts();
      const start = (this.currentPage - 1) * this.pageSize;
      return showproducts.slice(start, start + this.pageSize);
    },
  },
  async created() {
    this.user_id=this.$store.getters.userId;
    this.shop_id = this.$route.params.id;
    const shopResponse = await axios.post('http://localhost:8081/shop/getById', {id:this.shop_id});
    if ( shopResponse.data != null ) {
        this.shop = shopResponse.data;
    }
    const proResponse = await axios.post('http://localhost:8081/product/getAllByShop_id', {id:this.shop_id});
    if ( proResponse.data != null ) {
        this.products = proResponse.data;
    }
    for (let p of this.products) {
        const picResponse = await axios.post('http://localhost:8081/pic/getManyUrl', {id:p.picture_id});
        if ( picResponse.data != null ) {
            p.picture_id = picResponse.data;
        }
    }
    const starResponse = await axios.post('http://localhost:8081/shop/checkRelation', {sid:this.shop_id, uid:this.user_id});
    if ( starResponse.data != null ) {
        let relation = starResponse.data;
        if ( relation === "black" ){
            this.isBlocked = true;
            this.isFavorite = false;
        } else if ( relation === "star" ) {
            this.isFavorite = true;
            this.isBlocked = false;
        } else {
            this.isFavorite = false;
            this.isBlocked = false;
        }
    }
  },
  methods: {
    // 过滤后的商品列表
    filteredProducts() {
        if (this.searchKeywordNow==='' || this.searchTypeNow===''){
            return this.products;
        }
        else if (this.searchTypeNow==='name') {
            return this.products.filter(product => product.name.includes(this.searchKeywordNow));
        } else {
            
            return this.products.filter(product => this.categoryMap[product.category].includes(this.searchKeywordNow));
        }
    },
    goToDetail(product) {
      this.$router.push({
        name: 'product',
        params: { id: product.product_id },
      });
    },
    // 模拟商品搜索功能
    searchProducts() {
        this.searchKeywordNow = this.searchKeyword;
        this.searchTypeNow = this.searchType;
      },
    async toggleFavorite() {
        if ( this.isFavorite ) {
            const starResponse = await axios.post('http://localhost:8081/shop/changeRelation', {sid:this.shop_id, uid:this.user_id, relation:"none"});
            if ( starResponse.data != null ) {
                this.isFavorite = !this.isFavorite;
                this.$message.success('已取消收藏');
            }
        } else {
            const starResponse = await axios.post('http://localhost:8081/shop/changeRelation', {sid:this.shop_id, uid:this.user_id, relation:"star"});
            if ( starResponse.data != null ) {
                this.isFavorite = !this.isFavorite;
                this.$message.success('收藏成功');
            }
        }
    },
    async toggleBlock() {
        if ( this.isBlocked ) {
            const starResponse = await axios.post('http://localhost:8081/shop/changeRelation', {sid:this.shop_id, uid:this.user_id, relation:"none"});
            if ( starResponse.data != null ) {
                this.isBlocked = !this.isBlocked;
                this.$message.success('已取消拉黑');
            }
        } else {
            const starResponse = await axios.post('http://localhost:8081/shop/changeRelation', {sid:this.shop_id, uid:this.user_id, relation:"black"});
            if ( starResponse.data != null ) {
                this.isBlocked = !this.isBlocked;
                this.isFavorite = false;
                this.$message.success('拉黑成功');
            }
        }
    },
    changePage(page) {
      this.currentPage = page;
    },
  },
};
</script>

<style scoped>
.shop-page {
  display: flex;
  padding: 20px;
}
.shop-sidebar {
  width: 25%;
  padding: 20px;
  border-right: 1px solid #eee;
}
.shop-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}
.shop-rating {
  margin-bottom: 10px;
}
.star {
  font-size: 1.2rem;
  color: #ddd;
}
.star.filled {
  color: #ffd700;
}
.shop-location {
  color: gray;
  margin-bottom: 10px;
}
.shop-description {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 20px;
}
.shop-main {
  flex: 1;
  padding: 20px;
}
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.product-card {
  border: 1px solid #eee;
  padding: 10px;
  text-align: center;
}
.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
}
.product-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.product-price {
  color: #e74c3c;
}
.buy-now {
    background-color: #ff6700;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
    background-color: #f85000;
    }
}
</style>
