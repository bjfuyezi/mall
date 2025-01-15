<template>
  <div class="shop-audit">
    <el-table :data="shopList" style="width: 100%">
      <el-table-column prop="shop_name" label="店铺名称"></el-table-column>
      <el-table-column prop="shop_description" label="店铺描述"></el-table-column>
      <el-table-column prop="location" label="所在地"></el-table-column>
      <el-table-column prop="updated_time" label="申请时间"></el-table-column>
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

    <!-- 商品详情弹窗 -->
    <el-dialog :visible.sync="dialogInfoVisible" title="店铺详情">
      <el-table :data="this.formattedProductDetails" style="width: 100%">
        <el-table-column prop="label"></el-table-column>
        <el-table-column prop="value">
          <template slot-scope="scope">
            <!-- 判断是否为商品图片 -->
            <template v-if="scope.row.label === '许可证'">
              <img :src="'http://localhost:8081'+scope.row.value" alt="商品图片" style="width: 50px; height: 50px; object-fit: cover;" />
            </template>
            <!-- 显示其他字段 -->
            <template v-else>
              <span>{{ scope.row.value }}</span>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogInfoVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';  // 暂时注释掉未使用的导入

export default {
  name: 'ShopAuditView',
  data() {
    return {
      formattedProductDetails:[],   // 用于展示详情和修改
      dialogInfoVisible: false,     // 详情弹窗
      shopList: [],
      rejectDialogVisible: false,
      rejectReason: '',
      currentShop: null
    }
  },
  methods: {
    async viewDetails(product) {
      let pictures = '';
      // 查images的url
      const imageResponse = await axios.post('http://localhost:8081/pic/getUrl', {id:product.picture_id});
      if ( imageResponse.data != null ) {
        pictures = imageResponse.data;
      }
      // 格式化商品详情数据，适配弹窗中表格的展示
      this.formattedProductDetails = [
        { label: '店铺名称', value: product.shop_name },
        { label: '店铺描述', value: product.shop_description},
        { label: '创建时间', value: product.created_time },
        { label: '更新时间', value: product.updated_time },
        { label: '店铺等级', value: product.level },
        { label: '许可证', value: pictures },
        { label: '特产地', value: product.location }
      ];

      // 打开弹窗
      this.dialogInfoVisible = true;
    },
    // eslint-disable-next-line no-unused-vars
    async approveShop(shop) {
      const proAddResponse = await axios.post('http://localhost:8081/shop/status',{id:shop.shop_id, status:"closed"});
      const userAddResponse = await axios.post('http://localhost:8081/users/updateStatus',{id:shop.user_id, role:"seller"});
      if ( proAddResponse.status === 200 && userAddResponse.status === 200 ) {
        alert('已通过审核');
        window.location.reload();
      }
    },
    rejectShop(shop) {
      this.currentShop = shop;
      this.rejectDialogVisible = true;
    },
    async confirmReject() {
      const proAddResponse = await axios.post('http://localhost:8081/shop/insertReason',{id:this.currentShop.shop_id, status:"suspended", reason:this.rejectReason});
      if ( proAddResponse.status === 200) {
        alert('已驳回申请');
        window.location.reload();
      }
      this.rejectDialogVisible = false;
    }
  },
  async created() {
    const proAddResponse = await axios.post('http://localhost:8081/shop/',{});
    if ( proAddResponse.data != null) {
      this.shopList = proAddResponse.data.filter(product => product.status === 'waiting');
    }
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