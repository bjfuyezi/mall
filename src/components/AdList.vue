<template>
  <div class="ad-list-container">
    <div v-if="loading" class="loading">加载中...</div>
    <ul v-else-if="ads.length > 0" class="ad-list">
      <li v-for="(ad, index) in ads" :key="index" class="ad-item"  @click="emitViewAdDetails(ad)">
        <div class="ad-row">
          <span class="ad-name">{{ ad.name }}</span>
          <span class="ad-type">{{ ad.advertisement_type === 'shop' ? '店铺推广' : '商品推广' }}</span>
          <span class="ad-name">{{ ad.advertisement_type === 'shop' ? ad.shop_name : ad.product_name }}</span>
          <span class="ad-time">{{ formatDate(ad.start_time) }}———{{ formatDate(ad.end_time) }}</span>
          <strong class="ad-price">{{ ad.price }}</strong>
          <span :class="['ad-status', statusClass(ad.status)]">{{ statusLabel(ad.status)  }}</span>
        </div>
        <div class="ad-actions">
          <button @click="handleAction(ad)">修改信息</button>
           <button @click="handleAction(ad)">查看信息</button>
        </div>
      </li>
    </ul>
    <div v-else class="no-ads">没有找到符合条件的广告。</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdList',
  props: {
    statusFilter: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      ads: [],
      loading: true,
       statuses: [
        { value: 'pending', label: '待审核' },
        { value: 'approved', label: '已通过' },
        { value: 'running', label: '进行中' },
        { value: 'rejected', label: '被打回' },
        { value: 'expired', label: '已到期' }
      ]
    };
  },
  watch: {
    statusFilter: {
      immediate: true,
      handler(newVal) {
        this.fetchAdsByStatus(newVal);
      }
    }
  },
  methods: {
    statusLabel(i_status) {
      const status = this.statuses.find(s => s.value === i_status);
      return status ? status.label : i_status; // 如果没有找到匹配项，则显示原始状态值
    },
    async fetchAdsByStatus(status) {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8081/advertise/', {
          params: {
            status: status !== 'all' ? status : null
          }
        });
        console.log(response)
        this.ads = response.data; 
        console.log(response)
      } catch (error) {
        console.error("There was an error fetching the ads!", error);
      } finally {
        this.loading = false;
      }
    },
    handleAction(ad) {
      // 这里可以添加处理广告的操作逻辑，比如编辑、删除等。
      console.log('执行对广告的操作:', ad);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },emitViewAdDetails(ad) {
      this.$emit('viewAdDetails', ad); // 发出 viewAdDetails 事件
    },
    statusClass(status) {
      // 将英文状态转换为小写并移除空格作为类名
      return status.toLowerCase().replace(/\s+/g, '');
    }
  }
};
</script>

<style scoped lang="scss">
.ad-list-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading,
.no-ads {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.ad-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ad-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 0;
}

.ad-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  width: 100%;
}

.ad-row span,
.ad-row strong {
  flex: 1 1 auto;
  text-align: left;
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-row .ad-price {
  flex: 0 0 100px; /* 固定宽度 */
  font-size: 1.2em;
  font-weight: bold;
  color: #ff6700;
}

/* 如果需要更细粒度控制每列宽度，可以为每个 span 添加具体宽度 */
.ad-row .ad-type {
  flex: 0 0 100px;
}

.ad-row .ad-name {
  flex: 1 1 100px;
}

.ad-row .ad-time {
  flex: 0 0 300px;

}

.ad-row .ad-status {
  flex: 0 0 100px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 0.5rem;
  transition: background-color 0.3s ease;

  &[disabled] {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

/* 不同状态的颜色 */
.ad-status.rejected {
  background-color: #d9534f;
}
.ad-status.pending {
  background-color: #f0ad4e;
}
.ad-status.approved {
  background-color: #5cb85c;
}
.ad-status.inProgress {
  background-color: #5bc0de;
}
.ad-status.completed {
  background-color: #555;
  color: #fff; /* 确保文本可见 */
}

.ad-actions {
button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;
    background-color: #ff6700;
    transition: background-color 0.3s ease;

    &:hover {
    background-color: darken(#ff6700, 10%);
    }
}
}
</style>