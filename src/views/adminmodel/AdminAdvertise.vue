<template>
    <div>
      <h2>广告管理</h2>
      
      <!-- 搜索栏和操作按钮（顶部）-->
      <div class="search-bar">
        <div style="display: flex; align-items: center;">
          <!-- 搜索方式选择 -->
          <el-select
            v-model="searchType"
            placeholder="请选择搜索方式"
            style="width: 150px; margin-right: 10px;">
            <el-option label="名称" value="name" />
            <el-option label="商铺名" value="shop" />
          </el-select>
  
          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="请输入商品名称或商铺名"
            style="width: 200px; margin-right: 10px;"
          />
  
          <!-- 搜索按钮 -->
          <el-button @click="searchAdvertise" type="primary">搜索</el-button>
          
          <!-- 添加商品按钮
            <el-button @click="showAddProductDialog = true" type="success" style="margin-left: 10px;">添加商品</el-button> -->

            <!-- 添加商品弹窗 -->
            <!-- <el-dialog :visible.sync="showAddProductDialog" title="添加商品" width="50%"> -->
            <!-- 引入添加商品表单组件 -->
            <!-- <add-product-form @close="showAddProductDialog = false" /> -->
            <!-- </el-dialog> -->
        </div>
  
        <div style="margin-top: 10px; display: flex; align-items: center;">
          <!-- 广告状态选择 -->
          <el-select
            v-model="advertiseStatus"
            placeholder="选择广告状态"
            style="width: 200px; margin-right: 10px;">
            <el-option label="全部" value="all" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="正在进行" value="running" />
            <el-option label="已打回" value="rejected" />
            <el-option label="已失效" value="expired" />
          </el-select>
        </div>
      </div>
  
      <!-- 商品列表（中部）-->
      <div>
        <el-table :data="filteredAdvertise" style="width: 100%">
          <el-table-column prop="name" label="广告名称" />
          <el-table-column prop="shop" label="店铺名称" />
          <el-table-column prop="type" label="广告类型" />
          <el-table-column prop="banner" label="投放方式" />
          <el-table-column prop="category" label="开始时间" />
          <el-table-column prop="category" label="结束时间" />
          <el-table-column prop="status" label="状态" />
          <el-table-column prop="category" label="店铺名称" />
  
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="deleteAdvertise(scope.row.id)" size="small" type="danger">删除</el-button>
              <el-button @click="updateAd(scope.row.id)" size="small" type="warning">强制下线/通过</el-button>
              <el-button @click="showAdvertiseDetails(scope.row.id)" size="small" type="info">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 翻页组件 -->
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          @current-change="handlePageChange"
          layout="prev, pager, next"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        searchKeyword: '',
        searchShop: '',
        searchType: 'name',  // 默认为根据名称搜索
        advertiseStatus: 'all',  // 默认为“全部”状态
        categories: ['零食小吃', '酒水饮料', '干货腌货', '即食食品', '农产品'],
        advertises: [],
        currentPage: 1,
        pageSize: 15,
        totalItems: 0 // 模拟总商品数
      };
    },
    computed: {
        // 过滤后的广告
        filteredAdvertise() {
        if (this.advertiseStatus === 'all') {
            return this.advertises;
        }
        return this.advertises.filter(advertise => advertise.status === this.advertiseStatus);
        }
    },
    methods: {
    async fetchAds() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8081/advertise/');
        console.log(response)
        this.advertises = response.data; 
        console.log(response)
      } catch (error) {
        console.error("There was an error fetching the ads!", error);
      } finally {
        this.loading = false;
      }
    },
      // 模拟商品搜索功能
      searchProducts() {
        console.log('搜索商品:', this.searchKeyword, this.searchType, this.advertiseStatus);
      },
  
      // 库存解析：将库存字段从字符串转换为对象
      parseStock(advertises) {
        return Array.isArray(advertises) ? advertises : [];
      },
  
      handlePageChange(page) {
        console.log('当前页:', page);
      },
  
      // 商品管理操作
      deleteProduct(id) {
        console.log('删除:', id);
      },
  
      updateStock(id) {
        console.log('接受/强制下线:', id);
      },
  
      showProductDetails(id) {
        console.log('查看商品详情:', id);
      }
    },
  
    mounted() {
      console.log('商品数据加载完成');
    }
  };
  </script>
  
  <style scoped>
  .search-bar {
    margin-bottom: 20px;
  }
  
  .el-table th {
    background-color: #f4f4f4;
  }
  
  .dialog-footer {
    text-align: right;
  }
  
  .stock-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .stock-table th,
  .stock-table td {
    padding: 10px;
    text-align: center;
    border: 1px solid #ddd;
  }
  
  .stock-table th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  .stock-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .stock-table tr:hover {
    background-color: #f1f1f1;
  }
  </style>
  