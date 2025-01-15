<template>
  <div class="user-coupons-container">
    <div class="user-coupons-page">
      <div class="coupons-container">
        <h2>我的优惠券</h2>

        <!-- 优惠券状态标签 -->
        <div class="coupon-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="全部" name="all"></el-tab-pane>
            <el-tab-pane label="未使用" name="Unused"></el-tab-pane>
            <el-tab-pane label="已使用" name="Used"></el-tab-pane>
            <el-tab-pane label="已过期" name="Expired"></el-tab-pane>
          </el-tabs>
        </div>

        <!-- 优惠券列表 -->
        <div v-if="showUserCoupons.length > 0">
          <!-- 判断 showUserCoupons 是否有数据，若有则渲染表格 -->
          <el-table :data="paginatedCoupons" border stripe style="width: 100%; table-layout: auto;margin: 0 auto;">
            <!-- 序号列 -->
            <el-table-column
                label="序号"
                type="index"
                span="3"
                :index="(index) => index + 1"
            ></el-table-column>
            <!-- 券类型列 -->
            <!-- :formatter="couponTypeFormatter" 使用自定义的 formatter 来判断券类型 -->
            <el-table-column
                label="券类型【来源】"
                span="4"
                :formatter="(row) => couponTypeFormatter(row)"
            >
            </el-table-column>

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
            >
              <!-- 使用 slot-scope 渲染每一行的开始和结束时间 -->
              <template slot-scope="scope">
                {{ scope.row.start_time }} - {{ scope.row.end_time }} <!-- 显示有效期 -->
              </template>
            </el-table-column>
            <el-table-column
                label="状态"
                prop="status"
                span="4"
                :formatter="statusFormatter"
            >
            </el-table-column>
            <!-- 操作列，展示查看范围按钮 -->
            <el-table-column
                label="操作"
                span="4"
            >
              <template slot-scope="scope">
                <!-- 按钮点击事件调用 viewCouponRange 方法 -->
                <el-button @click="viewCouponRange(scope.row,scope.$index)" type="text" size="small">查看范围</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="margin-bottom: 20px; margin-top: 10px;" v-if="showUserCoupons.length > 0">
          <el-pagination
              :current-page="currentPage"
              :page-sizes="[1, 5, 10, 15, 20, 50]"
              :page-size="pageSize"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
              background
              layout="total, sizes,->, prev, pager, next, jumper"
              :total="this.showUserCoupons.length"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="el-icon-s-ticket"></i>
          <p>您的账户没有此类优惠券</p>
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
      currentPage:1,
      pageSize:10,
      activeTab: 'all',//默认为all
      userId : null,
      userCoupons: [],
      flattenedUserCoupons:[],
      showUserCoupons:[],
      loading :false,
      platformCouponDialogVisible: false, // 平台券弹窗是否显示
      shopCouponDialogVisible: false, // 店铺券弹窗是否显示
      platformScopeData:[],//存储返回来的平台券范围
      shopScopeData:[],
      selectIndex:0,
    }
  },
  computed:{
    // 将用户优惠券数据扁平化
    flattening() {
      const data = [];
      // 处理平台优惠券
      this.userCoupons.platformCoupons.forEach(coupon => {
        data.push({
          isPlatformCoupon: true, // 标记为平台优惠券
          user_coupon_id: coupon.user_coupon_detail.user_coupon_id,
          user_id: coupon.user_coupon_detail.user_id,
          coupon_id: coupon.coupon_detail.coupon_id,
          status: coupon.user_coupon_detail.status, // 使用状态
          claim_time: coupon.user_coupon_detail.claim_time,
          coupon_type: coupon.coupon_detail.coupon_type,//券的类型，平台或者店铺
          start_time: coupon.coupon_detail.start_time,//有效期
          end_time: coupon.coupon_detail.end_time,
          scope: coupon.coupon_detail.scope,//范围数组，平台券指的是店铺范围，店铺券指的是商品范围
          request: coupon.coupon_detail.request,//券的额度
          off: coupon.coupon_detail.off,
          coupon_status: coupon.coupon_detail.coupon_status,//券的状态
          total: coupon.coupon_detail.total,
          claim_limit: coupon.coupon_detail.claim_limit,
          max_unused_count: coupon.coupon_detail.max_unused_count,
          create_time: coupon.coupon_detail.create_time,
          shop_id: coupon.coupon_detail.shop_id || null, // 平台优惠券可能没有店铺ID
        });
      });

      // 处理店铺优惠券
      this.userCoupons.shopCoupons.forEach(shop => {
        shop.user_coupons.forEach(coupon => {
          data.push({
            isPlatformCoupon: false, // 标记为店铺优惠券
            shop_id: shop.shop_id, // 所属店铺
            shop_name: shop.shop_name, // 店铺名称
            user_coupon_id: coupon.user_coupon_detail.user_coupon_id,
            user_id: coupon.user_coupon_detail.user_id,
            coupon_id: coupon.coupon_detail.coupon_id,
            status: coupon.user_coupon_detail.status, // 使用状态
            claim_time: coupon.user_coupon_detail.claim_time,
            coupon_type: coupon.coupon_detail.coupon_type,
            start_time: coupon.coupon_detail.start_time,
            end_time: coupon.coupon_detail.end_time,
            scope: coupon.coupon_detail.scope,
            request: coupon.coupon_detail.request,
            off: coupon.coupon_detail.off,
            coupon_status: coupon.coupon_detail.coupon_status,
            total: coupon.coupon_detail.total,
            claim_limit: coupon.coupon_detail.claim_limit,
            max_unused_count: coupon.coupon_detail.max_unused_count,
            create_time: coupon.coupon_detail.create_time,
          });
        });
      });
      return data;
    },
    paginatedCoupons() {
      // 计算当前页的起始索引和结束索引
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      // 截取当前页的数据
      return this.showUserCoupons.slice(start, end);
    },
  },
  methods:{
    // 页码变化处理
    handlePageChange(page) {
      this.currentPage = page;
    },
    // 每页条数变化处理
    handlePageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1; // 页码重置为 1
    },
    async getUserCoupons() {
      this.loading = true;
      this.user_id = this.$store.getters.userId; // 获取用户ID
      console.log("当前用户id为：" + this.user_id);

      try {
        const userCouponResponse = await axios.get('http://localhost:8081/userCoupon/list', {
          params: { user_id: this.user_id }
        });
        if (userCouponResponse.data != null) {
          // console.log("get回复："+cartResponse.data);
          this.userCoupons = userCouponResponse.data;
          // 触发数据扁平化
          this.flattenedUserCoupons = this.flattening;  // 直接调用计算属性
          console.log('flattenedUserCoupons:', this.flattenedUserCoupons); // 打印 flattenedUserCoupons 的值
          this.showUserCoupons = this.flattenedUserCoupons;
          console.log("showUserCoupons:",this.showUserCoupons);
        }
      } catch (error) {
        console.error("获取用户优惠券数据失败", error);
      }finally {
        this.loading = false;
      }
    },
    handleTabClick(tab) {
      const status = tab.name;
      if(status==='all'){
        this.showUserCoupons = this.flattenedUserCoupons;
      }else{
        this.showUserCoupons = this.flattenedUserCoupons
            .filter(item => item.status===status);
      }
      //设置分页
      this.currentPage = 1; // 页码重置为 1
    },
    numberFormatter(row, column, value) {
      return `${value.toFixed(2)}`;
    },
    // 金额格式化函数，将数字格式化为人民币形式
    currencyFormatter(row, column, value) {
      // 保留两位小数并添加人民币符号
      return `￥${value.toFixed(2)}`;
    },
    // 优惠券类型的格式化函数，判断是平台券还是店铺券
    couponTypeFormatter(row) {
      console.log("couponTypeFormatter",row);
      // 根据 'isPlatformCoupon' 值判断并返回相应的券类型
      return row.isPlatformCoupon ? "平台券" : `${row.shop_name}店铺券`;
    },
    // 券的状态
    statusFormatter(row,column,value){
      if(value==='Unused'){
        return "未使用";
      }else if(value==='Used'){
        return "已使用";
      }else if(value==='Expired'){
        return "已过期";
      }else {
        return "未知状态";
      }
    },
    parseJson(str) {
      return JSON.parse(str);
    },
    // 查看券的可用范围
    async viewCouponRange(row,index) {
      this.selectIndex = index+1;
      const couponId = row.coupon_id; // 获取当前行的 coupon_id
      try {
        const response = await axios.get(`http://localhost:8081/userCoupon/scope/details?coupon_id=${couponId}`);
        const scopeDetails = response.data;

        if (row.isPlatformCoupon) {
          this.platformScopeData = scopeDetails.platform || [];
          this.shopScopeData = []; // 清空店铺券数据
          console.log("platform:",this.shopScopeData);
          console.log("platform:",this.platformScopeData);
          this.platformCouponDialogVisible = true; // 显示平台券弹窗
        } else {
          this.shopScopeData = scopeDetails.shop || [];
          this.platformScopeData = []; // 清空平台券数据
          console.log("shop:",this.shopScopeData);
          console.log("shop:",this.platformScopeData);
          this.shopCouponDialogVisible = true; // 显示店铺券弹窗
        }
      } catch (error) {
        console.error("获取范围数据失败:", error);
      }
    },
    // 清空平台券数据
    clearPlatformScopeData() {
      this.platformScopeData = [];
    },
    // 清空店铺券数据
    clearShopScopeData() {
      this.shopScopeData = [];
    }
  },
  created() {
    console.log('用户优惠券数据加载开始');
    this.getUserCoupons();
    console.log('用户优惠券数据加载完成');
    // 模拟从后端获取数据
    this.loading = false;
  },
}
</script>

<style lang="scss" scoped>
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