<template>
  <div class="home">
    <div class="main-content">
    <!-- 分类选择器 -->
      <aside class="category-sidebar">
        <h3>选择商品类别</h3>
        <ul>
          <li v-for="(category, index) in categories" :key="index">
            <label>
              <input type="radio" name="category" :value="category.value" @change="selectCategory(category.value)">
              {{ category.label }}
            </label>
          </li>
        </ul>
      </aside>

      <!-- 轮播广告 -->
      <div class="banner" v-if="banners.length">
        <div class="banner-content">
          <vue-slick-carousel v-bind="settings">
            <div v-for="(slide, index) in banners" :key="index" class="slide">
              <img :src="slide.imagePath" alt="Slide Image" />
            </div>
          </vue-slick-carousel>
        </div>
      </div>
    </div>
    

    <!-- 商品展示区域 -->
    <div class="products-section" ref="productsSection">
      <h2>热门商品</h2>
      <div class="products-grid">
        <div class="product-card" v-for="product in products" :key="product.id">
          <div class="product-image">
            <img :src="product.imagePath" alt="Product">
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">¥ {{ product.price }}</p>
            <button class="add-to-cart">加入购物车</button>
          </div>
        </div>
      </div>
      <div v-if="loadingMore" class="loading-more">加载中...</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  .main-content {
    display: flex;
    gap: 20px; /* 设置左右元素之间的间距 */
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;

    .category-sidebar {
      width: 20%; /* 左侧栏宽度 */
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      h3 {
        font-size: 18px;
        color: #333;
        margin-bottom: 15px;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          margin-bottom: 10px;

          label {
            display: block;
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.3s;

            &:hover {
              background-color: #f1f1f1;
            }
          }

          input[type="radio"] {
            margin-right: 10px;
          }
        }
      }
    }

    .banner {
      flex-grow: 1; /* 让右侧占满剩余空间 */
      background-color: #f5f5f5;

      .banner-content {
        img {
          width: 100%;
          height: 400px;
        }
      }
    }
  }

  .products-section {
    max-width: 1200px;
    margin: 30px auto;
    padding: 0 15px;

    h2 {
      margin-bottom: 20px;
      font-size: 24px;
      color: #333;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .product-image {
        img {
          width: 100%;
          height: auto;
        }
      }

      .product-info {
        padding: 15px;
        text-align: center;

        h3 {
          margin-bottom: 10px;
          font-size: 16px;
        }

        .price {
          color: #ff6700;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .add-to-cart {
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
      }
    }
  }

  .loading-more {
    text-align: center;
    margin-top: 20px;
    color: #aaa;
  }
}
</style>

<script>
import axios from 'axios';
import VueSlickCarousel from 'vue-slick-carousel';

export default {
  name: 'HomeView',
  components: {
      VueSlickCarousel,
  },
  data() {
    return {
      banners: [{ imagePath: 'img/test.jpg' }, ], // 存储轮播图的数据
      products: [], // 存储商品的数据
      page: 1, // 当前页码
      loadingMore: false, // 是否正在加载更多商品
      showBanner: true,
      bannerOffset: 0, // 新增：用于跟踪广告偏移量
      categories: [
        { label: '全部', value: 'all' },
        { label: '电子产品', value: 'electronics' },
        { label: '家居用品', value: 'household' },
        { label: '书籍', value: 'books' },
        // 添加更多类别...
      ],
      settings: {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
      },
      selectedCategory: 'all', // 默认选中的类别
    };
  },
  created() {
    this.fetchBanners();
    this.fetchProducts();
  },
  methods: {
    async fetchBanners() {
      try {
        const response = await axios.get('/api/banners');
        this.banners = response.data;
      } catch (error) {
        console.error('获取轮播图失败:', error);
      }
    },
    async fetchProducts() {
      try {
        this.loadingMore = true;

        // 动态设置 pageSize
        const pageSize = this.page === 1 ? 4 : 8;
        let newProducts = Array.from({ length: pageSize }, (element, index) => ({
          imagePath: 'test.jpg',
          name: 'aaa',
          price: '12',
          id: `${this.page}-${index}`, // 确保每个产品有一个唯一的 ID
        }));

        // 实际请求请取消注释下面的代码，并移除模拟数据部分
        /*
        const response = await axios.get(`/api/products?page=${this.page}&pageSize=${pageSize}&category=${this.selectedCategory}`);
        newProducts = response.data;
        */

        // 将新获取的商品追加到现有商品列表中
        this.products.push(...newProducts);

        if (this.page === 1) {
          // 如果是第一页，模拟有广告的情况，减少商品数量
          this.products = this.products.slice(0, 4);
        }

        this.page++;
        this.loadingMore = false;
      } catch (error) {
        console.error('获取商品失败:', error);
        this.loadingMore = false;
      }
    },
    handleScroll() {
      if (this.$refs.productsSection && !this.loadingMore) {
        // 计算页面是否接近底部
        const isNearBottom =
          window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 50;
          //console.log(window.innerHeight,document.documentElement.scrollTop,document.documentElement.offsetHeight,"\n")
        // 如果接近页面底部且不在加载状态，则加载更多商品
        if (isNearBottom) {
          this.fetchProducts();
        }
      }
    },
    selectCategory(value) {
      this.selectedCategory = value;
      this.page = 1;
      this.products = []; // 清空现有产品列表
      this.fetchProducts(); // 请求新类别下的产品
    },
  },
  mounted() {
        this.$nextTick(() => {
      window.addEventListener('scroll', this.handleScroll);
    });
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>