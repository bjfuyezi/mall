<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- 购物车头部 -->
      <div class="cart-header">
        <h2>我的购物车</h2>
        <!-- 清除失效商品按钮 -->
<!--        <el-button type="text" @click="clearInvalidItems">-->
<!--          <i class="el-icon-delete"></i> 清除失效商品-->
<!--        </el-button>-->
      </div>

      <!-- 购物车主体，若购物车有商品 -->

      <div class="cart-main" v-if="cartData.length > 0">
        <!-- 表格组件，用于展示扁平化的购物车数据，启用边框、斑马纹样式，设置顶部外边距10px，并在加载时显示加载动画 -->
        <el-table :data="flattenedCartData" border stripe style="width: 100%" v-loading="loading">
          <!-- 全选 -->
          <!-- 表格列，类型为选择框，宽度为55px，内容居中对齐，启用可选择功能，是否可选由isSelectable函数决定 -->
<!--          <el-table-column type="selection" width="55" align="center" :selectable="isSelectable"-->
<!--                           v-model="selectAll"/>-->
          <el-table-column type="selection" width="55" align="center" :selectable="isSelectable"
                           v-model="selectAll"/>
          <!-- 商品信息 -->
          <el-table-column label="商品信息">
            <template slot-scope="scope">
              <div v-if="scope.row.isShop">
                <!-- 商铺复选框 -->
                <el-checkbox v-model="scope.row.selected" @change="toggleShopSelection(scope.row)">
                  {{ scope.row.shop_name }}
                </el-checkbox>
              </div>
              <div v-else>
                <!-- 商品信息 -->
                <img :src="'http://localhost:8081'+scope.row.picture_url" alt="商品图片" class="product-thumbnail"/>
                <div>
                  <span>{{ scope.row.product_name }}</span>
                  <div class="product-specification">{{ scope.row.flavor }}</div>
                  <p v-if="!scope.row.available" style="color: red;">该商品已下架</p>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 单价 -->
          <el-table-column label="单价" align="center">
            <template slot-scope="scope">
              <span v-if="!scope.row.isShop">
                ¥{{ scope.row.price ? scope.row.price.toFixed(2) : '--' }}
              </span>
            </template>
          </el-table-column>

          <!-- 数量 -->
          <el-table-column label="数量" align="center">
            <template slot-scope="scope">
              <el-input-number
                  v-if="!scope.row.isShop"
                  v-model="scope.row.quantity"
                  :min="1"
                  :max="scope.row.stock"
                  :disabled="!scope.row.available"
                  @change="updateQuantity(scope.row)"
              />
            </template>
          </el-table-column>

          <!-- 小计 -->
          <el-table-column label="小计" align="center">
            <template slot-scope="scope">
              <span v-if="!scope.row.isShop">
                ¥{{ (scope.row.price && scope.row.quantity) ? (scope.row.price * scope.row.quantity).toFixed(2) : '--' }}
              </span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" align="center" width="120">
            <template slot-scope="scope">
              <el-button v-if="!scope.row.isShop" type="danger" size="mini" :disabled="!scope.row.available" @click="removeItem(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空购物车提示 -->
      <div v-else class="empty-cart">
        <i class="el-icon-shopping-cart-2"></i>
        <p>购物车还是空的</p>
        <!-- 按钮跳转到商品页 -->
        <el-button type="primary" @click="$router.push('/')">去首页逛逛</el-button>
      </div>

      <!-- 底部操作栏 -->
      <div class="cart-footer" v-if="cartData.length > 0">
