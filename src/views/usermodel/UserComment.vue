<template>
    <div class="review-container">
      <div class="review-card">
        <h2>商品评价</h2>
        
        <!-- 图片上传区域 -->
        <div class="upload-section">
          <el-upload
            class="image-uploader"
            action="#"
            :http-request="handleUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :multiple="false"
          >
            <div class="upload-box" v-if="imageList.length < 5">
              <i class="el-icon-plus"></i>
              <span>添加图片</span>
            </div>
          </el-upload>
          
          <!-- 已上传的图片预览 -->
          <div class="image-preview-list">
            <div v-for="(img, index) in imageList" :key="index" class="image-preview-item">
              <img :src="img" alt="评价图片">
              <div class="image-actions">
                <i class="el-icon-delete" @click="removeImage(index)"></i>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 评价内容输入框 -->
        <div class="content-section">
          <el-input
            type="textarea"
            v-model="commentForm.content"
            :rows="4"
            placeholder="请输入您的评价内容..."
            :maxlength="200"
            show-word-limit
          ></el-input>
        </div>
  
        <!-- 星级评分 -->
        <div class="rating-section">
          <span class="rating-label">商品评分：</span>
          <el-rate
            v-model="commentForm.level"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          ></el-rate>
        </div>
  
        <!-- 提交按钮 -->
        <div class="submit-section">
          <el-button type="primary" @click="submitComment" :disabled="!canSubmit">
            提交评价
          </el-button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserComment',
    data() {
      return {
        imageList: [], // 存储图片预览URL
        pictureIds: [], // 存储后端返回的picture_id
        commentForm: {
          comment_id: null,
          user_id: null,
          order_id: null,
          content: '',
          level: 5,
          product_id: null,
          status: '待评价',
          created_time: null,
          picture_id: [] // 存储图片ID数组
        }
      }
    },
    computed: {
      canSubmit() {
        return this.commentForm.content.trim() && 
               this.commentForm.level > 0 &&
               this.commentForm.order_id &&
               this.commentForm.product_id
      }
    },
    created() {
      // 从路由参数获取订单ID和商品ID
      this.commentForm.order_id = Number(this.$route.query.orderId) || null
      this.commentForm.product_id = Number(this.$route.query.productId) || null
      this.commentForm.user_id = this.$store.getters.userId;
    },
    methods: {
      beforeUpload(file) {
        // 验证文件类型和大小
        const isImage = file.type.startsWith('image/')
        const isLt2M = file.size / 1024 / 1024 < 2
  
        if (!isImage) {
          this.$message.error('只能上传图片文件！')
          return false
        }
        if (!isLt2M) {
          this.$message.error('图片大小不能超过 2MB！')
          return false
        }
  
        if (this.imageList.length >= 5) {
          this.$message.warning('最多只能上传5张图片')
          return false
        }
  
        return true
      },
      async handleUpload(options) {
        try {
          const file = options.file;
          const formData = new FormData();
          formData.append('file', file);
          
          // 上传单张图片到后端
          const response = await this.$axios.post('http://localhost:8081/pic/uploadAndId', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (response.data) {
            // 保存后端返回的图片ID
            const pictureId = response.data;
            this.pictureIds.push(pictureId);
            this.commentForm.picture_id = this.pictureIds;
            console.log(this.commentForm.picture_id)
            // 显示图片预览
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              this.imageList.push(reader.result);
            };

            this.$message.success('图片上传成功');
          } else {
            throw new Error('上传失败');
          }
        } catch (error) {
          this.$message.error('图片上传失败，请重试');
          console.error('上传图片失败:', error);
        }
      },
      removeImage(index) {
        this.imageList.splice(index, 1);
        this.pictureIds.splice(index, 1); // 同时删除对应的pictureId
        this.commentForm.picture_id = this.pictureIds; // 更新commentForm中的picture_id数组
      },
      async submitComment() {
        if (!this.canSubmit) {
          return;
        }
  
        try {
          const commentData = {
            comment_id: null,
            user_id: this.commentForm.user_id,
            order_id: this.commentForm.order_id,
            content: this.commentForm.content.trim(),
            level: Number(this.commentForm.level),
            product_id: this.commentForm.product_id,
            status: this.commentForm.status,
            created_time: null,
            picture_id: JSON.stringify(this.commentForm.picture_id) // 将图片ID数组转换为JSON字符串
          };

          const response = await this.$axios.post('http://localhost:8081/comment/create', commentData);
          
          if (response.status === 201) {
            this.$message.success('评价提交成功！');
            this.$router.push('/user/orders');
          } else {
            throw new Error(response.data.message || '提交失败');
          }
        } catch (error) {
          this.$message.error(error.message || '评价提交失败，请重试');
          console.error('提交评价失败:', error);
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .review-container {
    padding: 40px 20px;
    background-color: #f5f5f5;
    min-height: calc(100vh - 120px);
  
    .review-card {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
      h2 {
        text-align: center;
        margin-bottom: 30px;
        font-weight: normal;
        color: #333;
      }
    }
  
    .upload-section {
      margin-bottom: 20px;
  
      .upload-box {
        width: 120px;
        height: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: border-color 0.3s;
  
        &:hover {
          border-color: #409EFF;
        }
  
        i {
          font-size: 28px;
          color: #8c939d;
          margin-bottom: 5px;
        }
  
        span {
          font-size: 14px;
          color: #8c939d;
        }
      }
  
      .image-preview-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
  
        .image-preview-item {
          position: relative;
          width: 120px;
          height: 120px;
  
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
          }
  
          .image-actions {
            position: absolute;
            top: 5px;
            right: 5px;
            
            i {
              color: #fff;
              font-size: 18px;
              cursor: pointer;
              text-shadow: 0 0 3px rgba(0,0,0,0.5);
              
              &:hover {
                color: #ff4444;
              }
            }
          }
        }
      }
    }
  
    .content-section {
      margin-bottom: 20px;
    }
  
    .rating-section {
      margin-bottom: 30px;
      display: flex;
      align-items: center;
  
      .rating-label {
        margin-right: 10px;
        color: #606266;
      }
    }
  
    .submit-section {
      text-align: center;
  
      .el-button {
        padding: 12px 40px;
      }
    }
  }
  </style>
  