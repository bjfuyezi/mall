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
      <div class="banner" >
        <div class="banner-content">
          <vue-slick-carousel ref="carousel"  v-bind="settings" @afterChange="logSlideChange">
            <!-- <div v-if="this.banners.length == 0" class="slide">
              <img src="../assets/banner.png" alt="Default Slide Image" />
            </div> -->
            <div v-for="(slide, index) in banners" :key="index" class="slide" >
              <img :src="`http://localhost:8081${slide.url}`" alt="Slide Image" />
            </div>
          </vue-slick-carousel>
          <!-- <button @click="goToNextSlide">下一张</button> -->
        </div>
      </div>
    </div>
    

    <!-- 商品展示区域 -->
    <div class="products-section" ref="productsSection">
      <h2>热门商品</h2>
      <div class="products-grid">
        <div class="product-card" v-for="product in this.showProducts" :key="product.product_id">
          <div class="product-image">
            <img :src="'http://localhost:8081'+product.picture_id[0]" alt="Product" style="width: 200px; height: 200px; object-fit: cover;">
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">¥ {{ product.price }}</p>
            <button class="buy-now" @click="goToDetail(product)">立即购买</button>
          </div>
        </div>
      </div>
      <div v-if="loadingMore" class="loading-more">加载中...</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import VueSlickCarousel from 'vue-slick-carousel';
import defaultImage from '@/assets/banner.png';

