<template>
    <div>
      <h2>商品收藏管理</h2>
      
      <!-- 搜索栏和操作按钮（顶部）-->
      <div class="search-bar">
        <div style="display: flex; align-items: center;">
          <!-- 搜索方式选择 -->
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
  
        <div style="margin-top: 10px; display: flex; align-items: center;">
          <!-- 商品状态选择 -->
          <el-select
            v-model="productStatus"
            placeholder="选择商品状态"
            style="width: 200px; margin-right: 10px;">
            <el-option label="全部" value="all" />
            <el-option label="售卖中" value="sale" />
            <el-option label="已下架/售罄" value="empty" />
            <el-option label="审核中" value="waiting" />
            <el-option label="审核未通过" value="suspended" />
          </el-select>
        </div>
      </div>
  
      <!-- 商品列表（中部）-->
      <div>
        <el-table :data="filteredProducts" style="width: 100%">
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="category" label="类别" :formatter="(row, column, cellValue) => categoryMap[cellValue] || '未知类别'"/>
          <el-table-column prop="price" label="价格" />
  
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="deleteProduct(scope.row.product_id)" size="small" type="danger">取消收藏</el-button>
              <el-button @click="showProductDetails(scope.row.product_id)" size="small" type="info">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 删除确认弹窗 -->
        <el-dialog
          title="确认取消收藏"
          :visible.sync="deleteDialogVisible"
          width="400px"
          @close="resetDeleteState"
        >
          <p>确定要取消收藏这个商品吗？</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmDelete">确认</el-button>
          </span>
        </el-dialog>

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
  import axios from 'axios';

  export default {
    data() {
      return {
        user_id: 1,   // session获取
        shop_id: '',
        searchKeyword: '',
        searchType: 'name',  // 默认为根据名称搜索
        searchKeywordNow:'',
        searchTypeNow: '',  // 搜索用
        deleteDialogVisible:false,
        productStatus: 'all',  // 默认为“全部”状态
        deleteProductNow:'',  // 用户删除商品
        categoryMap: {
          'fresh': '生鲜食品',
          'snack': '零食小吃',
          'drink': '酒水饮料',
          'dry': '干货腌货',
          'instant': '即食食品',
          'green': '农产品'
        },
        statusMap: {
          'sale': '售卖中',
          'empty': '已下架/售罄',
          'waiting': '审核中',
          'suspended': '审核未通过'
        },
        products: [],
        currentPage: 1,
        pageSize: 15,
        totalItems: 3, // 模拟总商品数
      };
    },
    computed: {
      // 过滤后的商品列表
      filteredProducts() {
        if (this.searchKeywordNow==='' || this.searchTypeNow===''){
          if (this.productStatus === 'all') {
              return this.products;
          }
          return this.products.filter(product => product.status === this.productStatus);
        }
        else if (this.searchTypeNow==='name') {
          if (this.productStatus === 'all') {
            return this.products.filter(product => product.name.includes(this.searchKeywordNow));
          }
          return this.products.filter(product => product.status === this.productStatus && product.name.includes(this.searchKeywordNow));
        } else {
          if (this.productStatus === 'all') {
            return this.products.filter(product => this.categoryMap[product.category].includes(this.searchKeywordNow));
          }
          return this.products.filter(product => product.status === this.productStatus && this.categoryMap[product.category].includes(this.searchKeywordNow));
        }
      }
    },
    created() {
      this.getProducts();
      this.user_id=this.$store.getters.userId;
    },
    methods: {
      async getProducts() {
        this.user_id=this.$store.getters.userId;
        const proResponse = await axios.post('http://localhost:8081/product/selectStarByUserId', {id:this.user_id});
        if ( proResponse.data != null ) {
          this.products = proResponse.data;
          this.totalItems = this.products.length;
        }
      },
      // 模拟商品搜索功能
      searchProducts() {
        this.searchKeywordNow = this.searchKeyword;
        this.searchTypeNow = this.searchType;
      },
      handlePageChange(page) {
        console.log('当前页:', page);
      },
      // 商品管理操作
      deleteProduct(id) {
        this.deleteProductNow = id;
        this.deleteDialogVisible = true;
      },
      // 重置删除状态
      resetDeleteState() {
        this.deleteProductNow = null;
      },
      // 确认删除
      async confirmDelete() {
        // 调用后端 API 删除商品
        const proAddResponse = await axios.post('http://localhost:8081/product/deleteStar', {pid: this.deleteProductNow, uid:this.user_id});
        if ( proAddResponse.status === 200) {
          this.deleteDialogVisible = false;
          alert('商品取消收藏成功');
          window.location.reload();
        } else {
          this.deleteDialogVisible = false;
          alert('商品取消收藏失败');
          window.location.reload();
        }
      },
      async showProductDetails(product_id) {
        this.$router.push({
          name: 'product',
          params: { id: product_id }
        });
      },
    },
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
  /* 设定图片预览的最大宽度和高度 */
  .preview-img {
    max-width: 150px; /* 控制最大宽度 */
    max-height: 150px; /* 控制最大高度 */
    object-fit: cover; /* 确保图片按比例缩放且不会变形 */
  }
  </style>
  