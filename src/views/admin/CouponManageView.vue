<template>
  <div class="user-coupons-container">
    <div class="user-coupons-page">
      <div class="coupons-container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>平台发布的优惠券</h2>
          <el-button
              type="primary"
              icon="el-icon-plus"
              @click="showAddCouponDialog=true"
              style="margin-left: auto;"
          >
            发布新的优惠券
          </el-button>
          <el-dialog :visible.sync="showAddCouponDialog" title="添加优惠券" width="50%">
            <add-coupon @close="addComplete()" />
          </el-dialog>
        </div>

        <!-- 优惠券状态标签 -->
        <div class="coupon-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="全部" name="all"></el-tab-pane>
            <el-tab-pane label="待生效" name="Pending"></el-tab-pane>
            <el-tab-pane label="可领取" name="Active"></el-tab-pane>
            <el-tab-pane label="暂停领取" name="Paused"></el-tab-pane>
            <el-tab-pane label="已失效" name="Expired"></el-tab-pane>
          </el-tabs>
        </div>

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

            <el-table-column
                label="券的库存数量"
                prop="total"
                span="3"
            >
            </el-table-column>
            <el-table-column
                label="领取上限"
                prop="claim_limit"
                span="3"
            >
            </el-table-column>
            <el-table-column
                label="存放上限"
                prop="max_unused_count"
                span="3"
            >
            </el-table-column>

            <el-table-column
                label="状态"
                prop="coupon_status"
                span="3"
                :formatter="statusFormatter"
            >
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
                  <el-button @click="confirmDeleteCoupon(scope.row, scope.$index)" type="danger" size="small" >删除</el-button>
                  <div v-if="scope.row.coupon_status === 'Pending'">
                    <el-button @click="editCoupon(scope.row, scope.$index)" type="primary" size="small" >更新</el-button>
                  </div>
                  <div v-else-if="scope.row.coupon_status === 'Active'">
                    <el-button @click="editCoupon2(scope.row, scope.$index)" type="primary" size="small" >更新</el-button>
                    <el-button @click="pauseCoupon(scope.row, scope.$index)" type="warning" size="small" >暂停领取</el-button>
                  </div>
                  <div v-else-if="scope.row.coupon_status === 'Paused'">
                    <el-button @click="resumeCoupon(scope.row, scope.$index)" type="warning" size="small" >恢复领取</el-button>
                  </div>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="el-icon-s-ticket"></i>
          <p>没有优惠券需要管理</p>
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

        <!-- 确认删除对话框 -->
        <el-dialog :visible.sync="confirmDeleteDialogVisible" title="确认删除" width="30%">
          <p>确定要删除序号为 {{ selectIndex + 1 }} 的优惠券吗？</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="confirmDeleteDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="deleteCouponConfirm">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 编辑未生效优惠券对话框 -->
        <el-dialog :visible.sync="editPendingCouponDialogVisible" title="编辑未生效优惠券" width="50%">
          <p>修改序号为 {{ selectIndex + 1 }} 的优惠券</p>
          <el-form ref="editPendingCouponForm" :model="editCouponForm" label-width="120px">
            <el-form-item label="开始时间">
              <el-date-picker
                  v-model="editCouponForm.start_time"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                  v-model="editCouponForm.end_time"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="最低消费">
              <el-input-number v-model="editCouponForm.request" :min="0" :step="0.01" :precision="2"></el-input-number>
            </el-form-item>
            <el-form-item label="满减金额">
              <el-input-number v-model="editCouponForm.off" :min="0" :step="0.01" :precision="2"></el-input-number>
            </el-form-item>
            <el-form-item label="总数量">
              <el-input-number v-model="editCouponForm.total" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="限制领取数量">
              <el-input-number v-model="editCouponForm.claim_limit" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="单用户未使用数量">
              <el-input-number v-model="editCouponForm.max_unused_count" :min="0"></el-input-number>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editPendingCouponDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitEditPendingCoupon">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 编辑已生效优惠券对话框 -->
        <el-dialog :visible.sync="editActiveCouponDialogVisible" title="编辑已生效优惠券" width="50%">
          <p>修改序号为 {{ selectIndex + 1 }} 的优惠券</p>
          <el-form ref="editActiveCouponForm" :model="editCouponForm" label-width="120px">
            <el-form-item label="总数量">
              <el-input-number v-model="editCouponForm.total" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="限制领取数量">
              <el-input-number v-model="editCouponForm.claim_limit" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="单用户未使用数量">
              <el-input-number v-model="editCouponForm.max_unused_count" :min="0"></el-input-number>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editActiveCouponDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitEditActiveCoupon">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 暂停优惠券确认对话框 -->
        <el-dialog :visible.sync="pauseCouponDialogVisible" title="暂停优惠券" width="30%">
          <p>确定要暂停序号为 {{ selectIndex + 1 }} 的优惠券吗？</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="pauseCouponDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitPauseCoupon">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 恢复优惠券确认对话框 -->
        <el-dialog :visible.sync="resumeCouponDialogVisible" title="恢复优惠券" width="30%">
          <p>确定要恢复序号为 {{ selectIndex + 1 }} 的优惠券吗？</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="resumeCouponDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitResumeCoupon">确 定</el-button>
          </span>
        </el-dialog>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AddCoupon from './AddCoupon.vue';
