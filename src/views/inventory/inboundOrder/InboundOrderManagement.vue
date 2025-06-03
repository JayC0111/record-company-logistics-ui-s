<template>
  <div class="inbound-order-management-page">
    <div class="content-section-card">
      <h3 class="section-title">
        <span>入库单查询</span>
        <div>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建入库单</el-button>
        </div>
      </h3>
      <el-form :model="searchForm" ref="queryFormRef" inline class="table-toolbar">
        <el-form-item label="入库单号" prop="putaway_order_no">
          <el-input v-model="searchForm.putaway_order_no" placeholder="请输入入库单号" clearable @keyup.enter="handleSearch" style="width: 190px;" />
        </el-form-item>
        <el-form-item label="操作员" prop="creatorName">
          <el-input v-model="searchForm.creatorName" placeholder="请输入操作员名称" clearable @keyup.enter="handleSearch" style="width: 160px;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
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
                style="width: 230px;"
            />
        </el-form-item>
        <el-form-item class="action-buttons-item">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshLeft" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-section-card">
        <h3 class="section-title">入库单列表</h3>
        <el-table :data="inboundOrderList" border style="width: 100%" v-loading="loading">
            <el-table-column type="index" width="55" label="序号" align="center" fixed="left" />
            <el-table-column prop="putaway_order_no" label="入库单号" width="200" show-overflow-tooltip fixed="left" />
            <el-table-column prop="related_purchase_order_nos" label="关联采购单" min-width="200" show-overflow-tooltip />
            <el-table-column prop="creation_time" label="创建时间" width="170" align="center" />
            <el-table-column prop="creatorName" label="操作员" width="120" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="110" align="center">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="scope">
                <el-button link type="primary" size="small" :icon="View" @click="handleView(scope.row)">详情</el-button>
                <el-button v-if="canProcess(scope.row)" link type="success" size="small" :icon="Finished" @click="handleProcess(scope.row)">完成入库</el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="暂无入库单数据" />
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
import { Plus, Search, RefreshLeft, View, Finished, CircleClose } from '@element-plus/icons-vue';
import { getInboundOrderList, updateInboundOrder, cancelInboundOrder } from '@/api/inboundOrder.js';

defineOptions({
  name: 'InboundOrderManagement'
});

const router = useRouter();

const loading = ref(false);
const inboundOrderList = ref([]);

const searchForm = reactive({
  putaway_order_no: '',
  creatorName: '',
  status: '',
  dateRange: [],
});

const statusOptions = [
    { value: 'PENDING', label: '待处理' },
    { value: 'COMPLETED', label: '已完成' },
    { value: 'CANCELLED', label: '已取消' },
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
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  };
  return typeMap[status] || 'default';
};

// 操作按钮可见性控制
const canProcess = (row) => row.status === 'PENDING';
// const canCancel = (row) => row.status === 'PENDING'; // 取消按钮的逻辑可以后续添加

const fetchList = async () => {
  loading.value = true;
  try {
    const params = { 
        putaway_order_no: searchForm.putaway_order_no,
        creatorName: searchForm.creatorName,
        status: searchForm.status,
    };
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    params.page = pagination.currentPage - 1;
    params.size = pagination.pageSize;

    const res = await getInboundOrderList(params);
    inboundOrderList.value = res.data.content || [];
    pagination.total = res.data.totalElements || 0;
  } catch (error) {
    console.error("获取入库单列表失败:", error);
    ElMessage.error(error.message || '获取入库单列表失败');
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
  router.push({ name: 'CreateInboundOrder' }); // 路由名称根据您的router/index.js定义
};

const handleView = (row) => {
  router.push({ name: 'InboundOrderDetail', params: { id: row.id }}); // 路由名称根据您的router/index.js定义
};

const handleProcess = async (row) => {
  // 根据 ZERO.pdf Step 8: 执行入库上架 -> "确认入库完成"
  // 实际操作可能更复杂，例如需要录入实际上架数量或库位，这里简化为直接更新状态
  try {
    await ElMessageBox.confirm(`确定要将入库单【${row.putaway_order_no}】标记为“已完成”吗？`, '完成入库确认', {
      confirmButtonText: '确定完成',
      cancelButtonText: '取消',
      type: 'success'
    });
    // 调用API更新状态为 COMPLETED
    const res = await updateInboundOrder(row.id, { status: 'COMPLETED' });
    if (res.code === 200) {
        ElMessage.success('入库操作成功，状态已更新为“已完成”');
        fetchList(); // 刷新列表
    } else {
        ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
        ElMessage.error(error.message || '操作失败');
    }
  }
};

// const handleCancel = async (row) => { /* ... */ }; // 取消逻辑

onMounted(() => {
  fetchList();
});

onActivated(() => {
  fetchList();
});

</script>

<style scoped>
.inbound-order-management-page {
  /* 根容器的特定样式，如果需要 */
}
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

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color); /* 应用主题色 */
  margin: 0 0 18px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar { }

.action-buttons-item {
    margin-left: auto;
}
.pagination-container {
 padding: 20px 0 0 0;
 display: flex;
 justify-content: flex-end;
}
</style>