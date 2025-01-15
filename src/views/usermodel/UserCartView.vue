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
        <!-- 表头 -->
        <div class="cart-table-header">
          <el-checkbox
              v-model="selectAll"
              @change="handleSelectAll"
          >全选</el-checkbox>
          <span class="column-product">商品信息</span>
          <span class="column-price">单价</span>
          <span class="column-quantity">数量</span>
          <span class="column-total">小计</span>
          <span class="column-action">操作</span>
        </div>

        <div class="cart-items">
          <div
              v-for="(item, index) in flattenedCartData"
              :key="index"
              class="cart-item"
              :class="{ 'item-invalid': !item.available }"
          >
            <el-checkbox
                v-if="!item.isShop"
                :value="item.selected"
                :disabled="!item.available"
                @change="handleItemSelect(item)"
            ></el-checkbox>

            <div v-if="item.isShop" class="shop-container">
              <!-- 商铺复选框 -->
              <el-checkbox
                  :value="item.selected"
                  :disabled="!item.available"
                  @change="handleShopSelect(item)">
                店铺：{{ item.shop_name }}
              </el-checkbox>
              <el-button type="text" @click="toShop(item.shop_id)" icon="el-icon-d-arrow-right">查看店铺其他商品</el-button>
            </div>
            <div class="item-product" v-else>
              <img :src="'http://localhost:8081'+item.picture_url" alt="商品图片"/>
              <div class="product-info">
                <h3>{{ item.product_name }}</h3>
                <p class="specs">{{ item.flavor }}</p>
                <p class="status" v-if="!item.available">该商品已下架</p>
              </div>
            </div>

            <div class="item-price" >
              <div v-if="!item.isShop">
                <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
                <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <div class="item-quantity">
              <el-input-number
                  v-if="!item.isShop"
                  v-model="item.quantity"
                  :min="1"
                  :max="item.stock"
                  :disabled="!item.available"
                  @change="handleQuantityChange(item)"
              ></el-input-number>
            </div>

            <div class="item-total">
              <div v-if="!item.isShop">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>

            <div class="item-action">
              <el-button v-if="!item.isShop" type="danger" size="mini" :disabled="!item.available" @click="removeItem(item)">删除</el-button>
            </div>
          </div>
        </div>

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
        <div class="footer-left">
          <el-checkbox
              v-model="selectAll"
              @change="handleSelectAll"
          >全选</el-checkbox>
          <el-button type="text" @click="deleteSelectedItems">删除选中商品</el-button>
