<template>
  <div class="address-list">
    <el-card>
      <div slot="header" class="header">
        <span>收货地址</span>
        <el-button type="primary" size="small" @click="showAddDialog">添加新地址</el-button>
      </div>

      <el-table :data="addresses" style="width: 100%">
        <el-table-column prop="addressContent" label="详细地址"></el-table-column>
        <el-table-column prop="province" label="省份"></el-table-column>
        <el-table-column prop="phone" label="联系电话"></el-table-column>
        <el-table-column label="默认地址" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isDefault === 1" type="success">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除</el-button>
            <el-button
              v-if="scope.row.isDefault !== 1"
              size="mini"
              type="success"
              @click="setDefault(scope.row)">设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑地址对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="addressForm" :rules="rules" ref="addressForm" label-width="100px">
        <el-form-item label="详细地址" prop="addressContent">
          <el-input v-model="addressForm.addressContent"></el-input>
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="addressForm.province"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="addressForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'UserAddress',
  data() {
    return {
      addresses: [],
      dialogVisible: false,
      dialogTitle: '添加新地址',
      addressForm: {
        addressContent: '',
        province: '',
        phone: '',
        isDefault: 0
      },
      isEdit: false,
      rules: {
        addressContent: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        province: [
          { required: true, message: '请输入省份', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user
    }),
    ...mapGetters(['userId'])
  },
  methods: {
    async loadAddresses() {
      try {
        const response = await fetch(`http://localhost:8081/addresses/user/${this.userId}`);
        const data = await response.json();
        if (data.status === 'success') {
          this.addresses = data.data;
        }
      } catch (error) {
        this.$message.error('获取地址列表失败');
      }
    },
    showAddDialog() {
      this.isEdit = false;
      this.dialogTitle = '添加新地址';
      this.addressForm = {
        addressContent: '',
        province: '',
        phone: '',
        isDefault: 0
      };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.isEdit = true;
      this.dialogTitle = '编辑地址';
      this.addressForm = { ...row };
      this.dialogVisible = true;
    },
    async handleDelete(row) {
      try {
        const response = await fetch(`http://localhost:8081/addresses/delete/${row.addressId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.status === 'success') {
          this.$message.success('删除成功');
          this.loadAddresses();
        } else {
          this.$message.error(data.message || '删除失败');
        }
      } catch (error) {
        this.$message.error('删除失败');
      }
    },
    async setDefault(row) {
      try {
        const response = await fetch(`http://localhost:8081/addresses/default/${row.addressId}?userId=${this.userId}`, {
          method: 'PUT'
        });
        const data = await response.json();
        if (data.status === 'success') {
          this.$message.success('设置成功');
          this.loadAddresses();
        } else {
          this.$message.error(data.message || '设置失败');
        }
      } catch (error) {
        this.$message.error('设置失败');
      }
    },
    async submitForm() {
      this.$refs.addressForm.validate(async (valid) => {
        if (valid) {
          try {
            const url = this.isEdit ? 'http://localhost:8081/addresses/update' : 'http://localhost:8081/addresses/add';
            const method = this.isEdit ? 'PUT' : 'POST';
            
            if (!this.isEdit) {
              this.addressForm.userId = this.userId;
            }

            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(this.addressForm)
            });
            
            const data = await response.json();
            if (data.status === 'success') {
              this.$message.success(this.isEdit ? '更新成功' : '添加成功');
              this.dialogVisible = false;
              this.loadAddresses();
            } else {
              this.$message.error(data.message || (this.isEdit ? '更新失败' : '添加失败'));
            }
          } catch (error) {
            this.$message.error(this.isEdit ? '更新失败' : '添加失败');
          }
        }
      });
    }
  },
  created() {
    this.loadAddresses();
  }
}
</script>

<style scoped>
.address-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style> 