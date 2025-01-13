<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- 购物车头部 -->
      <div class="cart-header">
        <h2>我的购物车</h2>
        <!-- 清除失效商品按钮 -->
        <el-button type="text" @click="clearInvalidItems">
          <i class="el-icon-delete"></i> 清除失效商品
        </el-button>
      </div>

      <!-- 购物车主体，若购物车有商品 -->
      <div class="cart-main" v-if="cartData.length > 0">
        <!-- 表格组件，用于展示扁平化的购物车数据，启用边框、斑马纹样式，设置顶部外边距10px，并在加载时显示加载动画 -->
        <el-table :data="flatCartData" border stripe style="margin-top: 10px" v-loading="loading">
          <!-- 全选 -->
          <!-- 表格列，类型为选择框，宽度为55px，内容居中对齐，启用可选择功能，是否可选由isSelectable函数决定 -->
          <el-table-column type="selection" width="55" align="center" :selectable="isSelectable" />
          <!-- 商品信息 -->
          <el-table-column label="商品信息">
            <!-- 插槽模板，用于渲染表格中的每一行 -->
            <template #default="{ row }">
              <!-- 判断当前行是否为商铺行 -->
              <div v-if="row.isShop">
                <!-- 店铺行 -->
                <!-- 商铺复选框，绑定选中状态，点击时触发 toggleShopSelection 方法 -->
                <el-checkbox v-model="row.checked" @change="toggleShopSelection(row)" >
                  {{ row.shop_name }}  <!-- 显示商铺名称 -->
                </el-checkbox>
              </div>
              <!-- 如果当前行不是商铺行，显示商品信息 -->
              <div v-else>
                <!-- 商品行 -->
                <!-- 判断商品是否有图片 URL，若有则显示商品图片 -->
                <img
                    :src="'http://localhost:8081'+row.image_url"
                    alt="商品图片"
                    class="product-thumbnail"
                />
                <div>
                  <!-- 显示商品名称 -->
                  <span>{{ row.product_name }}</span>
                  <!-- 显示商品规格 -->
                  <div class="product-specification">{{ row.flavor }}</div>
                  <!-- 显示下架状态 -->
                  <p class="status" v-if="!item.available">该商品已下架</p>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 单价 -->
          <el-table-column label="单价" align="center">
            <!-- 在默认插槽中，接收 row 数据 -->
            <template #default="{ row }">
              <!-- 如果 row.isShop 为 false，说明是商品，显示价格 -->
              <span v-if="!row.isShop">
              <!-- 如果 row.price 存在，则格式化显示为两位小数；否则显示 '--' -->
              ¥{{ row.price ? row.price.toFixed(2) : '--' }}
            </span>
            </template>
          </el-table-column>

          <!-- 数量 -->
          <!-- 数量 -->
          <el-table-column label="数量" align="center">
            <!-- 在默认插槽中，接收 row 数据 -->
            <template #default="{ row }">
              <!-- 如果 row.isShop 为 false，显示数量修改输入框 -->
              <!-- 条件：row.isShop 为 false，才会显示数量修改框 -->
              <!-- 绑定 row.quantity 到输入框的值 -->
              <!-- 设置最小数量为 1,最大数量为当前规格的库存 -->
              <!-- 根据available判断是否需要禁止 -->
              <!-- 数量变化时调用 updateQuantity 方法，传入参数是这一行的数据 -->
              <el-input-number
                  v-if="!row.isShop"
                  v-model="row.quantity"
                  :min="1"
                  :max="row.stock"
                  :disabled="!item.available"
                  @change="updateQuantity(row)"
              />
            </template>
          </el-table-column>

          <!-- 小计 -->
          <el-table-column label="小计" align="center">
            <!-- 在默认插槽中，接收 row 数据 -->
            <template #default="{ row }">
              <!-- 如果 row.isShop 为 false，显示小计 -->
              <span v-if="!row.isShop">
              <!-- 如果 row.price 和 row.quantity 存在，计算小计并格式化为两位小数 -->
              ¥{{ (row.price && row.quantity) ? (row.price * row.quantity).toFixed(2) : '--' }}
                <!-- 如果 price 或 quantity 为 falsy 值（例如 0 或 null），显示 '--' -->
            </span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" align="center" width="120">
            <template #default="{ row }">
              <el-button
                  v-if="!row.isShop"
                  type="danger"
                  size="mini"
                  @click="removeItem(row)"
              >
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
        <el-checkbox v-model="allChecked" @change="toggleAllSelection">
          全选
        </el-checkbox>
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
      cartData: [], // 原始购物车数据
      loading: false, // 加载状态
    };
  },
  computed: {
    // 将购物车数据扁平化
    flatteningCartData(cartData) {
      const flattenedData = [];

      cartData.forEach(shop => {
        // 先处理店铺数据
        flattenedData.push({
          isShop: true, // 标记这是店铺数据
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
        });

        // 再处理店铺里的商品项
        shop.items.forEach(item => {
          flattenedData.push({
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
      return flattenedData;
    },
    // 全选状态
    allChecked() {
      return this.cartData.every((shop) =>
          shop.checked || shop.items.every((item) => item.checked)
      );
    },
    // 总金额
    totalAmount() {
      return this.cartData.reduce((total, shop) => {
        return (
            total +
            shop.items.reduce((shopTotal, item) => {
              if (item.checked) {
                return shopTotal + item.price * item.quantity;
              }
              return shopTotal;
            }, 0)
        );
      }, 0);
    },
    // 已选择商品数量
    selectedCount() {
      return this.cartData.reduce((count, shop) => {
        return count + shop.items.filter((item) => item.checked).length;
      }, 0);
    },
  },
  methods: {
    // 切换店铺选中状态
    toggleShopSelection(shop) {
      this.cartData.forEach((store) => {
        if (store.shop_id === shop.shop_id) {
          store.items.forEach((item) => {
            item.checked = shop.checked;
          });
        }
      });
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
      console.log("结算");
    },
    // 检测行是否可选
    // isSelectable 函数，返回一个布尔值，判断当前行是否可以被选择。
    // 若当前行是商铺行（isShop 为 true），则不可选；否则可以选择。
    isSelectable(row) {
      return !row.isShop;
    },
    async getCartData(){
      this.user_id = this.$store.getters.userId;//
      console.log("当前用户id为："+user_id);
      const cartResponse = await axios.post('http://localhost:8081/cart/items', {id:this.user_id});
      if(cartResponse.data!=null){
        this.cartData = cartResponse.data;
        this.flattenedCartData = this.flatteningCartData(this.cartData);
      }
    }
  },
  created() {
    console.log('商品数据加载完成');
    this.user_id=this.$store.getters.userId;
    this.getCartData();

    // 模拟从后端获取数据
    this.loading = true;
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