<template>
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">{{ title }}</h1>
        <p class="text-gray-500">此页面正在开发中...</p>
        
        <div class="mt-6 p-4 bg-blue-50 rounded-md">
          <p class="text-blue-700">页面信息：</p>
          <ul class="list-disc ml-5 mt-2">
            <li><span class="font-medium">路径：</span> {{ path }}</li>
            <li><span class="font-medium">模块：</span> {{ module }}</li>
            <li><span class="font-medium">功能：</span> {{ feature }}</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      required: true
    },
    path: {
      type: String,
      default: '未指定'
    },
    module: {
      type: String,
      default: '未指定'
    },
    feature: {
      type: String,
      default: '未指定'
    }
  });
  </script>