<!--        <el-checkbox v-model="allChecked" @change="toggleAllSelection">-->
<!--          全选-->
<!--        </el-checkbox>-->
        <div class="cart-summary">
          已选择 {{ selectedCount }} 件商品，总计：¥{{ totalAmount.toFixed(2) }}
        </div>
        <el-button type="primary" :disabled="totalAmount === 0" @click="checkout">
          去结算
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user_id:null,
      // 假设扁平化后的数据已经存储在 flattenedCartData 中
      flattenedCartData: [],
      cartData : [], // 原始购物车数据
      /*预期要有的数据：
      * 用户购物车id：cart_item_id【√】
      * 用户id：user_id【√】
      * 商品id：product_id【√】
      * 商品图片url：picture_url[Product数据表中查询到商品的图片json，获取第一个图片id，再获取得到url]【显示】【单独】【√】
      * 商品名称：name[Product数据表中查询]【显示】【√】
      * 规格：flavor【显示】【√】
      * 商品单价：price[Product数据表中查询]【显示】【√】
      * 初始数量：quantity【显示，可调节】【√】
      * 商品的库存量：stock[Product数据表中查询]【单独】【√】
      * 加入时间排序专用：added_time【√】
      * shop_id：商品来自的店铺名【√】
      * selected：是否选中，默认为false【√】
      * available：是否失效，默认为false【√】
      * */
      loading: false, // 加载状态
    };
  },
  computed: {
    // 将购物车数据扁平化
    flattening() {
      // const flattenedData = [];
      const data = [];
      this.cartData.forEach(shop => {
        // 先处理店铺数据
        data.push({
          isShop: true, // 标记这是店铺数据
          selected:false,
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
        });

        // 再处理店铺里的商品项
        shop.items.forEach(item => {
          data.push({
            isShop: false, // 标记这是商品数据
            shop_id: shop.shop_id, // 店铺ID
            shop_name: shop.shop_name, // 店铺名称
            cart_item_id: item.cart_item_id, // 购物车项ID
            product_name: item.product_name, // 产品名称
            product_id: item.product_id, // 产品ID
            flavor: item.flavor, // 产品口味
            quantity: item.quantity, // 数量
            price: item.price, // 单价
            available: item.available, // 是否可用
            stock: item.stock, // 库存
            selected: item.selected, // 是否选中
            added_time: item.cart_item.added_time, // 加入时间
            picture_url: item.picture_url, // 产品图片URL
            user_id: item.user_id, // 用户ID
          });
        });
      });
      return data;
    },

    selectAll: {
      // 计算属性的getter方法，获取购物车所有项的选中状态
      get() {
        return this.flattenedCartData.length > 0 && // 购物车必须非空
            this.flattenedCartData.every(item => { // 确保所有项都满足特定条件
              if (item.isShop) { // 如果是店铺项
                return item.selected; // 店铺项必须被选中
              } else { // 如果是商品项
                return !item.available || item.selected; // 商品项要么不可用，要么被选中
              }
            });
      },
      // 计算属性的setter方法，设置所有商品和店铺项的选中状态
      set(value) {
        this.flattenedCartData.forEach(item => {
          // 如果是店铺项，或者是商品项且商品项是可用的
          if (item.isShop || (!item.isShop && item.available)) {
            item.selected = value; // 设置选中状态为传入的value值
          }
        });
      }
    },
    // 全选状态
    allChecked() {
      return this.flattenedCartData
          .filter(item => !item.isShop) // 只处理商品项，排除店铺项
          .every(item => item.selected); // 检查每个商品项的selected字段是否为true
    },
    // 总金额
    totalAmount() {
      return this.flattenedCartData
          .filter(item => !item.isShop && item.selected) // 只处理已选中的商品项
          .reduce((total, item) => total + item.price * item.quantity, 0); // 计算总金额
    },
    // 已选择商品数量
    selectedCount() {
      return this.flattenedCartData
          .filter(item => !item.isShop && item.selected) // 只处理已选中的商品项
          .length;
    },
  },
  methods: {
    // 切换店铺选中状态
    toggleShopSelection(row) {
      this.flattenedCartData
          .filter(item => !item.isShop && item.shop_id===row.shop_id)
          .forEach(item => item.selected=row.selected)
    },
    // 更新全选状态
    toggleAllSelection() {

      this.cartData.forEach((shop) => {
        shop.checked = this.allChecked;
        shop.items.forEach((item) => {
          item.checked = this.allChecked;
        });
      });
    },
    // 更新商品数量
    updateQuantity(item) {
      console.log("更新商品数量", item);
    },
    // 删除商品
    removeItem(item) {
      this.cartData.forEach((shop) => {
        shop.items = shop.items.filter(
            (shopItem) => shopItem.cart_item_id !== item.cart_item_id
        );
      });
      this.cartData = this.cartData.filter((shop) => shop.items.length > 0);
    },
    // 结算
    checkout() {
      // console.log("结算");
    },
    // 检测行是否可选
    // isSelectable 函数，返回一个布尔值，判断当前行是否可以被选择。
    // 若当前行是商铺行（isShop 为 true），则不可选；否则可以选择。
    isSelectable(row) {
      return !row.isShop && row.available; // 只有商品且可用才可选
    },
    async getCartData() {
      this.loading = true;
      this.user_id = this.$store.getters.userId; // 获取用户ID
      console.log("当前用户id为：" + this.user_id);

      try {
        const cartResponse = await axios.get('http://localhost:8081/cart/items', {
          params: { user_id: this.user_id }
        });
        if (cartResponse.data != null) {
          // console.log("get回复："+cartResponse.data);
          this.cartData = cartResponse.data;
          // 触发数据扁平化
          this.flattenedCartData = this.flattening;  // 直接调用计算属性
          // console.log("扁平化数据："+this.flattenedCartData);
        }
      } catch (error) {
        console.error("获取购物车数据失败", error);
      }finally {
        this.loading = false;
      }
    }
  },
  created() {
    console.log('商品数据加载开始');
    this.getCartData();
    this.flattenedCartData = this.flatteningCartData;
    console.log('商品数据加载完成');
    // 模拟从后端获取数据
    this.loading = false;
  },
};
</script>

