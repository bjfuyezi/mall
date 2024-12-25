<template>
  <div class="home">
    <!-- 轮播广告 -->
    <div class="banner">
      <div class="banner-content">
        <!-- 这里可以添加轮播组件 -->
        <img src="https://via.placeholder.com/1200x400" alt="Banner">
      </div>
    </div>

    <!-- 商品展示区域 -->
    <div class="products-section">
      <h2>热门商品</h2>
      <div class="products-grid">
        <div class="product-card" v-for="n in 8" :key="n">
          <div class="product-image">
            <img src="https://via.placeholder.com/200x200" alt="Product">
          </div>
          <div class="product-info">
            <h3>商品名称</h3>
            <p class="price">¥ 999</p>
            <button class="add-to-cart">加入购物车</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  .banner {
    background-color: #f5f5f5;
    
    .banner-content {
      max-width: 1200px;
      margin: 0 auto;
      
      img {
        width: 100%;
        height: auto;
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
}
</style>