export default {
  name: 'HomeView',
  components: {
      VueSlickCarousel,
  },
  data() {
    return {
      defaultImageUrl: defaultImage,
      banners: [], // 存储轮播图的数据
      products: [], // 存储商品的数据
      showProducts: [], // 展示用的数据
      page: 1, // 当前页码
      ans:0,//当前轮数
      loadingMore: false, // 是否正在加载更多商品
      showBanner: true,
      bannerOffset: 0, // 新增：用于跟踪广告偏移量
      categories: [
        { label: '全部', value: 'all' },
        { label: '生鲜食品', value: 'fresh' },
        { label: '零食小吃', value: 'snack' },
        { label: '酒水饮料', value: 'drink' },
        { label: '干货腌货', value: 'dry' },
        { label: '即食食品', value: 'instant' },
        { label: '农产品', value: 'green' }
        // 添加更多类别...
      ],
      settings: {
        dots: true,
        infinite: true,
        speed: 500, // 过渡动画速度
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000, // 每张图片展示时间，例如5秒
        lazyLoad: 'ondemand', // 按需懒加载图片
        initialSide:1
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
        const response = await axios.get('http://localhost:8081/advertise/banner');
        this.banners = response.data;
        console.log(this.banners.length == 0);
        // 销毁并重新初始化轮播图
        this.$nextTick(() => {
          if (this.$refs.carousel) {
            this.$refs.carousel.destroy(); // 销毁当前实例
            this.$nextTick(() => {
              this.$refs.carousel.init(); // 重新初始化
              this.$refs.carousel.slick.slickGoTo(1); 
              this.$refs.carousel.play(); // 启动自动播放
            });
          }
        });
        // 确保 vue-slick-carousel 在数据变化后重新渲染
      } catch (error) {
        console.error('获取轮播图失败:', error);
      }
    },
    goToNextSlide() {
    if (this.$refs.carousel) {
      this.$refs.carousel.slickNext(); // 调用slickNext方法切换到下一张
    }
  },
    async fetchProducts() {
      try {
        this.loadingMore = true;
        if(this.ans<4&&this.ans!=0){
          console.log("加页");
          let newProducts = this.productsall.slice(this.ans*8,(this.ans+1)*8);
          this.products.push(...newProducts);
          console.log("当前页的",newProducts);
          // 收集所有需要的 id 到一个数组中
          const pIds = newProducts
                            .filter(p => p.greedy!== null&&p.greedy !== 0) // 过滤出 greedy 不为零的产品
                            .map(p => p.product_id);     // 提取这些产品的 picture_id
          // 将所有的 id 一次性发送给后端
          for(let p of newProducts)
            console.log(p.greedy!== null,p.greedy !== 0);
          if(pIds.length>0){
              await axios.post('http://localhost:8081/product/flushGreedy', { ids: pIds });
          }
          this.selectCategory(this.selectedCategory);//保持当前分类
          this.ans+=1;
          this.page+=1;
        }
        else{
          console.log("加新的");
              const userid = this.$store.getters.userId;
              const response = await axios.get('http://localhost:8081/product/homeview',{
                params:{
                  uid:userid
                }
              });
              if (response.data != null) {
                this.productsall = response.data;
                //this.products.push(...response.data);//追加新的内容
                //console.log(this.products);
                console.log("新东西",response.data);
              }
              for (let p of this.productsall) {
                //console.log(p.picture_id);
                const picResponse = await axios.post('http://localhost:8081/pic/getManyUrl', {id:p.picture_id});
                if ( picResponse.data != null ) {
                  p.picture_id = picResponse.data;
                }
              }
              let pIds =[];
              if(this.page == 1){
                this.products = this.productsall.slice(0, 4);
                // 收集所有需要的 id 到一个数组中
                pIds = this.products
                                  .filter(p => p.greedy!== null&&p.greedy !== 0) // 过滤出 greedy 不为零的产品
                                  .map(p => p.product_id);     // 提取这些产品的 picture_id
                // 将所有的 id 一次性发送给后端
                for(let p of this.products)
                  console.log(p.greedy!== null,p.greedy !== 0);
              }else{
                this.products.push(...this.productsall.slice(0,8));
                // 收集所有需要的 id 到一个数组中
                pIds = this.productsall.slice(0,8)
                                  .filter(p => p.greedy!== null&&p.greedy !== 0) // 过滤出 greedy 不为零的产品
                                  .map(p => p.product_id);     // 提取这些产品的 picture_id
                // 将所有的 id 一次性发送给后端
                for(let p of this.productsall.slice(0,8))
                  console.log(p.greedy!== null,p.greedy !== 0);
              }

              if(pIds.length>0){
                const pIdsString = pIds.join(',');
                await axios.post('http://localhost:8081/product/flushGreedy', { ids: pIdsString });
              }
              console.log("当前的",this.products);
              this.selectCategory(this.selectedCategory);//保持现有类别
              this.page+=1;
              this.ans=0;
        }
        // 动态设置 pageSize
        // const pageSize = this.page === 1 ? 4 : 8;
        // let newProducts = Array.from({ length: pageSize }, (element, index) => ({
        //   imagePath: 'test.jpg',
        //   name: 'aaa',
        //   price: '12',
        //   id: `${this.page}-${index}`, // 确保每个产品有一个唯一的 ID
        // }));

        // 实际请求请取消注释下面的代码，并移除模拟数据部分
        
        // 将新获取的商品追加到现有商品列表中
        // this.products.push(...newProducts);

        // if (this.page === 1) {
        //   // 如果是第一页，模拟有广告的情况，减少商品数量
        //   this.products = this.products.slice(0, 4);
        //   this.showProducts = this.showProducts.slice(0, 4);
        // }

        // this.page++;
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
      //this.page = 1;
      if ( value != 'all') {
        this.showProducts = this.products.filter(product => product.category === this.selectedCategory); // 请求新类别下的产品
      } else {
        this.showProducts = this.products;
      }
    },
    async goToDetail(product) {
      //加入浏览记录
      const userid = this.$store.getters.userId;
      const picResponse = await axios.post('http://localhost:8081/recommend/history', {pid:product.product_id,uid:userid});
      if(picResponse.status != 200){
          console.log(picResponse);
      }
      this.$router.push({
        name: 'product',
        params: { id: product.product_id },
        state: { product }
      });
    },
    logSlideChange(index) {
      console.log('当前幻灯片索引:', index);
      console.log('当前幻灯片数据:', this.banners[index]);
  },
  },
  mounted() {
        this.$nextTick(() => {
      window.addEventListener('scroll', this.handleScroll);

       // 确保组件已挂载并且所有图片都加载完毕后启动自动播放
    if (this.$refs.carousel && this.banners.length > 0) {
      this.$refs.carousel.play();
    }
    });
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>

<style lang="scss" scoped>
.home {
  .main-content {
    display: flex;
    gap: 20px; /* 设置左右元素之间的间距 */
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    max-height: 400px;

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
      width: 100%;
  flex-grow: 1;
  background-color: #f5f5f5;
  max-height: 400px; // 明确设定最大高度为400px
  max-width: 80%;
  overflow: hidden; // 防止内容溢出
button {
    position: absolute;
    right: 20px;
    bottom: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }

.banner-content {
  height: 100%; // 确保 banner 内容占据全部可用空间
}

.slide {
  height: 100%; /* 每个 slide 占据全部可用空间 */
}

.slide img {
  width: 1005; // 允许宽度根据比例调整
  height: auto; // 图片占据 slide 的全部高度
  object-fit: cover; // 保证图片被裁剪并覆盖整个区域
  display: block; // 避免底部空白
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