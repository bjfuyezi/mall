<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">待审核商家</div>
            <div class="stat-value">{{ pendingShops }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">待审核商品</div>
            <div class="stat-value">{{ pendingProducts }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">总商家数</div>
            <div class="stat-value">{{ totalShops }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">总商品数</div>
            <div class="stat-value">{{ totalProducts }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'DashboardView',
  data() {
    return {
      pendingShops: 0,
      pendingProducts: 0,
      totalShops: 0,
      totalProducts: 0
    }
  },
  async created() {
    // TODO: 从后端获取统计数据
    const proAddResponse = await axios.post('http://localhost:8081/shop/',{});
    if ( proAddResponse.data != null) {
      this.totalShops = proAddResponse.data.length;
      this.pendingShops = proAddResponse.data.filter(product => product.status === 'waiting').length;
    }
    const proResponse = await axios.post('http://localhost:8081/product/',{});
    if ( proResponse.data != null) {
      this.totalProducts = proResponse.data.length;
      this.pendingProducts = proResponse.data.filter(product => product.status === 'waiting').length;
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  .el-row {
    margin-bottom: 20px;
  }
  
  .stat-item {
    text-align: center;
    padding: 20px;
    
    .stat-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #409EFF;
    }
  }
}
</style> 