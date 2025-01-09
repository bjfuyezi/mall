<template>
  <div class="shop-audit">
    <el-table :data="shopList" style="width: 100%">
      <el-table-column prop="shop_name" label="店铺名称"></el-table-column>
      <el-table-column prop="shop_description" label="店铺描述"></el-table-column>
      <el-table-column prop="location" label="所在地"></el-table-column>
      <el-table-column prop="created_time" label="申请时间"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewDetails(scope.row)">查看详情</el-button>
          <el-button size="mini" type="success" @click="approveShop(scope.row)">通过</el-button>
          <el-button size="mini" type="danger" @click="rejectShop(scope.row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 驳回原因对话框 -->
    <el-dialog title="驳回原因" :visible.sync="rejectDialogVisible" width="30%">
      <el-input
        type="textarea"
        :rows="4"
        placeholder="请输入驳回原因"
        v-model="rejectReason">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReject">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import axios from 'axios';  // 暂时注释掉未使用的导入

export default {
  name: 'ShopAuditView',
  data() {
    return {
      shopList: [],
      rejectDialogVisible: false,
      rejectReason: '',
      currentShop: null
    }
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    viewDetails(shop) {
      // TODO: 实现查看详情功能
      console.log('查看店铺详情:', shop.shop_name);
    },
    // eslint-disable-next-line no-unused-vars
    approveShop(shop) {
      // TODO: 实现审核通过功能
      console.log('通过店铺审核:', shop.shop_name);
    },
    rejectShop(shop) {
      console.log('准备驳回店铺:', shop.shop_name);
      this.currentShop = shop;
      this.rejectDialogVisible = true;
    },
    confirmReject() {
      // TODO: 实现驳回功能
      console.log('驳回店铺:', this.currentShop.shop_name, '原因:', this.rejectReason);
      this.rejectDialogVisible = false;
    }
  },
  created() {
    // TODO: 获取待审核店铺列表
    this.shopList = []; // 暂时使用空数组
  }
}
</script>

<style lang="scss" scoped>
.shop-audit {
  .el-table {
    margin-top: 20px;
  }
}
</style> 