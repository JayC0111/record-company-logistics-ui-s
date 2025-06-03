<template>
  <div class="purchase-requisition-management-page"> <div class="content-section-card"> <h3 class="section-title"> <span>采购计划查询</span>
        <div> <el-button type="primary" :icon="Plus" @click="handleCreate">新建采购计划</el-button>
        </div>
      </h3>
      <el-form :model="searchForm" ref="queryFormRef" inline class="table-toolbar">
        <el-form-item label="计划单号" prop="requisition_no">
          <el-input v-model="searchForm.requisition_no" placeholder="请输入计划单号" clearable @keyup.enter="handleSearch" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="申请人" prop="requesterName">
          <el-input v-model="searchForm.requesterName" placeholder="请输入申请人姓名" clearable @keyup.enter="handleSearch" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 130px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请日期">
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
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="RefreshLeft" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-section-card"> <h3 class="section-title">采购计划单列表</h3> <el-table :data="requisitionList" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="55" label="序号" align="center" fixed="left" />
        <el-table-column prop="requisition_no" label="计划单号" width="170" show-overflow-tooltip fixed="left" />
        <el-table-column prop="request_date" label="申请日期" width="150" align="center" />
        <el-table-column prop="requesterName" label="申请人" width="120" show-overflow-tooltip />
        <el-table-column prop="request_department" label="申请部门" width="120" show-overflow-tooltip />
        <el-table-column prop="purpose" label="申请目的" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="130" align="center">
            <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
                    {{ getStatusText(scope.row.status) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleView(scope.row)" :icon="View">详情</el-button>
            <el-button v-if="canEdit(scope.row)" link type="primary" size="small" @click="handleEdit(scope.row)" :icon="Edit">编辑</el-button>
            <el-button v-if="canSubmit(scope.row)" link type="primary" size="small" @click="handleSubmitForApproval(scope.row)" :icon="Promotion">提交审批</el-button>
            <el-button v-if="canApprove(scope.row)" link type="success" size="small" @click="handleApprove(scope.row)" :icon="CircleCheck">审核</el-button>
            <el-button v-if="canDelete(scope.row)" link type="danger" size="small" @click="handleDelete(scope.row)" :icon="Delete">删除</el-button>
            <el-button v-if="canConvertToPO(scope.row)" link type="success" size="small" @click="handleConvertToPO(scope.row)" :icon="Finished">生成采购单</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无采购计划数据" />
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
import { Plus, Search, RefreshLeft, View, Edit, Delete, Promotion, CircleCheck, Finished } from '@element-plus/icons-vue';
import { ref, reactive, onMounted, onActivated } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { 
    getPurchaseRequisitionList, 
    deletePurchaseRequisition,
    submitPurchaseRequisition as submitRequisitionApi,
    // approvePurchaseRequisition as approveRequisitionApi // 审核通常在详情页操作，此处可能不需要
} from '@/api/purchaseRequisition';

// 9. defineOptions 用于 keep-alive
defineOptions({
  name: 'PurchaseRequisitionManagement'
});

const router = useRouter();
const loading = ref(false);
const requisitionList = ref([]);

// 10. searchForm 对应筛选表单
const searchForm = reactive({
  requisition_no: '',
  requesterName: '',
  status: '',
  dateRange: []
});

// 采购计划单状态选项
const statusOptions = [
    { value: 'DRAFT', label: '草稿' },
    { value: 'PENDING_APPROVAL', label: '待审批' },
    { value: 'APPROVED', label: '已批准' },
    { value: 'REJECTED', label: '已拒绝' },
    { value: 'PARTIALLY_CONVERTED', label: '部分转单' }, // 假设的状态
    { value: 'FULLY_CONVERTED', label: '已转单' },     // 假设的状态
];

// 11. pagination 对象结构与销售单页面一致
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 辅助函数，获取状态文本
const getStatusText = (status) => {
  const option = statusOptions.find(item => item.value === status);
  return option ? option.label : status;
};

// 辅助函数，获取状态对应的Tag类型
const getStatusType = (status) => {
  const typeMap = {
    'DRAFT': 'info',
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'PARTIALLY_CONVERTED': 'primary',
    'FULLY_CONVERTED': 'success'
  };
  return typeMap[status] || 'default';
};

// 定义操作按钮的可见性逻辑 (参照ZERO.pdf和销售单页面逻辑)
const canEdit = (row) => ['DRAFT'].includes(row.status);
const canSubmit = (row) => ['DRAFT'].includes(row.status);
const canApprove = (row) => row.status === 'PENDING_APPROVAL'; // 审核按钮，通常点击后进入详情页进行审核操作
const canDelete = (row) => ['DRAFT', 'REJECTED'].includes(row.status); // 通常草稿和已拒绝的可删除
const canConvertToPO = (row) => row.status === 'APPROVED';

// 12. fetchRequisitionList 对应 fetchOrderList
const fetchRequisitionList = async () => {
  loading.value = true;
  try {
    // 准备API参数，与销售单页面一致
    const params = { 
        requisition_no: searchForm.requisition_no,
        requesterName: searchForm.requesterName,
        status: searchForm.status,
    };
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    params.page = pagination.currentPage - 1; // 分页参数调整
    params.size = pagination.pageSize;

    const res = await getPurchaseRequisitionList(params);
    requisitionList.value = res.data.content || [];
    pagination.total = res.data.totalElements || 0;
  } catch (error) {
    console.error('获取采购计划列表失败', error);
    ElMessage.error(error.message || '获取采购计划列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchRequisitionList();
};

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'dateRange' ? [] : '';
  });
  handleSearch();
};

// 13. 分页事件处理与销售单页面一致
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1; // 修改size时重置到第一页
  fetchRequisitionList();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchRequisitionList();
};

