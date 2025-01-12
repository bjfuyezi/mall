<template>
  <div class="ad-management">
    <h2>广告管理</h2>

     <!-- 搜索栏和操作按钮（顶部）-->
      <div class="search-bar">
        <div style="display: flex; align-items: center;">
          <!-- 搜索方式选择 -->
          <el-select
            v-model="searchType"
            placeholder="请选择搜索方式"
            style="width: 150px; margin-right: 10px;">
            <el-option label="名称" value="name" />
            <el-option label="商铺名" value="shop" />
          </el-select>
  
          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="请输入商品名称或商铺名"
            style="width: 200px; margin-right: 10px;"
          />
  
          <!-- 搜索按钮 -->
          <el-button @click="searchAdvertise" type="primary">搜索</el-button>
          <!--新增按键-->
          <el-button @click="toggleBannerModal" class="add-ad-btn">添加广告</el-button>
          <el-button @click="toggleAddAdModal" class="add-ad-btn">购买曝光量</el-button>
        </div>

        <div style="margin-top: 10px; display: flex; align-items: center;">
          <!-- 广告状态选择 -->
          <el-select
            v-model="advertiseStatus"
            placeholder="选择广告状态"
            style="width: 200px; margin-right: 10px;">
            <el-option label="全部" value="all" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="正在进行" value="running" />
            <el-option label="已打回" value="rejected" />
            <el-option label="已失效" value="expired" />
          </el-select>
        </div>
        <!-- <div style="display: flex; align-items: center;">
            
            <button @click="toggleBannerModal" class="add-ad-btn">添加广告</button>
            <button @click="toggleAddAdModal" class="add-ad-btn">购买曝光量</button>
        </div> -->
      </div>

    <!-- 使用 el-dialog 替换弹窗 -->
    <el-dialog
      v-model="showBannerModal"
      title="添加首页广告"
      @close="closeBannerModal"
      :visible.sync="showBannerModal"
    >
      <add-banner @close-ad="closeBannerModal" @refresh="payOrder"></add-banner>
    </el-dialog>

    <!-- 购买曝光量的弹窗 -->
    <el-dialog
      v-model="showAddAdModal"
      title="购买曝光量"
      @close="closeAddAdModal"
      :visible.sync="showAddAdModal"
    >
      <add-ad @close-ad="closeAddAdModal" @refresh="payOrder"></add-ad>
    </el-dialog>


    <!-- 商品列表（中部）-->
      <div>
        <el-table :data="filteredAdvertise" style="width: 100%">
          <el-table-column prop="name" label="广告名称" />
          <el-table-column prop="shop_name" label="店铺名称" />
          <el-table-column label="广告类型" >
            <template slot-scope="scope">
                {{ scope.row.advertisement_type === 'shop' ? '店铺推广' : '商品推广'  }}
            </template>
          </el-table-column>
          <el-table-column label="投放方式" >
            <template slot-scope="scope">
                {{ scope.row.banner === true ? '首页推广' : '购买曝光量'  }}
            </template>
          </el-table-column>
          <el-table-column prop="start_time" label="开始时间" >
             <template slot-scope="scope">
                {{ scope.row.start_time? new Date(scope.row.start_time).toISOString().split('T')[0] : '暂无'}}
            </template>
          </el-table-column>
          <el-table-column prop="end_time" label="结束时间" >
              <template slot-scope="scope">
                {{ scope.row.end_time? new Date(scope.row.end_time).toISOString().split('T')[0] : '暂无' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" >
              <template slot-scope="scope">
    <!-- 根据状态值匹配标签 -->
                {{ getStatusLabel(scope.row.status) }}
              </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" />
  
          <el-table-column label="操作" min-width="150">
            <template slot-scope="scope">
              <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: nowrap; width: 100%;">

              <!-- 强制下线按钮（红色） -->
              <el-button 
                v-if="scope.row.status === 'approved' || scope.row.status === 'running'" 
                @click="updateAd(scope.row.advertisement_id,'expired')" 
                size="small" 
                type="danger">
                强制下线
              </el-button>

              <!-- 详情按钮（蓝色） -->
              <el-button 
                @click="showAdvertiseDetails(scope.row)" 
                size="small" 
                type="primary">
                编辑
              </el-button>
              
              </div>
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

      <!-- 编辑弹窗组件 -->
      <edit-ad-dialog 
        :visible.sync="editDialogVisible"
        :adData="currentAd"
        @close-dialog="closeDialog"
        @refresh="fetchAds()"
      />

          <!-- 选择支付方式对话框 -->
    <el-dialog
      title="选择支付方式"
      :visible.sync="showPayMethodDialog"
      width="300px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="pay-method-content">
        <el-button class="pay-method-btn" @click="PayMethod('wechat')">
          <i class="el-icon-goods"></i>
          微信支付
        </el-button>
        <el-button class="pay-method-btn" @click="PayMethod('alipay')">
          <i class="el-icon-goods"></i>
          支付宝支付
        </el-button>
      </div>
    </el-dialog>

 <!-- 添加支付二维码对话框 -->
    <el-dialog
      :title="payTypeText"
      :visible.sync="showPayDialog"
      width="300px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="pay-dialog-content">
        <p class="pay-type-text">{{ payTypeText }}扫码支付</p>
        <div class="qr-code" ref="qrCode"></div>
        <div class="pay-amount">
          支付金额：<span class="price">¥{{ currentPayAmount }}</span>
        </div>
        <div class="pay-tips">
          <p>请使用{{ payTypeText }}扫描二维码完成支付</p>
          <p class="small">支付完成前请不要关闭窗口</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPay">取消支付</el-button>
        <el-button type="primary" @click="confirmPay">确认已支付</el-button>
      </div>
    </el-dialog>
    
    </div>

</template>

<script>
import axios from 'axios';
import EditAdDialog from '@/components/AdDetailsModal.vue';
import AddAd from '@/components/AddAd.vue';
import AddBanner from '@/components/AddBanner.vue';
import QRCode from 'qrcodejs2';

export default {
  components: {
    EditAdDialog,
    AddAd,
    AddBanner
  },
  data() {
    return {
        searchKeyword: '',
        showAddAdModal: false, 
        showBannerModal: false, 
        editDialogVisible: false,
        reasonDialogVisible: false, // 控制弹窗显示
        reason: '',          // 存储拒绝原因
        reason_type : '',
        searchShop: '',
        searchType: 'name',  // 默认为根据名称搜索
        advertiseStatus: 'all',  // 默认为“全部”状态
        //categories: ['零食小吃', '酒水饮料', '干货腌货', '即食食品', '农产品'],
        advertises: [],
        advertiseall:[],
        currentPage: 1,
        pageSize: 10,
        searchButton: false,
        searchKey:null,
        currentAd:null,//当前处理的广告
        totalItems: 0, // 模拟总商品数
        showPayMethodDialog: false,
      showPayDialog: false,
      payMethod: '',
      payTypeText: '',
      qrCodeInstance: null,
      currentPayAmount: 0,
      currentPay: null
      };
  },
  computed: {
        // 过滤后的广告
            filteredAdvertise() {
      let filtered = this.advertises;

      // 根据广告状态过滤
      if (this.advertiseStatus !== 'all') {
        filtered = filtered.filter(advertise => advertise.status === this.advertiseStatus);
      }

      // 如果有关键词，进行搜索过滤
      if (this.searchKey) {
        filtered = filtered.filter(advertise => {
          if (this.searchType === 'name') {
            return advertise.name.toLowerCase().includes(this.searchKey.toLowerCase());
          } else if (this.searchType === 'shop') {
            return advertise.shop_name.toLowerCase().includes(this.searchKey.toLowerCase());
          }
          return false;
        });
      }

      return filtered;
    }
    },
  methods: {
    getStatusLabel(status) {
    const statusMap = {
      pending: '待审核',
      approved: '已通过',
      running: '进行中',
      rejected: '被打回',
      expired: '已失效'
    };
    return statusMap[status] || '未知'; // 如果没有匹配到，显示“未知”
    },
    //关闭详情弹窗
    closeDialog() {
      alert("关闭");
      this.editDialogVisible = false;  // 关闭弹窗
      this.currentAd = null;
    },
    closeBannerModal() {
      //alert("关闭banner");
      this.showBannerModal = false;  // 关闭弹窗
    },
    closeAddAdModal() {
      //alert("关闭");
      this.showAddAdModal = false;  // 关闭弹窗
    },
    //更新状态
    async updateAd(adId,status,reason){
      console.log(adId,status);
      try {
        const response = await axios.post('http://localhost:8081/advertise/status',{
            advertisement_id: adId,
            status: status,
            reason: reason
            });
        console.log(response);
        alert("提交成功");
        this.fetchAds();
      } catch (error) {
        console.error("操作出错", error);
      }
    },
    // 提交原因
    submitReason() {
    if (!this.reason) {
      this.$message.error('请输入拒绝原因');
      return;
    }
    this.updateAd(this.currentAd.advertisement_id,this.reason_type,this.reason);

    this.reasonDialogVisible = false;
    this.reason = '';  // 清空输入的原因
    this.reason_type = '';
  },
  async deleteAd(adId) {
      // 删除广告逻辑
      console.log(adId);
      await axios.delete('http://localhost:8081/advertise/del',{
           params: {id: adId}
        });
      this.fetchAds();
      //console.log('Deleting ad with ID:', adId); // 使用 adId 变量
    },
    //显示详情弹窗
    showAdvertiseDetails(ad){
      this.currentAd = ad;  // 将选中的广告数据传递给编辑表单
      this.editDialogVisible = true;  // 显示编辑弹窗
    },
    toggleAddAdModal() {
      this.showAddAdModal = true;
    },
    toggleBannerModal() {
      this.showBannerModal = true;
    },
    //显示原因弹窗
    showReasonDialog(ad,type) {
    this.currentAd = ad;  // 保存当前广告信息
    this.reasonDialogVisible = true; // 显示弹窗
    this.reason_type = type;
    },
    // 重置原因弹窗
    resetReasonForm() {
      this.reason = '';  // 关闭弹窗时清空输入框
      this.reason_type = '';
      this.reasonDialogVisible=false;
    },
    async fetchAds() {
      // 获取广告列表
      // 这里可以调用 API 获取广告列表
      // 示例数据
      try {
        const userid = this.$store.getters.userId;
        const response = await axios.get('http://localhost:8081/advertise/user',{
            params:{
                uid:userid
            }
        });
        console.log(response)
        this.advertiseall = response.data;
        this.advertises = response.data.slice(0,10); 
        this.totalItems = response.data.length;
        console.log(this.totalItems);
      } catch (error) {
        console.error("There was an error fetching the ads!", error);
      }
      //this.advertises=[{name:"hah",shop:"12",type:"a"},]
    },
    searchAdvertise() {
      if (this.searchKeyword) {
          this.searchKey=this.searchKeyword
      }else{
        this.searchKey = null
      }
  },
  handlePageChange(newPage) {
      this.currentPage = newPage; // 更新当前页
      this.advertises = this.advertiseall.slice((this.currentPage-1)*this.pageSize,this.currentPage*this.pageSize);
    },
  payOrder(data){
    console.log(data);
    this.currentPay = data;
    this.currentPayAmount = data.price;
    this.showPayMethodDialog = true;
  },
    async PayMethod(method) {
    console.log(method);
      this.payMethod = method;
      this.payTypeText = method === 'wechat' ? '微信' : '支付宝';
      this.showPayMethodDialog = false;
      try {
        /*// 调用后端接口获取支付链接
        const response = await this.$axios.post('/order/pay', {
          orderId: this.currentPayOrder.order_id,
          amount: this.currentPayAmount,
          payMethod: method
        });
        
        // 显示支付二维码
        this.showPayDialog = true;
        this.$nextTick(() => {
          this.generateQRCode(response.data.payUrl || 'https://example.com/pay');
        });
        
        // 开始轮询支付状态
        this.startCheckPayStatus(this.currentPayOrder.order_id);*/
        this.showPayDialog = true;
        const testPayUrl = method === 'wechat' 
          ? `weixin://wxpay/bizpayurl?pr=order_${this.currentPayOrder.order_id}_${this.currentPayAmount}` 
          : `https://qr.alipay.com/pay?order=${this.currentPayOrder.order_id}&amount=${this.currentPayAmount}`;

        // 在对话框显示后生成二维码，并设置不同的颜色
        this.$nextTick(() => {
          this.generateQRCode(testPayUrl, method);
        });
        
      } catch (error) {
        this.$message.error('创建支付订单失败，请重试');
        console.error('创建支付订单失败:', error);
      }
    },
    generateQRCode(url, payMethod) {
      // 清除已存在的二维码
      if (this.qrCodeInstance) {
        this.qrCodeInstance.clear();
      }
      const qrContainer = this.$refs.qrCode;
      if (qrContainer) {
        qrContainer.innerHTML = '';
        this.qrCodeInstance = new QRCode(qrContainer, {
          text: url,
          width: 200,
          height: 200,
          colorDark: payMethod === 'wechat' ? '#2C8722' : '#00A0E9',  // 微信绿色 vs 支付宝蓝色
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    },
    cancelPay() {
      this.$confirm('确定要取消支付吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.showPayDialog = false;
        this.stopCheckPayStatus();
        this.deleteAd(this.currentPay.advertisement_id);
      }).catch(() => {});
    },
    async confirmPay() {
      try {
        // 调用后端验证支付状态
        const response = await this.$axios.post('http://localhost:8081/order/pay', {
          order_id: this.currentPayOrder.order_id,
          payment_method:this.payTypeText
        });
        /*
        if (response.data.paid) {
          this.$message.success('支付成功！');
          this.showPayDialog = false;
          // 更新订单状态
          this.currentPayOrder.status = '待发货';
          this.stopCheckPayStatus();
        } else {
          this.$message.warning('未检测到支付，请确认是否已完成支付');
        }*/
        if (response.status === 201) {
          this.$message.success('支付成功！');
          this.showPayDialog = false;
          // 更新订单状态
          //this.currentPayOrder.status = '待发货';
          this.stopCheckPayStatus();
          this.updateAd(this.currentPay.advertisement_id,'pending',null);//更新状态为申请状态
          this.fetchAds();
        } else {
          this.$message.warning('未检测到支付，请确认是否已完成支付');
        }
      } catch (error) {
        this.$message.error('验证支付状态失败，请稍后重试');
        console.error('验证支付失败:', error);
      }
    },
    startCheckPayStatus(orderId) {
      this.payStatusTimer = setInterval(async () => {
        try {
          const response = await this.$axios.get(`/api/payment/status/${orderId}`);
          if (response.data.paid) {
            this.$message.success('支付成功！');
            this.showPayDialog = false;
            // 更新订单状态
            this.currentPayOrder.status = '待发货';
            this.stopCheckPayStatus();
          }
        } catch (error) {
          console.error('检查支付状态失败:', error);
        }
      }, 3000); // 每3秒检查一次
    },
    stopCheckPayStatus() {
      if (this.payStatusTimer) {
        clearInterval(this.payStatusTimer);
        this.payStatusTimer = null;
      }
    }
  },
  mounted() {
    this.fetchAds(); // 获取广告列表
  }
}
</script>

<style>
.ad-management {
  padding: 10px;
}
</style> 