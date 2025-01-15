<template>
  <div class="user-coupons-container">
    <div class="user-coupons-page">
      <div class="coupons-container">
        <h2>参与平台优惠活动</h2>
        <h3 style="color: red">注意事项：参与活动即默认您的店铺全部商品均参与满减优惠券活动！</h3>

        <!-- 优惠券列表 -->
        <div v-if="showCoupons.length > 0">
          <h3 >下面是您目前可以加入参与的平台优惠活动</h3>
          <!-- 判断 showUserCoupons 是否有数据，若有则渲染表格 -->
          <el-table :data="paginatedCoupons" border stripe style="width: 100%; table-layout: auto;margin: 0 auto;">
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
<!--                  <el-button @click="viewCouponRange(scope.row,scope.$index)" type="info" size="small" >查看范围</el-button>-->
                  <el-button @click="joinPlatformCoupon(scope.row,scope.$index)" type="success" size="small" >加入平台券活动</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div style="margin-bottom: 20px; margin-top: 10px;" v-if="showCoupons.length > 0">
          <el-pagination
              :current-page="currentPage"
              :page-sizes="[1, 5, 10, 15, 20, 50]"
              :page-size="pageSize"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
              background
              layout="total, sizes,->, prev, pager, next, jumper"
              :total="showCoupons.length"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="el-icon-s-ticket"></i>
          <p>没有平台优惠券可以加入</p>
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

        <el-dialog
            :visible.sync="confirmDialogVisible"
            title="确认加入平台券活动"
            width="30%"
            @close="handleDialogClose"
        >
          <span>您确定要加入序号为{{selectIndex}}的平台券活动吗？</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="confirmDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="joinPlatformCouponConfirm">确 定</el-button>
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
      // activeTab: 'all',//默认为all
      userId : null,
      platformCoupons:[],
      showCoupons:[],//展示的优惠券
      selectIndex:0,
      selectRow:[],
      shop_id:null,
      loading :false,
      showAddCouponDialog: false,
      platformCouponDialogVisible: false, // 平台券弹窗是否显示
      shopCouponDialogVisible: false, // 店铺券弹窗是否显示
      platformScopeData:[],//存储返回来的平台券范围
      shopScopeData:[],
      confirmDialogVisible: false, // 确认弹窗是否显示
    }
  },
  computed:{
    paginatedCoupons() {
      // 计算当前页的起始索引和结束索引
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      // 截取当前页的数据
      return this.showCoupons.slice(start, end);
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
    // 获取优惠券数据
    async getAllActivePlatformCoupons(){
      this.loading = true;
      this.user_id=this.$store.getters.userId;
      console.log("当前用户id为：" + this.user_id);
      const shopResponse = await axios.post('http://localhost:8081/shop/getByUser_id', { id: this.user_id });
      if (shopResponse.data != null) {
        this.shop_id = shopResponse.data.shop_id;
        console.log("当前店铺id为：" + this.shop_id);
      }
      try{
        const platformCouponsResponse = await axios.get(`http://localhost:8081/coupon/getAddPlatformCoupons?userId=${this.user_id}`);
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
    // 加入
    joinPlatformCoupon(row, index) {
      this.selectRow = row;
      this.selectIndex = index + 1;
      this.confirmDialogVisible = true; // 显示确认弹窗
    },
    joinPlatformCouponConfirm() {
      const shopId = this.shop_id;
      const couponId = this.selectRow.coupon_id;
      console.log(shopId);
      console.log(couponId);
      axios.post('http://localhost:8081/coupon/addShopToCoupon', null, {
        params: {
          shop_id: shopId,
          coupon_id: couponId
        }
      })
          .then(response => {
            if (response.status === 200) {
              this.$message.success('商家已经加入该平台券中');
              this.confirmDialogVisible = false; // 关闭确认弹窗
              this.getAllActivePlatformCoupons(); // 重新获取平台优惠券数据
            } else {
              this.$message.error(response.data);
            }
          })
          .catch(error => {
            this.$message.error('加入平台券活动失败: ' + error.response.data);
          });
    },
    handleDialogClose() {
      this.confirmDialogVisible = false;
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