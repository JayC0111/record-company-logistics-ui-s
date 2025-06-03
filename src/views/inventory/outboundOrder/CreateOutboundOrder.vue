<template>
  <div class="create-outbound-order-page" v-loading="pageLoading">
    <div class="content-section-card">
      <h3 class="section-title">出库单 - 表头信息</h3>
      <el-form :model="formHeader" :rules="headerRules" ref="headerFormRef" label-width="110px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出库单号:">
              <el-input v-model="formHeader.outboundOrderNo" placeholder="保存后自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库责任人:" prop="creatorName">
              <el-input v-model="formHeader.creatorName" placeholder="加载中..." readonly />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库时间:" prop="creationTime">
              <el-date-picker
                v-model="formHeader.creationTime"
                type="datetime"
                placeholder="选择或自动记录"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled="isViewMode || !canEditHeader()"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="关联销售单:">
              <el-input v-model="formHeader.relatedSalesOrderNos" placeholder="通过下方按钮关联" disabled type="textarea" :rows="1"/>
            </el-form-item>
          </el-col>
            <el-col :span="8">
            <el-form-item label="出库单状态:">
                <el-input :value="getOutboundStatusText(formHeader.status)" placeholder="保存后更新" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注:" prop="notes">
              <el-input
                v-model="formHeader.notes"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息"
                :disabled="isViewMode || (!isProcessingMode && !isCreateMode)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="content-section-card">
      <h3 class="section-title">
        <span>出库单 - 商品明细</span>
        <div v-if="isCreateMode">
          <el-button type="primary" :icon="LinkIcon" @click="openSelectSalesOrderLineDialog">关联销售单明细</el-button>
        </div>
      </h3>
      <el-table :data="formLines" border style="width: 100%" empty-text="请通过“关联销售单明细”按钮添加商品">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="salesOrderNo" label="来源销售单" width="170" show-overflow-tooltip/> <el-table-column prop="productCode" label="商品编号" width="140" />
        <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格型号" width="120" />
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column prop="quantityToPick" label="应拣数量" width="100" align="right" />
        <el-table-column label="实拣数量" width="150" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.pickedQuantity"
              :min="0"
              :max="Number(row.quantityToPick)"
              controls-position="right"
              style="width: 100%"
              :disabled="isViewMode || !isProcessingMode"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right" v-if="isCreateMode">
          <template #default="{ $index }">
            <el-button type="danger" link :icon="DeleteIcon" @click="handleRemoveLine($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-actions-footer">
      <el-button @click="handleCancel">
        {{ (isViewMode || isProcessingMode) ? '返 回' : '取 消' }}
      </el-button>
      <el-button
        type="primary"
        @click="handleSubmitOutboundOrder"
        v-if="isCreateMode && formLines.length > 0"
        :loading="loading"
      >提交出库单</el-button>
      <el-button
        type="success"
        @click="handleConfirmPickingComplete"
        v-if="isProcessingMode"
        :loading="loading"
      >确认出库完成</el-button>
    </div>

    <SelectSalesOrderLineDialog
      v-if="selectSalesOrderLineDialogVisible"
      v-model:visible="selectSalesOrderLineDialogVisible"
      @confirm="handleSalesOrderLinesSelected"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick, defineProps, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Link as LinkIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { getUserInfo } from '@/api/auth';
import SelectSalesOrderLineDialog from '@/components/shared/SelectSalesOrderLineDialog.vue'; 
import {
  createOutboundOrder,
  getOutboundOrderDetail,
  updateOutboundOrder
} from '@/api/outboundOrder'; 

defineOptions({
  name: 'CreateOutboundOrder'
});

const props = defineProps({
  id: String, 
  mode: String  
});

const router = useRouter();
const route = useRoute();
const headerFormRef = ref(null);
const loading = ref(false);
const pageLoading = ref(false);

const selectSalesOrderLineDialogVisible = ref(false);

