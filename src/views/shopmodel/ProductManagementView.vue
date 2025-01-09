<template>
    <div>
      <h2>商品管理</h2>
      
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
          
          <!-- 添加商品按钮 -->
            <el-button @click="showAddProductDialog = true" type="success" style="margin-left: 10px;">添加商品</el-button>

            <!-- 添加商品弹窗 -->
            <el-dialog :visible.sync="showAddProductDialog" title="添加商品" width="50%">
            <!-- 引入添加商品表单组件 -->
            <add-product-form @close="showAddProductDialog = false" />
            </el-dialog>
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
          <el-table-column prop="category" label="类别" />
          <el-table-column prop="price" label="定价" />
  
          <!-- 库存显示为口味-数量 -->
          <el-table-column label="库存">
            <template slot-scope="scope">
              <div>
                <div v-if="scope.row.stock && scope.row.stock.length">
                  <div v-for="(item, index) in parseStock(scope.row.stock)" :key="index">
                    <span>{{ item.flavor }}: {{ item.quantity }} 件</span>
                  </div>
                </div>
                <div v-else>无库存</div>
              </div>
            </template>
          </el-table-column>
  
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="deleteProduct(scope.row.id)" size="small" type="danger">删除</el-button>
              <el-button v-if="scope.row.status === 'sale'" @click="emptyProduct(scope.row.id)" size="small" type="warning">下架</el-button>
              <el-button v-if="scope.row.status === 'empty'" @click="saleProduct(scope.row.id)" size="small" type="warning">上架</el-button>
              <el-button @click="updateStock(scope.row.id)" size="small" type="info">更新库存</el-button>
              <el-button @click="showProductDetails(scope.row.id)" size="small" type="info">详情</el-button>
              <el-button v-if="scope.row.status != 'waiting'" @click="updateProduct(scope.row.id)" size="small" type="info">编辑</el-button>
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
  import AddProductForm from './AddProduct.vue';
  import axios from 'axios';

  export default {
    components: {
        AddProductForm
    },
    data() {
      return {
        user_id: 1,   // session获取
        shop_id: '',
        showAddProductDialog: false,  // 控制弹窗的显示
        searchKeyword: '',
        searchCategory: '',
        searchType: 'name',  // 默认为根据名称搜索
        productStatus: 'all',  // 默认为“全部”状态
        categories: ['生鲜食品', '零食小吃', '酒水饮料', '干货腌货', '即食食品', '农产品'],
        products: [
          {
            id: 1,
            name: '苹果',
            category: '生鲜食品',
            price: '19.9',
            stock: [
              { flavor: '甜味', quantity: 30 },
              { flavor: '酸味', quantity: 50 }
            ],
            description: '新鲜苹果，口感极佳。',
            status: 'sale',
            picture_id: [],
            created_time: '',
            updated_time: '',
            location: '',
            notice: '',
            unit: '',
            salenum: ''
          }
          // {
          //   id: 1,
          //   name: '苹果',
          //   category: '生鲜食品',
          //   stock: [
          //     { flavor: '甜味', quantity: 30 },
          //     { flavor: '酸味', quantity: 50 }
          //   ],
          //   description: '新鲜苹果，口感极佳。',
          //   status: 'selling'
          // },
          // {
          //   id: 2,
          //   name: '薯片',
          //   category: '零食小吃',
          //   stock: [
          //     { flavor: '海盐', quantity: 20 },
          //     { flavor: '烧烤', quantity: 40 }
          //   ],
          //   description: '脆脆的薯片，搭配丰富的口味。',
          //   status: 'sold_out'
          // },
          // {
          //   id: 3,
          //   name: '葡萄酒',
          //   category: '酒水饮料',
          //   stock: [
          //     { flavor: '干型', quantity: 15 },
          //     { flavor: '甜型', quantity: 25 }
          //   ],
          //   description: '高品质葡萄酒，适合各种场合。',
          //   status: 'pending'
          // }
        ],
        currentPage: 1,
        pageSize: 15,
        totalItems: 3, // 模拟总商品数
        addProductDialogVisible: false,
        newProduct: {
          name: '',
          category: '',
          stock: [],
          description: ''
        }
      };
    },
    computed: {
        // 过滤后的商品列表
      filteredProducts() {
        if (this.productStatus === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.status === this.productStatus);
      }
    },
    created() {
      console.log('商品数据加载完成');
      this.getProducts();
    },
    methods: {
      async getProducts() {
        const shopResponse = await axios.post('http://localhost:8081/shop/getByUser_id', {id:this.user_id});
        if ( shopResponse.data != null ) {
          this.shop_id = shopResponse.data.shop_id;
        }
        const proResponse = await axios.post('http://localhost:8081/product/getAllByShop_id', {id:this.shop_id});
        if ( proResponse.data != null ) {
          console.log("products读出来了，还没扔列表里");
          console.log(proResponse.data);
        }
      },
      // 模拟商品搜索功能
      searchProducts() {
        console.log('搜索商品:', this.searchKeyword, this.searchType, this.productStatus);
      },
  
      // 添加商品库存项
      addStockRow() {
        this.newProduct.stock.push({ flavor: '', quantity: 0 });
      },

      // 库存解析：将库存字段从字符串转换为对象
      parseStock(stock) {
        return Array.isArray(stock) ? stock : [];
      },
  
      handlePageChange(page) {
        console.log('当前页:', page);
      },
  
      // 商品管理操作
      deleteProduct(id) {
        console.log('删除商品:', id);
      },
  
      updateStock(id) {
        console.log('更新库存:', id);
      },
  
      showProductDetails(id) {
        console.log('查看商品详情:', id);
      }
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
  </style>
  