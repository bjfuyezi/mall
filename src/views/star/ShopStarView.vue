<template>
    <div>
      <h2>店铺收藏与拉黑管理</h2>
      
      <!-- 搜索栏和操作按钮（顶部）-->
      <div class="search-bar">
        <div style="display: flex; align-items: center;">
          <!-- 搜索方式选择 -->
          <el-select
            v-model="searchType"
            placeholder="请选择搜索方式"
            style="width: 150px; margin-right: 10px;">
            <el-option label="名称" value="name" />
            <el-option label="特产地" value="location" />
          </el-select>
  
          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="请输入店铺名称或地区"
            style="width: 200px; margin-right: 10px;"
          />
  
          <!-- 搜索按钮 -->
          <el-button @click="searchShops" type="primary">搜索</el-button>
        </div>
  
        <div style="margin-top: 10px; display: flex; align-items: center;">
          <!-- 商品状态选择 -->
          <el-select
            v-model="shopStatus"
            placeholder="选择店铺关联"
            style="width: 200px; margin-right: 10px;">
            <el-option label="全部" value="all" />
            <el-option label="收藏" value="star" />
            <el-option label="拉黑" value="black" />
          </el-select>
        </div>
      </div>
  
      <!-- 店铺列表（中部）-->
      <div>
        <el-table :data="filteredShops" style="width: 100%">
          <el-table-column prop="shop_name" label="店铺名称" />
          <el-table-column prop="location" label="所在地"/>
          <el-table-column prop="level" label="店铺等级" />
  
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button v-if="scope.row.relation === 'star'" @click="deleteShop(scope.row.shop_id)" size="small" type="danger">取消收藏</el-button>
              <el-button v-if="scope.row.relation === 'black'" @click="deleteShop(scope.row.shop_id)" size="small" type="danger">取消拉黑</el-button>
              <el-button @click="showShopDetails(scope.row.shop_id)" size="small" type="info">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 删除确认弹窗 -->
        <el-dialog
          title="确认取消"
          :visible.sync="deleteDialogVisible"
          width="400px"
          @close="resetDeleteState"
        >
          <p>确定要取消和这个店铺的关系吗？</p>
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
        shopStatus: 'all',  // 默认为“全部”状态
        deleteShopNow:'',  // 用户删除店铺关系
        statusMap: {
          'star': '收藏',
          'black': '拉黑',
        },
        shops: [],
        currentPage: 1,
        pageSize: 15,
        totalItems: 3, // 模拟总商品数
      };
    },
    computed: {
      // 过滤后的商品列表
      filteredShops() {
        if (this.searchKeywordNow==='' || this.searchTypeNow===''){
          if (this.shopStatus === 'all') {
              return this.shops;
          }
          return this.shops.filter(product => product.relation === this.shopStatus);
        }
        else if (this.searchTypeNow==='name') {
          if (this.shopStatus === 'all') {
            return this.shops.filter(product => product.shop_name.includes(this.searchKeywordNow));
          }
          return this.shops.filter(product => product.relation === this.shopStatus && product.shop_name.includes(this.searchKeywordNow));
        } else {
          if (this.shopStatus === 'all') {
            return this.shops.filter(product => product.location.includes(this.searchKeywordNow));
          }
          return this.shops.filter(product => product.relation === this.shopStatus && product.location.includes(this.searchKeywordNow));
        }
      }
    },
    created() {
      this.getShops();
      this.user_id=this.$store.getters.userId;
    },
    methods: {
      async getShops() {
        this.user_id=this.$store.getters.userId;
        const proResponse = await axios.post('http://localhost:8081/shop/selectByUser', {uid:this.user_id});
        if ( proResponse.data != null ) {
            for ( let shop of proResponse.data ) {
                const starResponse = await axios.post('http://localhost:8081/shop/checkRelation', {uid:this.user_id,sid:shop.shop_id});
                if ( starResponse.data != null ) {
                    this.shops.push({shop_id: shop.shop_id, shop_name: shop.shop_name, location: shop.location, level: shop.level, relation: starResponse.data});
                }
          }
          this.totalItems = this.shops.length;
        }
      },
      // 模拟商品搜索功能
      searchShops() {
        this.searchKeywordNow = this.searchKeyword;
        this.searchTypeNow = this.searchType;
      },
      handlePageChange(page) {
        console.log('当前页:', page);
      },
      // 商品管理操作
      deleteShop(id) {
        this.deleteShopNow = id;
        this.deleteDialogVisible = true;
      },
      // 重置删除状态
      resetDeleteState() {
        this.deleteShopNow = null;
      },
      // 确认删除
      async confirmDelete() {
        // 调用后端 API 删除商品
        const proAddResponse = await axios.post('http://localhost:8081/shop/changeRelation', {sid: this.deleteShopNow, uid:this.user_id, relation: "none"});
        if ( proAddResponse.status === 200) {
          this.deleteDialogVisible = false;
          alert('取消成功');
          window.location.reload();
        } else {
          this.deleteDialogVisible = false;
          alert('取消失败');
          window.location.reload();
        }
      },
      async showShopDetails(shop_id) {
        this.$router.push({
          name: 'shop-show',
          params: { id: shop_id }
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
  