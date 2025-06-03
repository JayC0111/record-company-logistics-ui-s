<template>
  <div class="create-sales-order-page" v-loading="pageLoading">
    <div class="content-section-card">
      <h3 class="section-title">销售单-表头信息</h3>
      <el-form :model="formHeader" :rules="headerRules" ref="headerFormRef" label-width="100px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="销售单号:">
              <el-input v-model="formHeader.orderNo" placeholder="保存后自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="下单时间:" prop="orderTime">
              <el-date-picker
                v-model="formHeader.orderTime"
                type="datetime"
                placeholder="选择下单时间 (不选则保存时自动记录)"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled="isViewMode || isApproveMode"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="销售员:" prop="salespersonId">
              <el-input v-model="formHeader.salespersonName" placeholder="加载中..." readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户名称:" prop="customerName">
              <el-input v-model="formHeader.customerName" placeholder="请选择客户" readonly :disabled="isViewMode || isApproveMode" @click="!(isViewMode || isApproveMode) && openCustomerSelector()">
                <template #append v-if="!isViewMode && !isApproveMode">
                  <el-button :icon="Search" @click="openCustomerSelector">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户电话:" prop="customerPhone">
              <el-input v-model="formHeader.customerPhone" placeholder="选择客户后带出" :disabled="isViewMode || isApproveMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="送货地址:" prop="shippingAddress">
              <el-input v-model="formHeader.shippingAddress" type="textarea" :rows="1" placeholder="选择客户后带出" :disabled="isViewMode || isApproveMode" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" v-if="formHeader.id || isViewMode || isApproveMode"> 
          <el-col :span="8">
              <el-form-item label="订单状态:">
                  <el-input :value="getStatusText(formHeader.status) || '未保存'" placeholder="保存后更新" disabled />
              </el-form-item>
          </el-col>
          <el-col :span="16">
              <el-form-item label="备注:" prop="remarks">
                  <el-input v-model="formHeader.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" :disabled="isViewMode || (isApproveMode && isApprovalActionPositive)" />
              </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="content-section-card">
      <h3 class="section-title">
        <span>销售单-商品明细</span>
        <div v-if="!isViewMode && !isApproveMode">
          <el-button type="primary" :icon="Plus" @click="openProductSelector">添加商品</el-button>
        </div>
      </h3>
      <el-table :data="formLines" border style="width: 100%">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="productCode" label="商品编号" width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格型号" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column label="销售单价" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.unitPrice" :precision="2" :step="0.01" :min="0" controls-position="right" style="width: 100%;" @change="calculateLineTotal(row)" :disabled="isViewMode || isApproveMode" />
          </template>
        </el-table-column>
        <el-table-column label="销售数量" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :step="1" :min="1" controls-position="right" style="width: 100%;" @change="calculateLineTotal(row)" :disabled="isViewMode || isApproveMode" />
          </template>
        </el-table-column>
        <el-table-column prop="lineTotal" label="金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.lineTotal) }}
          </template>
        </el-table-column>
        <el-table-column label="已出库数" width="100" v-if="isViewMode || isApproveMode">
            <template #default="{ row }"> {{ Number(row.outboundQuantity) || 0 }} </template>
        </el-table-column>
        <el-table-column label="已发货数" width="100" v-if="isViewMode || isApproveMode">
            <template #default="{ row }"> {{ Number(row.shippedQuantity) || 0 }} </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right" v-if="!isViewMode && !isApproveMode">
          <template #default="{ $index }">
            <el-button type="danger" link :icon="Delete" @click="handleDeleteProduct($index)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无商品，请点击“添加商品”按钮" />
        </template>
      </el-table>
      <div class="table-summary-footer">
        <span>合计金额：<span class="total-amount-value">{{ formatCurrency(totalAmount) }}</span></span>
        <span>总数量/条目：{{ totalQuantity }} / {{ formLines.length }} 条</span>
      </div>

      <div v-if="isApproveMode" class="approval-section content-section-card" style="margin-top: 20px;">
        <h3 class="section-title">订单审核</h3>
        <el-form label-width="100px" :model="approvalData" :rules="approvalRules" ref="approvalFormRef">
          <el-form-item label="审核意见:" prop="comment">
            <el-input
              v-model="approvalData.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入审核意见（审核不通过时必填）"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="handlePerformApproval(true)" :loading="loading">审核通过</el-button>
            <el-button type="danger" @click="handlePerformApproval(false)" :loading="loading">审核不通过 (打回草稿)</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="page-actions-footer modified-actions-footer">
        <el-button @click="handleCancel">
          {{ (isViewMode || isApproveMode) ? '返 回' : '取 消' }}
        </el-button>
        <template v-if="!isViewMode && !isApproveMode">
          <el-button class="btn-save-draft" @click="handleSaveDraft" :loading="loading">保存草稿</el-button>
          <el-button
            type="primary"
            @click="handleSubmitForApproval"
            :loading="loading"
            v-if="!formHeader.id || formHeader.status === 'DRAFT'"
          >提交审批</el-button>
        </template>
      </div>
    </div>

    <CustomerSelectorDialog
      v-if="customerSelectorVisible"
      v-model:visible="customerSelectorVisible"
      @select="handleCustomerSelect"
    />
    <ProductSelectorDialog
      v-if="productSelectorVisible"
      v-model:visible="productSelectorVisible"
      @select="handleProductSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick, defineProps, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, Search } from '@element-plus/icons-vue';
