<template>
  <div class="coupon-management">
    <h2>优惠券管理</h2>
    <el-table :data="coupons" style="width: 100%">
      <el-table-column prop="id" label="优惠券ID" width="80"></el-table-column>
      <el-table-column prop="name" label="优惠券名称"></el-table-column>
      <el-table-column prop="discount" label="折扣"></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button @click="editCoupon(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteCoupon(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      coupons: [] // 优惠券列表
    };
  },
  methods: {
    fetchCoupons() {
      axios.get('http://localhost:8081/coupon/list')
        .then(response => {
          this.coupons = response.data; // 使用 response
        })
        .catch(error => {
          console.error('Error fetching coupons:', error);
        });
    },
    editCoupon(coupon) {
      console.log('Editing coupon:', coupon); // 使用 coupon
    },
    deleteCoupon(couponId) {
      axios.delete(`http://localhost:8081/coupon/delete/${couponId}`)
        .then(response => {
          console.log('Delete response:', response); // 使用 response
          this.fetchCoupons(); // 刷新优惠券列表
        })
        .catch(error => {
          console.error('Error deleting coupon:', error);
        });
    }
  },
  mounted() {
    this.fetchCoupons(); // 获取优惠券列表
  }
}
</script>

<style scoped>
.coupon-management {
  padding: 20px;
}
</style> 