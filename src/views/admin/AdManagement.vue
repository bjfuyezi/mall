<template>
  <div class="ad-management">
    <h2>广告管理</h2>
    <el-button type="primary" @click="showAddAdDialog">发布广告</el-button>
    
    <el-table :data="ads" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="广告标题"></el-table-column>
      <el-table-column prop="status" label="状态"></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button @click="editAd(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteAd(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="发布广告" :visible.sync="addAdDialog">
      <el-form :model="newAd">
        <el-form-item label="广告标题">
          <el-input v-model="newAd.title"></el-input>
        </el-form-item>
        <el-form-item label="广告内容">
          <el-input v-model="newAd.content"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAdDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitAd">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ads: [], // 广告列表
      addAdDialog: false,
      newAd: {
        title: '',
        content: ''
      }
    };
  },
  methods: {
    showAddAdDialog() {
      this.addAdDialog = true;
    },
    submitAd() {
      // 提交广告逻辑
      this.addAdDialog = false;
    },
    editAd(ad) {
      // 编辑广告逻辑
      console.log('Editing ad:', ad); // 使用 ad 变量
    },
    deleteAd(adId) {
      // 删除广告逻辑
      console.log('Deleting ad with ID:', adId); // 使用 adId 变量
    },
    fetchAds() {
      // 获取广告列表
      // 这里可以调用 API 获取广告列表
      // 示例数据
      this.ads = [
        { id: 1, title: '春季促销', status: 'active' },
        { id: 2, title: '夏季特惠', status: 'inactive' }
      ];
    }
  },
  mounted() {
    this.fetchAds(); // 获取广告列表
  }
}
</script>

<style scoped>
.ad-management {
  padding: 20px;
}
</style> 