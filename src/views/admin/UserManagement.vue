<template>
  <div class="user-management">
    <h2>用户管理</h2>
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [] // 用户列表
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
    editUser(user) {
      console.log('Editing user:', user); // 使用 user
      
    },
    deleteUser(userId) {
      axios.delete(`http://localhost:8081/users/delete/${userId}`)
        .then(response => {
          console.log('Delete response:', response); // 使用 response
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