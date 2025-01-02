<template>
  <div class="address-management">
    <div class="address-container">
      <h2>收货地址管理</h2>
      
      <el-button type="primary" @click="showAddressDialog(null)">新增地址</el-button>
      
      <div class="address-list">
        <el-card v-for="address in addresses" :key="address.address_id" class="address-item">
          <div class="address-content">
            <div class="address-info">
              <p>{{ address.province }}</p>
              <p>{{ address.address_content }}</p>
              <p>电话：{{ address.phone }}</p>
            </div>
            <div class="address-actions">
              <el-button type="text" @click="showAddressDialog(address)">编辑</el-button>
              <el-button type="text" @click="deleteAddress(address.address_id)">删除</el-button>
              <el-button 
                type="text" 
                v-if="!address.is_default"
                @click="setDefaultAddress(address.address_id)"
              >设为默认</el-button>
              <el-tag v-else type="success">默认地址</el-tag>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 地址编辑对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="addressForm" :rules="rules" ref="addressForm" label-width="100px">
          <el-form-item label="省份" prop="province">
            <el-input v-model="addressForm.province"></el-input>
          </el-form-item>
          
          <el-form-item label="详细地址" prop="address_content">
            <el-input type="textarea" v-model="addressForm.address_content"></el-input>
          </el-form-item>
          
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="addressForm.phone"></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="addressForm.is_default">设为默认地址</el-checkbox>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddress">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserAddress',
  data() {
    return {
      addresses: [],
      dialogVisible: false,
      dialogTitle: '新增地址',
      addressForm: {
        province: '',
        address_content: '',
        phone: '',
        is_default: false
      },
      rules: {
        province: [
          { required: true, message: '请输入省份', trigger: 'blur' }
        ],
        address_content: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created() {
    this.getAddresses();
  },
  methods: {
    getAddresses() {
      this.$axios.get(`http://localhost:8081/users/addresses/${this.currentUser.username}`)
        .then(response => {
          if (response.data.status === 'success') {
            this.addresses = response.data.data;
          }
        })
        .catch(error => {
          this.$message.error('获取地址列表失败：' + error.message);
        });
    },
    showAddressDialog(address) {
      this.dialogTitle = address ? '编辑地址' : '新增地址';
      this.addressForm = address ? {...address} : {
        province: '',
        address_content: '',
        phone: '',
        is_default: false
      };
      this.dialogVisible = true;
    },
    submitAddress() {
      this.$refs.addressForm.validate(valid => {
        if (valid) {
          const url = this.addressForm.address_id ? 
            'http://localhost:8081/users/address/update' : 
            'http://localhost:8081/users/address/add';
          
          const method = this.addressForm.address_id ? 'put' : 'post';
          
          this.$axios[method](url, {
            ...this.addressForm,
            username: this.currentUser.username
          })
            .then(response => {
              if (response.data.status === 'success') {
                this.$message.success('保存成功');
                this.dialogVisible = false;
                this.getAddresses();
              }
            })
            .catch(error => {
              this.$message.error('保存失败：' + error.message);
            });
        }
      });
    },
    deleteAddress(addressId) {
      this.$confirm('确认删除该地址吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$axios.delete(`http://localhost:8081/users/address/delete/${addressId}`)
          .then(response => {
            if (response.data.status === 'success') {
              this.$message.success('删除成功');
              this.getAddresses();
            }
          })
          .catch(error => {
            this.$message.error('删除失败：' + error.message);
          });
      });
    },
    setDefaultAddress(addressId) {
      this.$axios.put(`http://localhost:8081/users/address/default/${addressId}`)
        .then(response => {
          if (response.data.status === 'success') {
            this.$message.success('设置默认地址成功');
            this.getAddresses();
          }
        })
        .catch(error => {
          this.$message.error('设置失败：' + error.message);
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.address-management {
  padding: 20px;
  
  .address-container {
    max-width: 1200px;
    margin: 0 auto;
    
    h2 {
      margin-bottom: 20px;
    }
  }
  
  .address-list {
    margin-top: 20px;
    
    .address-item {
      margin-bottom: 15px;
      
      .address-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .address-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style> 