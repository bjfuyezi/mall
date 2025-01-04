<template>
  <form @submit.prevent="handleSubmit" class="add-ad-form">  
    <h2>添加新广告</h2>

    <!-- 广告标题 -->
    <div class="form-group">
      <label for="name">名称</label>
      <input id="name" v-model="formData.name" type="text" required />
    </div>

    <!-- 广告类型 -->
    <div class="form-group">
      <label for="type">类型</label>
      <select id="type" v-model="formData.type" @change="onTypeChange" required>
        <option value="shop">店铺广告</option>
        <option value="product">产品广告</option>
        <!-- 添加其他可能的广告类型 -->
      </select>
    </div>

<!-- 动态显示的产品选择下拉列表 -->
    <div v-if="showProductSelect" class="form-group">
      <label for="product">选择商品</label>
      <select id="product" v-model="formData.selectedProduct" required>
        <option v-for="product in products" :key="product.id" :value="product.id">
          {{ product.name }}
        </option>
      </select>
    </div>

    <!-- 开始时间 -->
    <div class="form-group" >
      <label for="start_time">开始时间</label>
      <input id="start_time" v-model="formData.start_time" type="date" required />
       <span id="start_time_error" style="color: red; display: none;">开始时间不能为空</span>
    </div>

    <!-- 结束时间 -->
    <div class="form-group">
      <label for="end_time">结束时间</label>
      <input id="end_time" v-model="formData.end_time" type="date" @focus="checkStart" @change="price_cal" required />
    </div>

    <!-- 价格 -->
    <div class="form-group">
      <label for="price">价格 (元)</label>
      <input id="price" v-model.number="formData.price" type="number" step="0.01" min="0" disabled/>
    </div>

  <!-- 图片上传 -->
    <div class="form-group">
      <label for="picture">图片</label>
      <input id="picture" ref="pictureInput" type="file" @change="handleFileChange" />
      <span v-if="formData.picture">{{ formData.picture.name }}</span>
      <span v-else class="error" >请选择一个文件</span>
    </div>

    <!-- 提交按钮 -->
    <button type="submit" :disabled="isSubmitting">提交</button>

    <!-- 错误信息 -->
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script>
import axios from 'axios';
export default {
  name: 'AddAdForm',
  data() {
    return {
      formData: {
        ps_id: null,
        name: '',
        type: 'shop',
        start_time: null,
        end_time: null,
        price: null,
        picture: null, // 这里将保存文件对象
        selectedProduct: null, // 新增字段用于存储选中的产品ID
      },
      price:0,
      showProductSelect: false, // 控制是否显示产品选择下拉列表
      isSubmitting: false,
      error: null,
      products: [], // 存储从后端获取的产品列表
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.picture = file; // 只保存第一个文件
      } else {
        this.formData.picture = null;
      }
    },
    convertToInt(value) {
      return value !== null && value !== '' ? parseInt(value, 10) : 0;
    },
    convertToFloat(value) {
      return value !== null && value !== '' ? parseFloat(value).toFixed(2) : '0.00';
    },formatDate(isoString) {
      // 将 ISO 字符串解析为 Date 对象
      const date = new Date(isoString);
      // 获取年份、月份和日期，并确保月份和日期是两位数
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      // 返回格式化的日期字符串
      return `${year}-${month}-${day}`;
    },async checkStart() {
        const startTimeInput = document.getElementById('start_time');
        const startTimeError = document.getElementById('start_time_error');
        if(!this.formData.start_time){
          console.log("哈哈哈哈哈哈哈哈")
          startTimeInput.style.borderColor = 'red';
          startTimeError.style.display = 'block';
        }else{
          console.log(this.formData.start_time)
          startTimeInput.style.borderColor = '';
          startTimeError.style.display = 'none';
        }
    },
    async price_cal(){
      console.log(this.formatDate.start_time)
        try {
          const response = await axios.get('http://localhost:8081/advertise/money',{
            params: {
            start: this.formatDate(this.formData.start_time),
            end: this.formatDate(this.formData.end_time),
            times: 0,
            banner: true
            }
            });
          this.formData.price = response.data; // 假设后端返回的是一个价格
        } catch (err) {
          this.error = '无法加载预计价格，请稍等';
        }
    },
    async onTypeChange() {
      if (this.formData.type === 'product') {
        try {
          // 从后端获取产品列表
          //const response = await axios.get('http://localhost:8081/products');
          this.products = [{id:1,name:'商品1'},{id:2,name:'商品2'},{id:3,name:'商品3'}]//response.data; // 假设后端返回的是一个产品数组
          this.showProductSelect = true; // 显示产品选择下拉列表
        } catch (err) {
          this.error = '无法加载产品列表，请稍后再试';
        }
      } else {
        this.showProductSelect = false;
        this.products = [];
        this.formData.selectedProduct = null;
      }
    },
    async handleSubmit() {
      try {
        this.isSubmitting = true;
        this.error = null;

        const formData = new FormData();
        formData.append('name', this.formData.name);
        // 如果是产品广告，附加选中的产品ID
        if (this.formData.type === 'product' && this.formData.selectedProduct) {
            formData.append('ps_id', this.convertToInt(this.formData.selectedProduct));
        }else formData.append('ps_id', -1);
        formData.append('type', this.formData.type);
        formData.append('start_time', this.formatDate(this.formData.start_time));
        formData.append('end_time', this.formatDate(this.formData.end_time));
        formData.append('times', 0);
        formData.append('price', this.convertToFloat(this.formData.price));
        formData.append('banner', true);

        // 添加文件（如果有）
        if (this.formData.picture) {
          formData.append('picture', this.formData.picture); // 使用正确的键名 'pictrue'
        }else{
          formData.append('picture',null)
        }

        // 发送请求到服务器
        const response = await axios.post('http://localhost:8081/advertise/create', formData);
        if(response.status==200){
          alert('申请成功');
        }
        console.log(response);
        console.log('Form submitted:', formData);
        this.$emit('adAdded', { ...this.formData });
        this.clearForm();
      } catch (err) {
        this.error = err.message || '发生错误，请稍后再试';
      } finally {
        this.isSubmitting = false;
      }
    },
    clearForm() {
      this.formData = {
        ps_id: null,
        name: '',
        type: 'shop',
        start_time: null,
        end_time: null,
        price: null,
        picture: null,
      };
      // 手动清除文件输入框
      this.$refs.pictureInput.value = null;
    }
  }
};
</script>

<style scoped lang="scss">
.add-ad-form {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: calc(80vh - 100px);
  overflow-y: auto; /* 当内容超出容器的高度时，允许垂直滚动 */

  h2 {
    margin-top: 0;
    font-size: 1.5em;
    color: #ff6700;
  }

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    input, textarea, select {
      width: 90%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: #ff6700;
      }
    }

    textarea {
      resize: vertical;
    }
    .error{
      display: inline-block;
    }
  }

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;
    background-color: #ff6700;
    transition: background-color 0.3s ease;

    &:hover:not(:disabled) {
      background-color: darken(#ff6700, 10%);
    }

    &[disabled] {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }

  .error {
    margin-top: 1rem;
    color: red;
  }
}
</style>