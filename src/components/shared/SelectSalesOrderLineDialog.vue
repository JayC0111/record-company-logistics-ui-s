<template>
      <el-dialog
        v-model="dialogInternalVisible"
       title="关联销售单明细"
       width="75%"
       @close="handleDialogClose" append-to-body
       destroy-on-close
       top="5vh"
      >
       <div class="select-sales-order-line-dialog-content">
        <div class="dialog-search-container">
         <el-form :model="searchParams" inline label-width="80px" class="dialog-search-form">
          <el-form-item label="销售单号">
           <el-input v-model="searchParams.salesOrderNo" placeholder="请输入销售单号" clearable style="width: 180px;"/>
          </el-form-item>
          <el-form-item label="客户名称">
           <el-input v-model="searchParams.customerName" placeholder="请输入客户名称" clearable style="width: 180px;"/>
          </el-form-item>
          <el-form-item label="商品信息">
           <el-input v-model="searchParams.productKeyword" placeholder="商品编码/名称/规格" clearable style="width: 200px;"/>
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
        >
         <el-table-column type="selection" width="50" align="center" :selectable="isRowSelectable" reserve-selection />
         <el-table-column prop="salesOrderNo" label="销售单号" width="170" show-overflow-tooltip fixed="left" />
         <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
         <el-table-column prop="productCode" label="商品编号" width="140" />
         <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
         <el-table-column prop="specification" label="规格型号" width="120" />
         <el-table-column prop="unit" label="单位" width="70" />
         <el-table-column prop="originalOrderQuantity" label="订单数量" width="100" align="right" />
         <el-table-column prop="alreadyOutboundQuantity" label="已出库" width="90" align="right" />
         <el-table-column label="可出库" width="90" align="right">
          <template #default="{ row }">
           {{ row._maxCanPick }}
          </template>
         </el-table-column>
         <el-table-column label="本次出库数量" width="160" align="center" fixed="right">
          <template #default="{ row }">
           <el-input-number
            v-model="row.quantityToPickNow"
            :min="0"
            :max="row._maxCanPick"
            controls-position="right"
            style="width: 100%"
            :disabled="row._maxCanPick === 0"
            @change="(currentValue) => handleQuantityInputChange(row, currentValue)"
           />
          </template>
         </el-table-column>
         <template #empty>
          <el-empty description="暂无可出库的销售单明细" />
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
         <el-button type="primary" @click="handleConfirm" :loading="loading">确认添加</el-button>
        </span>
       </template>
      </el-dialog>
     </template>
     
     <script setup>
     // 组件JS逻辑开始处理
     console.log('[SelectSalesOrderLineDialog.vue] SCRIPT SETUP STARTED - 这个组件的JS开始处理了！');
     
     import { ref, reactive, watch, nextTick } from 'vue'; // nextTick 已导入但未显式使用
     import { ElMessage } from 'element-plus';
     import { Search as SearchIcon, RefreshLeft as RefreshLeftIcon } from '@element-plus/icons-vue';
     // 假设API路径正确
     import { getPendingOutboundSalesOrderLines } from '@/api/outboundOrder';
     
     const props = defineProps({
      visible: {
       type: Boolean,
       default: false
      }
     });
     
     const emit = defineEmits(['update:visible', 'confirm']);
     
     // --- 数据状态 ---
     const dialogInternalVisible = ref(props.visible);
     const loading = ref(false);
     const tableData = ref([]);
     const selectionTableRef = ref(null); // 用于引用el-table实例
     
     const searchParams = reactive({
      salesOrderNo: '',
      customerName: '',
      productKeyword: '',
     });
     
     const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
     });
     
     const currentPageSelectedRows = ref([]); // 存储当前页通过复选框选中的行
     
     // --- 核心逻辑函数 (在侦听器之前定义) ---
     const fetchData = async () => {
      loading.value = true;
      // 准备API请求参数，移除空值，但保留page和size
      const rawParams = {
       ...searchParams,
       page: pagination.currentPage - 1, // API通常页码从0开始
       size: pagination.pageSize,
      };
      const apiParams = {};
      for (const key in rawParams) {
       if (rawParams[key] !== undefined && rawParams[key] !== null && String(rawParams[key]).trim() !== '') {
        apiParams[key] = rawParams[key];
       } else if (key === 'page' || key === 'size') { // 确保page和size总是传递
         apiParams[key] = rawParams[key];
       }
      }
      console.log('[SelectSalesOrderLineDialog.vue] fetchData: Fetching data with processed apiParams:', JSON.stringify(apiParams));
      try {
       const res = await getPendingOutboundSalesOrderLines(apiParams);
       console.log('[SelectSalesOrderLineDialog.vue] fetchData: API response (raw):', res);
       if (res.code === 200 && res.data) {
        tableData.value = (res.data.content || []).map(item => {
         const originalQty = Number(item.originalOrderQuantity) || 0;
         const outboundQty = Number(item.alreadyOutboundQuantity) || 0;
         return {
          ...item, // 展开从API获取的所有属性
          _maxCanPick: Math.max(0, originalQty - outboundQty), // 计算最大可出库数量
          quantityToPickNow: 0, // 初始化本次出库数量为0
         };
        });
        pagination.total = res.data.totalElements || 0;
       } else {
        ElMessage.error(res.message || '获取待出库销售单明细失败');
        tableData.value = []; pagination.total = 0;
       }
      } catch (error) {
       console.error('[SelectSalesOrderLineDialog.vue] 获取待出库销售单明细异常:', error);
       ElMessage.error(error.message || '获取待出库销售单明细异常');
       tableData.value = []; pagination.total = 0;
      } finally {
       loading.value = false;
      }
     };
     
     const resetSearchFormFields = () => {
      console.log('[SelectSalesOrderLineDialog.vue] resetSearchFormFields called');
      searchParams.salesOrderNo = '';
      searchParams.customerName = '';
      searchParams.productKeyword = '';
     };
     
     const handleSearch = () => {
      console.log('[SelectSalesOrderLineDialog.vue] handleSearch called');
      pagination.currentPage = 1; // 重置到第一页
      fetchData();
     };
     
     const resetSearchFormAndFetch = () => {
      console.log('[SelectSalesOrderLineDialog.vue] resetSearchFormAndFetch called');
      resetSearchFormFields();
      handleSearch(); // 调用handleSearch会重置页码并获取数据
     };
     
     const initializeDialog = () => {
      console.log('!!!!!!!! [SelectSalesOrderLineDialog.vue] initializeDialog IS CALLED !!!!!!!!');
      resetSearchFormFields(); // 重置搜索条件
      pagination.currentPage = 1; // 重置页码
      console.log('[SelectSalesOrderLineDialog.vue] initializeDialog: Search params reset, pagination set to 1. Calling fetchData...');
      fetchData(); // 获取数据
     
      // 清除表格之前的选中状态
      if (selectionTableRef.value) {
       selectionTableRef.value.clearSelection();
      }
      currentPageSelectedRows.value = []; // 清空已选中的行记录
     };
     
     // 此函数已定义，以备将来使用或重构，但当前未绑定到@open事件
     const handleDialogOpen = () => {
      console.log('!!!!!!!! [SelectSalesOrderLineDialog.vue] handleDialogOpen function was CALLED (e.g., if manually triggered or re-attached to @open) !!!!!!!!');
      initializeDialog();
     };
     
     const handleDialogClose = () => {
      console.log('[SelectSalesOrderLineDialog.vue] handleDialogClose called');
      dialogInternalVisible.value = false; // 这会触发下面的侦听器来emit事件
     };
     
     // --- 侦听器 ---
     watch(() => props.visible, (newVal, oldVal) => {
      console.log(`[SelectSalesOrderLineDialog.vue] Watch props.visible CALLBACK FIRED. New value: ${newVal}, Old value: ${oldVal}`);
      dialogInternalVisible.value = newVal; // 同步内部状态以驱动v-model
     
      if (newVal) { // 如果对话框变为可见
       console.log('[SelectSalesOrderLineDialog.vue] props.visible is true in watch, calling initializeDialog.');
       initializeDialog(); // <--- 这是初始化的主要触发点
      }
      // 如果handleDialogClose和destroy-on-close已处理关闭逻辑，则此处不需要'else'块
     }, { immediate: true }); // <--- 确保immediate为true，以便在初始设置时（如果visible为true）运行
     
     watch(dialogInternalVisible, (newVal) => {
      if (newVal !== props.visible) { // 如果内部状态变化导致与props不一致
       console.log(`[SelectSalesOrderLineDialog.vue] Watch dialogInternalVisible changed to ${newVal}. Emitting update:visible.`);
       emit('update:visible', newVal); // 发出事件以更新父组件的v-model
      }
     });
     
     // --- 其他事件处理器和辅助函数 ---
     const getRowKey = (row) => row.salesOrderLineId; // 用于表格行的唯一key
     
     const handleSizeChange = (size) => {
      pagination.pageSize = size;
      pagination.currentPage = 1; // 更改每页大小时回到第一页
      fetchData();
     };
     
     const handleCurrentChange = (page) => {
      pagination.currentPage = page;
      fetchData();
     };
     
     const isRowSelectable = (row) => row._maxCanPick > 0; // 只有可出库数量大于0的行才能被选中
     
     const handleSelectionChange = (selection) => {
      // selection 是当前页所有被选中的行对象数组
      currentPageSelectedRows.value = selection;
     };
     
     const handleQuantityInputChange = (row, currentValue) => {
      // 可以在这里添加逻辑，例如如果输入数量变化，自动选中行等
      // console.log(`Quantity for ${row.productName} changed to: ${currentValue}`);
     };
     
     const handleConfirm = () => {
      // 过滤出实际输入了“本次出库数量”大于0的已选中行
      const linesToAdd = currentPageSelectedRows.value
       .filter(row => {
         // 确保从最新的tableData中获取quantityToPickNow，因为用户可能编辑了它
         const currentDataRow = tableData.value.find(td => td.salesOrderLineId === row.salesOrderLineId);
         return currentDataRow && Number(currentDataRow.quantityToPickNow) > 0;
       })
       .map(row => {
        // 再次从tableData中获取最新的行数据，以包含用户输入的quantityToPickNow
        const currentDataRow = tableData.value.find(td => td.salesOrderLineId === row.salesOrderLineId);
        const quantityToPick = Number(currentDataRow.quantityToPickNow);
     
        // 校验本次出库数量是否超过可出库数量
        if (quantityToPick > currentDataRow._maxCanPick) {
         ElMessage.error(`商品 "${currentDataRow.productName}" 的本次出库数量 (${quantityToPick}) 不能超过可出库数量 (${currentDataRow._maxCanPick})。`);
         return { error: true, id: currentDataRow.salesOrderLineId }; // 标记为错误行
        }
     
        // --- MODIFICATION START ---
        return {
         salesOrderLineId: currentDataRow.salesOrderLineId,
         salesOrderNo: currentDataRow.salesOrderNo,         // 确保使用 salesOrderNo
         salesOrderId: currentDataRow.salesOrderId,
         customerName: currentDataRow.customerName,       // 添加 customerName
         productId: currentDataRow.productId,
         productCode: currentDataRow.productCode,
         productName: currentDataRow.productName,
         specification: currentDataRow.specification,
         unit: currentDataRow.unit,
         quantityToPick: quantityToPick, // 这是用户输入的“本次出库数量”
         // 如果父组件还需要原始订单数量或已出库数量，也可以在这里添加
         // originalOrderQuantity: currentDataRow.originalOrderQuantity,
         // alreadyOutboundQuantity: currentDataRow.alreadyOutboundQuantity,
        };
        // --- MODIFICATION END ---
       });
     
      // 检查是否有校验错误的行
      const erroredLines = linesToAdd.filter(line => line.error);
      if (erroredLines.length > 0) {
       return; // 如果有错误，则不继续
      }
     
      // 过滤掉标记为错误的行（虽然上面已经return了，双重保险）
      const validLinesToAdd = linesToAdd.filter(line => !line.error);
     
      if (validLinesToAdd.length === 0) {
       ElMessage.warning('请至少选择一个商品并输入大于0的本次出库数量。');
       return;
      }
     
      emit('confirm', validLinesToAdd); // 发送有效行数据给父组件
      handleDialogClose(); // 关闭对话框
     };
     
     const handleCancel = () => {
      handleDialogClose(); // 关闭对话框
     };
     
     </script>
     
     <style scoped>
     .dialog-search-container {
      display: flex;
      justify-content: center; /* 使搜索表单居中 */
      margin-bottom: 15px;
     }
     .dialog-search-form {
      display: flex;
      flex-wrap: wrap; /* 允许表单项换行 */
      gap: 10px 15px; /* 行间距和列间距 */
      align-items: center; /* 垂直居中对齐表单项 */
     }
     .dialog-search-form .el-form-item {
      margin-bottom: 0 !important; /* 移除Element Plus默认的底部边距 */
      margin-right: 0 !important; /* 移除Element Plus默认的右侧边距，因为使用了gap */
     }
     .dialog-pagination-container {
      padding: 15px 0 0 0;
      display: flex;
      justify-content: flex-end; /* 分页器右对齐 */
     }
     .select-sales-order-line-dialog-content {
      min-height: 400px; /* 保证对话框内容区域有最小高度 */
     }
     </style>
    