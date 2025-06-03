<template>
  <div class="create-shipment-order-page" v-loading="pageLoading">
    <div class="content-section-card">
      <h3 class="section-title">发货单 - 表头信息</h3>
      <el-form :model="formHeader" :rules="headerRules" ref="headerFormRef" label-width="110px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="发货单号:">
              <el-input v-model="formHeader.shipmentNo" placeholder="保存后自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发货日期:" prop="shipmentDate">
              <el-date-picker
                v-model="formHeader.shipmentDate"
                type="datetime"
                placeholder="选择发货日期"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled="isViewMode"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发货单状态:">
              <el-input :value="getShipmentStatusText(formHeader.status)" placeholder="保存后更新" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="物流公司:" prop="logisticsCarrierId">
              <el-select
                v-model="formHeader.logisticsCarrierId"
                placeholder="请选择物流公司"
                filterable
                clearable
                style="width: 100%;"
                :disabled="isViewMode"
                @change="handleLogisticsCarrierChange"
              >
                <el-option v-for="item in logisticsCarrierOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="运单号:" prop="trackingNumber">
              <el-input v-model="formHeader.trackingNumber" placeholder="请输入运单号" clearable :disabled="isViewMode" />
            </el-form-item>
          </el-col>
           <el-col :span="8">
            <el-form-item label="创建人:">
              <el-input v-model="formHeader.creatorName" placeholder="加载中..." readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户名称:">
              <el-input v-model="formHeader.customerName" placeholder="关联出库单后带入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="关联出库单:"> 
              <el-input v-model="formHeader.relatedOutboundOrderNos" placeholder="通过下方按钮关联" disabled type="textarea" :rows="1"/>
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
                :disabled="isViewMode"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="content-section-card">
      <h3 class="section-title">
        <span>发货商品明细</span>
        <div v-if="isCreateMode || (isEditMode && !formHeader.id && !pageLoading)"> <el-button 
            type="primary" 
            :icon="LinkIcon" 
            @click="openSelectOutboundOrderDialog"
            :disabled="isEditMode && !!formHeader.id" >关联待发货出库单</el-button>
        </div>
      </h3>
      <el-table :data="formLines" border style="width: 100%" empty-text="请通过“关联待发货出库单”按钮添加商品">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="sourceOutboundOrderNo" label="来源出库单" width="180" show-overflow-tooltip/>  
        <el-table-column prop="productCode" label="商品编号" width="140" />
        <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格型号" width="120" />
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column label="本次发货数量" width="150" align="right">
            <template #default="{ row }">
                <el-input-number
                    v-model="row.shippedQuantity"
                    :min="0" 
                    :max="row.maxShippableQuantity || row.pickedQuantity || 0"  controls-position="right"
                    style="width: 100%"
                    :disabled="isViewMode || (isEditMode && !!formHeader.id)" 
                />
            </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right" v-if="isCreateMode || (isEditMode && !formHeader.id)">
          <template #default="{ $index }">
            <el-button type="danger" link :icon="DeleteIcon" @click="handleRemoveLine($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-actions-footer">
      <el-button @click="handleCancel">
        {{ isViewMode ? '返 回' : '取 消' }}
      </el-button>
      <el-button
        type="primary"
        @click="handleSubmitShipmentOrder"
        v-if="isCreateMode && formLines.length > 0"
        :loading="submitLoading"
      >确认发货</el-button>
      <el-button
        type="primary"
        @click="handleUpdateShipmentOrder"
        v-if="isEditMode"
        :loading="submitLoading"
      >保存修改</el-button>
    </div>

    <SelectReadyOutboundOrderDialog
      v-if="selectOutboundOrderDialogVisible"
      v-model:visible="selectOutboundOrderDialogVisible"
      @confirm="handleOutboundOrdersSelected"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, defineProps, onActivated } from 'vue'; // <-- 引入 onActivated
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Link as LinkIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { getUserInfo } from '@/api/auth';
import {
    createShipmentOrder,
    getShipmentOrderDetail,
    updateShipmentOrder, // 虽然当前未使用，但保留导入
    getLogisticsCarriers
} from '@/api/shipmentOrder';
// 确保这个组件的路径和名称是正确的
import SelectReadyOutboundOrderDialog from '@/components/shared/SelectReadyOutboundOrderDialog.vue';


// --- 新增 defineOptions 来定义组件的 name ---
defineOptions({
  name: 'CreateShipmentOrder' // 用于 KeepAlive 缓存匹配
});
// --- 结束新增 ---

