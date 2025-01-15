<template>
  <div class="user-coupons-container">
    <div class="user-coupons-page">
      <div class="coupons-container">
        <h2>领取平台优惠券</h2>

        <!-- 优惠券列表 -->
        <div v-if="showCoupons.length > 0">
          <!-- 判断 showUserCoupons 是否有数据，若有则渲染表格 -->
          <el-table :data="showCoupons" border stripe style="width: 100%; table-layout: auto;margin: 0 auto;">
            <!-- 序号列 -->
            <el-table-column
                label="序号"
                type="index"
                span="2"
                :index="(index) => index + 1"
            ></el-table-column>

            <!-- 门槛金额列 -->
            <!-- prop="request"  显示 'request' 属性值 -->
            <!-- :formatter="currencyFormatter"  使用 currencyFormatter 格式化为货币 -->
            <el-table-column
                label="门槛金额"
                prop="request"
                span="3"
                :formatter="currencyFormatter"
            >
            </el-table-column>

            <!-- 折扣金额列 -->
            <!-- prop="off"  显示 'off' 属性值 -->
            <!-- :formatter="currencyFormatter"  使用 currencyFormatter 格式化为货币 -->
            <el-table-column
                label="折扣金额"
                prop="off"
                span="3"
                :formatter="currencyFormatter"
            >
            </el-table-column>

            <!-- 有效期列 -->
            <el-table-column
                label="有效期"
                span="6"
                min-width="200"
            >
              <!-- 使用 slot-scope 渲染每一行的开始和结束时间 -->
              <template slot-scope="scope">
                {{ scope.row.start_time }} - {{ scope.row.end_time }} <!-- 显示有效期 -->
              </template>
            </el-table-column>

            <!-- 操作列，展示查看范围按钮 -->
            <el-table-column
                label="操作"
                span="4"
                min-width="150"
            >
              <template slot-scope="scope">
                <el-button-group>
                  <!-- 按钮点击事件调用 viewCouponRange 方法 -->
                  <el-button @click="viewCouponRange(scope.row,scope.$index)" type="info" size="small" >查看范围</el-button>
                  <el-button @click="claimCoupon(scope.row,scope.$index)" type="success" size="small" >领券</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="el-icon-s-ticket"></i>
          <p>没有平台优惠券可以领取</p>
        </div>

        <!-- 弹窗1：平台券范围展示 -->
        <el-dialog
            :visible.sync="platformCouponDialogVisible"
            title="平台券范围展示"
            width="60%"
            @close="clearPlatformScopeData"
        >
          <div v-if="platformScopeData.length > 0">
            <h3>序号为{{this.selectIndex}}的优惠券的可用店铺信息如下</h3>
            <el-table :data="platformScopeData" style="width: 100%" border stripe>
              <el-table-column label="店铺名" prop="shop_name"></el-table-column>
              <el-table-column label="描述" prop="shop_description"></el-table-column>
              <el-table-column label="位置" prop="location"></el-table-column>
              <el-table-column label="店铺评分" prop="level"></el-table-column>
              <el-table-column label="状态" prop="status"></el-table-column>
            </el-table>
          </div>
          <div v-else>
            <p>没有可用范围。</p>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="platformCouponDialogVisible = false">关闭</el-button>
          </span>
        </el-dialog>

        <!-- 弹窗2：店铺券范围展示 -->
                <el-dialog
                    :visible.sync="shopCouponDialogVisible"
                    title="店铺券范围展示"
                    width="60%"
                    @close="clearShopScopeData"
                >
                  <div v-if="shopScopeData.length > 0">
                    <h3>序号为{{this.selectIndex}}的优惠券的可用商品信息如下</h3>
                    <el-table :data="shopScopeData" style="width: 100%" border stripe>
                      <el-table-column label="产品名" prop="name"></el-table-column>
                      <el-table-column label="分类" prop="category"></el-table-column>
                      <el-table-column label="价格" prop="price"></el-table-column>
                      <el-table-column label="描述" prop="price"></el-table-column>
                      <el-table-column label="库存">
                        <template slot-scope="scope">
                          <div>
                            <div v-if="scope.row.quantity && scope.row.quantity.length>0">
                              <div v-for="(item, index) in parseJson(scope.row.quantity)" :key="index">
                                <span>{{ item.flavor }}: {{ item.quantity }} {{ scope.row.unit }}</span>
                              </div>
                            </div>
                            <div v-else>无库存</div>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="状态" prop="status"></el-table-column>
                      <!-- 根据需要展示更多内容 -->
                    </el-table>
                  </div>
                  <div v-else>
                    <p>没有可用范围。</p>
                  </div>
                  <span slot="footer" class="dialog-footer">
                    <el-button @click="shopCouponDialogVisible = false">关闭</el-button>
                  </span>
                </el-dialog>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: 'UserCouponView',
  data() {
    return {
      // activeTab: 'all',//默认为all
      userId : null,
      platformCoupons:[],
      showCoupons:[],//展示的优惠券
      selectIndex:0,
      selectRow:[],
      showAddCouponDialog: false,
      loading :false,
      platformCouponDialogVisible: false, // 平台券弹窗是否显示
      shopCouponDialogVisible: false, // 店铺券弹窗是否显示
      platformScopeData:[],//存储返回来的平台券范围
      shopScopeData:[],
    }
  },
  computed:{

  },
  methods:{

    // 获取优惠券数据
    async getAllActivePlatformCoupons(){
      this.loading = true;
      this.user_id=this.$store.getters.userId;
      console.log("当前用户id为：" + this.user_id);
      try{
        const platformCouponsResponse = await axios.get('http://localhost:8081/coupon/platform/active');
        if(platformCouponsResponse.data!=null){
          this.platformCoupons = platformCouponsResponse.data;
          console.log("platform:",this.platformCoupons);
          //不需要扁平化
          this.showCoupons = this.platformCoupons;
        }
      }catch (error) {
        console.error("获取平台优惠券数据失败", error);
      }finally {
        this.loading = false;
      }
    },
    numberFormatter(row, column, value) {
      return `${value.toFixed(2)}`;
    },
    // 金额格式化函数，将数字格式化为人民币形式
    currencyFormatter(row, column, value) {
      // 保留两位小数并添加人民币符号
      return `￥${value.toFixed(2)}`;
    },
    // 查看券的可用范围
    async viewCouponRange(row,index) {
      this.selectIndex = index+1;
      const couponId = row.coupon_id; // 获取当前行的 coupon_id
      try {
        const response = await axios.get(`http://localhost:8081/userCoupon/scope/details?coupon_id=${couponId}`);
        const scopeDetails = response.data;
        // 这里只有平台券
        this.platformScopeData = scopeDetails.platform || [];
        console.log("platform:",this.platformScopeData);
        this.platformCouponDialogVisible = true; // 显示平台券弹窗

        // 这里只有店铺券
        // this.shopScopeData = scopeDetails.shop || [];
        // console.log("shop:",this.shopScopeData);
        // this.shopCouponDialogVisible = true; // 显示店铺券弹窗
      } catch (error) {
        console.error("获取范围数据失败:", error);
      }
    },
    claimCoupon(row,index){
      const couponId = row.coupon_id; // 获取当前行的 coupon_id
      this.selectIndex = index + 1;
      const userId = this.$store.getters.userId; // 获取当前用户ID

      axios.post('http://localhost:8081/userCoupon/claim', {
        user_id: userId,
        coupon_id: couponId
      }).then(response => {
        if (response.status === 200) {
          this.$message.success('优惠券领取成功');
          // 可以在这里更新优惠券状态或重新加载优惠券列表
        } else {
          this.$message.error(response.data);
        }
      }).catch(error => {
        this.$message.error('优惠券领取失败: ' + error.response.data);
      });
    },
    // 清空平台券数据
    clearPlatformScopeData() {
      this.platformScopeData = [];
    },
    // 清空店铺券数据
    clearShopScopeData() {
      this.shopScopeData = [];
    },
    parseJson(str) {
      return JSON.parse(str);
    },
  },
  created() {
    console.log('平台优惠券数据加载开始');
    this.getAllActivePlatformCoupons();
    console.log('平台优惠券数据加载完成');
    // 模拟从后端获取数据
    this.loading = false;
  },
}
</script>

