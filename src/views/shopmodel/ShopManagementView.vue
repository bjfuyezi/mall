<template>
    <div class="shop-management">
      <!-- 顶部导航栏 -->
      <header class="top-nav">
        <div class="logo">
          <span>电商平台</span>
        </div>
        <div class="user-info">
          <span>商家名称</span>
          <button class="logout-btn">退出</button>
        </div>
      </header>
  
      <div class="main-container">
        <!-- 固定左侧导航栏 -->
        <aside class="category-sidebar">
          <h3>选择功能</h3>
          <ul>
            <li :class="{ active: currentTab === 'shop-info' }" @click="navigateTo('shop-info')">
              店铺信息
            </li>
            <li :class="{ active: currentTab === 'product-management' }" @click="navigateTo('product-management')">
              商品管理
            </li>
            <li :class="{ active: currentTab === 'promotion-management' }" @click="navigateTo('promotion-management')">
              推广管理
            </li>
            <li :class="{ active: currentTab === 'coupon-management' }" @click="navigateTo('coupon-management')">
              优惠券管理
            </li>
          </ul>
        </aside>
  
        <!-- 右侧内容区域 -->
        <div class="main-content">
          <!-- 商品展示区域 -->
          <div class="section" v-if="currentTab === 'store-info'">
            <h2>店铺信息</h2>
            <div class="content">
              <p>店铺详细信息展示。</p>
              <!-- 其他具体内容 -->
            </div>
          </div>
  
          <div class="section" v-if="currentTab === 'product-management'">
            <h2>商品管理</h2>
            <div class="content">
              <p>管理您的商品，修改商品信息等。</p>
              <div class="products-grid">
                <div class="product-card" v-for="product in products" :key="product.id">
                  <div class="product-image">
                    <img :src="product.imagePath" alt="Product" />
                  </div>
                  <div class="product-info">
                    <h3>{{ product.name }}</h3>
                    <p class="price">¥ {{ product.price }}</p>
                    <button class="edit-btn">编辑</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 其他功能的内容部分类似 -->
          <div class="section" v-if="currentTab === 'promotion-management'">
            
          </div>
  
          <div class="section" v-if="currentTab === 'coupon-management'">
            <h2>优惠券管理</h2>
            <div class="content">
              <p>创建、修改和管理优惠券。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentTab: 'store-info', // 默认选中店铺信息
        products: [
          { id: 1, imagePath: 'img/product1.jpg', name: '商品1', price: 120 },
          { id: 2, imagePath: 'img/product2.jpg', name: '商品2', price: 150 },
          { id: 3, imagePath: 'img/product3.jpg', name: '商品3', price: 180 },
          { id: 4, imagePath: 'img/product4.jpg', name: '商品4', price: 200 },
        ], // 示例商品数据
      };
    },
    methods: {
      // 导航栏点击切换页面
      navigateTo(tab) {
        this.currentTab = tab;
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .shop-management {
    display: flex;
    flex-direction: column;
    height: 100vh; /* 页面填满视口高度 */
  
    /* 顶部导航栏 */
    .top-nav {
      background-color: #f67000; /* 主题颜色 */
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
  
      .logo {
        font-size: 20px;
        font-weight: bold;
      }
  
      .user-info {
        font-size: 14px;
  
        .logout-btn {
          background-color: #f85000;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
  
          &:hover {
            background-color: #ff6f1a;
          }
        }
      }
    }
  
    /* 主容器（包括侧边栏和右侧内容区） */
    .main-container {
      display: flex;
      flex: 1;
      height: calc(100vh - 60px); /* 剩余空间减去顶部导航栏的高度 */
  
      /* 固定左侧导航栏 */
      .category-sidebar {
        width: 220px;
        background-color: #f67000; /* 主题颜色 */
        color: white;
        padding-top: 30px;
        position: fixed; /* 固定左侧 */
        top: 60px; /* 留出顶部导航栏的高度 */
        left: 0;
        padding-left: 20px;
        font-size: 18px;
        height: calc(100vh - 60px); /* 侧边栏的高度与页面剩余高度一致 */
  
        h3 {
          font-size: 20px;
          margin-bottom: 15px;
        }
  
        ul {
          list-style: none;
          padding: 0;
  
          li {
            margin-bottom: 20px;
            cursor: pointer;
            padding: 10px;
            border-radius: 4px;
            transition: background-color 0.3s;
  
            &:hover {
              background-color: #f1f1f1;
            }
  
            &.active {
              background-color: white;
              color: #f67000;
              font-weight: bold;
            }
          }
        }
      }
  
      /* 右侧内容区域 */
      .main-content {
        margin-left: 240px; /* 留出左侧导航栏的空间 */
        flex: 1;
        padding: 20px;
        background-color: #f5f5f5;
        height: 100%;
        overflow-y: auto;
      }
  
      /* 各个功能的部分 */
      .section {
        margin-bottom: 40px;
  
        h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
        }
  
        .content {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          font-size: 16px;
          color: #666;
  
          .products-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
  
            .product-card {
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  
                .edit-btn {
                  background-color: #f67000;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  transition: background-color 0.3s;
  
                  &:hover {
                    background-color: #f85000;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  </style>
  