const props = defineProps({
  id: String,
  mode: String // 'view', 'edit'
});

const router = useRouter();
const route = useRoute(); // 可以用来获取 query 参数等
const headerFormRef = ref(null);
const pageLoading = ref(false);
const submitLoading = ref(false);
const selectOutboundOrderDialogVisible = ref(false);
const logisticsCarrierOptions = ref([]);

const initialFormHeaderState = () => ({
  id: null,
  shipmentNo: '',
  status: 'SHIPPED', // 新建时默认为 'SHIPPED'，因为创建即发货
  shipmentDate: _formatDateTimeToString(new Date()), // 默认为当前时间
  logisticsCarrierId: null,
  logisticsCarrierName: '',
  trackingNumber: '',
  creatorId: '',
  creatorName: '',
  notes: '',
  relatedOutboundOrderIds: [], 
  relatedOutboundOrderNos: '', 
  customerName: '', // 从关联的出库单带入
});

const formHeader = reactive(initialFormHeaderState());
const formLines = ref([]); // 存储发货单的商品明细

// 根据 props.id 和 props.mode (或 route.query.mode) 来判断当前模式
const currentMode = computed(() => props.mode || route.query.mode);

const isCreateMode = computed(() => !props.id); // 没有ID就是创建模式
const isViewMode = computed(() => !!props.id && currentMode.value === 'view');
const isEditMode = computed(() => !!props.id && currentMode.value === 'edit');

const shipmentStatusOptions = [
  { value: 'SHIPPED', label: '已发货' },
  { value: 'DELIVERED', label: '已签收' },
  // 根据需要可以添加其他状态，如 'CANCELLED'
];

const getShipmentStatusText = (statusValue) => {
  const option = shipmentStatusOptions.find(opt => opt.value === statusValue);
  return option ? option.label : statusValue;
};

const headerRules = reactive({
  shipmentDate: [{ required: true, message: '请选择发货日期', trigger: 'change' }],
  logisticsCarrierId: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  trackingNumber: [
    { required: true, message: '请输入运单号', trigger: 'blur' },
    { max: 50, message: '运单号长度不能超过50个字符', trigger: 'blur' }
  ],
  notes: [{ max: 255, message: '备注长度不能超过255个字符', trigger: 'blur' }]
});

function _formatDateTimeToString(dateObj) {
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
  Object.assign(formHeader, initialFormHeaderState());
  formHeader.shipmentDate = _formatDateTimeToString(new Date()); // 重置时也设置默认发货日期
  formLines.value = [];
  if (headerFormRef.value) {
    headerFormRef.value.clearValidate();
  }
};

const loadCreatorInfo = async () => {
  if (formHeader.creatorId && formHeader.creatorName && !isCreateMode.value) return;
  formHeader.creatorName = "加载中...";
  try {
    const res = await getUserInfo();
    if (res.code === 200 && res.data) {
      formHeader.creatorId = res.data.userId || res.data.id;
      formHeader.creatorName = res.data.fullName || res.data.username;
    } else { formHeader.creatorName = "加载失败"; }
  } catch (error) { formHeader.creatorName = "加载异常"; console.error("Failed to load creator info for shipment:", error); }
};

const fetchLogisticsCarriersList = async () => {
    try {
        const res = await getLogisticsCarriers({ page: 0, size: 1000, isActive: true }); // 只获取启用的
        if (res.code === 200 && res.data) {
            logisticsCarrierOptions.value = res.data.content || [];
        }
    } catch (error) {
        console.error('获取物流公司列表失败:', error);
        ElMessage.error('获取物流公司列表失败');
    }
};

const handleLogisticsCarrierChange = (carrierId) => {
    const selectedCarrier = logisticsCarrierOptions.value.find(c => c.id === carrierId);
    formHeader.logisticsCarrierName = selectedCarrier ? selectedCarrier.name : '';
};