<style lang="scss" scoped>

.el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 添加按钮之间的间距 */
}

.el-button-group > .el-button {
  margin: 0; /* 移除按钮的外边距 */
}
/* 将按钮容器右对齐 */
.button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px; /* 和内容保持适当间距 */
}

.user-coupons-container {
  width: 100%;
}

.user-coupons-page {
  background-color: #f5f5f5;
  padding: 20px 0;
  min-height: calc(100vh - 120px);
}

.coupons-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: normal;
  }
}

.coupon-list {
  .coupon-item {
    background: white;
    bcoupon-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;

    .coupon-header {
      padding: 15px 20px;
      bcoupon-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .coupon-info {
        .coupon-id {
          margin-right: 20px;
          color: #666;
        }

        .coupon-date {
          color: #999;
        }
      }

      .coupon-status {
        color: #ff6700;
        font-weight: bold;
      }
    }

    .coupon-products {
      padding: 20px;

      .product-item {
        display: flex;
        gap: 15px;
        padding: 10px 0;

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          bcoupon-radius: 4px;
        }

        .product-info {
          flex: 1;

          h4 {
            margin: 0 0 5px;
            font-size: 14px;
          }

          .product-spec {
            color: #999;
            font-size: 12px;
            margin-bottom: 5px;
          }

          .product-price {
            .price {
              color: #ff6700;
              font-weight: bold;
              margin-right: 10px;
            }

            .quantity {
              color: #999;
            }
          }
        }
      }
    }

    .coupon-footer {
      padding: 15px 20px;
      bcoupon-top: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .coupon-total {
        color: #666;

        .total-price {
          color: #ff6700;
          font-weight: bold;
          font-size: 18px;
        }
      }

      .coupon-actions {
        display: flex;
        gap: 10px;
      }
    }

    &.highlight {
      animation: highlight 3s;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;

  i {
    font-size: 60px;
    margin-bottom: 20px;
  }
}

@keyframes highlight {
  0% {
    background-color: #fff1f0;
  }
  100% {
    background-color: white;
  }
}

.pay-method-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;

  .pay-method-btn {
    height: 50px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    i {
      font-size: 20px;
    }
  }
}

.pay-dialog-content {
  text-align: center;
  padding: 20px 0;

  .pay-type-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }

  .qr-code {
    width: 200px;
    height: 200px;
    margin: 0 auto 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .pay-amount {
    font-size: 18px;
    margin-bottom: 15px;

    .price {
      color: #ff6700;
      font-weight: bold;
    }
  }

  .pay-tips {
    color: #666;

    p {
      margin: 5px 0;

      &.small {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style>