<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
  padding: 20px;
}

.not-found-content h1 {
  font-size: 120px;
  margin: 0;
  color: #409EFF;
}

.not-found-content h2 {
  font-size: 30px;
  margin: 0;
  color: #303133;
}

.not-found-content p {
  margin: 20px 0 30px;
  color: #606266;
}
</style>