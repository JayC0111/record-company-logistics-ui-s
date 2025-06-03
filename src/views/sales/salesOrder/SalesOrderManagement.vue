<template>
  <div class="sales-order-management-page">
    <div class="content-section-card">
      <h3 class="section-title">
        <span>销售单查询</span>
        <div>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建销售单</el-button>
        </div>
      </h3>
      <el-form :model="searchForm" inline class="table-toolbar">
        <el-form-item label="销售单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入销售单号" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 130px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期">
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
      <h3 class="section-title">销售单列表</h3>
      <el-table :data="orderList" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="55" label="序号" align="center" fixed="left" />
        <el-table-column prop="orderNo" label="销售单号" width="170" show-overflow-tooltip fixed="left" />
        <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="totalAmount" label="总金额" min-width="120" align="right">
          <template #default="scope">
            ¥{{ formatNumber(scope.row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="130" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" min-width="100" show-overflow-tooltip />
        <el-table-column label="下单时间" min-width="160" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.orderTime || scope.row.createTime }}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleView(scope.row)" :icon="View">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)" v-if="canEdit(scope.row)" :icon="Edit">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleSubmitReview(scope.row)" v-if="canSubmit(scope.row)" :icon="Promotion">提交审批</el-button>
            <el-button link type="success" size="small" @click="handleApprove(scope.row)" v-if="canApprove(scope.row)" :icon="CircleCheck">审核</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)" v-if="canDelete(scope.row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
         <template #empty>
          <el-empty description="暂无销售单数据" />
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
import { Plus, Search, RefreshLeft, View, Edit, Delete, Promotion, CircleCheck } from '@element-plus/icons-vue';
import { ref, reactive, onMounted, onActivated } from 'vue'; // <-- 引入 onActivated
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getSalesOrderList, deleteSalesOrder, submitSalesOrder as submitSalesOrderApi } from '@/api/salesOrder';

// --- 新增 defineOptions 来定义组件的 name ---
// 这个 name 需要与 Layout.vue 中 keep-alive 的 include 数组中的名称匹配
defineOptions({
  name: 'SalesOrderManagement'
});
// --- 结束新增 ---

const router = useRouter();
const loading = ref(false);
const orderList = ref([]);

const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: '',
  dateRange: []
});

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PENDING_APPROVAL', label: '待审核' },
  { value: 'APPROVED', label: '已审核 (待出库)' },
  { value: 'PARTIALLY_SHIPPED', label: '部分发货' },
  { value: 'SHIPPED', label: '已发货' },
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
    'DRAFT': 'info',
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'PARTIALLY_SHIPPED': 'primary',
    'SHIPPED': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  };
  return typeMap[status] || 'default';
};

const formatNumber = (num) => {
  if (typeof num !== 'number') return '0.00';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const canEdit = (row) => ['DRAFT'].includes(row.status);
const canSubmit = (row) => ['DRAFT'].includes(row.status);
const canApprove = (row) => row.status === 'PENDING_APPROVAL';
const canDelete = (row) => ['DRAFT', 'CANCELLED'].includes(row.status);

const fetchOrderList = async () => {
  loading.value = true;
  console.log('[SalesOrderManagement.vue] fetchOrderList called. Params:', JSON.parse(JSON.stringify(searchForm)), 'Pagination:', JSON.parse(JSON.stringify(pagination)));
  try {
    const params = { ...searchForm };
    if (params.dateRange && params.dateRange.length === 2) {
      params.startDate = params.dateRange[0];
      params.endDate = params.dateRange[1];
    }
    delete params.dateRange;

    params.page = pagination.currentPage - 1;
    params.size = pagination.pageSize;

    const res = await getSalesOrderList(params);
    orderList.value = res.data.content || [];
    pagination.total = res.data.totalElements || 0;
    console.log('[SalesOrderManagement.vue] fetchOrderList success. Total orders:', pagination.total);
  } catch (error) {
    console.error('获取销售单列表失败', error);
    ElMessage.error(error.message || '获取销售单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchOrderList();
};

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'dateRange' ? [] : '';
  });
  handleSearch();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  fetchOrderList();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchOrderList();
};

const handleCreate = () => {
  router.push({ name: 'CreateSalesOrder' });
};

const handleView = (row) => {
  router.push({ name: 'SalesOrderDetail', params: { id: row.id }});
};

const handleEdit = (row) => {
  router.push({ name: 'EditSalesOrder', params: { id: row.id }});
};

const handleSubmitReview = async (row) => {
  try {
    await ElMessageBox.confirm('确定要提交该销售单进行审核吗？', '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const res = await submitSalesOrderApi(row.id);
    if (res.code === 200) {
        ElMessage.success('提交成功');
        fetchOrderList(); // 刷新列表
    } else {
        ElMessage.error(res.message || '提交销售单失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
        ElMessage.error(error.message || '提交销售单操作失败');
        console.error('提交销售单失败详情:', error);
    }
  }
};

const handleApprove = (row) => {
  router.push({ name: 'SalesOrderDetail', params: { id: row.id }, query: { mode: 'approve' }});
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该销售单吗？删除后不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    });
    const res = await deleteSalesOrder(row.id);
    if (res.code === 200) {
        ElMessage.success('删除成功');
        fetchOrderList(); // 刷新列表
    } else {
        ElMessage.error(res.message || '删除销售单失败');
    }
  } catch (error) {
     if (error !== 'cancel') {
        ElMessage.error(error.message || '删除销售单操作失败');
        console.error('删除销售单失败详情:', error);
    }
  }
};

onMounted(() => {
  console.log('SalesOrderManagement onMounted');
  fetchOrderList();
});

// --- 修改部分：引入 onActivated 钩子并在其中调用 fetchOrderList ---
onActivated(() => {
  console.log('SalesOrderManagement onActivated, re-fetching list.');
  fetchOrderList(); 
});
// --- 结束修改 ---

</script>

<style scoped>
/* .sales-order-management-page {} */ /* 你可以取消注释并添加特定样式 */

.pagination-container {
  padding: 20px 0 0 0;
  display: flex;
  justify-content: flex-end;
}
</style>