<template>
    <div class="forbidden-container">
      <h1>403 - 无权限访问</h1>
      <p>抱歉，您没有权限访问此页面。</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </template>
  
  <script setup>
  // No specific script needed for a simple 403 page
  </script>
  
  <style scoped>
  .forbidden-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - var(--header-height, 50px) - 40px); /* 减去头部和app-main的padding */
    text-align: center;
  }
  .forbidden-container h1 {
    font-size: 2.5em;
    color: #ff4d4f; /* Element Plus danger color */
    margin-bottom: 20px;
  }
  .forbidden-container p {
    font-size: 1.2em;
    margin-bottom: 30px;
  }
  </style>