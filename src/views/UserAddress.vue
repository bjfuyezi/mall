<template>
  <div class="address-list">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <div class="header-left">
          <el-button icon="el-icon-arrow-left" type="text" @click="goBack">返回</el-button>
          <span class="title">收货地址</span>
        </div>
        <el-button type="primary" size="small" @click="showAddDialog">
          <i class="el-icon-plus"></i> 新增地址
        </el-button>
      </div>

      <div class="address-items">
        <el-row :gutter="20">
          <el-col :span="24" v-for="address in addresses" :key="address.addressId">
            <el-card shadow="hover" class="address-item">
              <div class="address-content">
                <div class="address-main">
                  <div class="location" v-if="address.addressContent">
                    <i class="el-icon-location"></i>
                    {{ address.province }} {{ address.addressContent }}
                  </div>
                  <div class="phone" v-if="address.phone">
                    <i class="el-icon-phone"></i>
                    {{ address.phone }}
                  </div>
                </div>
                <div class="address-tags">
                  <el-tag v-if="address.isDefault === 1" type="success" size="small">默认地址</el-tag>
                </div>
              </div>
              <div class="address-actions">
                <el-button type="text" @click="handleEdit(address)">编辑</el-button>
                <el-button type="text" @click="handleDelete(address)" class="delete-btn">删除</el-button>
                <el-button 
                  v-if="address.isDefault !== 1"
                  type="text" 
                  @click="setDefault(address)">
                  设为默认
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 添加/编辑地址对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="addressForm" :rules="rules" ref="addressForm" label-width="100px">
        <el-form-item label="详细地址" prop="addressContent">
          <el-input v-model="addressForm.addressContent" 
                    type="textarea" 
                    :rows="2"
                    placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元等">
          </el-input>
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="addressForm.province" placeholder="请输入省份"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码"></el-input>
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
        addressId: null,
        userId: null,
        addressContent: '',
        province: '',
        phone: '',
        isDefault: 0
      },
      isEdit: false,
      rules: {
        addressContent: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 5, message: '地址长度至少5个字符', trigger: 'blur' }
        ],
        province: [
          { required: true, message: '请输入省份', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
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
        console.log('Loading addresses for userId:', this.userId);
        const response = await fetch(`http://localhost:8081/addresses/user/${this.userId}`);
        const data = await response.json();
        console.log('Received addresses data:', data);
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          this.addresses = data.data;
          console.log('Updated addresses:', this.addresses);
        } else {
          console.error('Invalid address data received:', data);
          this.$message.error('获取地址列表失败');
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        this.$message.error('获取地址列表失败');
      }
    },
    showAddDialog() {
      this.isEdit = false;
      this.dialogTitle = '添加新地址';
      this.addressForm = {
        addressId: null,
        userId: null,
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

            console.log('提交的地址数据：', this.addressForm);

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
            console.error('提交地址时出错：', error);
            this.$message.error(this.isEdit ? '更新失败' : '添加失败');
          }
        }
      });
    },
    goBack() {
      this.$router.push('/user/center');
    }
  },
  created() {
    this.loadAddresses();
  }
}
</script>

<style lang="scss" scoped>
.address-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 2px solid #ff6700;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .address-items {
    margin-top: 20px;

    .el-col {
      margin-bottom: 20px;
    }
  }

  .address-item {
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
    }

    .address-content {
      margin-bottom: 15px;
    }

    .address-main {
      .location, .phone {
        margin: 8px 0;
        color: #666;
        
        i {
          margin-right: 8px;
          color: #999;
        }
      }
    }

    .address-tags {
      margin-top: 10px;
    }

    .address-actions {
      border-top: 1px solid #eee;
      padding-top: 10px;
      display: flex;
      justify-content: flex-end;
      gap: 15px;

      .delete-btn {
        color: #ff4d4f;
      }
    }
  }
}
</style> 