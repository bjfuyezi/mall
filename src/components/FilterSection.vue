<template>
  <section class="filter-section">
    <h3>筛选条件</h3>
    <div class="filters">
      <label v-for="(status, index) in statuses" :key="index" :class="{ active: selectedStatus === status.value }">
        <input type="radio" :value="status.value" v-model="selectedStatus" @change="fetchAdsByStatus">
        {{ status.label }}
      </label>
    </div>
  </section>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FilterSection',
  data() {
    return {
      selectedStatus: 'all', // 默认选择所有状态
      statuses: [
        { label: '全部', value: 'all' },
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '进行中', value: 'inProgress' },
        { label: '被拒绝', value: 'rejected' },
        { label: '已完成', value: 'completed' }
      ]
    };
  },
  methods: {
    async fetchAdsByStatus() {
      try {
        const response = await axios.get('/api/ads', {
          params: {
            status: this.selectedStatus !== 'all' ? this.selectedStatus : null
          }
        });
        this.$emit('filterChange', response.data.ads); // 假设后端返回的数据结构是 { ads: [] }
      } catch (error) {
        console.error("There was an error fetching the ads!", error);
      }
    }
  },
  mounted() {
    this.fetchAdsByStatus(); // 页面加载时获取初始数据
  }
};
</script>

<style scoped lang="scss">
.filter-section {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 {
    margin-top: 0;
    font-size: 1.2em;
    color: #ff6700;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;

    label {
      display: inline-block;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
      border: 1px solid transparent;

      &:hover,
      &.active {
        background-color: #ff6700;
        color: #fff;
        border-color: #ff6700;
      }

      input[type="radio"] {
        display: none;
      }
    }
  }
}
</style>