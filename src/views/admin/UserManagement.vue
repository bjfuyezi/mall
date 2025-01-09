<template>
  <div class="user-management">
    <h2>用户管理</h2>
    <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="id" label="用户ID" width="80"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button @click="editUser(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑用户" :visible.sync="editUserDialog">
      <el-form :model="currentUser">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="currentUser.email"></el-input>
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
        email: ''
      },
      currentUser: {}
    };
  },
  methods: {
    fetchUsers() {
      axios.get('http://localhost:8081/users/list')
        .then(response => {
          this.users = response.data; // 使用 response
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
    },
    showAddUserDialog() {
      this.addUserDialog = true;
    },
    addUser() {
      axios.post('http://localhost:8081/users/add', this.newUser)
        .then(response => {
          console.log('Add user response:', response); // 使用 response
          this.fetchUsers(); // 刷新用户列表
          this.addUserDialog = false; // 关闭对话框
        })
        .catch(error => {
          console.error('Error adding user:', error);
        });
    },
    editUser(user) {
      this.currentUser = { ...user }; // 复制用户信息
      this.editUserDialog = true; // 打开编辑对话框
    },
    updateUser() {
      axios.put(`http://localhost:8081/users/edit/${this.currentUser.id}`, this.currentUser)
        .then(response => {
          console.log('Update user response:', response); // 使用 response
          this.fetchUsers(); // 刷新用户列表
          this.editUserDialog = false; // 关闭对话框
        })
        .catch(error => {
          console.error('Error updating user:', error);
        });
    },
    deleteUser(userId) {
      axios.delete(`http://localhost:8081/users/delete/${userId}`)
        .then(response => {
          console.log('Delete user response:', response); // 使用 response
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