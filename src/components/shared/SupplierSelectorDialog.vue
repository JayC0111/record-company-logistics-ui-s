<template>
    <el-dialog
      title="选择供应商"
      :model-value="visible"
      width="750px"
      :append-to-body="true"
      :close-on-click-modal="false"
      @update:model-value="$emit('update:visible', $event)"
      @close="handleClose"
    >
      <div class="selector-dialog-content">
        <el-form :model="searchForm" inline class="table-toolbar" style="margin-bottom: 15px;">
          <el-form-item label="供应商名称">
            <el-input v-model="searchForm.name" placeholder="请输入供应商名称" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="searchForm.contact_person" placeholder="请输入联系人" clearable style="width: 160px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="RefreshLeft" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
  
        <el-table
          ref="supplierTableRef"
          :data="supplierList"
          v-loading="loading"
          border
          highlight-current-row
          @row-dblclick="handleRowDblClick"
          height="350px"
        >
          <el-table-column width="50" align="center">
              <template #default="scope">
                  <el-radio :label="scope.row.id" v-model="selectedSupplierId" @change="handleRadioChange(scope.row)">&nbsp;</el-radio>
              </template>
          </el-table-column>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="供应商名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="contact_person" label="联系人" width="120" show-overflow-tooltip />
          <el-table-column prop="phone" label="联系电话" width="150" />
        </el-table>
  
        <div class="pagination-container" style="margin-top: 15px;">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 30]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
            small
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirmSelection">确定</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, reactive, watch, nextTick } from 'vue';
  import { Search, RefreshLeft } from '@element-plus/icons-vue';
  import { getSupplierList } from '@/api/supplier.js'; // 确认API路径
  import { ElMessage } from 'element-plus';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    // initialSelectedId: { // 如果需要回显
    //   type: String,
    //   default: null
    // }
  });
  
  const emit = defineEmits(['update:visible', 'selected']);
  
  const loading = ref(false);
  const supplierList = ref([]);
  const selectedSupplierId = ref(null); // 用于单选
  const currentSelectedSupplier = ref(null); // 存储选中的完整供应商对象
  
  const searchForm = reactive({
    name: '',
    contact_person: ''
  });
  
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  
  const supplierTableRef = ref(null);
  
  const fetchList = async () => {
    loading.value = true;
    try {
      const params = {
        ...searchForm,
        page: pagination.currentPage - 1,
        size: pagination.pageSize,
        is_active: true // 通常只选择活跃的供应商
      };
      const res = await getSupplierList(params);
      supplierList.value = res.data.content || [];
      pagination.total = res.data.totalElements || 0;
    } catch (error) {
      console.error("获取供应商列表失败:", error);
      ElMessage.error('获取供应商列表失败');
    } finally {
      loading.value = false;
    }
  };
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      // selectedSupplierId.value = props.initialSelectedId; // 如果需要回显
      // currentSelectedSupplier.value = null; // 重置
      // if (props.initialSelectedId && supplierList.value.length > 0) {
      //   const found = supplierList.value.find(s => s.id === props.initialSelectedId);
      //   if (found) currentSelectedSupplier.value = found;
      // }
      resetSearch(); // 打开时重置并加载第一页
    }
  });
  
  const handleSearch = () => {
    pagination.currentPage = 1;
    fetchList();
  };
  
  const resetSearch = () => {
    searchForm.name = '';
    searchForm.contact_person = '';
    handleSearch();
  };
  
  const handleSizeChange = (val) => {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    fetchList();
  };
  
  const handleCurrentChange = (val) => {
    pagination.currentPage = val;
    fetchList();
  };
  
  const handleRadioChange = (supplier) => {
      selectedSupplierId.value = supplier.id;
      currentSelectedSupplier.value = supplier; // 存储完整对象
  };
  
  const handleRowDblClick = (row) => {
      selectedSupplierId.value = row.id;
      currentSelectedSupplier.value = row;
      handleConfirmSelection();
  };
  
  const handleConfirmSelection = () => {
    if (!currentSelectedSupplier.value) {
      ElMessage.warning('请选择一个供应商');
      return;
    }
    emit('selected', currentSelectedSupplier.value); // 返回选中的完整供应商对象
    handleClose();
  };
  
  const handleClose = () => {
    emit('update:visible', false);
  };
  
  </script>
  
  <style scoped>
  .selector-dialog-content {
    /* 可以添加一些内边距或样式 */
  }
  .pagination-container {
    padding-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
  /* 确保radio和表格内容对齐 */
  .el-table .el-radio {
      vertical-align: middle;
  }
  </style>