import { getUserInfo } from '@/api/auth';
import CustomerSelectorDialog from '@/components/shared/CustomerSelectorDialog.vue';
import ProductSelectorDialog from '@/components/shared/ProductSelectorDialog.vue';
import { 
  createSalesOrder as createSalesOrderAPI, 
  getSalesOrderDetail, 
  updateSalesOrder as updateSalesOrderAPI,
  approveSalesOrder as approveSalesOrderAPI 
} from '@/api/salesOrder';

defineOptions({
  name: 'CreateSalesOrder'
});

const props = defineProps({
  mode: String 
});

const router = useRouter();
const route = useRoute();
const headerFormRef = ref(null);
const approvalFormRef = ref(null);
const loading = ref(false);
const pageLoading = ref(false);

const approvalData = reactive({ comment: '' });
const isApprovalActionPositive = ref(true); 

const isViewMode = computed(() => props.mode === 'view');
const isEditMode = computed(() => !!route.params.id && props.mode !== 'view' && props.mode !== 'approve');
const isApproveMode = computed(() => {
  return props.mode === 'approve' && formHeader.status === 'PENDING_APPROVAL';
});

const approvalRules = reactive({
    comment: [{ 
        required: computed(() => !isApprovalActionPositive.value), 
        message: '审核不通过时，请输入审核意见', 
        trigger: 'blur' 
    }]
});

const initialFormHeaderState = () => ({
  id: null, orderNo: '', orderTime: null, customerId: '', customerName: '',
  customerPhone: '', shippingAddress: '', salespersonId: '', salespersonName: '',
  status: '', remarks: '', totalAmount: 0,
});

const formHeader = reactive(initialFormHeaderState());
const formLines = ref([]);

const headerRules = {
  customerName: [{ required: true, message: '请选择客户', trigger: 'change' }],
  salespersonId: [{ required: true, message: '销售员信息加载失败或未设置' }],
  customerPhone: [{ required: true, message: '请输入客户联系方式', trigger: 'blur' }],
  shippingAddress: [{ required: true, message: '请输入客户送货地址', trigger: 'blur' }],
  remarks: [{ max: 255, message: '备注长度不能超过255个字符', trigger: 'blur' }],
};

