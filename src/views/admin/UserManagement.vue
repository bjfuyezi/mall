<template>
    <div class="user-management">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="user_id" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role" label="角色"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button @click="editUser(scope.row)">编辑</el-button>
            <el-button type="danger" @click="confirmDeleteUser(scope.row.user_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addUserDialog">
        <el-form :model="newUser">
          <el-form-item label="用户名">
            <el-input v-model="newUser.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input type="password" v-model="newUser.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="newUser.email"></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="newUser.role" placeholder="请选择角色">
              <el-option label="买家" value="buyer"></el-option>
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="卖家" value="seller"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserDialog = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
  
      <!-- 编辑用户对话框 -->
      <el-dialog title="编辑用户" :visible.sync="editUserDialog">
        <el-form :model="currentUser">
          <el-form-item label="用户名">
            <el-input v-model="currentUser.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input type="password" v-model="currentUser.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="currentUser.email"></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="currentUser.role" placeholder="请选择角色">
              <el-option label="买家" value="buyer"></el-option>
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="卖家" value="seller"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editUserDialog = false">取 消</el-button>
          <el-button type="primary" @click="updateUser">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [], // 用户列表
      addUserDialog: false,
      editUserDialog: false,
      newUser: {
        username: '',
        password: '',
        email: '',
        role: '' // 默认角色为空
      },
      currentUser: {}
    };
  },
  methods: {
    fetchUsers() {
      axios.get('http://localhost:8081/users/list')
        .then(response => {
          this.users = response.data;
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
    },
    showAddUserDialog() {
      this.newUser = { username: '', password: '', email: '', role: '' }; // 重置表单
      this.addUserDialog = true;
    },
    addUser() {
      axios.post('http://localhost:8081/users/add', this.newUser)
        .then(response => {
          console.log('Add user response:', response);
          this.fetchUsers(); // 刷新用户列表
          this.addUserDialog = false; // 关闭对话框
        })
        .catch(error => {
          console.error('Error adding user:', error);
        });
    },
    editUser(user) {
      this.currentUser = { ...user, password: '' }; // 复制用户信息，密码重置为空
      this.editUserDialog = true;
    },
    updateUser() {
      axios.put(`http://localhost:8081/users/edit/${this.currentUser.user_id}`, this.currentUser)
        .then(response => {
          console.log('Update user response:', response);
          this.fetchUsers(); // 刷新用户列表
          this.editUserDialog = false; // 关闭对话框
        })
        .catch(error => {
          console.error('Error updating user:', error);
        });
    },
    confirmDeleteUser(userId) {
      this.$confirm('确定要删除此用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteUser(userId);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    deleteUser(userId) {
      axios.delete(`http://localhost:8081/users/delete/${userId}`)
        .then(response => {
          console.log('Delete user response:', response);
          this.fetchUsers(); // 刷新用户列表
        })
        .catch(error => {
          console.error('Error deleting user:', error);
        });
    }
  },
  mounted() {
    this.fetchUsers(); // 获取用户列表
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}
</style> 