const loadShipmentOrderData = async (orderId) => {
  if (!orderId) {
      resetForm();
      loadCreatorInfo(); // 新建时加载创建人
      return;
  }
  pageLoading.value = true;
  console.log(`[CreateShipmentOrder.vue] loadShipmentOrderData for ID: ${orderId}`);
  try {
    const res = await getShipmentOrderDetail(orderId);
    if (res.code === 200 && res.data) {
      resetForm(); // 先重置
      Object.assign(formHeader, res.data); // 再赋值
      // 确保物流公司名称被正确设置 (如果物流列表已加载)
      if(formHeader.logisticsCarrierId && logisticsCarrierOptions.value.length > 0){
          handleLogisticsCarrierChange(formHeader.logisticsCarrierId);
      } else if (formHeader.logisticsCarrierId && logisticsCarrierOptions.value.length === 0) {
          // 如果物流列表还没加载完，监听它加载完后再设置
          watch(logisticsCarrierOptions, (newVal) => {
              if(newVal.length > 0) handleLogisticsCarrierChange(formHeader.logisticsCarrierId)
          }, {once: true})
      }

      formLines.value = (res.data.items || []).map(item => ({
          ...item,
          shippedQuantity: Number(item.shippedQuantity) || 0,
          // sourceOutboundOrderNo: item.sourceOutboundOrderNo || item.outboundOrderNo || 'N/A', // 从mock数据结构看，item中应直接有sourceOutboundOrderNo
          // maxShippableQuantity: Number(item.pickedQuantityFromOutbound) || Number(item.shippedQuantity) || 0 // 用于编辑时限制，新建时等于pickedQuantity
      }));
    } else { 
      ElMessage.error(res.message || '加载发货单数据失败'); 
      // router.push({ name: 'ShipmentList' }); // 避免在加载不存在的ID时卡住
    }
  } catch (error) {
    console.error('加载发货单数据异常:', error);
    ElMessage.error(error.message || '加载发货单数据异常');
    // router.push({ name: 'ShipmentList' });
  }
  finally { pageLoading.value = false; }
};

onMounted(async () => {
  console.log('[CreateShipmentOrder.vue] Mounted. Props ID:', props.id, 'Props mode:', currentMode.value);
  await fetchLogisticsCarriersList(); // 先加载物流公司列表
  if (props.id) {
    loadShipmentOrderData(props.id);
  } else {
    resetForm();
    loadCreatorInfo();
  }
});

// --- 新增 onActivated 钩子 ---
onActivated(() => {
  console.log('[CreateShipmentOrder.vue] Activated. Props ID:', props.id, 'Props mode:', currentMode.value);
  if (props.id) { // 如果是查看或编辑已存在的发货单
    console.log('[CreateShipmentOrder.vue] Re-loading data due to activation for shipment order ID:', props.id);
    fetchLogisticsCarriersList().then(() => { // 确保物流公司列表最新
        loadShipmentOrderData(props.id);
    });
  } else { // 如果是返回到“新建”状态
    console.log('[CreateShipmentOrder.vue] Activated in create mode, ensuring form is reset and creator info loaded.');
    resetForm();
    loadCreatorInfo();
    fetchLogisticsCarriersList(); // 也确保物流公司列表已加载
  }
});
// --- 结束新增 ---


watch(() => props.id, async (newId, oldId) => {
  console.log(`[CreateShipmentOrder.vue] Watch props.id changed from "${oldId}" to "${newId}"`);
  if (newId && newId !== oldId) {
    if (logisticsCarrierOptions.value.length === 0) { // 确保物流公司已加载
        await fetchLogisticsCarriersList();
    }
    loadShipmentOrderData(newId);
  } else if (!newId && oldId && isCreateMode.value) { // 从编辑/查看切换到新建模式
    resetForm();
    loadCreatorInfo();
    if (logisticsCarrierOptions.value.length === 0) fetchLogisticsCarriersList();
  }
});

const openSelectOutboundOrderDialog = () => {
  // 在编辑模式下，如果已经有关联的出库单（即已保存的发货单），通常不允许重新关联
  if (isEditMode.value && formHeader.id) {
    ElMessage.info('已保存的发货单不允许重新关联出库单。如需修改，请考虑作废当前发货单并新建。');
    return;
  }
  if (formLines.value.length > 0) {
      ElMessageBox.confirm('重新关联出库单将会清空当前已添加的商品明细，确定要继续吗？', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
      }).then(() => {
          formLines.value = [];
          formHeader.relatedOutboundOrderIds = [];
          formHeader.relatedOutboundOrderNos = '';
          formHeader.customerName = '';
          selectOutboundOrderDialogVisible.value = true;
      }).catch(() => {});
  } else {
      selectOutboundOrderDialogVisible.value = true;
  }
};

