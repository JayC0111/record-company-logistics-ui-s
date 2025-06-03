<template>
  <div class="purchase-order-management-page">
    <div class="content-section-card">
      <h3 class="section-title"> <span>采购单查询</span>
        <div>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建采购单</el-button>
        </div>
      </h3>
      <el-form :model="searchForm" ref="queryFormRef" inline class="table-toolbar">
        <el-form-item label="采购单号" prop="po_number">
          <el-input v-model="searchForm.po_number" placeholder="请输入采购单号" clearable @keyup.enter="handleSearch" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierName">
          <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" clearable @keyup.enter="handleSearch" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 130px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期">
            <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 220px;"
            />
        </el-form-item>
        <el-form-item class="action-buttons-item">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshLeft" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-section-card">
        <h3 class="section-title">采购单列表</h3> <el-table :data="purchaseOrderList" border style="width: 100%" v-loading="loading">
            <el-table-column type="index" width="55" label="序号" align="center" fixed="left" />
            <el-table-column prop="po_number" label="采购单号" width="190" show-overflow-tooltip fixed="left" />
            <el-table-column prop="supplierName" label="供应商" min-width="160" show-overflow-tooltip />
            <el-table-column prop="order_date" label="下单日期" width="150" align="center" />
            <el-table-column prop="total_amount" label="总金额" width="120" align="right">
                <template #default="scope">
                    ¥{{ formatAmount(scope.row.total_amount) }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="140" align="center">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="creatorName" label="创建人" width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="scope">
                <el-button link type="primary" size="small" :icon="View" @click="handleView(scope.row)">详情</el-button>
                <el-button v-if="canEdit(scope.row)" link type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button v-if="canDelete(scope.row)" link type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
            </el-table-column>
            <template #empty>
                <el-empty description="暂无采购单数据" />
            </template>
        </el-table>

        <div class="pagination-container">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, RefreshLeft, View, Edit, Delete } from '@element-plus/icons-vue';
import { getPurchaseOrderList, deletePurchaseOrder } from '@/api/purchaseOrder.js';

defineOptions({
  name: 'PurchaseOrderManagement'
});

const router = useRouter();

const loading = ref(false);
const purchaseOrderList = ref([]);

const searchForm = reactive({
  po_number: '',
  supplierName: '',
  status: '',
  dateRange: [],
});

const statusOptions = [
    { value: 'PENDING_RECEIPT', label: '待收货' },
    { value: 'PARTIALLY_RECEIVED', label: '部分收货' },
    { value: 'FULLY_RECEIVED', label: '全部收货' },
    { value: 'COMPLETED', label: '已完成' },
    { value: 'CANCELLED', label: '已取消' }
];

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const getStatusText = (status) => {
  const option = statusOptions.find(item => item.value === status);
  return option ? option.label : status;
};

const getStatusType = (status) => {
  const typeMap = {
    'PENDING_RECEIPT': 'warning',
    'PARTIALLY_RECEIVED': 'primary',
    'FULLY_RECEIVED': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  };
  return typeMap[status] || 'default';
};

const formatAmount = (num) => {
  if (typeof num !== 'number') return '0.00';
  return num.toFixed(2); 
};

const canEdit = (row) => ['PENDING_RECEIPT'].includes(row.status);
const canDelete = (row) => ['PENDING_RECEIPT', 'CANCELLED'].includes(row.status);

const fetchList = async () => {
  loading.value = true;
  try {
    const params = { 
        po_number: searchForm.po_number,
        supplierName: searchForm.supplierName,
        status: searchForm.status,
    };
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    params.page = pagination.currentPage - 1;
    params.size = pagination.pageSize;

    const res = await getPurchaseOrderList(params);
    purchaseOrderList.value = res.data.content || [];
    pagination.total = res.data.totalElements || 0;
  } catch (error) {
    console.error("获取采购单列表失败:", error);
    ElMessage.error(error.message || '获取采购单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchList();
};

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'dateRange' ? [] : '';
  });
  handleSearch();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchList();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchList();
};

const handleCreate = () => {
  router.push('/purchase/order/create');
};

const handleView = (row) => {
  router.push(`/purchase/order/detail/${row.id}`);
};

const handleEdit = (row) => {
  router.push(`/purchase/order/edit/${row.id}`);
};

const handleDelete = async (row) => {
  ElMessageBox.confirm(
    `确定要删除采购单【${row.po_number}】吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deletePurchaseOrder(row.id);
      ElMessage.success('删除成功');
      fetchList();
    } catch (error) {
      console.error("删除采购单失败:", error);
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchList();
});

onActivated(() => {
  fetchList();
});

</script>

<style scoped>
/* .purchase-order-management-page {} */

.content-section-card {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
}
.content-section-card:last-child {
  margin-bottom: 0;
}

/* 修正：移除了局部的 .section-title 颜色定义，使其继承 global.css 中的样式 */
.section-title {
  font-size: 16px;
  font-weight: 500;
  /* color 定义已移除，将由 global.css 中的 .section-title 生效 */
  margin: 0 0 18px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar {
  /* 确保class与global.css中的定义协同工作 */
}
.action-buttons-item {
    margin-left: auto;
}
.pagination-container {
 padding: 20px 0 0 0;
 display: flex;
 justify-content: flex-end;
}
</style>