<template>
  <div class="ad-management">
    <header>
      <button @click="toggleAddAdModal" class="add-ad-btn">添加广告</button>
    </header>

    <!-- 添加广告的弹窗 -->
    <transition name="modal-fade">
      <div v-if="showAddAdModal" class="modal-overlay" @click.self="closeAddAdModal">
        <div class="modal-container">
          <AddAdForm @close="closeAddAdModal" @adAdded="handleAdAdded"></AddAdForm>
        </div>
      </div>
    </transition>

<section class="filters">
      <div>
        <div class="radio-group">
          <label v-for="(status, index) in statuses" :key="index">
            <input
              type="radio"
              :id="status.value"
              :value="status.value"
              v-model="statusFilter"
              name="statusFilter"
            />
            {{ status.label }}
          </label>
        </div>
      </div>
    </section>


    <AdList :statusFilter="statusFilter" @viewAdDetails="viewAdDetails"></AdList>

    <transition name="modal-fade">
      <AdDetailsModal
        v-if="selectedAd"
        :show="!!selectedAd"
        :ad="selectedAd"
        @close="closeAdDetails"
      ></AdDetailsModal>
    </transition>
  </div>
</template>
<script>
import AdList from '../../components/AdList.vue';
import AddAdForm from '../../components/AddAdForm.vue';
import AdDetailsModal from '../../components/AdDetailsModal.vue';

export default {
  name: 'promotion-management',
  components: {
    AddAdForm,
    AdList,
    AdDetailsModal
  },
  data() {
    return {
      showAddAdModal: false, 
      statusFilter: 'all',
      selectedAd: null,
      // 定义可用的状态选项
      statuses: [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '待审核' },
        { value: 'approved', label: '已通过' },
        { value: 'inProgress', label: '进行中' },
        { value: 'rejected', label: '被拒绝' },
        { value: 'completed', label: '已完成' }
      ]
    };
  },
  methods: {
    toggleAddAdModal() {
      this.showAddAdModal = !this.showAddAdModal;
    },
    handleAdAdded() {
      this.closeAddAdModal();
      this.$nextTick(() => {
        // 刷新广告列表的逻辑...
      });
    },
    closeAddAdModal() {
      this.showAddAdModal = false;
    },
    viewAdDetails(ad) {
      this.selectedAd = ad;
    },
    closeAdDetails() {
      this.selectedAd = null;
    }
  }
};
</script>
<style scoped lang="scss">
.ad-management {
  padding: 20px;
  background-color: #f7f7f7;
  min-height: 100vh;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      font-size: 2em;
      color: #ff6700;
    }

    .add-ad-btn {
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

  .filters {
  margin-bottom: 1rem;

  .radio-group {
    display: flex;
    flex-wrap: wrap;

    label {
      display: flex;
      align-items: center;
      margin-right: 1rem;
      margin-bottom: 0.5rem;
      font-weight: normal;

      input[type="radio"] {
        margin-right: 0.5rem;
      }
    }
  }

  strong {
    font-weight: bold;
    margin-right: 0.5rem;
  }
}

  .form-fade-enter-active, .form-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .form-fade-enter, .form-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
  
}
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 500px;
    padding: 20px;
    overflow: hidden;
    position: relative;

    h2 {
      margin-top: 0;
      font-size: 1.5em;
      color: #ff6700;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
    }
  }

  .modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-fade-enter, .modal-fade-leave-to {
    opacity: 0;
  }

</style>