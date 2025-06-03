<template>
    <el-dialog
      v-model="dialogInternalVisible"
      title="关联待发货出库单明细"
      width="80%"
      @close="handleDialogClose"
      append-to-body
      destroy-on-close
      top="5vh"
    >
      <div class="select-ready-outbound-dialog-content">
        <div class="dialog-search-container">
          <el-form :model="searchParams" inline label-width="90px" class="dialog-search-form">
            <el-form-item label="出库单号">
              <el-input v-model="searchParams.outboundOrderNo" placeholder="请输入出库单号" clearable style="width: 180px;"/>
            </el-form-item>
            <el-form-item label="销售单号">
              <el-input v-model="searchParams.salesOrderNo" placeholder="请输入关联销售单号" clearable style="width: 180px;"/>
            </el-form-item>
            <el-form-item label="商品信息">
              <el-input v-model="searchParams.productKeyword" placeholder="商品编码/名称" clearable style="width: 200px;"/>
            </el-form-item>
            <el-form-item class="search-buttons">
              <el-button type="primary" :icon="SearchIcon" @click="handleSearch" :loading="loading">查询</el-button>
              <el-button :icon="RefreshLeftIcon" @click="resetSearchFormAndFetch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
  
        <el-table
          ref="selectionTableRef"
          :data="tableData"
          border
          style="width: 100%; margin-top: 15px;"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          :row-key="getRowKey"
          max-height="450px"
          reserve-selection
        >
          <el-table-column type="selection" width="50" align="center" :selectable="isRowSelectable" />
          <el-table-column prop="outboundOrderNo" label="出库单号" width="180" show-overflow-tooltip fixed="left" />
          <el-table-column prop="displaySalesOrderNo" label="关联销售单" width="180" show-overflow-tooltip />
          <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="productCode" label="商品编号" width="140" />
          <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="specification" label="规格型号" width="120" />
          <el-table-column prop="unit" label="单位" width="70" />
          <el-table-column prop="pickedQuantity" label="可发货数量" width="110" align="right">
              <template #default="{ row }">
                  {{ Number(row.pickedQuantity) || 0 }}
              </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无待发货的出库单明细" />
          </template>
        </el-table>
  
        <div class="dialog-pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"      
            @current-change="handleCurrentChange" 
            background
          />
        </div>
      </div>
  
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleConfirm" :loading="loading" :disabled="selectedRows.length === 0">确认添加</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Search as SearchIcon, RefreshLeft as RefreshLeftIcon } from '@element-plus/icons-vue';
  import { getReadyToShipOutboundOrders } from '@/api/shipmentOrder'; //
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
  });
  
  const emit = defineEmits(['update:visible', 'confirm']);
  
  const dialogInternalVisible = ref(props.visible);
  const loading = ref(false);
  const tableData = ref([]);
  const selectionTableRef = ref(null);
  
  const searchParams = reactive({
    outboundOrderNo: '',
    salesOrderNo: '',
    productKeyword: '',
  });
  
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });
  
  const selectedRows = ref([]);
  
  const fetchData = async () => {
    loading.value = true;
    const apiParams = {
      ...searchParams,
      page: pagination.currentPage - 1,
      size: pagination.pageSize,
    };
    for (const key in apiParams) {
      if (apiParams[key] === '' || apiParams[key] === null || apiParams[key] === undefined) {
        if (key !== 'page' && key !== 'size') {
          delete apiParams[key];
        }
      }
    }
  
    try {
      const res = await getReadyToShipOutboundOrders(apiParams);
      if (res.code === 200 && res.data) {
        tableData.value = (res.data.content || []).map(item => ({
          ...item,
          id: item.id, 
          outboundOrderId: item.outboundOrderId, 
          outboundOrderNo: item.outboundOrderNo, 
          displaySalesOrderNo: item.displaySalesOrderNo, 
          customerName: item.customerName, 
          pickedQuantity: Number(item.pickedQuantity) || 0,
        }));
        pagination.total = res.data.totalElements || 0;
      } else {
        ElMessage.error(res.message || '获取待发货出库单明细失败');
        tableData.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error('获取待发货出库单明细异常:', error);
      ElMessage.error(error.message || '获取待发货出库单明细异常');
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };
  
  const resetSearchFormFields = () => {
    searchParams.outboundOrderNo = '';
    searchParams.salesOrderNo = '';
    searchParams.productKeyword = '';
  };
  
  const handleSearch = () => {
    pagination.currentPage = 1;
    fetchData();
  };
  
  const resetSearchFormAndFetch = () => {
    resetSearchFormFields();
    handleSearch();
  };
  
  const initializeDialog = () => {
    resetSearchFormFields();
    pagination.currentPage = 1;
    fetchData();
    if (selectionTableRef.value) {
      selectionTableRef.value.clearSelection();
    }
    selectedRows.value = [];
  };
  
  const handleDialogClose = () => {
    dialogInternalVisible.value = false;
  };
  
  const handleSizeChange = (newSize) => {
    pagination.pageSize = newSize;
    pagination.currentPage = 1;
    fetchData();
  };
  
  const handleCurrentChange = (newPage) => {
    pagination.currentPage = newPage;
    fetchData();
  };
  
  watch(() => props.visible, (newVal) => {
    dialogInternalVisible.value = newVal;
    if (newVal) {
      initializeDialog();
    }
  }, { immediate: true });
  
  watch(dialogInternalVisible, (newVal) => {
    if (newVal !== props.visible) {
      emit('update:visible', newVal);
    }
  });
  
  const getRowKey = (row) => `${row.outboundOrderId}-${row.id}`;
  
  const isRowSelectable = (row) => {
    return Number(row.pickedQuantity) > 0;
  };
  
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection;
  };
  
  const handleConfirm = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请至少选择一条待发货的出库明细。');
      return;
    }
    emit('confirm', JSON.parse(JSON.stringify(selectedRows.value)));
    handleDialogClose();
  };
  
  const handleCancel = () => {
    handleDialogClose();
  };
  
  </script>
  
  <style scoped>
  .select-ready-outbound-dialog-content {
    min-height: 400px;
  }
  .dialog-search-container {
    margin-bottom: 15px;
  }
  .dialog-search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 15px;
    align-items: center;
  }
  .dialog-search-form .el-form-item {
    margin-bottom: 0 !important;
    margin-right: 0 !important;
  }
  .dialog-pagination-container {
    padding: 15px 0 0 0;
    display: flex;
    justify-content: flex-end;
  }
  </style>