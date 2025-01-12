<template>
  <div class="user-comments-container">
    <div class="user-comments-page">
      <div class="comments-container">
        <h2>我的评价</h2>
        
        <!-- 评价列表 -->
        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.comment_id" class="comment-item">
            <div class="comment-header">
              <div class="comment-info">
                <span class="comment-date">{{ new Date(comment.created_time).toLocaleString() }}</span>
              </div>
              <div class="comment-rating">
                <el-rate
                  v-model="comment.level"
                  disabled
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                ></el-rate>
              </div>
            </div>

            <div class="comment-content">
              <div class="product-info">
                <img :src="comment.product_image" :alt="comment.product_name">
                <div class="product-detail">
                  <h4>{{ comment.product_name }}</h4>
                  <p class="price">¥{{ comment.product_price }}</p>
                </div>
              </div>
              
              <div class="comment-text">
                {{ comment.content }}
              </div>

              <!-- 评价图片 -->
              <div class="comment-images" v-if="comment.picture_urls && comment.picture_urls.length">
                <img 
                  v-for="(url, index) in comment.picture_urls" 
                  :key="index" 
                  :src="url" 
                  @click="previewImage(url)"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="comments.length === 0" class="empty-state">
          <i class="el-icon-chat-dot-square"></i>
          <p>暂无评价记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCommentList',
  data() {
    return {
      comments: []
    }
  },
  created() {
    this.fetchComments();
  },
  methods: {
    async fetchComments() {
      try {
        const response = await this.$axios.post('http://localhost:8081/comment/getCommentByUserId', {
          user_id: this.$store.getters.userId
        });
        
        if (response.data) {
          this.comments = response.data;
        }
      } catch (error) {
        this.$message.error('获取评价列表失败');
        console.error('获取评价列表失败:', error);
      }
    },
    previewImage(url) {
      // 图片预览
      this.$imagePreview({
        images: [url],
        index: 0
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.user-comments-container {
  width: 100%;
}

.user-comments-page {
  background-color: #f5f5f5;
  padding: 20px 0;
  min-height: calc(100vh - 120px);
}

.comments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: normal;
  }
}

.comment-list {
  .comment-item {
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;

    .comment-header {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .comment-date {
        color: #999;
      }
    }

    .comment-content {
      padding: 20px;

      .product-info {
        display: flex;
        gap: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-detail {
          h4 {
            margin: 0 0 10px;
            font-size: 16px;
          }

          .price {
            color: #ff6700;
            font-weight: bold;
          }
        }
      }

      .comment-text {
        padding: 15px 0;
        color: #333;
        line-height: 1.6;
      }

      .comment-images {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.3s;

          &:hover {
            opacity: 0.8;
          }
        }
      }
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
</style> 