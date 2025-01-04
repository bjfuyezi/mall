<template>
  <div id="app">
    <!-- 侧边导航栏 -->
    <div class="side-nav">
      <router-link to="/shopmodel/info" class="nav-item">店铺信息</router-link>
      <router-link to="/shopmodel/productManage" class="nav-item">商品列表</router-link>
      <router-link to="/shopmodel/couponManage" class="nav-item">优惠设置</router-link>
      <router-link to="/shopmodel/promotionManage" class="nav-item">推广管理</router-link>
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-content">
      <router-view></router-view> <!-- 根据路由动态加载不同的页面 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideNav'
}
</script>

<style scoped>
#app {
  display: flex;
}

.side-nav {
  position: fixed;
  top: 100px; /* 距离顶部100px */
  left: 0;
  width: 200px;
  background-color: #f5f5f5;
  padding-top: 20px;
  padding-left: 10px;
  height: 100vh;
  border-right: 1px solid #e8e8e8;
}

.nav-item {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  border-bottom: 1px solid #e8e8e8;
  
  &:hover {
    background-color: #ff6700;
    color: white;
  }
  
  &.router-link-active {
    background-color: #ff6700;
    color: white;
  }
}

.main-content {
  margin-left: 200px; /* 留出侧边栏的空间 */
  padding: 20px;
  width: calc(100% - 200px); /* 使右侧内容区域占满剩余空间 */
  background-color: #fafafa;
  height: 100vh;
  overflow-y: auto;
}
</style>