const statusOptions = [
  { value: 'DRAFT', label: '草稿' }, { value: 'PENDING_APPROVAL', label: '待审核' },
  { value: 'APPROVED', label: '已审核 (待出库)' }, { value: 'PARTIALLY_SHIPPED', label: '部分发货' },
  { value: 'SHIPPED', label: '已发货' }, { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' }
];

const getStatusText = (statusValue) => {
  const option = statusOptions.find(opt => opt.value === statusValue);
  return option ? option.label : statusValue;
};

const customerSelectorVisible = ref(false);
const productSelectorVisible = ref(false);

// MODIFICATION START: Define relevant route names for this component
const relevantRouteNames = ['CreateSalesOrder', 'EditSalesOrder', 'SalesOrderDetail'];
// MODIFICATION END

const resetFormForCreate = () => {
  console.log('[CreateSalesOrder.vue] resetFormForCreate called');
  Object.assign(formHeader, initialFormHeaderState());
  formLines.value = [];
  approvalData.comment = '';
  isApprovalActionPositive.value = true;
  nextTick(() => {
    if (headerFormRef.value) headerFormRef.value.clearValidate();
    if (approvalFormRef.value) approvalFormRef.value.clearValidate();
  });
};

const loadSalespersonInfo = async () => {
  console.log('[CreateSalesOrder.vue] loadSalespersonInfo called. Current salespersonId:', formHeader.salespersonId);
  if (formHeader.salespersonId && formHeader.salespersonName && !(isEditMode.value && !formHeader.salespersonId)) {
     // If already loaded or in edit mode with data, skip.
  }
  if (!route.params.id || !formHeader.salespersonId) {
    formHeader.salespersonName = '加载中...';
    try {
      const res = await getUserInfo();
      console.log('[CreateSalesOrder.vue] getUserInfo response:', JSON.parse(JSON.stringify(res, null, 2)));
      if (res.code === 200 && res.data && (res.data.userId || res.data.id)) {
        formHeader.salespersonId = res.data.userId || res.data.id;
        formHeader.salespersonName = res.data.fullName || res.data.username;
        nextTick(() => {
          if (headerFormRef.value && formHeader.salespersonId) {
            headerFormRef.value.clearValidate('salespersonId');
          }
        });
      } else {
        formHeader.salespersonName = '加载失败';
      }
    } catch (error) {
      console.error("[CreateSalesOrder.vue] loadSalespersonInfo_error:", error);
      formHeader.salespersonName = '加载异常';
    }
  }
  console.log('[CreateSalesOrder.vue] Final salespersonId after load/check:', formHeader.salespersonId);
};

const loadOrderData = async (orderId) => {
  if (!orderId) { resetFormForCreate(); loadSalespersonInfo(); return; }
  pageLoading.value = true;
  console.log(`[CreateSalesOrder.vue] loadOrderData: Fetching order with ID: ${orderId}`);
  try {
    const res = await getSalesOrderDetail(orderId);
    console.log('[CreateSalesOrder.vue] loadOrderData: API response for order detail:', JSON.parse(JSON.stringify(res, null, 2)));
    if (res.code === 200 && res.data) {
      resetFormForCreate(); 
      Object.assign(formHeader, res.data);
      formHeader.totalAmount = Number(res.data.totalAmount) || 0;
      formHeader.salespersonId = res.data.salespersonId || ''; 
      formHeader.salespersonName = res.data.salespersonName || res.data.createdBy || '未知';
      
      console.log('[CreateSalesOrder.vue] loadOrderData: formHeader.status after load:', formHeader.status);
      nextTick(() => { if(headerFormRef.value && formHeader.salespersonId) headerFormRef.value.clearValidate('salespersonId'); });
      
      formLines.value = (res.data.items || []).map(item => {
        const unitPrice = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        let lineTotal = Number(item.lineTotal);
        if (isNaN(lineTotal) || (lineTotal === 0 && unitPrice * quantity !== 0 && quantity > 0)) {
            lineTotal = parseFloat((unitPrice * quantity).toFixed(2));
        }
        return { 
            ...item, 
            unitPrice, 
            quantity, 
            lineTotal,
            outboundQuantity: Number(item.outboundQuantity) || 0,
            shippedQuantity: Number(item.shippedQuantity) || 0 
        };
      });
      
      const calculatedTotalFromLines = formLines.value.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
      if (Math.abs(formHeader.totalAmount - calculatedTotalFromLines) > 0.001 && calculatedTotalFromLines !==0 ) {
          console.warn(`[CreateSalesOrder.vue] loadOrderData: Header totalAmount (${formHeader.totalAmount}) differs from calculated sum of lines (${calculatedTotalFromLines}). Updating header totalAmount.`);
          formHeader.totalAmount = parseFloat(calculatedTotalFromLines.toFixed(2));
      } else if (formHeader.totalAmount === 0 && calculatedTotalFromLines !== 0) {
          formHeader.totalAmount = parseFloat(calculatedTotalFromLines.toFixed(2));
      }
    } else { 
      ElMessage.error(res.message || '加载订单数据失败'); 
    }
  } catch (error) { 
    console.error("[CreateSalesOrder.vue] loadOrderData_error:", error); 
    ElMessage.error(error.message || '加载订单数据时发生错误'); 
  } 
  finally { pageLoading.value = false; }
};

onMounted(() => {
  console.log('[CreateSalesOrder.vue] Mounted. Route query mode:', route.query.mode, 'Props mode:', props.mode, 'Route params ID:', route.params.id, 'Route name:', route.name);
  const orderId = route.params.id;
  // MODIFICATION START: Check route name before initial load
  if (relevantRouteNames.includes(route.name)) {
    if (orderId) { 
      loadOrderData(orderId); 
    } else { 
      resetFormForCreate(); 
      loadSalespersonInfo(); 
    }
  } else {
    console.log('[CreateSalesOrder.vue] Mounted, but route name', route.name, 'is not relevant. Initial load skipped by onMounted.');
  }
  // MODIFICATION END
});

onActivated(() => {
  const orderId = route.params.id;
  console.log('[CreateSalesOrder.vue] Activated. Current route params ID:', orderId, 'Props mode:', props.mode, 'Current route name:', route.name);
  // MODIFICATION START: Add route name check
  if (relevantRouteNames.includes(route.name)) {
    if (orderId) { 
      console.log('[CreateSalesOrder.vue] Re-loading data due to activation for order ID:', orderId);
      loadOrderData(orderId);
    } else if (!orderId && (props.mode === undefined || props.mode === 'create')) {
      console.log('[CreateSalesOrder.vue] Activated in create mode for relevant route, ensuring form is reset and salesperson info loaded.');
      resetFormForCreate();
      loadSalespersonInfo();
    }
  } else {
    console.log('[CreateSalesOrder.vue] Activated, but route name', route.name, 'is not relevant. Load/reset skipped by onActivated.');
  }
  // MODIFICATION END
});

watch(() => props.mode, (newMode, oldMode) => { 
  console.log(`[CreateSalesOrder.vue] Watch props.mode changed from "${oldMode}" to "${newMode}"`); 
  // Add specific logic if mode change needs to trigger data reload for relevant routes
  if (relevantRouteNames.includes(route.name) && route.params.id) {
      // loadOrderData(route.params.id); // Example: reload if mode changes for an existing order
  }
});

watch(() => formHeader.status, (newStatus, oldStatus) => { 
  console.log(`[CreateSalesOrder.vue] Watch formHeader.status changed from "${oldStatus}" to "${newStatus}"`); 
});

watch(() => route.params.id, (newId, oldId) => {
  console.log(`[CreateSalesOrder.vue] Watch route.params.id changed from "${oldId}" to "${newId}". Current route name: ${route.name}, props.mode: ${props.mode}`);
  // MODIFICATION START: Add route name check
  if (relevantRouteNames.includes(route.name)) {
    if (newId && newId !== oldId) { 
      loadOrderData(newId); 
    } else if (!newId && oldId && (route.name === 'CreateSalesOrder' || props.mode === 'create')) { 
      console.log('[CreateSalesOrder.vue] Navigated to create mode for relevant sales order route, resetting form.');
      resetFormForCreate(); 
      loadSalespersonInfo(); 
    }
  } else {
    console.log('[CreateSalesOrder.vue] Watch route.params.id changed, but route name', route.name, 'is not relevant. Load/reset skipped by watcher.');
  }
  // MODIFICATION END
}, { immediate: false });

const totalAmount = computed(() => {
  if (formHeader.id && (isViewMode.value || isApproveMode.value || isEditMode.value)) {
    return Number(formHeader.totalAmount) || 0;
  }
  return formLines.value.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
});
const totalQuantity = computed(() => {
  return formLines.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '0.00';
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const calculateLineTotal = (row) => {
  if (typeof row.unitPrice === 'number' && typeof row.quantity === 'number') {
    row.lineTotal = parseFloat((row.unitPrice * row.quantity).toFixed(2));
  } else { row.lineTotal = 0; }
  if (!isViewMode.value && !isApproveMode.value) { 
      formHeader.totalAmount = parseFloat(formLines.value.reduce((sum, item) => sum + (item.lineTotal || 0), 0).toFixed(2));
  }
};
const openCustomerSelector = () => { if (isViewMode.value || isApproveMode.value) return; customerSelectorVisible.value = true; };
const handleCustomerSelect = (customer) => { if (customer) { formHeader.customerId = customer.id; formHeader.customerName = customer.name; formHeader.customerPhone = customer.phone || ''; formHeader.shippingAddress = customer.shippingAddress || ''; } customerSelectorVisible.value = false; };
const openProductSelector = () => { if (isViewMode.value || isApproveMode.value) return; productSelectorVisible.value = true; };
const handleProductSelect = (selectedItems) => {
  if (isViewMode.value || isApproveMode.value) return;
  if (selectedItems && selectedItems.length > 0) {
    selectedItems.forEach(product => { 
      formLines.value.push({ 
        productId: product.id, 
        productCode: product.productCode, 
        productName: product.name, 
        specification: product.specification, 
        unit: product.unit, 
        unitPrice: Number(product.salesPrice) || 0, 
        quantity: 1, 
        lineTotal: Number(product.salesPrice) || 0, 
        outboundQuantity: 0,
        shippedQuantity: 0 
      }); 
    });
    if (!isViewMode.value && !isApproveMode.value) { 
      formHeader.totalAmount = parseFloat(formLines.value.reduce((sum, item) => sum + (item.lineTotal || 0), 0).toFixed(2)); 
    }
  }
  productSelectorVisible.value = false;
};
const handleDeleteProduct = (index) => {
  if (isViewMode.value || isApproveMode.value) return;
  formLines.value.splice(index, 1);
  if (!isViewMode.value && !isApproveMode.value) { 
    formHeader.totalAmount = parseFloat(formLines.value.reduce((sum, item) => sum + (item.lineTotal || 0), 0).toFixed(2)); 
  }
};
const validateFormsInternal = async () => { 
  if (isViewMode.value) return true; 
  if (isApproveMode.value && isApprovalActionPositive.value) return true;

  let valid = false;
  if (headerFormRef.value) { try { await headerFormRef.value.validate(); valid = true; } catch (error) { valid = false; } } 
  else { return false; }
  if (!valid) return false;

  if (!isApproveMode.value && formLines.value.length === 0) { 
      ElMessage.warning('请至少添加一个商品到销售单！'); return false; 
  }
  for (const item of formLines.value) { 
    if (!(Number(item.quantity) > 0 && Number(item.unitPrice) >= 0)) { 
      ElMessage.warning(`商品 "${item.productName}" 的数量或单价无效！`); return false; 
    } 
  }
  return true;
};
const formatDateTimeToString = (dateObj) => {
    if (!dateObj) return null;
    const date = new Date(dateObj); 
    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0'); 
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0'); 
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const preparePayload = () => { 
  let finalOrderTime = formHeader.orderTime;
  if (!finalOrderTime && !formHeader.id) {
    finalOrderTime = formatDateTimeToString(new Date());
  }

  const calculatedTotalAmount = parseFloat(formLines.value.reduce((sum, item) => sum + (item.lineTotal || 0), 0).toFixed(2));
  return {
    ...(formHeader.id && { id: formHeader.id }), 
    orderTime: finalOrderTime, 
    customerId: formHeader.customerId,
    customerName: formHeader.customerName, 
    customerPhone: formHeader.customerPhone, 
    shippingAddress: formHeader.shippingAddress,
    salespersonId: formHeader.salespersonId, 
    salespersonName: formHeader.salespersonName, 
    remarks: formHeader.remarks, 
    totalAmount: (isViewMode.value || isApproveMode.value) ? Number(formHeader.totalAmount) : calculatedTotalAmount, 
    status: formHeader.status, 
    items: formLines.value.map(line => ({ 
        ...(line.id && { id: line.id }), 
        productId: line.productId, 
        productCode: line.productCode, 
        productName: line.productName, 
        specification: line.specification, 
        unit: line.unit, 
        unitPrice: line.unitPrice, 
        quantity: line.quantity, 
        lineTotal: line.lineTotal,
        outboundQuantity: line.outboundQuantity,
        shippedQuantity: line.shippedQuantity
    })),
  };
};
const handleSaveDraft = async () => {
  if (isViewMode.value || isApproveMode.value) return;
  const isValid = await validateFormsInternal(); if (!isValid) return;
  const payload = preparePayload(); 
  payload.status = 'DRAFT'; 
  
  loading.value = true;
  try {
    let res;
    if (formHeader.id) { res = await updateSalesOrderAPI(formHeader.id, payload); } 
    else { res = await createSalesOrderAPI(payload); }
    if (res.code === 200 && res.data) {
      ElMessage.success(formHeader.id ? '草稿更新成功' : '草稿已保存');
      Object.assign(formHeader, res.data);
      formLines.value = (res.data.items || []).map(item => ({ 
        ...item, 
        unitPrice: Number(item.unitPrice) || 0, 
        quantity: Number(item.quantity) || 0, 
        lineTotal: Number(item.lineTotal) || 0,
        outboundQuantity: Number(item.outboundQuantity) || 0,
        shippedQuantity: Number(item.shippedQuantity) || 0
      }));
    } else { ElMessage.error(res.message || (formHeader.id ? '更新草稿失败' : '保存草稿失败')); }
  } catch (error) { console.error("保存/更新草稿失败:", error); ElMessage.error(error.message || '操作草稿时发生错误'); } 
  finally { loading.value = false; }
};
const handleSubmitForApproval = async () => {
  if (isViewMode.value || isApproveMode.value) return;
  const isValid = await validateFormsInternal(); if (!isValid) return;

  ElMessageBox.confirm( 
    formHeader.id && formHeader.status !== 'DRAFT' 
      ? `订单当前状态为【${getStatusText(formHeader.status)}】，确定要强制提交审批吗?` 
      : (formHeader.id ? '确定要提交此修改后的销售单进行审批吗?' : '确定要提交此销售单进行审批吗?'), 
    '提交确认', 
    { confirmButtonText: '确定提交', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    const payload = preparePayload(); 
    payload.status = 'PENDING_APPROVAL';
    
    loading.value = true;
    try {
      let res;
      if (formHeader.id) { 
        res = await updateSalesOrderAPI(formHeader.id, payload); 
      } else { 
        res = await createSalesOrderAPI(payload);
      }

      if (res.code === 200 && res.data) { 
        ElMessage.success('销售单已提交审批'); 
        router.push({ name: 'SalesOrderList' }); 
      } else { 
        ElMessage.error(res.message || '提交审批失败'); 
        if (res.data && res.data.status) {
            formHeader.status = res.data.status;
        }
      }
    } catch (error) { 
      console.error("提交审批失败:", error); 
      ElMessage.error(error.message || '提交审批发生错误'); 
    } finally { 
      loading.value = false; 
    }
  }).catch(() => { 
    ElMessage.info('已取消提交'); 
  });
};

const handlePerformApproval = async (isApproved) => {
  if (!isApproveMode.value) { console.log('[CreateSalesOrder.vue] handlePerformApproval: Not in approve mode.'); return; }
  isApprovalActionPositive.value = isApproved; 
  console.log(`[CreateSalesOrder.vue] handlePerformApproval: Action isApproved=${isApproved}, approvalComment="${approvalData.comment}"`);

  let approvalFormValid = true;
  if (approvalFormRef.value) { try { await approvalFormRef.value.validate(); } catch (e) { approvalFormValid = false; } }
  if (!approvalFormValid) { console.log('[CreateSalesOrder.vue] handlePerformApproval: Approval comment validation failed.'); return; }

  const actionText = isApproved ? '通过' : '不通过 (打回草稿)';
  try {
    await ElMessageBox.confirm(`确定要审核此订单并将其标记为“${actionText}”吗？`, '审核确认', { confirmButtonText: `确定${actionText}`, cancelButtonText: '取消', type: 'warning', });
    loading.value = true;
    const res = await approveSalesOrderAPI(formHeader.id, isApproved, approvalData.comment);
    console.log('[CreateSalesOrder.vue] handlePerformApproval: API response:', JSON.parse(JSON.stringify(res, null, 2)));
    if (res.code === 200 && res.data) {
      ElMessage.success(`订单已审核：${actionText}`);
      Object.assign(formHeader, res.data); 
      approvalData.comment = ''; 
      if (res.data.status === 'DRAFT') {
        loadOrderData(formHeader.id); 
      } else {
        router.push({ name: 'SalesOrderList' }); 
      }
    } else { ElMessage.error(res.message || '审核操作失败'); }
  } catch (error) { 
    if (error !== 'cancel') { 
      console.error("[CreateSalesOrder.vue] 审核操作失败:", error); 
      ElMessage.error(error.message || '审核操作发生错误'); 
    } 
  } finally { 
    loading.value = false; 
  }
};

const handleCancel = () => { 
  if (isViewMode.value || isApproveMode.value || isEditMode.value) {
    router.push({ name: 'SalesOrderList' });
  } else {
    if (formLines.value.length > 0 || formHeader.customerName) {
        ElMessageBox.confirm('表单内容尚未保存，确定要取消并返回列表吗？', '取消确认', {
            confirmButtonText: '确定返回',
            cancelButtonText: '继续编辑',
            type: 'warning'
        }).then(() => {
            router.push({ name: 'SalesOrderList' });
        }).catch(() => {
            // User chose to continue editing
        });
    } else {
        router.push({ name: 'SalesOrderList' });
    }
  }
};

</script>

<style scoped>
.create-sales-order-page {}
.el-form-item { margin-bottom: 18px; }
.el-form-item .el-input, .el-form-item .el-select, .el-form-item .el-date-picker { width: 100%; }
.table-summary-footer { 
  margin-top: 20px; 
  text-align: right; 
  font-size: 14px; 
  color: var(--font-color-secondary); 
}
.table-summary-footer span + span { margin-left: 30px; }
.total-amount-value { 
  font-weight: bold; 
  color: var(--error-color);
}
.modified-actions-footer { 
  margin-top: 20px; 
  padding-top: 20px; 
  border-top: 1px solid var(--border-color-light, #e4e7ed);
  padding-left: 0; 
  padding-right: 0;
  padding-bottom: 0;
  border-radius: 0 0 4px 4px;
  display: flex; 
  justify-content: flex-end; 
}
.modified-actions-footer .el-button + .el-button { margin-left: 10px; }
.approval-section .el-form-item { margin-bottom: 20px; }
</style>