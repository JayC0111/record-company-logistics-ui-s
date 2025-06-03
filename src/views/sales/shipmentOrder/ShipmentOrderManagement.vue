<template>
  <div class="shipment-order-management-page">
    <div class="content-section-card">
      <h3 class="section-title">
        <span>发货单查询</span>
        <div>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建发货单</el-button>
        </div>
      </h3>
      <el-form :model="searchForm" inline class="table-toolbar">
        <el-form-item label="发货单号">
          <el-input v-model="searchForm.shipmentNo" placeholder="请输入发货单号" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="关联出库单">
          <el-input v-model="searchForm.relatedOutboundOrderNo" placeholder="请输入出库单号" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 160px;" />
        </el-form-item>
        <el-form-item label="物流公司">
          <el-select v-model="searchForm.logisticsCarrierId" placeholder="请选择物流公司" clearable filterable style="width: 170px;">
            <el-option v-for="item in logisticsCarrierOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="发货日期">
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
      <h3 class="section-title">发货单列表</h3>
      <el-table :data="orderList" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="55" label="序号" align="center" fixed="left" />
        <el-table-column prop="shipmentNo" label="发货单号" width="190" show-overflow-tooltip fixed="left" />
        <el-table-column prop="relatedOutboundOrderNos" label="关联出库单" min-width="180" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="logisticsCarrierName" label="物流公司" min-width="120" show-overflow-tooltip />
        <el-table-column prop="trackingNumber" label="运单号" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shipmentDate" label="发货日期" min-width="160" show-overflow-tooltip />
        <el-table-column prop="creatorName" label="创建人" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleView(scope.row)" :icon="View">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)" v-if="canEdit(scope.row)" :icon="Edit">编辑</el-button>
            <el-button link type="success" size="small" @click="handleConfirmDelivery(scope.row)" v-if="canConfirmDelivery(scope.row)" :icon="Finished">确认签收</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)" v-if="canDelete(scope.row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
         <template #empty>
          <el-empty description="暂无发货单数据" />
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
import { Plus, Search, RefreshLeft, View, Edit, Delete, Finished } from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import {
    getShipmentOrderList,
    deleteShipmentOrder as deleteShipmentOrderApi,
    confirmShipmentDelivery as confirmShipmentDeliveryApi,
    getLogisticsCarriers
} from '@/api/shipmentOrder'; //

const router = useRouter();
const loading = ref(false);
const orderList = ref([]);
const logisticsCarrierOptions = ref([]);

const searchForm = reactive({
  shipmentNo: '',
  relatedOutboundOrderNo: '', // 修改字段名以反映其内容
  customerName: '',
  logisticsCarrierId: '',
  status: '',
  dateRange: []
});

const statusOptions = [
  { value: 'SHIPPED', label: '已发货' },
  { value: 'DELIVERED', label: '已签收' },
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
    'SHIPPED': 'primary',
    'DELIVERED': 'success',
  };
  return typeMap[status] || 'default';
};

const canEdit = (row) => row.status === 'SHIPPED';
const canConfirmDelivery = (row) => row.status === 'SHIPPED';
const canDelete = (row) => row.status === 'SHIPPED' || row.status === 'CANCELLED';

const fetchLogisticsCarriers = async () => { //
    try {
        const res = await getLogisticsCarriers({ page: 0, size: 1000 });
        if (res.code === 200 && res.data) {
            logisticsCarrierOptions.value = res.data.content || [];
        }
    } catch (error) {
        console.error('获取物流公司列表失败:', error);
    }
};

const fetchOrderList = async () => { //
  loading.value = true;
  try {
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
    // 确保API调用时，如果搜索的是关联出库单号，参数名与后端一致
    // 例如，如果后端期望 relatedOutboundOrderNo，这里不需要额外转换
    // 如果后端期望的是 relatedSalesOrderNo (用于间接查询)，则需要相应调整

    queryParams.page = pagination.currentPage - 1;
    queryParams.size = pagination.pageSize;

    const res = await getShipmentOrderList(queryParams);
    if (res.code === 200 && res.data) {
        orderList.value = (res.data.content || []).map(item => ({
            ...item,
            // 确保 relatedOutboundOrderNos 字段被正确使用和显示
            relatedOutboundOrderNos: item.relatedOutboundOrderNos || item.relatedOutboundOrderNo || ''
        }));
        pagination.total = res.data.totalElements || 0;
    } else {
        ElMessage.error(res.message || '获取发货单列表失败');
        orderList.value = [];
        pagination.total = 0;
    }
  } catch (error) {
    console.error('获取发货单列表失败:', error);
    ElMessage.error(error.message || '获取发货单列表失败');
    orderList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => { //
  pagination.currentPage = 1;
  fetchOrderList();
};

const resetSearch = () => { //
  searchForm.shipmentNo = '';
  searchForm.relatedOutboundOrderNo = ''; // 修改
  searchForm.customerName = '';
  searchForm.logisticsCarrierId = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
};

const handleSizeChange = (size) => { //
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchOrderList();
};

const handleCurrentChange = (page) => { //
  pagination.currentPage = page;
  fetchOrderList();
};

const handleCreate = () => { //
  router.push({ name: 'CreateShipmentOrder' });
};

const handleView = (row) => { //
  router.push({ name: 'ShipmentDetail', params: { id: row.id } });
};

const handleEdit = (row) => { //
  router.push({ name: 'EditShipment', params: { id: row.id } });
};

const handleConfirmDelivery = async (row) => { //
  try {
    await ElMessageBox.confirm(`确定要将发货单 ${row.shipmentNo} 标记为“已签收”吗？`, '确认签收', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });
    loading.value = true;
    const res = await confirmShipmentDeliveryApi(row.id);
    if (res.code === 200) {
      ElMessage.success('操作成功，发货单已标记为已签收');
      fetchOrderList();
    } else {
      ElMessage.error(res.message || '确认签收失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认签收操作失败');
      console.error('确认签收失败详情:', error);
    }
  } finally {
      loading.value = false;
  }
};

const handleDelete = async (row) => { //
  try {
    await ElMessageBox.confirm(`确定要删除发货单 ${row.shipmentNo} 吗？删除后可能影响关联数据！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    });
    loading.value = true;
    const res = await deleteShipmentOrderApi(row.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      if (orderList.value.length === 1 && pagination.currentPage > 1) {
        pagination.currentPage--;
      }
      fetchOrderList();
    } else {
      ElMessage.error(res.message || '删除发货单失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除发货单操作失败');
      console.error('删除发货单失败详情:', error);
    }
  } finally {
      loading.value = false;
  }
};

onMounted(() => { //
  fetchLogisticsCarriers();
  fetchOrderList();
});

</script>

<style scoped>
.table-toolbar .el-form-item { /* */
  margin-bottom: 12px;
}
.pagination-container { /* */
  padding: 20px 0 0 0;
  display: flex;
  justify-content: flex-end;
}
</style>