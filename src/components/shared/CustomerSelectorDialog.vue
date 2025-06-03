<template>
    <el-dialog
      :model-value="visible"
      title="选择客户"
      width="75%"
      @close="handleClose"
      :close-on-click-modal="false"
      top="10vh"
    >
      <div class="customer-selector-content">
        <el-form :model="searchParams" inline @submit.prevent="handleSearch" class="dialog-search-form">
          <el-form-item label="客户名称">
            <el-input v-model="searchParams.name" placeholder="请输入客户名称" clearable style="width: 180px;" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="searchParams.phone" placeholder="请输入联系电话" clearable style="width: 150px;" />
          </el-form-item>
          <el-form-item label="客户地址">
            <el-input v-model="searchParams.address" placeholder="请输入客户地址" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="resetSearchAndFetch">重置</el-button>
          </el-form-item>
        </el-form>
  
        <el-table
          :data="tableData"
          border
          style="width: 100%; margin-top: 15px;"
          height="300px"
          v-loading="loading"
          @row-dblclick="handleRowDblClick"
          highlight-current-row
          @current-change="handleCurrentRowChange"
          ref="customerTableRef"
        >
          <el-table-column label="" width="55" align="center">
            <template #default="scope">
              <el-radio :label="scope.row.id" v-model="selectedCustomerId">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="客户名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="phone" label="联系电话" width="120" />
          <el-table-column prop="shippingAddress" label="默认收货地址" min-width="200" show-overflow-tooltip />
          <template #empty>
            <el-empty description="暂无客户数据" />
          </template>
        </el-table>
  
        <div class="pagination-container modal-pagination">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentPageChange"
            background
            size="small"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="!selectedCustomer">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  console.log('[CustomerSelectorDialog.vue] SCRIPT SETUP STARTED - 这个组件的JS开始处理了！');
  
  import { ref, reactive, watch } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Search, Refresh } from '@element-plus/icons-vue';
  import { getCustomerListAPI } from '@/api/customer';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:visible', 'select']);
  
  // 响应式状态定义
  const loading = ref(false);
  const tableData = ref([]);
  const searchParams = reactive({
    name: '',
    phone: '',
    address: ''
  });
  const pagination = reactive({
    currentPage: 1,
    pageSize: 5,
    total: 0,
  });
  const selectedCustomerId = ref(null);
  const selectedCustomer = ref(null);
  const customerTableRef = ref(null);
  
  // 函数定义区域
  const fetchData = async () => {
    console.log('[CustomerSelectorDialog.vue] fetchData: Function CALLED');
    loading.value = true;
    try {
      const apiParams = {
        name: searchParams.name || undefined,
        phone: searchParams.phone || undefined,
        address: searchParams.address || undefined,
        page: pagination.currentPage - 1,
        size: pagination.pageSize
      };
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === undefined || apiParams[key] === '') {
          delete apiParams[key];
        }
      });
      try {
          console.log('[CustomerSelectorDialog.vue] fetchData: API params to be sent:', JSON.parse(JSON.stringify(apiParams)));
      } catch(e) {
          console.log('[CustomerSelectorDialog.vue] fetchData: API params to be sent (raw):', apiParams);
      }
  
      const res = await getCustomerListAPI(apiParams);
      try {
          console.log('[CustomerSelectorDialog.vue] fetchData: API response received:', JSON.parse(JSON.stringify(res)));
      } catch(e) {
          console.log('[CustomerSelectorDialog.vue] fetchData: API response received (raw):', res);
      }
  
      if (res.code === 200 && res.data) {
        tableData.value = res.data.content || [];
        pagination.total = res.data.totalElements || 0;
        console.log('[CustomerSelectorDialog.vue] fetchData: Data loaded successfully. tableData length:', tableData.value.length, 'pagination.total:', pagination.total);
      } else {
        ElMessage.error(res.message || '获取客户列表失败');
        tableData.value = [];
        pagination.total = 0;
        console.error('[CustomerSelectorDialog.vue] fetchData: Failed to get customer list or bad response format. Response:', res);
      }
    } catch (error) {
      console.error('[CustomerSelectorDialog.vue] fetchData: API call FAILED with error:', error);
      ElMessage.error('获取客户列表异常');
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };
  
  const handleSearch = () => {
    console.log('[CustomerSelectorDialog.vue] handleSearch: Function CALLED');
    pagination.currentPage = 1;
    console.log('[CustomerSelectorDialog.vue] handleSearch: pagination.currentPage set to 1');
    console.log('[CustomerSelectorDialog.vue] handleSearch: Calling fetchData()');
    fetchData();
  };
  
  const resetSearchAndFetch = () => {
    console.log('[CustomerSelectorDialog.vue] resetSearchAndFetch: Function CALLED');
    searchParams.name = '';
    searchParams.phone = '';
    searchParams.address = '';
    try {
      console.log('[CustomerSelectorDialog.vue] resetSearchAndFetch: searchParams after clear:', JSON.parse(JSON.stringify(searchParams)));
    } catch(e) {
      console.log('[CustomerSelectorDialog.vue] resetSearchAndFetch: searchParams after clear (raw):', searchParams);
    }
    console.log('[CustomerSelectorDialog.vue] resetSearchAndFetch: Calling handleSearch()');
    handleSearch();
  };
  
  const handleSizeChange = (size) => {
    console.log('[CustomerSelectorDialog.vue] handleSizeChange: New size:', size);
    pagination.pageSize = size;
    pagination.currentPage = 1;
    fetchData();
  };
  
  const handleCurrentPageChange = (page) => {
    console.log('[CustomerSelectorDialog.vue] handleCurrentPageChange: New page:', page);
    pagination.currentPage = page;
    fetchData();
  };
  
  const handleClose = () => {
    console.log('[CustomerSelectorDialog.vue] handleClose: Closing dialog.');
    emit('update:visible', false);
  };
  
  const handleConfirm = () => {
    if (selectedCustomer.value) {
      console.log('[CustomerSelectorDialog.vue] handleConfirm: Customer selected:', selectedCustomer.value.name);
      emit('select', { ...selectedCustomer.value });
      handleClose();
    } else {
      ElMessage.warning('请选择一个客户');
    }
  };
  
  const handleRowDblClick = (row) => {
    if (row) {
      console.log('[CustomerSelectorDialog.vue] handleRowDblClick: Row double-clicked:', row.name);
      selectedCustomerId.value = row.id;
      selectedCustomer.value = row;
      handleConfirm();
    }
  };
  
  const handleCurrentRowChange = (currentRow) => {
    if (currentRow) {
      console.log('[CustomerSelectorDialog.vue] handleCurrentRowChange: Current row changed:', currentRow.name);
      selectedCustomerId.value = currentRow.id;
      selectedCustomer.value = currentRow;
    } else {
      console.log('[CustomerSelectorDialog.vue] handleCurrentRowChange: Current row cleared (no selection).');
      selectedCustomerId.value = null;
      selectedCustomer.value = null;
    }
  };
  
  // Watcher 定义 (放在所有函数定义之后)
  watch(() => props.visible, (newVal, oldVal) => {
    console.log('[CustomerSelectorDialog.vue] WATCH props.visible CALLBACK FIRED. New value:', newVal, 'Old value:', oldVal);
  
    if (newVal) {
      console.log('[CustomerSelectorDialog.vue] WATCH props.visible: Processing for newVal = true (Dialog is OPENING).');
  
      selectedCustomerId.value = null;
      selectedCustomer.value = null;
      if (customerTableRef.value) {
        customerTableRef.value.setCurrentRow(null);
      }
  
      console.log('[CustomerSelectorDialog.vue] WATCH props.visible: Calling resetSearchAndFetch()');
      resetSearchAndFetch(); // 现在 resetSearchAndFetch 应该已经被定义了
    } else {
      console.log('[CustomerSelectorDialog.vue] WATCH props.visible: Processing for newVal = false (Dialog is CLOSING).');
    }
  }, { immediate: true });
  
  </script>
  
  <style scoped>
  .customer-selector-content {
    /* padding-bottom: 10px; */
  }
  
  .dialog-search-form.el-form--inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px 15px;
  }
  
  .dialog-search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  .pagination-container.modal-pagination {
    margin-top: 15px;
    padding: 0;
    display: flex;
    justify-content: flex-end;
  }
  </style>