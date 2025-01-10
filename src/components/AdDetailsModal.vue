<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="编辑广告"
    width="80%"
    @close="resetForm"
  >
    <div class="detail-page">
      <!-- 图片显示区域 -->
      <div class="image-container">
        <img :src="`http://localhost:8081${this.currentAd.url}`" alt="广告图片" v-if="currentAd.url" />
        <p v-else>{{`http://localhost:8081${this.currentAd.url}`}}</p>

          <el-form :model="currentAd" label-width="120px" class="ad-form" ref="editForm">
          <!-- 开始时间 -->
          <el-form-item label="创建时间">
            <span>{{ currentAd.created_time ? new Date(currentAd.created_time).toISOString().split('T')[0] : '暂无' }}</span>
          </el-form-item>

          <!-- 结束时间 -->
          <el-form-item label="更新时间">
            <span>{{ currentAd.updated_time ? new Date(currentAd.updated_time).toISOString().split('T')[0] : '暂无' }}</span>
          </el-form-item>
          </el-form>
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-container">
        <el-form :model="currentAd" label-width="120px" class="ad-form" ref="editForm">
          <!-- 广告名称 -->
          <el-form-item label="广告编号">
           <span>{{ currentAd.advertisement_id }}</span>
          </el-form-item>
          <!-- 广告名称 -->
          <el-form-item label="广告名称">
            <el-input v-model="currentAd.name" placeholder="请输入广告名称" />
          </el-form-item>

          <!-- 广告类型 -->
          <el-form-item label="广告类型">
            <span>{{ currentAd.advertisement_type === 'shop' ? '店铺推广' : '商品推广' }}</span>
          </el-form-item>
          
          <!-- 投放方式 -->
          <el-form-item label="投放方式">
            <span>{{ currentAd.banner ? '首页推广' : '购买曝光量' }}</span>
          </el-form-item>

          <!-- 商铺名称 -->
          <el-form-item label="商铺名称">
            <span>{{ currentAd.shop_name }}</span>
          </el-form-item>

          <!-- 商品名称 -->
          <el-form-item label="商品名称" v-if="currentAd.product_name">
            <span>{{ currentAd.product_name }}</span>
          </el-form-item>

          <!-- 开始时间 -->
          <el-form-item label="开始时间">
            <span>{{ currentAd.start_time ? new Date(currentAd.start_time).toISOString().split('T')[0] : '暂无' }}</span>
          </el-form-item>

          <!-- 结束时间 -->
          <el-form-item label="结束时间">
            <span>{{ currentAd.end_time ? new Date(currentAd.end_time).toISOString().split('T')[0] : '暂无' }}</span>
          </el-form-item>

          <!-- 价格 -->
          <el-form-item label="价格">
            <span>¥{{ currentAd.price }}</span>
          </el-form-item>

          <!-- 状态 -->
          <el-form-item label="广告状态">
            <span>{{ getStatusLabel(currentAd.status) }}</span>
          </el-form-item>

          <!-- 状态 -->
          <el-form-item label="打回原因" v-if="currentAd.reason">
            <span>{{ getStatusLabel(currentAd.reason) }}</span>
          </el-form-item>
        </el-form>
        
        <!-- 提交按钮区域 -->
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    adData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      dialogVisible: this.visible,  // 控制弹窗显示
      currentAd: { ...this.adData } // 初始化当前广告数据
    };
  },
  watch: {
    adData: {
      immediate: true,  // 立即触发一次
      handler(newAdData) {
        this.currentAd = { ...newAdData };  // 更新 currentAd
      }
    },
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        // 每次打开弹窗时，重新初始化 currentAd 为父组件的 adData
        this.currentAd = { ...this.adData };  // 重新赋值，恢复初始数据
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    // 状态标签转换
    getStatusLabel(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        running: '进行中',
        rejected: '被打回',
        expired: '已到期'
      };
      return statusMap[status] || '未知';
    },

    // 提交数据
    async handleSubmit() {
       try {
        console.log(this.currentAd);
        const response = await axios.post('http://localhost:8081/advertise/updateinfo',{
            advertisement_id: this.currentAd.advertisement_id,
            name: this.currentAd.name
            });
        console.log(response);
        alert("修改成功");
        this.$emit('refresh'); 
      } catch (error) {
        console.error("修改出错", error);
      }
      this.closeDialog();
    },

    // 关闭弹窗的方法
    closeDialog() {
      this.currentAd = null;
      this.dialogVisible = false;
      console.log(this.dialogVisible);
      this.$emit('close-dialog'); 
    },

    // 重置表单
    resetForm() {
    this.$nextTick(() => {
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields();  // 重置表单字段
      } else {
        console.error("表单引用未找到");
      }
    });
    }
  }
};
</script>

<style scoped>
.detail-page {
  display: flex;
  justify-content: space-between;  /* 设置左右布局 */
  padding: 20px;
}
.image-container {
  width: 40%;  /* 图片区域占40% */
  text-align: center;
  margin-bottom: 20px; /* 给时间字段一点间距 */
}

.image-container img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.info-container {
  width: 55%;  /* 信息区域占55% */
}

.ad-form .el-form-item {
  margin-bottom: 10px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.el-form-item span {
  display: inline-block;
  line-height: 25px;
  font-size: 14px;
}
</style>