<style>
.cart-page {
  background-color: #f5f5f5; /* 设置页面背景颜色为淡灰色 */
  padding: 20px 0; /* 设置上下内边距为 20px，左右内边距为 0 */
  min-height: calc(100vh - 120px); /* 设置最小高度为视口高度减去 120px，确保页面内容至少填充视口高度 */
}

.cart-container {
  max-width: 1200px; /* 设置容器的最大宽度为 1200px，确保容器不会过宽 */
  margin: 0 auto; /* 设置左右外边距为 auto，使容器水平居中对齐 */
  background-color: #fff; /* 设置容器的背景颜色为白色 */
  border-radius: 8px; /* 设置容器的边角圆滑度为 8px，创建圆角效果 */
  padding: 20px; /* 设置容器内边距为 20px，确保内容与边界之间有适当的空间 */
}

.cart-header {
  display: flex; /* 使用 flexbox 布局，允许内部元素灵活排列 */
  justify-content: space-between; /* 在水平方向上，左右两侧元素分开对齐，且间距均匀 */
  align-items: center; /* 在垂直方向上，确保子元素垂直居中对齐 */
  padding-bottom: 20px; /* 设置底部内边距为 20px，确保内容与底部有适当间距 */
  border-bottom: 1px solid #eee; /* 添加一个浅灰色的底部边框，用于分隔头部与下面的内容 */

  h2 {
    font-size: 20px; /* 设置标题字体大小为 20px */
    font-weight: normal; /* 设置标题字体为常规粗细 */
  }
}

.empty-cart {
  text-align: center; /* 内容水平居中 */
  padding: 60px 0; /* 上下内边距 60px，左右内边距为 0 */
  color: #999; /* 字体颜色设为浅灰色 */

  i {
    font-size: 60px; /* 图标字体大小 60px */
    margin-bottom: 20px; /* 图标下方的间距 20px */
  }

  .el-button {
    margin-top: 20px; /* 按钮与上方内容的间距为 20px */
  }
}


/* 产品缩略图 */
.product-thumbnail {
  width: 60px;  /* 设置产品缩略图的宽度为 60px */
  height: 60px; /* 设置产品缩略图的高度为 60px */
}

/* 产品规范 */
.product-specification {
  color: #888;      /* 设置产品规格的文字颜色为灰色 (颜色代码 #888) */
  font-size: 12px;   /* 设置产品规格文字的字体大小为 12px */
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.cart-summary {
  font-weight: bold;
}
</style>