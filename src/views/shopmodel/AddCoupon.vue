<template>
  <div class="create-coupon">
    <h2>商家发布优惠券</h2>
    <el-form ref="couponForm" :model="coupon" :rules="rules" label-width="120px">
      <!-- 有效期 -->
      <el-form-item label="有效期" prop="date_range">
        <el-date-picker
            v-model="coupon.date_range"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"

        ></el-date-picker>
      </el-form-item><!-- @change="handleDateRangeChange"-->

      <!-- 商品选择 -->
      <el-form-item label="适用商品" prop="selectedProducts">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;"></div>
        <el-checkbox-group v-model="selectedProducts" @change="handleCheckedProductsChange">
          <el-checkbox
              v-for="product in products"
              :key="product.product_id"
              :label="product.product_id"
          >{{ product.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 满足金额 -->
      <el-form-item label="满足金额" prop="request">
        <el-input-number v-model="coupon.request" :min="0" :step="0.01" :precision="2" label="请输入满足金额"></el-input-number>
      </el-form-item>

      <!-- 减免金额 -->
      <el-form-item label="减免金额" prop="off">
        <el-input-number v-model="coupon.off" :min="0" :step="0.01" :precision="2" label="请输入减免金额"></el-input-number>
      </el-form-item>

      <!-- 发行总量 -->
      <el-form-item label="发行总量" prop="total">
        <el-input-number v-model="coupon.total" :min="0" label="请输入发行总量"></el-input-number>
      </el-form-item>

      <!-- 领取限制 -->
      <el-form-item label="领取限制" prop="claim_limit">
        <el-input-number v-model="coupon.claim_limit" :min="0" label="请输入领取限制"></el-input-number>
      </el-form-item>

      <!-- 最大未使用数量 -->
      <el-form-item label="最大未使用数量" prop="max_unused_count">
        <el-input-number v-model="coupon.max_unused_count" :min="0" label="请输入最大未使用数量"></el-input-number>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitCouponForm">确 定</el-button>
    </span>
  </div>
</template>

<script>
import axios from 'axios';
import moment from "moment";

export default {
  data() {
    return {
      shop_id:null,
      user_id:null,
      products: [], // 存储商店的所有商品
      selectedProducts: [], // 选中的商品ID
      checkAll: false,
      isIndeterminate: true,
      coupon: {
        coupon_type: "shop",
        start_time: "",
        end_time: "",
        scope: "[]",
        date_range: [new Date(2025, 0, 16, 0, 0), new Date(2025, 1, 6, 0, 0)],
        request: 100.00,
        off: 20.00,
        total: 999999999,
        claim_limit: 5,
        max_unused_count: 3,
      },
      rules: {
        date_range: [{ required: true, message: "请选择有效期", trigger: "change" }],
        // selectedProducts: [
        //   { required: true, message: "至少选择一个商品", trigger: "change" },
        //   { type: 'array', min: 1, message: "至少选择一个商品", trigger: "blur" }
        // ],
        // selectedProducts: [{ required: true, message: "至少选择一个商品", trigger: "change" }],
        request: [{ required: true, message: "请输入满足金额", trigger: "blur" }],
        off: [{ required: true, message: "请输入减免金额", trigger: "blur" }],
        total: [{ required: true, message: "请输入发行总量", trigger: "blur" }],
        claim_limit: [{ required: true, message: "请输入领取限制", trigger: "blur" }],
        max_unused_count: [{ required: true, message: "请输入最大未使用数量", trigger: "blur" }]
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '未来一周',
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '未来一个月',
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '未来三个月',
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      }
    };
  },
  created() {

    console.log("用户ID:", this.user_id);
    this.fetchShopIdByUserId();
    // this.fetchProductsByShopId();
    this.user_id = this.$store.getters.userId;
  },
  methods: {
    async fetchShopIdByUserId() {
      try {
        this.user_id = this.$store.getters.userId;
        const shopResponse = await axios.post('http://localhost:8081/shop/getByUser_id', { id: this.user_id });
        if (shopResponse.data != null) {
          this.shop_id = shopResponse.data.shop_id;
          console.log("get:"+this.shop_id);
          console.log("店铺ID:", this.shop_id);
          try {
            const response = await axios.post('http://localhost:8081/product/getAllByShop_id', { id: this.shop_id });
            if (response.data) {
              this.products = response.data;
              console.log("商品列表:", this.products);
            } else {
              this.$message.warning('该店铺下没有商品');
            }
          } catch (error) {
            this.$message.error('获取商品信息失败: ' + error.response.data);
          }
        }
      } catch (error) {
        this.$message.error('获取店铺信息失败: ' + error.response.data);
      }
    },
    async fetchProductsByShopId() {
      try {
        console.log(this.shop_id);
        const response = await axios.post('http://localhost:8081/product/getAllByShop_id', { id: this.shop_id });
        if (response.data) {
          this.products = response.data;
          console.log("商品列表:", this.products);
        } else {
          this.$message.warning('该店铺下没有商品');
        }
      } catch (error) {
        this.$message.error('获取商品信息失败: ' + error.response.data);
      }
    },
    handleCheckAllChange(val) {
      this.coupon.selectedProducts = val ? this.products.map(p => p.product_id) : [];
      this.isIndeterminate = val ? false : (this.selectedProducts.length > 0 && this.selectedProducts.length < this.products.length);
    },
    handleCheckedProductsChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.products.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.products.length;
      console.log('products:', this.products);
      console.log('selectedProducts:', this.selectedProducts);
      console.log('checkAll:', this.checkAll);
      console.log('isIndeterminate:', this.isIndeterminate);
    },
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        const [start, end] = value;
        this.coupon.date_range = [moment(start).format('yyyy-MM-dd HH:mm:ss'), moment(end).format('yyyy-MM-dd HH:mm:ss')];
      }
    },
    async submitCouponForm() {
      this.$refs.couponForm.validate(async (valid) => {
        if (valid) {
          try {
            // 分解日期范围
            const [start, end] = this.coupon.date_range;
            const couponData = {
              "coupon_type": "shop",
              "start_time": moment(start).format('YYYY-MM-DD HH:mm:ss'),
              "end_time": moment(end).format('YYYY-MM-DD HH:mm:ss'),
              "scope": JSON.stringify(this.selectedProducts),
              "request": parseFloat(this.coupon.request),
              "off": parseFloat(this.coupon.off),
              "total": this.coupon.total,
              "claim_limit": this.coupon.claim_limit,
              "max_unused_count":this.coupon.max_unused_count,
              "shop_id":this.shop_id
            };

            const response = await axios.post('http://localhost:8081/coupon/create', couponData);
            if (response.status === 200) {
              this.$message.success('优惠券发布成功');
              // 关闭弹窗啥的
              this.$emit('close');
            } else {
              this.$message.error(response.data);
            }
          } catch (error) {
            // console.error('发布优惠券失败:', error);
            this.$message.error(error.response.data);
          }
        } else {
          this.$message.error('表单验证失败，请检查输入');
        }
      });
    },
  }
};
</script>

<style scoped>
.create-coupon {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.coupon-form {
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

input, select {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
</style>