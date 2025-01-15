<template>
  <form @submit.prevent="handleSubmit" class="add-ad-form">  
    <h2>购买曝光量</h2>

    <!-- 广告标题 -->
    <div class="form-group">
      <label for="name">名称</label>
      <input id="name" v-model="formData.name" type="text" required />
    </div>

<!-- 动态显示的产品选择下拉列表 -->
    <div class="form-group">
      <label for="product">选择商品</label>
      <select id="product" v-model="formData.selectedProduct" required>
        <option v-for="product in products" :key="product.product_id" :value="product.product_id">
          {{ product.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="times">选择曝光量</label>
      <input id="times" v-model="formData.times" type="text" @change="price_cal" required />
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
      <span v-else class="error" >请选择封面图片，默认使用商品封面</span>
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
  name: 'AddAd',
  data() {
    return {
      formData: {
        ps_id: 0,
        name: '',
        price: null,
        picture: null, // 这里将保存文件对象
        selectedProduct: null, // 新增字段用于存储选中的产品ID
        times: 0//推广次数
      },
      shop_id:0,
      isSubmitting: false,
      error: null,
      products: [], // 存储从后端获取的产品列表
    };
  },
  created(){
    this.getProducts()
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
      return `${year}-${month}-${day} 00:00:00`;
    },
    async getProducts() {
      console.log('here');
      const userid = this.$store.getters.userId;
      const shopResponse = await axios.post('http://localhost:8081/shop/getByUser_id', {id:userid});
      this.shop_id=shopResponse.data.shop_id;
      if ( shopResponse.data != null ) {
          const proResponse = await axios.post('http://localhost:8081/product/getAllByShop_id', {id:shopResponse.data.shop_id});
          if ( proResponse.data != null ) {
            this.products = proResponse.data;
            console.log(proResponse.data);
          }
        }
     
        },
    // async getProucts() {
    //     try {
    //       // 从后端获取产品列表
    //       //const response = await axios.get('http://localhost:8081/products');
    //       this.products = [{id:1,name:'商品1'},{id:2,name:'商品2'},{id:3,name:'商品3'}]//response.data; // 假设后端返回的是一个产品数组
    //     } catch (err) {
    //       this.error = '无法加载产品列表，请稍后再试';
    //     }
    // },
    async price_cal(){
        try {
          const response = await axios.get('http://localhost:8081/advertise/money',{
            params: {
            start: "",
            end: "",
            times: this.formData.times,
            banner: false
            }
            });
          this.formData.price = response.data; // 假设后端返回的是一个价格
          console.log(this.price)
        } catch (err) {
          this.error = '无法加载预计价格，请稍等';
        }
    },
    async handleSubmit() {
      try {
        this.error = null;

        const formData = new FormData();
        formData.append('name', this.formData.name);
        // 曝光量必须是商品广告
        formData.append('ps_id', this.convertToInt(this.formData.selectedProduct));
        formData.append('type', 'product');
        formData.append('start_time', null);
        formData.append('end_time', null);
        formData.append('times', this.convertToInt(this.formData.times));
        formData.append('price', this.convertToFloat(this.formData.price));
        formData.append('banner', false);
        formData.append('shop_id',this.shop_id);

        // 添加文件（如果有）
        if (this.formData.picture) {
          formData.append('picture', this.formData.picture); // 使用正确的键名 'pictrue'
        }

        // 发送请求到服务器
        const response = await axios.post('http://localhost:8081/advertise/create', formData);
        if(response.status==200){
          //进入支付页面
          console.log(response.data);
          this.$emit('refresh',response.data);
        }else if(response.status==400){
          alert('已有推广正在进行');
        }else{
          alert('申请失败，遇到',response.status,'错误');
        }
        this.clearForm();
      } catch (err) {
        this.error = err.message || '发生错误，请稍后再试';
      }
      this.closeDialog();
    },
    // 关闭弹窗的方法
    closeDialog() {
      //this.dialogVisible = false;
      // alert('小弹窗');
      this.$emit('close-ad'); 
    },
    clearForm() {
      this.formData = {
        ps_id: null,
        name: '',
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
   input.radio-group {
      display: inline-block;
      max-width: 10px; 
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