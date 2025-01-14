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
                <span class="order-id">订单号：{{ comment.order_id }}</span>
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
                <img :src="`http://localhost:8081${comment.product_firimg}`" :alt="comment.product_name">
                <div class="product-detail">
                  <h4>{{ comment.product_name }}</h4>
                  <p class="price">¥{{ comment.product_price }}</p>
                </div>
              </div>
              
              <div class="comment-text">
                {{ comment.content }}
              </div>

              <!-- 评价图片 -->
              <div class="comment-images" v-if="comment.imgList && comment.imgList.length">
                <img 
                  v-for="(url, index) in comment.imgList" 
                  :key="index" 
                  :src="`http://localhost:8081${url}`"
                  @click="previewImage(`http://localhost:8081${url}`)"
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
        const userid = this.$store.getters.userId;
        const response = await this.$axios.post('http://localhost:8081/comment/getCommentVo', {
          user_id: userid
        });
        
        if (response.data) {
          this.comments = response.data;
          // 处理日期格式
          this.comments.forEach(comment => {
            if (comment.created_time) {
              comment.created_time = new Date(comment.created_time).toLocaleString();
            }
          });
        }
      } catch (error) {
        this.$message.error('获取评价列表失败');
        console.error('获取评价列表失败:', error);
      }
    },
    previewImage(url) {
      // 图片预览
      this.$alert(`<img src="${url}" style="max-width: 100%;">`, '图片预览', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
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

      .comment-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .order-id {
          color: #666;
          font-weight: bold;
        }

        .comment-date {
          color: #999;
        }
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