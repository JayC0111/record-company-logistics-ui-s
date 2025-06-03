<template>
  <div class="outbound-order-management-page">
    <div class="content-section-card">
      <h3 class="section-title">
        <span>出库单查询</span>
        <div>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建出库单</el-button>
        </div>
      </h3>
      <el-form :model="searchForm" inline class="table-toolbar">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.outboundOrderNo" placeholder="请输入出库单号" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="关联销售单">
          <el-input v-model="searchForm.relatedSalesOrderNos" placeholder="请输入销售单号" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="searchForm.creatorName" placeholder="请输入责任人名称" clearable style="width: 160px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
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
      <h3 class="section-title">出库单列表</h3>
      <el-table :data="orderList" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="55" label="序号" align="center" fixed="left" />
        <el-table-column prop="outboundOrderNo" label="出库单号" width="190" show-overflow-tooltip fixed="left" />
        <el-table-column prop="relatedSalesOrderNos" label="关联销售单" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="130" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creatorName" label="出库责任人" min-width="120" show-overflow-tooltip />
        <el-table-column prop="creationTime" label="创建时间" min-width="160" show-overflow-tooltip />
        <el-table-column prop="notes" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleView(scope.row)" :icon="View">查看</el-button>
            <el-button link type="primary" size="small" @click="handleProcess(scope.row)" v-if="canProcess(scope.row)" :icon="Edit">处理</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)" v-if="canDelete(scope.row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
         <template #empty>
          <el-empty description="暂无出库单数据" />
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
import { Plus, Search, RefreshLeft, View, Edit, Delete } from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getOutboundOrderList, deleteOutboundOrder as deleteOutboundOrderApi } from '@/api/outboundOrder'; //

const router = useRouter();
const loading = ref(false);
const orderList = ref([]);

const searchForm = reactive({
  outboundOrderNo: '',
  relatedSalesOrderNos: '',
  creatorName: '', // 新增：出库责任人名称
  status: '',
  dateRange: []
});

const statusOptions = [
  { value: 'PENDING', label: '待出库' },
  { value: 'READY_TO_SHIP', label: '待发货' },
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
    'PENDING': 'warning',
    'READY_TO_SHIP': 'success',
  };
  return typeMap[status] || 'default';
};

const canProcess = (row) => row.status === 'PENDING';
const canDelete = (row) => row.status === 'PENDING';


const fetchOrderList = async () => {
  loading.value = true;
  try {
    // 构造查询参数，确保只传递有值的搜索项
    const queryParams = {};
    for (const key in searchForm) {
      if (searchForm[key] !== '' && searchForm[key] !== null && !(Array.isArray(searchForm[key]) && searchForm[key].length === 0)) {
        if (key === 'dateRange') {
          queryParams.startDate = searchForm[key][0];
          queryParams.endDate = searchForm[key][1];
        } else {
          queryParams[key] = searchForm[key];
        }
      }
    }

    // 添加分页参数
    queryParams.page = pagination.currentPage - 1;
    queryParams.size = pagination.pageSize;
    
    // console.log('Fetching outbound orders with params:', queryParams); // 调试用
    const res = await getOutboundOrderList(queryParams); //
    if (res.code === 200 && res.data) {
        orderList.value = res.data.content || [];
        pagination.total = res.data.totalElements || 0;
    } else {
        ElMessage.error(res.message || '获取出库单列表失败');
        orderList.value = [];
        pagination.total = 0;
    }
  } catch (error) {
    console.error('获取出库单列表失败:', error);
    ElMessage.error(error.message || '获取出库单列表失败');
    orderList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1; 
  fetchOrderList();
};

const resetSearch = () => {
  searchForm.outboundOrderNo = '';
  searchForm.relatedSalesOrderNos = '';
  searchForm.creatorName = ''; // 新增：重置责任人
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch(); 
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1; 
  fetchOrderList();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchOrderList();
};

const handleCreate = () => {
  router.push({ name: 'CreateOutboundOrder' }); //
};

const handleView = (row) => {
  router.push({ name: 'OutboundOrderDetail', params: { id: row.id } }); //
};

const handleProcess = (row) => {
  router.push({ name: 'ProcessOutboundOrder', params: { id: row.id } }); //
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除出库单 ${row.outboundOrderNo} 吗？删除后不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    });
    loading.value = true; 
    const res = await deleteOutboundOrderApi(row.id); //
    if (res.code === 200) {
      ElMessage.success('删除成功');
      if (orderList.value.length === 1 && pagination.currentPage > 1) {
        pagination.currentPage--;
      }
      fetchOrderList();
    } else {
      ElMessage.error(res.message || '删除出库单失败');
    }
  } catch (error) {
    if (error !== 'cancel') { 
      ElMessage.error(error.message || '删除出库单操作失败');
      console.error('删除出库单失败详情:', error);
    }
  } finally {
      loading.value = false;
  }
};

onMounted(() => {
  fetchOrderList();
});

</script>

<style scoped>
/* .outbound-order-management-page {} */

.pagination-container {
  padding: 20px 0 0 0;
  display: flex;
  justify-content: flex-end;
}
</style>