<!--          <el-button type="text" @click="checkCoupons">选择优惠券</el-button>-->
<!--          <el-button type="text" @click="MoveToFavorite">移入收藏夹</el-button>-->
        </div>
        <div class="footer-right">
          <div class="selected-info">
            已选择 <span>{{ selectedCount }}</span> 件商品
            <div class="total-price">
              合计：<span>¥{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
          <el-button
              type="primary"
              size="large"
              :disabled="totalAmount === 0"
              @click="checkout"
          >
            立即结算
          </el-button>
        </div>
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
          available:true,
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
    selectedCartItemIds() {
      return this.flattenedCartData
          .filter(item => item.selected && !item.isShop) // 确保只选择商品项且被选中
          .map(item => item.cart_item_id); // 映射出这些商品项的 ID
    },
  },
  methods: {
    toShop(shop_id){
      this.$router.push({
        name: 'shop-show',
        params: { id: shop_id }
      });
    },
    handleShopSelect(shopItem) {
      // 切换店铺的选中状态
      const newSelectedState = !shopItem.selected;
      // 更新店铺的选中状态
      this.$set(shopItem, 'selected', newSelectedState);
      // 更新店铺下所有商品的选中状态
      this.flattenedCartData
          .filter(item => item.shop_id === shopItem.shop_id)
          .forEach(item => {
            // 使用 this.$set() 来确保响应式更新
            this.$set(item, 'selected', newSelectedState);
          });
    },
    handleSelectAll() {
    },
    handleItemSelect(productItem) {
      // 更新商品的勾选状态
      const newSelectedState2 = !productItem.selected;
      // 更新商品的勾选状态
      this.$set(productItem, 'selected', newSelectedState2);
      // 获取当前商品所属的店铺 ID
      const shop_id = productItem.shop_id;
      // 检查该店铺下所有商品是否都被勾选
      const allChecked = this.flattenedCartData
          .filter(item => item.shop_id === shop_id && !item.isShop)
          .every(item => item.selected);
      // 更新该店铺的勾选状态
      this.flattenedCartData
          .filter(item => item.shop_id === shop_id && item.isShop)
          .forEach(shop => {
            // 使用 this.$set() 来确保响应式更新
            this.$set(shop, 'selected', allChecked);
          });
    },
    handleQuantityChange(item) {
      // 处理数量变化
      console.log('数量变化：', item)
      // 发送 PUT 请求到后端更新购物车商品数量
      axios.put('http://localhost:8081/cart/update', item)
          .then(response => {
            // 请求成功，处理返回的内容
            console.log(response.data); // 控制台输出返回的信息
            if (response.data === "购物车商品数量更新成功") {
              // 更新成功后的操作，例如提示用户
              // this.$message.success('商品数量更新成功');
            } else {
              // 更新失败的操作，例如提示用户
              this.$message.error('更新商品数量失败');
            }
          })
          .catch(error => {
            // 请求失败，处理错误
            console.error('更新商品数量请求失败', error);
            this.$message.error('更新失败：' + error.message);
          });
    },
    // 删除商品
    removeItem(item) {
      // 弹出确认对话框
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户确认删除，发送 DELETE 请求到后端删除购物车商品
        axios.delete('http://localhost:8081/cart/delete', { data: item })
            .then(response => {
              // 请求成功，处理返回的内容
              console.log(response.data);
              if (response.data === "商品已从购物车中删除") {
                // 删除成功后的操作，例如提示用户
                this.$message.success('商品已从购物车中删除');
                // 从前端界面移除商品
                this.flattenedCartData = this.flattenedCartData.filter(i => i.cart_item_id !== item.cart_item_id);
              } else {
                // 删除失败的操作，例如提示用户
                this.$message.error('删除商品失败');
              }
            })
            .catch(error => {
              // 请求失败，处理错误
              console.error('删除商品请求失败', error);
              this.$message.error('删除失败：' + error.message);
            });
      }).catch(() => {
        // 用户取消删除，可以在这里执行取消操作的逻辑
        this.$message.info('已取消删除');
      });
    },
    // 一次性删除多个商品
    deleteSelectedItems() {
      const cartItemIdsToDelete = this.selectedCartItemIds;
      if (cartItemIdsToDelete.length === 0) {
        this.$message.warning('请先选择要删除的商品');
        return;
      }
      // 弹出确认对话框
      this.$confirm('此操作将永久删除选中商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户确认删除，发送 DELETE 请求到后端
        const requestBody = {
          cart_item_ids: cartItemIdsToDelete
        };
        axios.delete('http://localhost:8081/cart/deleteMany', { data: requestBody })
            .then(response => {
              const message = response.data === "商品均已从购物车中删除" ? '商品均已从购物车中删除' : '删除商品失败';
              this.$message[message === '商品均已从购物车中删除' ? 'success' : 'error'](message);
              // 重新获取购物车数据以更新前端视图
              this.getCartData();
            })
            .catch(error => {
              console.error('删除商品请求失败', error);
              this.$message.error('删除失败：' + error.message);
            });
      }).catch(() => {
        // 用户取消删除，可以在这里执行取消操作的逻辑
        this.$message.info('已取消批量删除');
      });
    },
    clearInvalidItems(){
      // 通过 item.available 来获取所有失效的购物车项的 ID
      const invalidItemIds = this.flattenedCartData
          .filter(item => !item.available && !item.isShop) // 确保只选择商品项且是失效的
          .map(item => item.cart_item_id); // 映射出这些商品项的 ID

      if (invalidItemIds.length === 0) {
        this.$message.info('没有失效的商品需要删除');
        return;
      }
      // 弹出确认对话框
      this.$confirm('此操作将永久删除失效商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const requestBody = {
          cart_item_ids: invalidItemIds
        };
        // 用户确认删除，发送 POST 请求到后端删除失效的购物车商品
        axios.delete('http://localhost:8081/cart/deleteMany', { data: requestBody })
            .then(response => {
              // 请求成功，处理返回的内容
              console.log(response.data);
              if (response.data === "商品均已从购物车中删除") {
                // 删除成功后的操作，例如提示用户
                this.$message.success('失效商品已从购物车中删除');
                // 重新获取购物车数据以更新前端视图
                this.getCartData();
              } else {
                // 删除失败的操作，例如提示用户
                this.$message.error('删除失效商品失败');
              }
            })
            .catch(error => {
              // 请求失败，处理错误
              console.error('删除失效商品请求失败', error);
              this.$message.error('删除失败：' + error.message);
            });
      }).catch(() => {
        // 用户取消删除，可以在这里执行取消操作的逻辑
        this.$message.info('已取消删除失效商品');
      });
    },
    //   TODO:将选中的商品移入收藏夹
    MoveToFavorite(){
      // todo:this.user_id=this.$store.getters.userId;
      //const sResponse = await axios.post('http://localhost:8081/product/changeStar', {pid:this.product.product_id, uid:this.user_id});
    },
    // 结算
    checkout() {
      //TODO:选中商品，得到cart_item_id数组，去后端判断哪些优惠券可以使用，再跳转到选择优惠券页面
      // console.log("结算");
    },
    toggleShopAvailabilityBasedOnItems(shopId) {
      // 首先，找到与给定 shop_id 相关联的所有商品项
      const items = this.flattenedCartData.filter(item => item.shop_id === shopId && !item.isShop);

      // 检查这些商品项的 available 属性是否都为 false
      const areAllItemsUnavailable = items.every(item => !item.available);

      // 如果所有商品项都不可用，更新店铺的 available 状态
      if (areAllItemsUnavailable) {
        // 找到对应的店铺项并更新其 available 状态
        const shopItem = this.flattenedCartData.find(item => item.isShop && item.shop_id === shopId);
        if (shopItem) {
          this.$set(shopItem, 'available', false);
        }
      }
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
          // 遍历每个店铺，更新其 available 状态
          this.cartData.forEach(shop => {
            this.toggleShopAvailabilityBasedOnItems(shop.shop_id);
          });
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
    console.log('商品数据加载完成');
    // 模拟从后端获取数据
    this.loading = false;
  },
};
</script>

