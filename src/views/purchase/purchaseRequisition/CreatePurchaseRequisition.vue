<template>
  <div class="create-purchase-requisition-page">
    <div class="page-main-header" style="margin-bottom: 20px;">
      <h1 class="page-main-title">{{ pageTitle }}</h1>
    </div>

    <el-form :model="form" :rules="rules" ref="requisitionFormRef" label-width="120px">
      <el-card shadow="never" class="form-section-card">
        <h3 class="section-title">基本信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="计划单号" prop="requisition_no">
              <el-input v-model="form.requisition_no" placeholder="保存后自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请日期" prop="request_date">
              <el-date-picker v-model="form.request_date" type="date" placeholder="选择日期" style="width: 100%;" value-format="YYYY-MM-DD" :disabled="viewMode"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人" prop="requesterName">
              <el-input v-model="form.requesterName" placeholder="当前登录用户" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请部门" prop="request_department">
              <el-input v-model="form.request_department" placeholder="请输入申请部门" :disabled="viewMode"/>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="采购用途" prop="purpose">
              <el-input v-model="form.purpose" placeholder="请输入采购用途" :disabled="viewMode"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card shadow="never" class="form-section-card">
        <h3 class="section-title" style="margin-bottom: 10px;">
          <span>商品明细</span>
          <div v-if="!viewMode">
            <el-button type="primary" :icon="Plus" @click="openProductSelector">添加商品</el-button>
          </div>
        </h3>
        <el-table :data="form.items" border style="width: 100%">
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip>
              <template #default="scope">
                  {{ scope.row.productName }} ({{scope.row.productCode}})
              </template>
          </el-table-column>
          <el-table-column prop="specification" label="规格型号" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="estimated_quantity" label="需求数量" width="150" align="center">
            <template #default="scope">
              <el-input-number v-if="!viewMode" v-model="scope.row.estimated_quantity" :min="1" controls-position="right" @change="calculateLineTotal(scope.row)" style="width: 100%" />
              <span v-else>{{ scope.row.estimated_quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="estimated_unit_price" label="预估单价" width="150" align="center">
            <template #default="scope">
              <el-input-number v-if="!viewMode" v-model="scope.row.estimated_unit_price" :min="0" :precision="2" controls-position="right" @change="calculateLineTotal(scope.row)" style="width: 100%"/>
              <span v-else>¥{{ scope.row.estimated_unit_price?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预估金额" width="120" align="right">
            <template #default="scope">
              <span>¥{{ (scope.row.estimated_quantity * scope.row.estimated_unit_price || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="建议供应商" min-width="180" show-overflow-tooltip>
             <template #default="scope">
                <div v-if="!viewMode" style="display: flex; align-items: center;">
                    <span style="flex-grow: 1; margin-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="scope.row.suggestedSupplierName">
                        {{ scope.row.suggestedSupplierName || '未选择' }}
                    </span>
                    <el-button link type="primary" @click="openSupplierSelector(scope.$index)">选择</el-button>
                </div>
                <span v-else>{{ scope.row.suggestedSupplierName || '无' }}</span>
            </template>
          </el-table-column>
           <el-table-column prop="line_notes" label="行备注" min-width="150">
            <template #default="scope">
              <el-input v-if="!viewMode" v-model="scope.row.line_notes" placeholder="备注" />
              <span v-else>{{ scope.row.line_notes }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center" v-if="!viewMode">
            <template #default="scope">
              <el-button link type="danger" @click="removeLineItem(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
             <el-empty :description="viewMode ? '暂无商品明细' : '请点击“添加商品”按钮增加明细'" />
          </template>
        </el-table>
        <div style="text-align: right; margin-top: 10px; font-weight: bold;">
            预估总金额：¥{{ totalEstimatedAmount.toFixed(2) }}
        </div>
      </el-card>

      <el-card shadow="never" class="form-section-card">
        <h3 class="section-title">备注信息</h3>
        <el-form-item label="备注" prop="notes" label-width="0px">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" :disabled="viewMode"/>
        </el-form-item>
      </el-card>
    </el-form>

    <div class="page-actions-footer" v-if="!viewMode || (mode === 'approve' && form.status === 'PENDING_APPROVAL')">
      <el-button @click="goBack">取消</el-button>
      <template v-if="mode === 'create' || mode === 'edit'">
          <el-button type="primary" @click="handleSaveDraft" :loading="saveLoading">保存草稿</el-button>
          <el-button type="success" @click="handleSubmitForApproval" :loading="submitLoading">提交审批</el-button>
      </template>
      <template v-if="mode === 'approve' && form.status === 'PENDING_APPROVAL'">
          <el-button type="danger" @click="handleApproval(false)" :loading="approvalLoading.reject">审批拒绝</el-button>
          <el-button type="success" @click="handleApproval(true)" :loading="approvalLoading.approve">审批通过</el-button>
      </template>
    </div>

    <ProductSelectorDialog 
        v-model:visible="productSelectorVisible" 
        @selected="handleProductsSelected"
        :multiple="true" 
    />
    <SupplierSelectorDialog
        v-model:visible="supplierSelectorVisible"
        @selected="handleSupplierSelected"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import ProductSelectorDialog from '@/components/shared/ProductSelectorDialog.vue'; // 确认路径
import SupplierSelectorDialog from '@/components/shared/SupplierSelectorDialog.vue'; // 确认路径
import { 
    createPurchaseRequisition, 
    getPurchaseRequisitionDetail, 
    updatePurchaseRequisition,
    submitPurchaseRequisition,
    approvePurchaseRequisition
} from '@/api/purchaseRequisition';
import { useUserStore } from '@/stores/modules/auth'; // 假设你有用户store获取当前用户信息

defineOptions({
  name: 'CreatePurchaseRequisition'
});

const router = useRouter();
const route = useRoute();
const userStore = useUserStore(); // 用于获取当前用户信息

const requisitionFormRef = ref(null);
const form = reactive({
  id: null,
  requisition_no: '',
  request_date: new Date().toISOString().slice(0,10), // 默认当天
  requester_id: '',
  requesterName: '',
  request_department: '',
  purpose: '',
  notes: '',
  status: 'DRAFT',
  items: [],
});

const rules = {
  request_date: [{ required: true, message: '请选择申请日期', trigger: 'change' }],
  request_department: [{ required: true, message: '请输入申请部门', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入采购用途', trigger: 'blur' }],
  items: [{ type: 'array', required: true, min:1, message: '请至少添加一个商品明细', trigger: 'change'}]
};

const mode = ref('create'); // create, edit, view, approve
const pageTitle = computed(() => {
  if (mode.value === 'create') return '新建采购计划单';
  if (mode.value === 'edit') return '编辑采购计划单';
  if (mode.value === 'approve') return '审批采购计划单';
  return '采购计划单详情';
});
const viewMode = computed(() => mode.value === 'view' || mode.value === 'approve');

const productSelectorVisible = ref(false);
const supplierSelectorVisible = ref(false);
const currentLineItemIndex = ref(null); // 用于记录当前操作的是第几行明细的供应商选择

const saveLoading = ref(false);
const submitLoading = ref(false);
const approvalLoading = reactive({ approve: false, reject: false });


// 计算属性
const totalEstimatedAmount = computed(() => {
  return form.items.reduce((sum, item) => {
    const quantity = Number(item.estimated_quantity) || 0;
    const price = Number(item.estimated_unit_price) || 0;
    return sum + (quantity * price);
  }, 0);
});

const calculateLineTotal = (line) => {
  // 此函数主要用于触发总金额的重新计算 (通过 Vue 的响应式系统)
  // 实际行总金额在表格模板中直接计算展示
};

// 加载当前用户信息
const loadCurrentUser = () => {
    // 假设 userStore.userInfo 包含 id 和 fullName
    if (userStore.userInfo) {
        form.requester_id = userStore.userInfo.id;
        form.requesterName = userStore.userInfo.fullName || userStore.userInfo.username;
        // form.request_department = userStore.userInfo.department || ''; // 如果有部门信息
    } else {
        // 如果store中没有，可以尝试调用API获取
        console.warn("未能从store获取当前用户信息");
    }
};


// 方法
const openProductSelector = () => {
  productSelectorVisible.value = true;
};

const handleProductsSelected = (selectedProducts) => {
  selectedProducts.forEach(product => {
    // 检查是否已存在相同product_id的行
    if (!form.items.find(item => item.product_id === product.id)) {
      form.items.push({
        id: null, // 新增行为null，后端生成
        product_id: product.id,
        productCode: product.productCode,
        productName: product.name,
        specification: product.specification,
        unit: product.unit,
        estimated_quantity: 1,
        estimated_unit_price: product.costPrice || 0, // 默认使用成本价
        suggested_supplier_id: null,
        suggestedSupplierName: '',
        line_notes: ''
      });
    } else {
      ElMessage.warning(`商品 "${product.name}" 已在明细中。`);
    }
  });
};

const openSupplierSelector = (index) => {
  currentLineItemIndex.value = index;
  supplierSelectorVisible.value = true;
};

const handleSupplierSelected = (supplier) => {
  if (currentLineItemIndex.value !== null && form.items[currentLineItemIndex.value]) {
    form.items[currentLineItemIndex.value].suggested_supplier_id = supplier.id;
    form.items[currentLineItemIndex.value].suggestedSupplierName = supplier.name;
  }
  currentLineItemIndex.value = null;
};

const removeLineItem = (index) => {
  form.items.splice(index, 1);
};

const loadRequisitionDetails = async (id) => {
  try {
    loading.value = true;
    const res = await getPurchaseRequisitionDetail(id);
    if (res.code === 200 && res.data) {
      Object.assign(form, res.data);
      // 确保 items 是一个数组
      form.items = Array.isArray(res.data.items) ? res.data.items : [];
    } else {
      ElMessage.error('获取采购计划单详情失败');
      goBack();
    }
  } catch (error) {
    ElMessage.error('加载详情失败: ' + error.message);
    goBack();
  } finally {
    loading.value = false;
  }
};


const handleSaveDraft = async () => {
  await handleSave('DRAFT');
};

const handleSubmitForApproval = async () => {
  await handleSave('PENDING_APPROVAL', true); // true 表示这是提交操作
};

const handleSave = async (statusToSet, isSubmitting = false) => {
  const valid = await requisitionFormRef.value.validate();
  if (!valid) {
    ElMessage.error('请检查表单必填项！');
    return;
  }
  if (!form.items || form.items.length === 0) {
    ElMessage.error('请至少添加一个商品明细！');
    return;
  }

  const loadingRef = isSubmitting ? submitLoading : saveLoading;
  loadingRef.value = true;

  const payload = { ...form, status: statusToSet };
  
  try {
    let response;
    if (mode.value === 'create') {
      response = await createPurchaseRequisition(payload);
      ElMessage.success(isSubmitting ? '提交审批成功！' : '草稿保存成功！');
      // 创建成功后，通常会跳转到详情页或列表页，或者重置表单
      // 这里我们先跳转回列表页
      goBack(); 
    } else if (mode.value === 'edit') {
      response = await updatePurchaseRequisition(form.id, payload);
      ElMessage.success(isSubmitting ? '提交审批成功！' : '更新成功！');
      goBack();
    }
    
  } catch (error) {
    console.error("保存/提交失败:", error);
    // ElMessage 已在 request.js 全局处理
  } finally {
    loadingRef.value = false;
  }
};

const handleApproval = async (approved) => {
    const actionText = approved ? '通过' : '拒绝';
    let comment = '';
    if (!approved) { // 拒绝时要求填写意见
        try {
            const { value } = await ElMessageBox.prompt('请输入审批意见（拒绝时必填）：', `审批${actionText}`, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea',
                inputPlaceholder: '审批意见',
                inputValidator: (val) => {
                    if (!val && !approved) return '拒绝时必须填写审批意见';
                    return true;
                }
            });
            comment = value;
        } catch (error) { // 用户点击取消
            return;
        }
    }

    const loadingType = approved ? 'approve' : 'reject';
    approvalLoading[loadingType] = true;

    try {
        await approvePurchaseRequisition(form.id, { approved, comment });
        ElMessage.success(`审批${actionText}成功`);
        goBack();
    } catch (error) {
        // ElMessage 已在 request.js 全局处理
    } finally {
        approvalLoading[loadingType] = false;
    }
};


const goBack = () => {
  router.push({ name: 'PurchasePlanList' }); // 确保路由名称正确
};

onMounted(() => {
  const requisitionId = route.params.id;
  const queryMode = route.query.mode;

  if (queryMode) {
      mode.value = queryMode; // view, approve
  } else if (requisitionId) {
      mode.value = 'edit';
  } else {
      mode.value = 'create';
  }

  if (mode.value !== 'create') {
    if (requisitionId) {
      loadRequisitionDetails(requisitionId);
    } else {
        ElMessage.error("编辑/查看模式下缺少计划单ID");
        goBack();
        return;
    }
  } else {
      loadCurrentUser(); // 新建时加载当前用户信息
      form.request_date = new Date().toISOString().slice(0,10); // 确保新建时日期是当天
  }

  // 如果是审批模式，但状态不是待审批，则跳回详情查看模式
  if (mode.value === 'approve' && form.status && form.status !== 'PENDING_APPROVAL') {
      mode.value = 'view';
      ElMessage.info("该计划单已审批，以详情模式打开。");
  }
});

// 监听路由参数变化，以应对编辑后又新建的情况
watch(() => route.params.id, (newId, oldId) => {
    if (route.name === 'CreatePurchasePlan' && !newId) { // 导航到新建页面
        mode.value = 'create';
        requisitionFormRef.value?.resetFields(); // 重置表单
        form.id = null;
        form.requisition_no = '';
        form.items = [];
        loadCurrentUser();
        form.request_date = new Date().toISOString().slice(0,10);
    }
});

</script>

<style scoped>
.create-purchase-requisition-page {
  padding: 20px;
}
.page-main-header {
  margin-bottom: 20px;
}
.page-main-title {
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}
.form-section-card {
  margin-bottom: 20px;
}
.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color);
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9e9eb;
  display: flex; /* 用于标题和按钮同行 */
  justify-content: space-between; /* 用于标题和按钮同行 */
  align-items: center; /* 用于标题和按钮同行 */
}
.page-actions-footer {
  position: sticky;
  bottom: 0;
  background-color: #ffffff;
  padding: 15px 20px;
  border-top: 1px solid #e9e9eb;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>