const initialFormHeaderState = () => ({
  id: null, 
  outboundOrderNo: '', 
  relatedSalesOrderIds: [], 
  relatedSalesOrderNos: '', // 用于显示
  creatorId: '', 
  creatorName: '',        // 用于显示
  creationTime: null, 
  status: 'PENDING',      // 新建时默认为 PENDING
  notes: '',
  customerName: '',       // 从关联销售单带入
});

const formHeader = reactive(initialFormHeaderState());
const formLines = ref([]);

const currentMode = computed(() => props.mode || route.query.mode);

const isCreateMode = computed(() => !props.id && currentMode.value !== 'process' && currentMode.value !== 'view');
const isViewMode = computed(() => currentMode.value === 'view');
const isProcessingMode = computed(() => !!props.id && formHeader.status === 'PENDING' && currentMode.value === 'process');

const headerRules = reactive({
  notes: [{ max: 255, message: '备注长度不能超过255个字符', trigger: 'blur' }]
  // creationTime 和 creatorName 通常不需要用户校验，它们是自动填充或只读的
});

const outboundStatusOptions = [
    { value: 'PENDING', label: '待出库' },
    { value: 'READY_TO_SHIP', label: '待发货 (拣货完成)' },
    { value: 'CANCELLED', label: '已取消' },
];

const getOutboundStatusText = (statusValue) => {
    const option = outboundStatusOptions.find(opt => opt.value === statusValue);
    return option ? option.label : statusValue;
};

const canEditHeader = () => isCreateMode.value; // 只有新建时允许编辑表头（主要是出库时间和备注）