const handleCreate = () => {
  router.push({ name: 'CreatePurchasePlan' }); // 确保路由名称正确
};

const handleView = (row) => {
  router.push({ name: 'PurchasePlanDetail', params: { id: row.id }}); // 确保路由名称正确
};

const handleEdit = (row) => {
  router.push({ name: 'EditPurchasePlan', params: { id: row.id }}); // 确保路由名称正确
};

const handleSubmitForApproval = async (row) => {
  try {
    await ElMessageBox.confirm('确定要提交该采购计划进行审批吗？', '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const res = await submitRequisitionApi(row.id); // 使用导入的 submitRequisitionApi
    if (res.code === 200) {
        ElMessage.success('提交成功');
        fetchRequisitionList();
    } else {
        ElMessage.error(res.message || '提交采购计划失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
        ElMessage.error(error.message || '提交采购计划操作失败');
    }
  }
};

const handleApprove = (row) => {
  // 审核操作通常跳转到详情页，并在详情页进行批准/拒绝
  router.push({ name: 'PurchasePlanDetail', params: { id: row.id }, query: { mode: 'approve' }});
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该采购计划吗？删除后不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    });
    const res = await deletePurchaseRequisition(row.id);
    if (res.code === 200) {
        ElMessage.success('删除成功');
        fetchRequisitionList();
    } else {
        ElMessage.error(res.message || '删除采购计划失败');
    }
  } catch (error) {
     if (error !== 'cancel') {
        ElMessage.error(error.message || '删除采购计划操作失败');
    }
  }
};

const handleConvertToPO = (row) => {
    router.push({ path: '/purchase/order/create', query: { fromRequisitionId: row.id } });
};

// 14. onMounted 和 onActivated 与销售单页面一致
onMounted(() => {
  fetchRequisitionList();
});

onActivated(() => {
  fetchRequisitionList(); 
});

</script>

<style scoped>
/* 15. 样式与销售单页面对应调整 */
/* .purchase-requisition-management-page {} */

.content-section-card {
  margin-bottom: 20px;
}
.content-section-card:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color, #1d50f9); /* 确保标题颜色符合主题 */
  margin: 0 0 20px 0; /* 调整标题和表单/表格的间距 */
  padding-bottom: 16px; /* 参照销售单页面截图下方可能有分割线 */
  border-bottom: 1px solid var(--border-color-lighter, #ebeef5); /* 参照销售单页面截图下方可能有分割线 */

  /* 用于标题行内按钮的布局 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title span { 
    /* 如果标题和按钮不在一行，这个span可以去掉，直接h3设置颜色 */
}

.table-toolbar {
    /* 确保class与global.css中的定义协同工作 */
}

.pagination-container {
 padding: 20px 0 0 0;
 display: flex;
 justify-content: flex-end;
}
</style>