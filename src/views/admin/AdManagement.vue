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
      </div>
  
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
             <!-- 通过按钮（绿色） -->
              <el-button 
                v-if="scope.row.status === 'pending'" 
                @click="updateAd(scope.row.advertisement_id,'approved',null)" 
                size="small" 
                type="success">
                通过
              </el-button>

              <!-- 强制下线按钮（红色） -->
              <el-button 
                v-if="scope.row.status === 'approved' || scope.row.status === 'running'" 
                @click="updateAd(scope.row.advertisement_id,'expired')" 
                size="small" 
                type="danger">
                强制下线
              </el-button>

              <!-- 打回按钮（橙色）updateAd(scope.row.advertisement_id,'rejected') -->
              <el-button 
                v-if="scope.row.status === 'pending'" 
                @click="showReasonDialog(scope.row,'rejected')"
                size="small" 
                type="warning">
                打回
              </el-button>

              <!-- 详情按钮（蓝色） -->
              <el-button 
                @click="showAdvertiseDetails(scope.row)" 
                size="small" 
                type="primary">
                编辑
              </el-button>
              
              <!-- 删除按钮（红色） -->
              <el-button 
                v-if="scope.row.status === 'expired'" 
                @click="deleteAd(scope.row.advertisement_id)" 
                size="small" 
                type="danger">
                删除
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
        @refresh="fetchAds"
      />

    <el-dialog
      title="请输入原因"
      :visible.sync="reasonDialogVisible"
      width="400px"
      @close="resetReasonnForm"
    >
      <el-form :model="reason" label-width="80px">
        <el-form-item label="原因">
          <el-input 
            v-model="reason" 
            type="textarea" 
            rows="4" 
            placeholder="请输入原因"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="reasonDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReason">提交</el-button>
      </div>
    </el-dialog>

    </div>

</template>

<script>
import axios from 'axios';
import EditAdDialog from '@/components/AdDetailsModal.vue';
export default {
  components: {
    EditAdDialog
  },
  data() {
    return {
        searchKeyword: '',
        editDialogVisible: false,
        reasonDialogVisible: false, // 控制弹窗显示
        reason: '',          // 存储拒绝原因
        reason_type : '',
        searchShop: '',
        searchType: 'name',  // 默认为根据名称搜索
        advertiseStatus: 'all',  // 默认为“全部”状态
        //categories: ['零食小吃', '酒水饮料', '干货腌货', '即食食品', '农产品'],
        advertises: [],
        advertisesall: [],
        currentPage: 1,
        pageSize: 7,
        searchButton: false,
        searchKey:null,
        currentAd:null,//当前处理的广告
        totalItems: 0 // 模拟总商品数
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
      expired: '已到期'
    };
    return statusMap[status] || '未知'; // 如果没有匹配到，显示“未知”
    },
    //关闭详情弹窗
    closeDialog() {
      alert("关闭");
      this.editDialogVisible = false;  // 关闭弹窗
      this.currentAd = null;
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
      const flag = confirm('确认要删除吗？')
      console.log(adId);
      if(flag){
        const response = await axios.delete('http://localhost:8081/advertise/del',{
           params: {id: adId}
        });
      
      if(response.status == 200){
        alert('删除成功！');
      }else{
        alert('删除失败');
      }}
      this.fetchAds();
      //console.log('Deleting ad with ID:', adId); // 使用 adId 变量
    },
    //显示详情弹窗
    showAdvertiseDetails(ad){
      this.currentAd = ad;  // 将选中的广告数据传递给编辑表单
      this.editDialogVisible = true;  // 显示编辑弹窗
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
        const response = await axios.get('http://localhost:8081/advertise/admin');
        console.log(response)
        this.advertises = response.data; 
        this.advertiseall = response.data;
        this.advertises = response.data.slice(0,9); 
        this.totalItems = response.data.length;
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