const _formatDateTimeToString = (dateObj) => {
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

const resetForm = () => {
  console.log('[CreateOutboundOrder.vue] resetForm called');
  Object.assign(formHeader, initialFormHeaderState());
  formLines.value = [];
  nextTick(() => { if (headerFormRef.value) headerFormRef.value.clearValidate(); });
};

const loadCreatorInfo = async () => {
  // 仅在新建模式，或查看/编辑模式下但当前没有创建人信息时加载
  if (!isCreateMode.value && formHeader.creatorId && formHeader.creatorName) return;

  formHeader.creatorName = "加载中...";
  try {
    const res = await getUserInfo(); 
    if (res.code === 200 && res.data) {
      formHeader.creatorId = res.data.userId || res.data.id; 
      formHeader.creatorName = res.data.fullName || res.data.username; 
    } else { 
      formHeader.creatorName = "加载失败"; 
      if (isCreateMode.value) formHeader.creatorId = 'mock-creator-id'; // 新建时的回退
    }
  } catch (error) { 
    formHeader.creatorName = "加载异常"; 
    if (isCreateMode.value) formHeader.creatorId = 'mock-creator-id'; // 新建时的回退
    console.error("Failed to load creator info for outbound order:", error); 
  }
};

const loadOutboundOrderData = async (orderId) => {
  if (!orderId) { 
      resetForm(); 
      loadCreatorInfo(); 
      formHeader.creationTime = _formatDateTimeToString(new Date()); 
      return; 
  }
  pageLoading.value = true;
  console.log(`[CreateOutboundOrder.vue] loadOutboundOrderData for ID: ${orderId}, mode: ${currentMode.value}`);
  try {
    const res = await getOutboundOrderDetail(orderId); 
    console.log('[CreateOutboundOrder.vue] API response for getOutboundOrderDetail:', JSON.parse(JSON.stringify(res)));
    if (res.code === 200 && res.data) {
      resetForm(); 
      Object.assign(formHeader, res.data); // formHeader现在应该有relatedSalesOrderNos和creatorName了

      formLines.value = (res.data.items || []).map(item => ({ 
          ...item, 
          quantityToPick: Number(item.quantityToPick) || 0, 
          pickedQuantity: item.pickedQuantity !== null && item.pickedQuantity !== undefined 
                          ? Number(item.pickedQuantity) 
                          : (isProcessingMode.value ? 0 : null), // 处理模式下，若为null，则设为0方便输入
          salesOrderNo: item.salesOrderNo || item.displaySalesOrderNo, // 确保 salesOrderNo 字段有值
      }));
      
      console.log('[CreateOutboundOrder.vue] Outbound order data loaded. Header:', JSON.parse(JSON.stringify(formHeader)), 'Lines:', JSON.parse(JSON.stringify(formLines.value)));
    } else { 
      ElMessage.error(res.message || '加载出库单数据失败'); 
      if (!props.id) router.push({ name: 'OutboundOrderList' });
    }
  } catch (error) { 
    console.error('加载出库单数据异常:', error); 
    ElMessage.error(error.message || '加载出库单数据异常'); 
    if (!props.id) router.push({ name: 'OutboundOrderList' }); 
  } 
  finally { pageLoading.value = false; }
};

onMounted(() => {
  console.log('[CreateOutboundOrder.vue] Mounted. Props ID:', props.id, 'Props mode:', props.mode, 'Route query mode:', route.query.mode);
  if (props.id) { 
    loadOutboundOrderData(props.id); 
  } else { 
    resetForm(); 
    loadCreatorInfo(); 
    formHeader.creationTime = _formatDateTimeToString(new Date()); 
  }
});

onActivated(() => {
  console.log('[CreateOutboundOrder.vue] Activated. Props ID:', props.id, 'Props mode:', props.mode, 'Route query mode:', route.query.mode);
  if (props.id) { 
    console.log('[CreateOutboundOrder.vue] Re-loading data due to activation for outbound order ID:', props.id);
    loadOutboundOrderData(props.id);
  } else { 
    console.log('[CreateOutboundOrder.vue] Activated in create mode, ensuring form is reset and creator info loaded.');
    resetForm();
    loadCreatorInfo();
    formHeader.creationTime = _formatDateTimeToString(new Date());
  }
});

watch(() => props.id, (newId, oldId) => {
  console.log(`[CreateOutboundOrder.vue] Watch props.id changed from "${oldId}" to "${newId}", currentMode: ${currentMode.value}`);
  if (newId && newId !== oldId) { 
    loadOutboundOrderData(newId); 
  } else if (!newId && oldId && isCreateMode.value) { // 仅在确实要回到新建模式时重置
    resetForm(); 
    loadCreatorInfo(); 
    formHeader.creationTime = _formatDateTimeToString(new Date()); 
  }
});

watch(currentMode, (newMode, oldMode) => {
  console.log(`[CreateOutboundOrder.vue] Watch currentMode changed from "${oldMode}" to "${newMode}", ID: ${props.id}`);
  if (props.id && newMode !== oldMode && (newMode === 'view' || newMode === 'process')) {
    loadOutboundOrderData(props.id);
  }
});

const openSelectSalesOrderLineDialog = () => {
  console.log('[CreateOutboundOrder.vue] Attempting to open SelectSalesOrderLineDialog...');
  selectSalesOrderLineDialogVisible.value = true;
};

const handleSalesOrderLinesSelected = (selectedLinesFromDialog) => {
  console.log('[CreateOutboundOrder.vue] Received selected lines from dialog (raw):', JSON.parse(JSON.stringify(selectedLinesFromDialog, null, 2)));
  
  const newLinesToAdd = selectedLinesFromDialog.map(dialogLine => {
    return {
      id: null, 
      salesOrderLineId: dialogLine.salesOrderLineId,
      salesOrderId: dialogLine.salesOrderId,
      salesOrderNo: dialogLine.salesOrderNo || dialogLine.displaySalesOrderNo, // 优先使用明确的 salesOrderNo
      customerName: dialogLine.customerName, // 确保从弹窗数据中获取客户名称
      productId: dialogLine.productId,
      productCode: dialogLine.productCode,
      productName: dialogLine.productName,
      specification: dialogLine.specification,
      unit: dialogLine.unit,
      quantityToPick: Number(dialogLine.selectedQuantityToPick) || Number(dialogLine.quantityToPick) || 0,
      pickedQuantity: null, 
    };
  });
  
  newLinesToAdd.forEach(newLine => {
    if (!formLines.value.some(existingLine => existingLine.salesOrderLineId === newLine.salesOrderLineId)) {
      formLines.value.push(newLine);
    } else {
      ElMessage.warning(`销售单明细 ${newLine.salesOrderNo} - ${newLine.productName} 已存在于当前出库单。`);
    }
  });
  
  const uniqueSalesOrderNos = [...new Set(formLines.value.map(line => line.salesOrderNo))].filter(Boolean);
  formHeader.relatedSalesOrderNos = uniqueSalesOrderNos.join(', ');
  formHeader.relatedSalesOrderIds = [...new Set(formLines.value.map(line => line.salesOrderId || ''))].filter(Boolean);

  // 更新表头的客户名称（假设所有关联的销售单都来自同一个客户，或者取第一个）
  if (formLines.value.length > 0 && formLines.value[0].customerName) {
    formHeader.customerName = formLines.value[0].customerName;
  } else {
    formHeader.customerName = '未知客户';
  }
  
  selectSalesOrderLineDialogVisible.value = false;
};

const handleRemoveLine = (index) => {
  formLines.value.splice(index, 1);
  const uniqueSalesOrderNos = [...new Set(formLines.value.map(line => line.salesOrderNo))].filter(Boolean);
  formHeader.relatedSalesOrderNos = uniqueSalesOrderNos.join(', ');
  formHeader.relatedSalesOrderIds = [...new Set(formLines.value.map(line => line.salesOrderId || ''))].filter(Boolean);
  if (formLines.value.length === 0) {
    formHeader.customerName = '';
  } else {
    // 如果还有行，可以考虑重新设置客户名称，但可能复杂化，暂时保持不变或取第一个
     formHeader.customerName = formLines.value[0].customerName || '未知客户';
  }
};

const preparePayload = (context = 'create') => { 
  const payload = {
    // 表头信息
    ...(formHeader.id && context !== 'create' && { id: formHeader.id }), // 更新时带id
    notes: formHeader.notes,
    creatorId: formHeader.creatorId, // 已在 loadCreatorInfo 或加载时设置
    creationTime: formHeader.creationTime || _formatDateTimeToString(new Date()),
    status: context === 'create' ? 'PENDING' : (context === 'process_complete' ? 'READY_TO_SHIP' : formHeader.status), // 根据上下文设置状态
    relatedSalesOrderIds: [...new Set(formLines.value.map(line => line.salesOrderId || ''))].filter(Boolean),
    // relatedSalesOrderNos 和 customerName 主要用于显示，通常不作为核心数据提交，除非后端需要
    customerName: formHeader.customerName, // 可选提交
    
    // 明细信息
    items: formLines.value.map(line => ({
      ...(line.id && context !== 'create' && { id: line.id }), // 更新出库单明细时带id
      salesOrderLineId: line.salesOrderLineId,
      salesOrderNo: line.salesOrderNo, // 提交销售单号，方便后端追溯或记录
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      specification: line.specification,
      unit: line.unit,
      quantityToPick: Number(line.quantityToPick) || 0, 
      pickedQuantity: (line.pickedQuantity !== null && line.pickedQuantity !== undefined) ? Number(line.pickedQuantity) : null,
    }))
  };
  
  // 在创建时，确保 creatorId 有值
  if (context === 'create' && !payload.creatorId) {
    console.warn("[CreateOutboundOrder.vue] creatorId is missing in payload for create. Using fallback.");
    payload.creatorId = 'mock-user-id'; // 或者从 Pinia/Auth store 获取当前用户ID
  }

  // 移除不应提交给后端的纯显示字段
  delete payload.outboundOrderNo; // 由后端生成
  delete payload.creatorName;     // 后端通过ID获取

  console.log(`[CreateOutboundOrder.vue] Prepared Payload for ${context}:`, JSON.parse(JSON.stringify(payload)));
  return payload;
};

const handleSubmitOutboundOrder = async () => {
  let validHeader = false;
  if (headerFormRef.value) { await headerFormRef.value.validate((valid) => { validHeader = valid; }); } 
  else { validHeader = true; } // 如果表单引用不存在，跳过校验（不应发生）
  if (!validHeader) { ElMessage.error('请检查表头信息是否完整且正确。'); return; }
  if (formLines.value.length === 0) { ElMessage.error('请至少添加一条商品明细。'); return; }
  for (const line of formLines.value) {
    if (!(Number(line.quantityToPick) > 0)) { ElMessage.error(`商品 "${line.productName}" 的应拣数量必须大于0。`); return; }
  }

  loading.value = true;
  try {
    const payload = preparePayload('create'); // context 为 'create'
    
    const res = await createOutboundOrder(payload); 
    
    if (res.code === 200 && res.data) {
      ElMessage.success('出库单提交成功！');
      router.push({ name: 'OutboundOrderList' });
    } else { ElMessage.error(res.message || '提交出库单失败，请重试。'); }
  } catch (error) { console.error('提交出库单异常:', error); ElMessage.error(error.message || '提交出库单异常，请检查网络或联系管理员。'); } 
  finally { loading.value = false; }
};

const handleConfirmPickingComplete = async () => { 
  if (formHeader.status !== 'PENDING') {
    ElMessage.warning(`订单状态为【${getOutboundStatusText(formHeader.status)}】，无法执行拣货完成操作。`);
    return;
  }

  for (const line of formLines.value) {
    if (line.pickedQuantity === null || line.pickedQuantity === undefined || Number(line.pickedQuantity) < 0) {
      ElMessage.error(`商品 "${line.productName}" 的实拣数量未填写或无效。`);
      return;
    }
    if (Number(line.pickedQuantity) > Number(line.quantityToPick)) {
      ElMessage.error(`商品 "${line.productName}" 的实拣数量 (${line.pickedQuantity}) 不能大于应拣数量 (${line.quantityToPick})。`);
      return;
    }
  }

  loading.value = true;
  try {
    const payload = preparePayload('process_complete'); // context 为 'process_complete'

    console.log('[CreateOutboundOrder.vue] Confirm Picking Payload:', JSON.parse(JSON.stringify(payload)));

    const res = await updateOutboundOrder(formHeader.id, payload); 
    if (res.code === 200 && res.data) {
        ElMessage.success('确认出库完成操作成功！状态更新为：待发货');
        formHeader.status = res.data.status || 'READY_TO_SHIP'; 
        // 更新行项目的实拣数量 (如果API返回了更新后的items)
        if(res.data.items){
            formLines.value = res.data.items.map(item => ({
                ...item,
                pickedQuantity: Number(item.pickedQuantity)
            }));
        }
        // 可以选择停留在当前页（只读模式）或跳转
        // props.mode = 'view'; // 如果 props 可写，但通常 props 是单向数据流
        // 最好是导航到新的路由或让父组件改变 mode
        router.push({ name: 'OutboundOrderList' }); // 简单起见，先返回列表
    } else {
        ElMessage.error(res.message || '确认出库完成失败。');
    }
  } catch (error) {
    console.error('确认出库完成异常:', error);
    ElMessage.error(error.message || '确认出库完成异常。');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => { 
  const targetRoute = { name: 'OutboundOrderList' };
  if (isViewMode.value || isProcessingMode.value) {
    router.push(targetRoute);
  } else { // CreateMode
    if (formLines.value.length > 0 || formHeader.notes || (formHeader.creationTime && new Date(formHeader.creationTime).getTime() !== initialFormHeaderState().creationTime?.getTime())) { 
        ElMessageBox.confirm('表单内容尚未保存，确定要取消吗？', '提示', {
            confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
        }).then(() => {
            resetForm();
            router.push(targetRoute); 
        }).catch(() => {});
    } else {
        router.push(targetRoute);
    }
  }
};

</script>

<style scoped>
.create-outbound-order-page {}
.el-form-item { margin-bottom: 18px; }
/* page-actions-footer 样式应已在 global.css 定义 */
</style>