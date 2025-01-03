<template>
  <div class="shop-management">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <span class="status-message">
        {{ shopStatus === 'closed' ? '您的店铺已歇业' : '您的店铺正在营业中' }}
      </span>
      <div class="action-buttons">
        <button @click="toggleShopStatus" :disabled="isProcessing">
          {{ shopStatus === 'closed' ? '开业' : '歇业' }}
        </button>
        <button @click="closeShop" :disabled="isProcessing">注销店铺</button>
      </div>
    </div>

    <!-- 中部表单区域 -->
    <div class="shop-details">
      <h2>店铺详情</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="shopName">店铺名称</label>
          <input v-model="shopInfo.shopName" :disabled="isFormDisabled" type="text" id="shopName" />
        </div>
        <div class="form-group">
          <label for="description">店铺描述</label>
          <textarea v-model="shopInfo.description" :disabled="isFormDisabled" id="description"></textarea>
        </div>
        <div class="form-group">
          <label>创建时间</label>
          <input v-model="shopInfo.createdTime" disabled type="text" />
        </div>
        <div class="form-group">
          <label>特产地</label>
          <input v-model="shopInfo.location" :disabled="isFormDisabled" type="text" id="location"/>
        </div>
        <!-- 食品经营许可证 -->
        <div class="form-group">
          <label for="picture">食品经营许可证</label>
          <!-- 显示默认图片，如果用户没有选择图片 -->
          <img v-if="this.picture" :src="`http://localhost:8081${this.url}`" alt="Now Image" width="200" height="200" />
          <input 
            type="file" 
            id="picture" 
            @change="handleFileUpload" 
            accept=".jpg,.jpeg,.png"
            required
          />
        </div>
        <div class="form-group">
          <label>店铺等级</label>
          <input v-model="shopInfo.level" disabled type="text" id="level"/>
        </div>
        <div class="form-group">
          <label>营业额</label>
          <input v-model="shopInfo.salary" disabled type="text" id="salary"/>
        </div>
        <div class="form-group">
          <label>总销量</label>
          <input v-model="shopInfo.salenum" disabled type="text" id="salenum"/>
        </div>

        <!-- 提交按钮和提现按钮 -->
        <div class="buttons">
          <button type="submit" :disabled="isFormDisabled">{{ isFormDisabled ? '您的更改申请正在审核中' : '申请修改信息' }}</button>
          <button type="button" @click="withdraw" :disabled="isProcessing">提现</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      user_id: 1,
      shopStatus: '', 
      isProcessing: false, // 用于防止重复点击
      picture: null,
      url: '',
      shopInfo: {
        shop_id: '',
        shopName: '',
        description: '',
        createdTime: '',
        location: '',
        level: '',
        salary: '',
        salenum: ''
      }
    };
  },
  computed: {
    isFormDisabled() {
      return this.shopStatus === 'waiting' || this.isProcessing;
    }
  },
  mounted() {
    // 页面加载时获取店铺信息
    this.fetchShopDetails();
  },
  methods: {
  // 获取店铺信息
    fetchShopDetails() {
      this.isProcessing = true;
      axios.post('http://localhost:8081/shop/getByUserId', {id:this.user_id}) // 后端接口地址
        .then(response => {
          // 假设后端返回的数据结构为 response.data
          const shopData = response.data;
          this.shopStatus = shopData.status;
          this.shopInfo = {
            shop_id: shopData.shop_id,
            shopName: shopData.shop_name,
            description: shopData.shop_description,
            createdTime: shopData.created_time,
            location: shopData.location,
            level: shopData.level,
            salary: shopData.salary
          };
          // 获取营业额
          axios.post('http://localhost:8081/product/getSalenumByShopId', {id: shopData.shop_id})
            .then(response => {
              this.shopInfo.salenum = response.data;
            })
            .catch(error => {
              console.error('获取营业额失败', error);
          });
          // 根据 picture_id 获取图片
          const pictureId = shopData.picture_id; // 假设图片ID是返回数据中的字段
          if (pictureId) {
            axios.post('http://localhost:8081/pic/getUrl', {id: pictureId})
              .then(response => {
                this.url = response.data;
              })
              .catch(error => {
                console.error('获取图片失败', error);
              });
          }
        })
        .catch(error => {
          console.error('获取店铺信息失败:', error);
        })
        .finally(() => {
          this.isProcessing = false;
        });
    },
    // 切换店铺状态（开业/歇业）
    toggleShopStatus() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      this.shopStatus = this.shopStatus === 'closed' ? 'open' : 'closed';
      axios.post('http://localhost:8081/shop/status', {id:this.shopInfo.shop_id, status:this.shopStatus})
            .then(response => {
              if ( response.status === 200 ){
                alert('切换店铺成功');
                window.location.reload();
              }
            })
            .catch(error => {
              console.error('切换失败', error);
            });
    },

    // 注销店铺
    closeShop() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      axios.post('http://localhost:8081/shop/deleteShop', {id:this.shopInfo.shop_id})
            .then(response => {
              if ( response.status === 200 ){
                alert('删除店铺成功');
                this.$router.push('/shopmodel/asshop'); // 使用 Vue Router 跳转到成为商家
              }
            })
            .catch(error => {
              console.error('删除失败', error);
            });
    },

    // 提交修改店铺信息申请
    submitForm() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      // 提交表单前先检查必要字段
      if (!this.shopInfo.shopName || !this.shopInfo.description || !this.shopInfo.location ) {
        alert('请填写所有必要的字段并上传图片');
        return;
      }

      // 准备表单数据
      const formData = new FormData();
      formData.append('shop_name', this.shopInfo.shopName);
      formData.append('description', this.shopInfo.description);
      formData.append('location', this.shopInfo.location);

      // 追加图片数据
      formData.append('picture', this.picture.file);
      formData.append('shop_id', this.shopInfo.shop_id);

      axios.post('http://localhost:8081/shop/updateShop', formData)
            .then(response => {
              if ( response.status === 200 ){
                alert('申请成功');
                window.location.reload();
              }
            })
            .catch(error => {
              console.error('申请失败', error);
            });
    },

    // 提现功能
    withdraw() {
      if (this.isProcessing) return;

      this.isProcessing = true;
      // 模拟提现操作
      setTimeout(() => {
        alert('提现申请已提交');
        this.isProcessing = false;
      }, 1000);
    },
    handleFileUpload(event) {
      const file = event.target.files[0];

      if (file) {
        const fileType = file.type;
        const fileSize = file.size;

        // 验证文件类型和大小
        if (['image/jpeg', 'image/png'].includes(fileType) && fileSize <= 20 * 1024 * 1024) { // 限制大小为5MB以内
          const reader = new FileReader();
          reader.onload = (e) => {
            this.picture = {
              file: file,
              preview: e.target.result
            };
          };
          reader.readAsDataURL(file);
        } else {
          alert("只支持上传 jpg, jpeg, png 格式的图片，并且大小不能超过 20MB！");
        }
      }
    },
  }
};
</script>

<style scoped>
.shop-management {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}

.status-message {
  font-size: 16px;
}

.action-buttons button {
  margin-left: 10px;
}

.shop-details {
  margin-top: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.shop-details h2 {
  font-size: 20px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.buttons {
  margin-top: 20px;
}

.buttons button {
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
}

.buttons button:disabled {
  cursor: not-allowed;
  background-color: #ccc;
}
</style>