<style>
.shop-container {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: space-between; /* 两端对齐 */
}

.shop-container .el-checkbox {
  flex: 0 0 auto; /* 不允许复选框伸缩 */
}

.shop-container .el-button {
  flex: 0 0 auto; /* 不允许按钮伸缩 */
  margin-left: 10px; /* 给按钮和复选框之间添加一些间距 */
}
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

.cart-table-header {
  display: grid;
  grid-template-columns: 1fr 4fr 1fr 2fr 1fr 2fr;
  align-items: center;
  padding: 15px 0;
  background-color: #f8f8f8;
  margin: 20px 0;
  border-radius: 4px;

  span {
    text-align: center;
    color: #666;
  }
}

.cart-item {
  display: grid; /* 使用 grid 布局 */
  grid-template-columns: 1fr 4fr 1fr 2fr 1fr 2fr; /* 设置网格布局的列宽，分别占 1fr, 4fr, 1fr, 2fr, 1fr, 2fr */
  align-items: center; /* 使子元素垂直居中对齐 */
  padding: 20px 0; /* 设置上下内边距 */
  border-bottom: 1px solid #eee; /* 为每个购物车项添加底部边框，颜色为浅灰色 */

  &.item-invalid {
    opacity: 0.5; /* 为无效商品项设置透明度为 0.5 */
  }

  /* 商品信息区域 */
  .item-product {
    display: flex; /* 使用 flex 布局来排列图片和商品信息 */
    gap: 15px; /* 图片和商品信息之间有 15px 的间距 */
    flex-direction: row; /* 将商品图片和信息在水平方向上排列，默认情况下是纵向排列 */

    img {
      width: 80px; /* 图片的宽度为 80px */
      height: 80px; /* 图片的高度为 80px */
      object-fit: cover; /* 保证图片完全覆盖容器并保持比例，可能会裁剪图片 */
      border-radius: 4px; /* 为图片添加 4px 的圆角 */
    }

    .product-info {
      flex: 1; /* 使商品信息区域占据剩余的可用空间 */
      display: flex; /* 使用 flex 布局排列商品信息 */
      flex-direction: column; /* 商品信息内容垂直排列 */
      gap: 8px; /* 每个子元素之间有 8px 的间距 */

      h3 {
        font-size: 14px; /* 商品标题字体大小为 14px */
        margin: 0; /* 消除标题的外边距 */
      }

      .specs {
        color: #999; /* 规格文本颜色为浅灰色 */
        font-size: 12px; /* 规格文本字体大小为 12px */
      }

      .status {
        color: #ff4d4f; /* 商品状态文本颜色为红色 */
        font-size: 12px; /* 商品状态字体大小为 12px */
      }
    }
  }

  /* 价格区域 */
  .item-price {
    text-align: center; /* 让价格居中显示 */

    .current-price {
      color: #ff6700; /* 当前价格的颜色为橙色 */
      font-size: 16px; /* 当前价格的字体大小为 16px */
    }

    .original-price {
      color: #999; /* 原价的颜色为灰色 */
      font-size: 12px; /* 原价的字体大小为 12px */
      text-decoration: line-through; /* 原价添加删除线效果 */
      margin-left: 5px; /* 原价左侧有 5px 的外边距 */
    }
  }

  /* 数量区域 */
  .item-quantity {
    text-align: center; /* 使数量居中显示 */

    .stock {
      color: #ff4d4f; /* 库存数量文本颜色为红色 */
      font-size: 12px; /* 库存数量的字体大小为 12px */
      margin-top: 5px; /* 库存数量的上边距为 5px */
    }
  }

  /* 总价区域 */
  .item-total {
    text-align: center; /* 使总价居中显示 */
    color: #ff6700; /* 总价的颜色为橙色 */
    font-size: 16px; /* 总价的字体大小为 16px */
    font-weight: bold; /* 总价的字体加粗 */
  }

  /* 操作区域 */
  .item-action {
    text-align: center; /* 使操作区域内容居中 */
    display: flex; /* 使用 flex 布局排列操作按钮 */
    flex-direction: row; /* 操作按钮水平排列 */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    gap: 8px; /* 每个操作按钮之间有 8px 的间距 */
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
  display: flex;  /* 使用 flexbox 布局，子元素将在横向上排列 */
  justify-content: space-between;  /* 子元素之间的空间分布为两端对齐（左对齐，右对齐） */
  align-items: center;  /* 子元素在交叉轴上（垂直方向）对齐居中 */
  padding-top: 20px;  /* 设置顶部的内边距 */
  margin-top: 20px;  /* 设置底部区域与上方元素之间的间距 */
  border-top: 1px solid #eee;  /* 在底部区域上方绘制一条1像素的浅灰色边框 */
}

.footer-left {
  display: flex;  /* 使左侧区域使用 flexbox 布局 */
  align-items: center;  /* 子元素在左侧区域之间对齐居中 */
  gap: 20px;  /* 子元素之间有间距（20px） */
}

.footer-right {
  display: flex;  /* 使右侧区域使用 flexbox 布局 */
  align-items: center;  /* 子元素在右侧区域之间对齐居中 */
  gap: 20px;  /* 子元素之间有间距（20px） */

  .selected-info {
    text-align: right;  /* 使选中的信息右对齐 */

    span {
      color: #ff6700;  /* 设置文字颜色为橙色 */
      font-weight: bold;  /* 设置文字加粗 */
    }

    .total-price {
      margin-top: 5px;  /* 设置与上方内容之间的垂直间距 */
      font-size: 16px;  /* 设置总价的字体大小 */

      span {
        color: #ff6700;  /* 设置总价数字的颜色为橙色 */
        font-size: 24px;  /* 设置总价数字的字体大小 */
      }
    }
  }

  .el-button {
    padding: 15px 40px;  /* 按钮的样式，增加内边距 */
  }
}

.cart-summary {
  font-weight: bold;
}
</style>