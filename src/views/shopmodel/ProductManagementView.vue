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
            <add-product-form @close="addComplete()" />
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
          <el-table-column prop="category" label="类别" :formatter="(row, column, cellValue) => categoryMap[cellValue] || '未知类别'"/>
          <el-table-column prop="price" label="定价" />
  
          <!-- 库存显示为口味-数量 -->
          <el-table-column label="库存">
            <template slot-scope="scope">
              <div>
                <div v-if="scope.row.quantity && scope.row.quantity.length">
                  <div v-for="(item, index) in parseJson(scope.row.quantity)" :key="index">
                    <span>{{ item.flavor }}: {{ item.quantity }} {{ scope.row.unit }}</span>
                  </div>
                </div>
                <div v-else>无库存</div>
              </div>
            </template>
          </el-table-column>
  
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="deleteProduct(scope.row.product_id)" size="small" type="danger">删除</el-button>
              <el-button v-if="scope.row.status === 'sale'" @click="emptyProduct(scope.row.product_id)" size="small" type="warning">下架</el-button>
              <el-button v-if="scope.row.status === 'empty'" @click="saleProduct(scope.row.product_id)" size="small" type="warning">上架</el-button>
              <el-button @click="showProductDetails(scope.row)" size="small" type="info">详情</el-button>
              <el-button v-if="scope.row.status != 'waiting'" @click="updateProduct(scope.row)" size="small" type="info">更新信息</el-button>
            </template>
          </el-table-column>
        </el-table>
  
         <!-- 商品详情弹窗 -->
        <el-dialog :visible.sync="dialogInfoVisible" title="商品详情">
          <el-table :data="this.formattedProductDetails" style="width: 100%">
            <el-table-column prop="label"></el-table-column>
            <el-table-column prop="value">
              <template slot-scope="scope">
                <!-- 判断是否为商品图片 -->
                <template v-if="scope.row.label === '商品图片'">
                  <!-- 如果是商品图片，则遍历图片数组并显示 -->
                  <div v-for="(image, index) in scope.row.value" :key="index" style="display: inline-block; margin-right: 10px;">
                    <img :src="'http://localhost:8081'+image" alt="商品图片" style="width: 50px; height: 50px; object-fit: cover;" />
                  </div>
                </template>
                <!-- 显示其他字段 -->
                <template v-else>
                  <span>{{ scope.row.value }}</span>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogInfoVisible = false">关闭</el-button>
          </div>
        </el-dialog>

        <!-- 删除确认弹窗 -->
        <el-dialog
          title="确认删除"
          :visible.sync="deleteDialogVisible"
          width="400px"
          @close="resetDeleteState"
        >
          <p>确定要删除这个商品吗？</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmDelete">确认</el-button>
          </span>
        </el-dialog>

        <!-- 编辑弹窗 -->
        <el-dialog :visible.sync="updateDialogVisible" title="更新信息">
          <el-form :model="updatedProduct">
            <el-form-item label="名称">
              <el-input v-model="updatedProduct.name" type="text" id="productName" required />
            </el-form-item>
            <el-form-item label="类别">
              <el-select v-model="updatedProduct.category" id="category" required>
                <!-- 通过categoryMap的键值对动态生成选项 -->
                <el-option
                  v-for="(label, value) in categoryMap"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="定价">
              <el-input  v-model="updatedProduct.price" type="number" id="price" min="0" step="0.01" required  />
            </el-form-item>
            <el-form-item label="商品描述">
              <el-input v-model="updatedProduct.description" type="text" id="productDescription" required />
            </el-form-item>
            <el-form-item label="售卖单位">
              <el-input v-model="updatedProduct.unit" type="text" id="productUnit" required />
            </el-form-item>
            <el-form-item label="注意事项">
              <el-input v-model="updatedProduct.notice" type="text" id="productNotice" required />
            </el-form-item>
            <el-form-item label="库存量">
              <div class="stock-tags">
                <div v-for="(stock, index) in updatedProduct.quantity" :key="index" class="stock-tag">
                  <el-input v-model="stock.flavor" placeholder="口味" style="width: 100px; margin-right: 10px;"></el-input>
                  <el-input v-model="stock.quantity" type="number" min="0" placeholder="库存量" style="width: 100px;"></el-input>
                  <el-button type="danger" @click="removeStock(index)" size="small">移除</el-button>
                </div>
                <el-button @click="addStock" type="primary" :disabled="updatedProduct.quantity.length >= 5">添加库存项</el-button>
              </div>
            </el-form-item>
            <el-form-item label="商品图片">
              <!-- 使用 Element UI 的上传组件 el-upload -->
              <el-upload
                class="image-upload-container"
                :action="uploadUrl"
                :file-list="fileList" 
                :on-success="handleImageUploadSuccess" 
                :disabled="updatedProduct.images.length >= 5"  
                accept="image/*" 
                :limit="5" 
                list-type="picture-card" 
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>

            <!-- 图片预览部分 -->
            <el-form-item label="图片预览">
              <div class="image-previews">
                <div v-for="(image, index) in fileList" :key="'preview-' + index" class="image-preview">
                  <img :src="image.url" :alt="'preview-' + index" class="preview-img" />
                  <el-button 
                    size="mini" 
                    type="danger" 
                    icon="el-icon-delete" 
                    @click="removeImage(index)">
                    移除
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="updateDialogVisible = false">取消</el-button>
            <el-button @click="submitUpdate" type="primary">提交</el-button>
          </div>
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
  import AddProductForm from './AddProduct.vue';
  import axios from 'axios';

  export default {
    components: {
        AddProductForm
    },
    data() {
      return {
        fileList:[],
        uploadUrl: 'http://localhost:8081/pic/uploadAndId',
        user_id: 1,   // session获取
        shop_id: '',
        showAddProductDialog: false,  // 控制弹窗的显示
        searchKeyword: '',
        searchType: 'name',  // 默认为根据名称搜索
        searchKeywordNow:'',
        searchTypeNow: '',  // 搜索用
        deleteDialogVisible:false,
        productStatus: 'all',  // 默认为“全部”状态
        formattedProductDetails:[],   // 用于展示详情和修改
        deleteProductNow:'',  // 用户删除商品
        dialogInfoVisible: false,     // 详情弹窗
        updateDialogVisible:false,  // 更新弹窗
        updatedProduct: {
          id: '',
          name: '',
          category: '',
          price: null,
          description: '',
          quantity: [],
          unit: '',
          notice: '',
          images: [], // 存储图片信息
        },
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
        addProductDialogVisible: false,
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
            return this.products.filter(product => product.name.includes(this.searchKeywordNow))
          }
          return this.products.filter(product => product.status === this.productStatus && product.name.includes(this.searchKeywordNow))
        } else {
          if (this.productStatus === 'all') {
            return this.products.filter(product => this.categoryMap[product.category].includes(this.searchKeywordNow))
          }
          return this.products.filter(product => product.status === this.productStatus && this.categoryMap[product.category].includes(this.searchKeywordNow))
        }
      }
    },
    created() {
      console.log('商品数据加载完成');
      this.getProducts();
      this.user_id=this.$store.getters.userId;
    },
    methods: {
      // 上传成功后的回调函数
      handleImageUploadSuccess(response, file, fileList) {
        this.user_id=this.$store.getters.userId;
        let imageId = response.data;
        console.log(fileList);
        imageId = file.response;
        // 更新 fileList 以符合 Element UI 需要的格式
        this.fileList.push({
          name: file.name,
          url: file.url,
          uid: Date.now(),  // 确保每个文件有一个唯一的 uid
        });
        this.updatedProduct.images.push(imageId);
        console.log('图片上传成功，ID:', imageId);
      },

      removeImage(index) {
        this.updatedProduct.images.splice(index, 1);
      },
      async submitUpdate() {
        this.user_id=this.$store.getters.userId;
        // 准备表单数据
        const formData = new FormData();
        formData.append('name', this.updatedProduct.name);
        formData.append('category', this.updatedProduct.category);
        formData.append('price', this.updatedProduct.price);
        formData.append('description', this.updatedProduct.description);
        formData.append('unit', this.updatedProduct.unit);
        formData.append('notice', this.updatedProduct.notice);
        formData.append('product_id', this.updatedProduct.id);
        formData.append('images', JSON.stringify(this.updatedProduct.images));
        formData.append('quantity', JSON.stringify(this.updatedProduct.quantity));
        console.log(this.updatedProduct.images);

        const proUpResponse = await axios.post('http://localhost:8081/product/updateAll', formData);
        if ( proUpResponse.status === 200 ) {
          alert('商品更新成功');
          window.location.reload();
        } else {
          alert('商品更新失败');
          window.location.reload();
        }
      },
      async getProducts() {
        this.user_id=this.$store.getters.userId;
        const shopResponse = await axios.post('http://localhost:8081/shop/getByUser_id', {id:this.user_id});
        if ( shopResponse.data != null ) {
          this.shop_id = shopResponse.data.shop_id;
        }
        const proResponse = await axios.post('http://localhost:8081/product/getAllByShop_id', {id:this.shop_id});
        if ( proResponse.data != null ) {
          this.products = proResponse.data;
          this.totalItems = this.products.length;
        }
      },
      async emptyProduct(id) {
        let data = new FormData();
        data.append("id",id);
        data.append("status","empty");
        const proDelResponse = await axios.post('http://localhost:8081/product/updateStatus', data);
        if ( proDelResponse.status === 200 ) {
          alert('商品下架成功');
          window.location.reload();
        } else {
          alert('商品下架失败');
          window.location.reload();
        }
      },
      async saleProduct(id) {
        let data = new FormData();
        data.append("id",id);
        data.append("status","sale");
        const proDelResponse = await axios.post('http://localhost:8081/product/updateStatus', data);
        if ( proDelResponse.status === 200 ) {
          alert('商品上架成功');
          window.location.reload();
        } else {
          alert('商品上架失败');
          window.location.reload();
        }
      },
      // 模拟商品搜索功能
      searchProducts() {
        this.searchKeywordNow = this.searchKeyword;
        this.searchTypeNow = this.searchType;
      },

      updateProduct(product) {
        this.updatedProduct.quantity = this.parseJson(product.quantity);
        this.updatedProduct.name = product.name;
        this.updatedProduct.category = product.category;
        this.updatedProduct.price = product.price;
        this.updatedProduct.description = product.description;
        this.updatedProduct.unit = product.unit;
        this.updatedProduct.notice = product.notice;
        this.updatedProduct.id = product.product_id;
        this.updateDialogVisible = true;
      },

      // 添加库存项
      addStock() {
        if (this.updatedProduct.quantity.length < 5) {
          this.updatedProduct.quantity.push({ flavor: '', quantity: 0 });
        }
      },
      // 移除库存项
      removeStock(index) {
        this.updatedProduct.quantity.splice(index, 1);
      },
      // 提交更新库存到后端
      submitUpdateStock() {
        const updatedData = {
          stock: this.updatedStock
        };

        axios.post('http://localhost:8081/product/updateStock', updatedData)
          .then(response => {
            if (response.status === 200) {
              alert('库存更新成功');
              this.product.stock = [...this.updatedStock]; // 更新当前商品的库存
              this.updateStockDialogVisible = false; // 关闭弹窗
            }
          })
          .catch(error => {
            console.error('库存更新失败', error);
          });
      },

      // 库存解析：将库存字段从字符串转换为对象
      parseJson(str) {
        return JSON.parse(str);
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
        const proAddResponse = await axios.post('http://localhost:8081/product/deleteById', {id: this.deleteProductNow});
        if ( proAddResponse.status === 200) {
          this.deleteDialogVisible = false;
          alert('商品删除成功');
          window.location.reload();
        } else {
          this.deleteDialogVisible = false;
          alert('商品删除失败');
          window.location.reload();
        }
      },
      addComplete() {
        this.showAddProductDialog = false;
        window.location.reload();
      },
      async showProductDetails(product) {
        let pictures = [];
        // 查images的url
        const imageResponse = await axios.post('http://localhost:8081/pic/getManyUrl', {id:product.picture_id});
        if ( imageResponse.data != null ) {
          pictures = imageResponse.data;
        }
        // 格式化商品详情数据，适配弹窗中表格的展示
        this.formattedProductDetails = [
          { label: '商品名称', value: product.name },
          { label: '类别', value: this.categoryMap[product.category] },
          { label: '定价', value: product.price },
          { label: '描述', value: product.description },
          { label: '状态', value: this.statusMap[product.status] },
          { label: '创建时间', value: product.created_time },
          { label: '更新时间', value: product.updated_time },
          { label: '库存量', value: this.parseJson(product.quantity).map(item => `${item.flavor}: ${item.quantity}`).join(', ') },
          { label: '售卖单位', value: product.unit },
          { label: '商品图片', value: pictures },
          { label: '注意事项', value: product.notice },
          { label: '折扣', value: product.discount },
          { label: '销量', value: product.salenum },
          { label: '特产地', value: product.location }
        ];
        if (product.status === 'suspended') {
          this.formattedProductDetails.push({label: '打回原因', value: product.reason});
        }

        // 打开弹窗
        this.dialogInfoVisible = true;
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
  