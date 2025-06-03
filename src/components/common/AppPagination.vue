<template>
    <div :class="{'hidden': hidden}" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :background="background"
        :layout="layout"
        :page-sizes="pageSizes"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  // 定义组件的props
  const props = defineProps({
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 10
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  });
  
  // 定义组件的emits
  const emit = defineEmits(['update:page', 'update:limit', 'pagination']);
  
  // 计算属性，用于双向绑定当前页码
  const currentPage = computed({
    get() {
      return props.page;
    },
    set(val) {
      emit('update:page', val);
    }
  });
  
  // 计算属性，用于双向绑定每页数量
  const pageSize = computed({
    get() {
      return props.limit;
    },
    set(val) {
      emit('update:limit', val);
    }
  });
  
  // 当每页显示数量变化时触发
  const handleSizeChange = (val) => {
    // 确保页码在改变size后是合理的，例如跳到第一页
    currentPage.value = 1;
    emit('pagination', { page: currentPage.value, limit: val });
  };
  
  // 当页码变化时触发
  const handleCurrentChange = (val) => {
    emit('pagination', { page: val, limit: pageSize.value });
  };
  </script>
  
  <style scoped>
  .pagination-container {
    background: #fff;
    padding: 16px 16px;
    display: flex;
    justify-content: flex-end;
  }
  .pagination-container.hidden {
    display: none;
  }
  </style>