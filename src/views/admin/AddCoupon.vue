<template>
  <div class="create-coupon">
    <h2>平台发布优惠券</h2>
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
      coupon: {
        coupon_type: "platform",
        start_time: "",
        end_time: "",
        scope: "[]",
        date_range: [new Date(2025, 0, 16, 0, 0), new Date(2025, 1, 6, 0, 0)],
        request: 100.00,
        off: 20.00,
        total: 999999999,
        claim_limit: 5,
        max_unused_count: 3,
        shop_id: null,
      },
      rules: {
        date_range: [{ required: true, message: "请选择有效期", trigger: "change" }],
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
  methods: {
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
              "coupon_type": "platform",
              "start_time": moment(start).format('YYYY-MM-DD HH:mm:ss'),
              "end_time": moment(end).format('YYYY-MM-DD HH:mm:ss'),
              "scope": "[]",
              "request": parseFloat(this.coupon.request),
              "off": parseFloat(this.coupon.off),
              "total": this.coupon.total,
              "claim_limit": this.coupon.claim_limit,
              "max_unused_count":this.coupon.max_unused_count,
              "shop_id":null
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