const handleOutboundOrdersSelected = (selectedOutboundLines) => {
  console.log('[CreateShipmentOrder.vue] Selected outbound lines from dialog:', JSON.parse(JSON.stringify(selectedOutboundLines)));
  if (!selectedOutboundLines || selectedOutboundLines.length === 0) {
    selectOutboundOrderDialogVisible.value = false;
    return;
  }
  // 清空现有行项目，因为是重新关联
  formLines.value = selectedOutboundLines.map(obLine => ({
      id: null, // 发货单明细行是新的
      outboundOrderLineId: obLine.id,             // 来源出库单明细ID
      salesOrderLineId: obLine.salesOrderLineId,  // 原始销售单明细ID (确保SelectReadyOutboundOrderDialog返回的数据中有这个字段)
      sourceOutboundOrderNo: obLine.outboundOrderNo,
      productId: obLine.productId,
      productCode: obLine.productCode,
      productName: obLine.productName,
      specification: obLine.specification,
      unit: obLine.unit,
      shippedQuantity: Number(obLine.pickedQuantity) || 0, // 发货数量等于出库单的实拣数量
      maxShippableQuantity: Number(obLine.pickedQuantity) || 0, // 用于前端校验，最大可发货数量
      // 其他可能需要的商品信息...
  }));

  const uniqueOutboundOrderNos = [...new Set(selectedOutboundLines.map(line => line.outboundOrderNo || ''))].filter(Boolean);
  formHeader.relatedOutboundOrderNos = uniqueOutboundOrderNos.join(', ');

  const uniqueOutboundOrderIds = [...new Set(selectedOutboundLines.map(line => line.outboundOrderId || ''))].filter(Boolean);
  formHeader.relatedOutboundOrderIds = uniqueOutboundOrderIds;

  // 假设所有关联的出库单都来自同一个客户，或者取第一个作为代表
  if (selectedOutboundLines.length > 0 && selectedOutboundLines[0].customerName) {
      formHeader.customerName = selectedOutboundLines[0].customerName;
  } else {
      formHeader.customerName = '多个客户或未知'; // 需要根据实际业务调整如何显示
  }
  selectOutboundOrderDialogVisible.value = false;
};

const handleRemoveLine = (index) => {
  formLines.value.splice(index, 1);
  if (formLines.value.length === 0) {
      formHeader.relatedOutboundOrderIds = [];
      formHeader.relatedOutboundOrderNos = '';
      formHeader.customerName = '';
  } else {
      // 重新计算关联的出库单号等信息
      const uniqueOutboundOrderNos = [...new Set(formLines.value.map(line => line.sourceOutboundOrderNo || ''))].filter(Boolean);
      formHeader.relatedOutboundOrderNos = uniqueOutboundOrderNos.join(', ');
      const uniqueOutboundOrderIds = [...new Set(formLines.value.map(line => {
          // 需要找到这一行对应的原始出库单ID，这需要在 formLines 的每个item中保存 outboundOrderId
          // 假设在 handleOutboundOrdersSelected 中已保存
          const selectedLineOrigin = selectedOutboundLines.find(sol => sol.id === line.outboundOrderLineId);
          return selectedLineOrigin ? selectedLineOrigin.outboundOrderId : null;
      }).filter(Boolean))];
      formHeader.relatedOutboundOrderIds = uniqueOutboundOrderIds;
      // 客户名称也可能需要重新确定，如果允许多个出库单对应不同客户
  }
};

const preparePayload = () => {
  const payload = {
    id: formHeader.id, // 编辑时需要
    shipmentDate: formHeader.shipmentDate || _formatDateTimeToString(new Date()),
    logisticsCarrierId: formHeader.logisticsCarrierId,
    logisticsCarrierName: formHeader.logisticsCarrierName, // 同时提交名称方便显示
    trackingNumber: formHeader.trackingNumber,
    creatorId: formHeader.creatorId, // 应在 loadCreatorInfo 中设置
    // creatorName: formHeader.creatorName, // 后端应通过 creatorId 获取
    notes: formHeader.notes,
    status: formHeader.status || 'SHIPPED', // 创建时默认为 SHIPPED
    relatedOutboundOrderIds: formHeader.relatedOutboundOrderIds, // 从选择的出库单聚合而来
    customerName: formHeader.customerName, 
    items: formLines.value.map(line => ({
      // id: line.id, // 发货单明细的ID，新建时不需要，编辑时可能需要
      outboundOrderLineId: line.outboundOrderLineId, // 必须
      salesOrderLineId: line.salesOrderLineId,    // 必须，用于追溯销售单
      productId: line.productId,
      shippedQuantity: Number(line.shippedQuantity) || 0,
      // 以下商品信息主要是为了 payload 完整，后端也可以通过 productId 重新获取
      productCode: line.productCode,
      productName: line.productName,
      specification: line.specification,
      unit: line.unit,
      sourceOutboundOrderNo: line.sourceOutboundOrderNo, // 方便后端记录或校验
    })),
  };
  if (isCreateMode.value && !payload.id) { // 确保新建时不传递空的id
    delete payload.id;
  }
  if (!payload.creatorId && isCreateMode.value) {
    // 兜底，如果 creatorId 仍未设置 (理论上 loadCreatorInfo 应该已处理)
    console.warn("CreatorId is not set, attempting to load again or use placeholder.");
    // payload.creatorId = 'fallback-user-id'; // 最好有实际值
  }
  return payload;
};

