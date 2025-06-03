<template>
    <el-dialog
      :model-value="visible"
      title="选择商品"
      width="80%"
      @close="handleClose"
      :close-on-click-modal="false"
      top="8vh"
      class="product-selector-dialog"
    >
      <div class="product-selector-content">
        <el-form :model="searchParams" inline @submit.prevent="handleSearch" class="dialog-search-form">
          <el-form-item label="商品编码">
            <el-input v-model="searchParams.productCode" placeholder="请输入商品编码" clearable style="width: 180px;" />
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="searchParams.name" placeholder="请输入商品名称" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item label="规格型号">
            <el-input v-model="searchParams.specification" placeholder="请输入规格型号" clearable style="width: 160px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="resetSearchAndFetch">重置</el-button>
          </el-form-item>
        </el-form>
  
        <el-table
          ref="multipleTableRef"
          :data="tableData"
          border
          style="width: 100%; margin-top: 15px;"
          height="440px"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="50" align="center" :reserve-selection="true" />
          <el-table-column prop="productCode" label="商品编码" width="140" show-overflow-tooltip />
          <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="specification" label="规格型号" width="120" show-overflow-tooltip />
          <el-table-column prop="unit" label="单位" width="70" align="center" />
          <el-table-column prop="salesPrice" label="标准售价" width="100" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.salesPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="onHandQuantity" label="在手库存" width="100" align="right" />
          <template #empty>
            <el-empty description="暂无商品数据" />
          </template>
        </el-table>
  
        <div class="pagination-container modal-pagination">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentPageChange"
            background
            size="small" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="selectedProducts.length === 0">确定选中</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  console.log('[ProductSelectorDialog.vue] SCRIPT SETUP STARTED - 这个组件的JS开始处理了！');
  
  import { ref, reactive, watch } from 'vue'; // Removed unused 'computed', 'ElTable' (ElTable is used in template, not script)
  import { ElMessage } from 'element-plus';
  import { Search, Refresh } from '@element-plus/icons-vue';
  import { getProductListAPI } from '@/api/product';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
  });
  
  const emit = defineEmits(['update:visible', 'select']);
  
  // Reactive States
  const loading = ref(false);
  const tableData = ref([]);
  const searchParams = reactive({
    name: '',
    productCode: '',
    specification: ''
  });
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });
  const multipleTableRef = ref(null); // For el-table instance
  const selectedProducts = ref([]);
  
  // Function Definitions (Order is important: define functions before they are called by watchers with immediate:true)
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '0.00';
    // Assuming CNY, adjust if needed. Removed ¥ symbol as per original code.
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, '');
  };
  
  const fetchData = async () => {
    console.log('[ProductSelectorDialog.vue] fetchData: Function CALLED');
    loading.value = true;
    try {
      const apiParams = {
        name: searchParams.name || undefined,
        productCode: searchParams.productCode || undefined,
        specification: searchParams.specification || undefined,
        page: pagination.currentPage - 1,
        size: pagination.pageSize
      };
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === undefined || apiParams[key] === '') {
          delete apiParams[key];
        }
      });
      try {
          console.log('[ProductSelectorDialog.vue] fetchData: API params to be sent:', JSON.parse(JSON.stringify(apiParams)));
      } catch(e) {
          console.log('[ProductSelectorDialog.vue] fetchData: API params to be sent (raw):', apiParams);
      }
  
      const res = await getProductListAPI(apiParams);
      try {
          console.log('[ProductSelectorDialog.vue] fetchData: API response received:', JSON.parse(JSON.stringify(res)));
      } catch(e) {
          console.log('[ProductSelectorDialog.vue] fetchData: API response received (raw):', res);
      }
  
      if (res.code === 200 && res.data) {
        tableData.value = res.data.content || [];
        pagination.total = res.data.totalElements || 0;
        console.log('[ProductSelectorDialog.vue] fetchData: Data loaded successfully. tableData length:', tableData.value.length, 'pagination.total:', pagination.total);
      } else {
        ElMessage.error(res.message || '获取商品列表失败');
        tableData.value = [];
        pagination.total = 0;
        console.error('[ProductSelectorDialog.vue] fetchData: Failed to get product list or bad response format. Response:', res);
      }
    } catch (error) {
      console.error('[ProductSelectorDialog.vue] fetchData: API call FAILED with error:', error);
      ElMessage.error('获取商品列表异常');
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };
  
  const handleSearch = () => {
    console.log('[ProductSelectorDialog.vue] handleSearch: Function CALLED');
    pagination.currentPage = 1;
    console.log('[ProductSelectorDialog.vue] handleSearch: pagination.currentPage set to 1');
    console.log('[ProductSelectorDialog.vue] handleSearch: Calling fetchData()');
    fetchData();
  };
  
  const resetSearchAndFetch = () => {
    console.log('[ProductSelectorDialog.vue] resetSearchAndFetch: Function CALLED');
    searchParams.name = '';
    searchParams.productCode = '';
    searchParams.specification = '';
    try {
      console.log('[ProductSelectorDialog.vue] resetSearchAndFetch: searchParams after clear:', JSON.parse(JSON.stringify(searchParams)));
    } catch(e) {
      console.log('[ProductSelectorDialog.vue] resetSearchAndFetch: searchParams after clear (raw):', searchParams);
    }
    console.log('[ProductSelectorDialog.vue] resetSearchAndFetch: Calling handleSearch()');
    handleSearch();
  };
  
  const handleSizeChange = (size) => {
    console.log('[ProductSelectorDialog.vue] handleSizeChange: New size:', size);
    pagination.pageSize = size;
    pagination.currentPage = 1;
    fetchData();
  };
  
  const handleCurrentPageChange = (page) => {
    console.log('[ProductSelectorDialog.vue] handleCurrentPageChange: New page:', page);
    pagination.currentPage = page;
    fetchData();
  };
  
  const handleClose = () => {
    console.log('[ProductSelectorDialog.vue] handleClose: Closing dialog.');
    emit('update:visible', false);
    // Selection is cleared when dialog opens, via the watch
  };
  
  const handleConfirm = () => {
    if (selectedProducts.value.length > 0) {
      console.log('[ProductSelectorDialog.vue] handleConfirm: Products selected count:', selectedProducts.value.length);
      // Use JSON.parse(JSON.stringify(...)) to send a deep copy and avoid potential reactivity issues with the parent
      emit('select', JSON.parse(JSON.stringify(selectedProducts.value)));
      handleClose();
    } else {
      ElMessage.warning('请至少选择一个商品');
    }
  };
  
  const handleSelectionChange = (selection) => {
    console.log('[ProductSelectorDialog.vue] handleSelectionChange: Selection count:', selection.length);
    selectedProducts.value = selection;
  };
  
  // Watcher (defined after all functions it might call)
  watch(() => props.visible, (newVal, oldVal) => {
    console.log('[ProductSelectorDialog.vue] WATCH props.visible CALLBACK FIRED. New value:', newVal, 'Old value:', oldVal);
    if (newVal) {
      console.log('[ProductSelectorDialog.vue] WATCH props.visible: Processing for newVal = true (Dialog is OPENING).');
      // Clear previous selections
      if (multipleTableRef.value) {
        console.log('[ProductSelectorDialog.vue] WATCH props.visible: Clearing table selection.');
        multipleTableRef.value.clearSelection();
      }
      selectedProducts.value = []; // Ensure selectedProducts array is also cleared
  
      console.log('[ProductSelectorDialog.vue] WATCH props.visible: Calling resetSearchAndFetch()');
      resetSearchAndFetch(); // This will clear search params, reset page to 1, and fetch data
    } else {
      console.log('[ProductSelectorDialog.vue] WATCH props.visible: Processing for newVal = false (Dialog is CLOSING).');
    }
  }, { immediate: true });
  
  </script>
  
  <style scoped>
  .product-selector-dialog .el-dialog__body {
    padding-top: 10px;
  }
  .product-selector-content {
    /* 可根据需要添加样式 */
  }
  
  .dialog-search-form.el-form--inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center; /* 使整行搜索条件居中 */
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