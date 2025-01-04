<template>
    <div class="create-product">
      <h2>创建商品</h2>
      <form @submit.prevent="submitForm" class="product-form">
        <!-- 商品名称 -->
        <div class="form-group">
          <label for="productName">商品名称</label>
          <input v-model="product.name" type="text" id="productName" required />
        </div>
  
        <!-- 商品类别 -->
        <div class="form-group">
          <label for="category">类别</label>
          <select v-model="product.category" id="category" required>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
  
        <!-- 定价 -->
        <div class="form-group">
          <label for="price">定价</label>
          <input v-model="product.price" type="number" id="price" min="0" step="0.01" required />
        </div>
  
        <!-- 商品描述 -->
        <div class="form-group">
          <label for="description">商品描述</label>
          <textarea v-model="product.description" id="description" required></textarea>
        </div>
  
        <!-- 初始库存量 -->
        <div class="form-group">
          <label for="stock">初始库存量</label>
          <div class="stock-tags">
            <div v-for="(stock, index) in product.stock" :key="index" class="stock-tag">
              <input v-model="stock.flavor" placeholder="口味" />
              <input v-model="stock.quantity" type="number" min="0" placeholder="库存量" />
              <button type="button" @click="removeStock(index)">移除</button>
            </div>
            <button type="button" @click="addStock" :disabled="product.stock.length >= 5">添加组合标签</button>
          </div>
        </div>
  
        <!-- 售卖单位 -->
        <div class="form-group">
          <label for="unit">售卖单位</label>
          <input v-model="product.unit" type="text" id="unit" required />
        </div>
  
        <!-- 注意事项 -->
        <div class="form-group">
          <label for="notice">注意事项</label>
          <textarea v-model="product.notice" id="notice" required></textarea>
        </div>
  
        <!-- 商品图片上传 -->
        <div class="form-group">
          <label for="productImages">商品图片</label>
          <div class="image-upload-container">
            <input 
              type="file" 
              accept="image/*"
              v-for="(image, index) in product.images" 
              :key="index"
              :id="'image-' + index"
              @change="handleImageUpload($event, index)"
              :disabled="product.images.length >= 5"
            />
            <button type="button" @click="addImage" :disabled="product.images.length >= 5">添加图片</button>
          </div>
          <div class="image-previews">
            <div v-for="(image, index) in product.images" :key="'preview-' + index" class="image-preview">
              <img :src="image.previewUrl" :alt="'preview-' + index" />
              <button type="button" @click="removeImage(index)">移除</button>
            </div>
          </div>
        </div>
  
        <!-- 提交按钮 -->
        <div class="form-group">
          <button type="submit" class="submit-button">申请上架</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';

  export default {
    data() {
      return {
        shop_id: 4,     // session获取
        pictures_id: '',  // 存储图片的id
        product: {
          name: '',
          category: '',
          price: null,
          description: '',
          stock: [],
          unit: '',
          notice: '',
          images: [], // 存储图片信息
        },
        categories: [
          '生鲜食品', '零食小吃', '酒水饮料', '干货腌货', '即食食品', '农产品'
        ],
      };
    },
    methods: {
      addStock() {
        if (this.product.stock.length < 5) {
          this.product.stock.push({ flavor: '', quantity: 0 });
        }
      },
      removeStock(index) {
        this.product.stock.splice(index, 1);
      },
      addImage() {
        if (this.product.images.length < 5) {
          this.product.images.push({ file: null, previewUrl: null });
        }
      },
      handleImageUpload(event, index) {
        const file = event.target.files[0];

        if (file) {
            const fileType = file.type;
            const fileSize = file.size;

            // 验证文件类型和大小
            if (['image/jpeg', 'image/png'].includes(fileType) && fileSize <= 20 * 1024 * 1024) { // 限制大小为5MB以内
              const reader = new FileReader();
              reader.onload = (e) => {
                this.$set(this.product.images, index, {
                file: file,
                previewUrl: e.target.result
                });
            };
            reader.readAsDataURL(file);
            } else {
                alert("只支持上传 jpg, jpeg, png 格式的图片，并且大小不能超过 20MB！");
            }
        }
      },
      removeImage(index) {
        this.product.images.splice(index, 1);
      },
      async submitForm() {
        // 准备表单数据
        const formData = new FormData();
        formData.append('name', this.product.name);
        formData.append('category', this.product.category);
        formData.append('price', this.product.price);
        formData.append('description', this.product.description);
        formData.append('unit', this.product.unit);
        formData.append('notice', this.product.notice);
        formData.append('shop_id', this.shop_id);

        // 将库存信息（每个口味和数量）添加到 FormData 中
        formData.append('stock', JSON.stringify(this.product.stock));

        // 将图片信息添加到 FormData 中（最多5个文件）
        for (let image of this.product.images){
            if (image.file) {
              let imageData = new FormData();
              imageData.append("file", image.file);
              const response = await axios.post('http://localhost:8081/pic/uploadAndId', imageData);
              if ( response.status === 200 ){
                this.pictures_id = this.pictures_id + response.data + ",";
                imageData = null;
              } else {
                  console.error('文件上传失败');
              }
            }
        }
        // 将图片信息（id列表）添加到 FormData 中
        formData.append('images', this.pictures_id);

        axios.post('http://localhost:8081/product/addProduct', formData)
            .then(response => {
              if ( response.status === 200 ){
                alert('申请成功');
                // 关闭弹窗啥的
              } else if ( response.status === 409 ) {
                alert('存在重名商品，请重新输入');
                window.location.reload();
              } else {
                alert('找不到店铺，请检查登录状态');
              }
            })
            .catch(error => {
              if ( error.response.status === 409 ){
                alert('存在重名商品，请重新输入');
                window.location.reload();
              } else {
                alert('找不到店铺，请检查登录状态');
              }
            });
      }
    }
  };
  </script>
  
  <style scoped>
  .create-product {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .product-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .stock-tags {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .stock-tag {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .stock-tag input {
    flex: 1;
  }
  
  button {
    background-color: #ff6700;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .submit-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .submit-button:hover {
    background-color: #45a049;
  }
  
  /* 图片上传部分样式 */
  .image-upload-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .image-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .image-preview {
    position: relative;
  }
  
  .image-preview img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  .image-preview button {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 2px 5px;
    border-radius: 50%;
    cursor: pointer;
  }
  </style>
  