const handleSubmitShipmentOrder = async () => {
  let valid = false;
  if (headerFormRef.value) {
    await headerFormRef.value.validate((v) => { valid = v; });
  }
  if (!valid) { ElMessage.error('请检查表头信息是否完整且正确。'); return; }
  if (formLines.value.length === 0) { ElMessage.error('请至少添加一条发货商品明细。'); return; }
  for (const line of formLines.value) {
    if (!(Number(line.shippedQuantity) > 0)) { ElMessage.error(`商品 "${line.productName}" 的发货数量必须大于0。`); return; }
    if (line.maxShippableQuantity !== undefined && Number(line.shippedQuantity) > Number(line.maxShippableQuantity)) {
        ElMessage.error(`商品 "${line.productName}" 的发货数量 (${line.shippedQuantity}) 不能大于可发货数量 (${line.maxShippableQuantity})。`); return;
    }
  }

  submitLoading.value = true;
  try {
    const payload = preparePayload();
    if (payload.id) delete payload.id; // 确保创建时不传发货单ID
    payload.status = 'SHIPPED'; // 创建即发货

    console.log('[CreateShipmentOrder.vue] Submitting createShipmentOrder with payload:', JSON.parse(JSON.stringify(payload)));
    const res = await createShipmentOrder(payload);
    if (res.code === 200 && res.data) {
      ElMessage.success('发货单创建成功 (已确认发货)！');
      router.push({ name: 'ShipmentList' }); 
    } else { ElMessage.error(res.message || '确认发货失败。'); }
  } catch (error) { console.error('确认发货异常:', error); ElMessage.error(error.message || '确认发货异常。'); } 
  finally { submitLoading.value = false; }
};

const handleUpdateShipmentOrder = async () => {
  if (!isEditMode.value || !formHeader.id) return;
  // 编辑发货单的逻辑，通常是修改物流信息、备注等，商品明细一般不允许修改已保存的发货单
  // 如果允许修改，这里的 payload 和 API 调用需要相应调整
  let valid = false;
  if (headerFormRef.value) { await headerFormRef.value.validate((v) => { valid = v; }); }
  if (!valid) { ElMessage.error('请检查表头信息是否完整且正确。'); return; }

  submitLoading.value = true;
  try {
    const payload = preparePayload(); // preparePayload 需要能区分是创建还是更新
    // payload.status = formHeader.status; // 编辑时状态可能不变或由特定操作改变

    console.log('[CreateShipmentOrder.vue] Submitting updateShipmentOrder with payload:', JSON.parse(JSON.stringify(payload)));
    const res = await updateShipmentOrder(formHeader.id, payload);
     if (res.code === 200 && res.data) {
      ElMessage.success('发货单更新成功！');
      // router.push({ name: 'ShipmentList' });
      loadShipmentOrderData(formHeader.id); // 重新加载以显示更新后的数据
    } else { ElMessage.error(res.message || '更新发货单失败。'); }
  } catch (error) { console.error('更新发货单异常:', error); ElMessage.error(error.message || '更新发货单异常。'); }
  finally { submitLoading.value = false; }
};

const handleCancel = () => {
  if (isViewMode.value || isEditMode.value) {
    router.push({ name: 'ShipmentList' });
  } else { // CreateMode
    if (formLines.value.length > 0 || formHeader.logisticsCarrierId || formHeader.trackingNumber || formHeader.notes) {
        ElMessageBox.confirm('表单内容可能尚未保存，确定要取消并返回列表吗？', '提示', {
            confirmButtonText: '确定返回', cancelButtonText: '继续编辑', type: 'warning',
        }).then(() => {
            resetForm();
            router.push({ name: 'ShipmentList' });
        }).catch(() => {});
    } else {
        router.push({ name: 'ShipmentList' });
    }
  }
};
</script>

<style scoped>
.create-shipment-order-page {} /* 可以添加页面特定样式 */
.el-form-item { margin-bottom: 18px; }
/* .page-actions-footer 样式应在 global.css 或此处定义 */
</style>