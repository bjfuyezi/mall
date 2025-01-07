<template>
  <div class="product-audit">
    <el-table :data="productList" style="width: 100%">
      <el-table-column prop="name" label="商品名称"></el-table-column>
      <el-table-column prop="shop_name" label="所属店铺"></el-table-column>
      <el-table-column prop="price" label="价格"></el-table-column>
      <el-table-column prop="category" label="类别"></el-table-column>
      <el-table-column prop="created_time" label="申请时间"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewDetails(scope.row)">查看详情</el-button>
          <el-button size="mini" type="success" @click="approveProduct(scope.row)">通过</el-button>
          <el-button size="mini" type="danger" @click="rejectProduct(scope.row)">驳回</el-button>
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
  name: 'ProductAuditView',
  data() {
    return {
      productList: [],
      rejectDialogVisible: false,
      rejectReason: '',
      currentProduct: null
    }
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    viewDetails(product) {
      // TODO: 实现查看详情功能
      console.log('查看商品详情:', product.name);
    },
    // eslint-disable-next-line no-unused-vars
    approveProduct(product) {
      // TODO: 实现审核通过功能
      console.log('通过商品审核:', product.name);
    },
    rejectProduct(product) {
      console.log('准备驳回商品:', product.name);
      this.currentProduct = product;
      this.rejectDialogVisible = true;
    },
    confirmReject() {
      // TODO: 实现驳回功能
      console.log('驳回商品:', this.currentProduct.name, '原因:', this.rejectReason);
      this.rejectDialogVisible = false;
    }
  },
  created() {
    // TODO: 获取待审核商品列表
    this.productList = []; // 暂时使用空数组
  }
}
</script>

<style lang="scss" scoped>
.product-audit {
  .el-table {
    margin-top: 20px;
  }
}
</style> 