import moment from "moment/moment";
export default {
  name: 'UserCouponView',
  components: {
    AddCoupon
  },
  data() {
    return {
      activeTab: 'all',//默认为all
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
      confirmDeleteDialogVisible:false,
      editPendingCouponDialogVisible: false,
      editActiveCouponDialogVisible: false,
      editCouponForm: {
        coupon_id: null,
        start_time: '',
        end_time: '',
        scope: '',
        request: 0,
        off: 0,
        total: 0,
        claim_limit: 0,
        max_unused_count: 0
      },
      pauseCouponDialogVisible: false,
      resumeCouponDialogVisible: false,
    }
  },
  computed:{

  },
  methods:{
    // 重新加载优惠券列表
    async refreshCoupons() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:8081/coupon/platform');
        if (response.data != null) {
          this.platformCoupons = response.data;
          if(this.activeTab==='all'){
            this.showCoupons = this.platformCoupons; // 更新显示的优惠券列表
          }else {
            this.showCoupons = this.platformCoupons
                .filter(item => item.coupon_status===this.activeTab);
          }
        }
      } catch (error) {
        console.error("重新加载优惠券数据失败", error);
        this.$message.error('重新加载优惠券数据失败: ' + error.response.data);
      } finally {
        this.loading = false;
      }
    },
    addComplete() {
      this.showAddCouponDialog = false;
      this.refreshCoupons(); // 重新加载优惠券列表
    },
    confirmDeleteCoupon(row, index) {
      this.selectRow = row;
      this.selectIndex = index;
      this.confirmDeleteDialogVisible = true;
    },
    async deleteCouponConfirm() {
      const couponId = this.selectRow.coupon_id;
      try {
        const response = await axios.delete(`http://localhost:8081/coupon/delete/${couponId}`);
        if (response.status === 200) {
          this.$message.success('优惠券删除成功');
          await this.refreshCoupons(); // 重新加载优惠券列表
          this.showCoupons = this.activeTab === 'all' ? this.platformCoupons : this.platformCoupons.filter(item => item.coupon_status === this.activeTab);
        } else {
          this.$message.error('优惠券删除失败');
        }
      } catch (error) {
        this.$message.error(error.response.data);
      } finally {
        this.confirmDeleteDialogVisible = false;
      }
    },
    editCoupon(row,index){
      this.selectRow = row;
      this.selectIndex = index;
      this.editCouponForm = { ...row }; // 深拷贝行数据到表单
      this.editPendingCouponDialogVisible = true;
    },
    editCoupon2(row,index){
      this.selectRow = row;
      this.selectIndex = index;
      this.editCouponForm = { ...row }; // 深拷贝行数据到表单
      this.editActiveCouponDialogVisible = true;
    },
    submitEditPendingCoupon() {
      this.$refs.editPendingCouponForm.validate(async (valid) => {
        if (valid) {
          try {
            const couponData = {
              "coupon_id":this.editCouponForm.coupon_id,
              "start_time": moment(this.editCouponForm.start_time).format('YYYY-MM-DD HH:mm:ss'),
              "end_time": moment(this.editCouponForm.end_time).format('YYYY-MM-DD HH:mm:ss'),
              "request": this.editCouponForm.request,
              "off": this.editCouponForm.off,
              "total": this.editCouponForm.total,
              "claim_limit": this.editCouponForm.claim_limit,
              "max_unused_count":this.editCouponForm.max_unused_count,
            };
            const response = await axios.post('http://localhost:8081/coupon/update/pending', couponData);
            if (response.status === 200) {
              this.$message.success('未生效优惠券修改成功');
              this.editPendingCouponDialogVisible = false;
              await this.refreshCoupons(); // 重新加载优惠券列表
            } else {
              this.$message.error(response.data);
            }
          } catch (error) {
            this.$message.error('未生效优惠券修改失败: ' + error.response.data);
          }
        }
      });
    },
    submitEditActiveCoupon() {
      this.$refs.editActiveCouponForm.validate(async (valid) => {
        if (valid) {
          try {
            const couponData = {
              "coupon_id":this.editCouponForm.coupon_id,
              "total": this.editCouponForm.total,
              "claim_limit": this.editCouponForm.claim_limit,
              "max_unused_count":this.editCouponForm.max_unused_count,
            };
            const response = await axios.post('http://localhost:8081/coupon/update/active', couponData);
            if (response.status === 200) {
              this.$message.success('已生效优惠券修改成功');
              this.editActiveCouponDialogVisible = false;
              await this.refreshCoupons(); // 重新加载优惠券列表
            } else {
              this.$message.error(response.data);
            }
          } catch (error) {
            this.$message.error('已生效优惠券修改失败: ' + error.response.data);
          }
        }
      });
    },
    pauseCoupon(row, index) {
      this.selectRow = row;
      this.selectIndex = index;
      this.pauseCouponDialogVisible = true;
    },
    submitPauseCoupon() {
      const couponId = this.selectRow.coupon_id;
      axios.put(`http://localhost:8081/coupon/pause?coupon_id=${couponId}`)
          .then(response => {
            if (response.status === 200) {
              this.$message.success('优惠券暂停发放成功');
              this.pauseCouponDialogVisible = false;
              this.refreshCoupons(); // 重新加载优惠券列表
            } else {
              this.$message.error(response.data);
            }
          })
          .catch(error => {
            this.$message.error('优惠券暂停发放失败: ' + error.response.data);
          });
    },
    resumeCoupon(row, index) {
      this.selectRow = row;
      this.selectIndex = index;
      this.resumeCouponDialogVisible = true;
    },
    submitResumeCoupon() {
      const couponId = this.selectRow.coupon_id;
      axios.put(`http://localhost:8081/coupon/resume?coupon_id=${couponId}`)
          .then(response => {
            if (response.status === 200) {
              this.$message.success('优惠券恢复领取成功');
              this.resumeCouponDialogVisible = false;
              this.refreshCoupons(); // 重新加载优惠券列表
            } else {
              this.$message.error(response.data);
            }
          })
          .catch(error => {
            this.$message.error('优惠券恢复领取失败: ' + error.response.data);
          });
    },
    // 获取优惠券数据
    async getAllPlatformCoupons(){
      this.loading = true;
      this.user_id=this.$store.getters.userId;
      console.log("当前用户id为：" + this.user_id);
      try{
        const platformCouponsResponse = await axios.get('http://localhost:8081/coupon/platform');
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
    handleTabClick(tab) {
      const status = tab.name;
      if(status==='all'){
        this.showCoupons = this.platformCoupons;
      }else{
        this.showCoupons = this.platformCoupons
            .filter(item => item.coupon_status===status);
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
    // 券的状态
    statusFormatter(row,column,value){
      if(value==='Pending'){
        return "待生效";
      }else if(value==='Active'){
        return "可领取";
      }else if(value==='Paused'){
        return "暂停领取";
      }else if(value==='Expired'){
        return "已失效";
      }else {
        return "未知状态";
      }
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
    this.getAllPlatformCoupons();
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