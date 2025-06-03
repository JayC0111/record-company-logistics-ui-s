import { generateId, paginateData, filterData } from './index';
import { products } from './products'; // 用于商品信息
import { mockSuppliers } from './suppliers'; // 用于建议供应商信息

// 模拟采购计划单数据
export let purchaseRequisitions = [ // 改为 let 以便增删改
    {
        id: 'pr-mock-001', // 使用固定ID方便测试
        requisition_no: 'PR-20240603-001',
        status: 'DRAFT', // 草稿
        requester_id: 'user-purchaser-01',
        requesterName: '采购员小王', 
        request_department: '采购部',
        request_date: '2024-06-03',
        purpose: '为夏季促销活动备货',
        notes: '部分商品需紧急采购。',
        items: [
            { 
                id: generateId('prl'), 
                purchase_requisition_id: 'pr-mock-001',
                product_id: products[0].id, 
                productCode: products[0].productCode,
                productName: products[0].name,     
                specification: products[0].specification, 
                unit: products[0].unit,                 
                estimated_quantity: 100, 
                estimated_unit_price: parseFloat(products[0].costPrice) || 30, 
                suggested_supplier_id: mockSuppliers[0].id,
                suggestedSupplierName: mockSuppliers[0].name, 
                line_notes: '夏季主打'
            },
            { 
                id: generateId('prl'), 
                purchase_requisition_id: 'pr-mock-001',
                product_id: products[1].id, 
                productCode: products[1].productCode,
                productName: products[1].name,     
                specification: products[1].specification, 
                unit: products[1].unit,                 
                estimated_quantity: 50, 
                estimated_unit_price: parseFloat(products[1].costPrice) || 25, 
                suggested_supplier_id: mockSuppliers[1].id,
                suggestedSupplierName: mockSuppliers[1].name, 
                line_notes: ''
            },
        ],
        totalEstimatedAmount: (100 * (parseFloat(products[0].costPrice) || 30)) + (50 * (parseFloat(products[1].costPrice) || 25))
    },
    {
        id: 'pr-mock-002',
        requisition_no: 'PR-20240602-001',
        status: 'PENDING_APPROVAL', // 待审批
        requester_id: 'user-purchaser-02',
        requesterName: '采购员小李',
        request_department: '采购部',
        request_date: '2024-06-02',
        purpose: '日常库存补充',
        notes: '',
        items: [
            { 
                id: generateId('prl'), 
                purchase_requisition_id: 'pr-mock-002',
                product_id: products[2].id, 
                productCode: products[2].productCode,
                productName: products[2].name,     
                specification: products[2].specification, 
                unit: products[2].unit,                 
                estimated_quantity: 200, 
                estimated_unit_price: parseFloat(products[2].costPrice) || 40, 
                suggested_supplier_id: null, // 可以没有建议供应商
                suggestedSupplierName: '', 
                line_notes: '常规补货'
            },
        ],
        totalEstimatedAmount: 200 * (parseFloat(products[2].costPrice) || 40)
    },
    {
        id: 'pr-mock-003',
        requisition_no: 'PR-20240601-001',
        status: 'APPROVED', // 已批准
        requester_id: 'user-purchaser-01',
        requesterName: '采购员小王',
        request_department: '采购部',
        request_date: '2024-06-01',
        purpose: '补充《叶惠美》专辑库存',
        notes: '供应商已确认有货。',
        items: [],
        totalEstimatedAmount: 0
    },
    {
        id: 'pr-mock-004',
        requisition_no: 'PR-20240530-001',
        status: 'REJECTED', // 已拒绝
        requester_id: 'user-purchaser-02',
        requesterName: '采购员小李',
        request_department: '采购部',
        request_date: '2024-05-30',
        purpose: '采购黑胶唱片',
        notes: '审批意见：成本过高，暂不采购。',
        items: [],
        totalEstimatedAmount: 0
    },
];

const purchaseRequisitionsMock = {
    getPurchaseRequisitionList(params) {
        console.log('[Mock /purchaseRequisitions.js] getPurchaseRequisitionList called with params:', params);
        let result = JSON.parse(JSON.stringify(purchaseRequisitions));
        
        if (params.startDate && params.endDate) {
            result = result.filter(item => {
                const itemDate = new Date(item.request_date);
                return itemDate >= new Date(params.startDate) && itemDate <= new Date(params.endDate);
            });
        }

        const filters = {};
        if (params.requisition_no) filters.requisition_no = params.requisition_no;
        if (params.requesterName) filters.requesterName = params.requesterName;
        if (params.status) filters.status = params.status;
        result = filterData(result, filters);
        
        result.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());

        return Promise.resolve({
            code: 200,
            message: '获取成功',
            data: paginateData(result, params?.page, params?.size)
        });
    },

    getPurchaseRequisitionDetail(id) {
        console.log('[Mock /purchaseRequisitions.js] getPurchaseRequisitionDetail for ID:', id);
        const requisition = purchaseRequisitions.find(pr => pr.id === id);
        if (requisition) {
            const detail = JSON.parse(JSON.stringify(requisition));
            if (!detail.items) { 
                detail.items = [];
            }
            // 确保明细中的预估金额正确
            detail.items.forEach(item => {
                item.estimatedAmount = (Number(item.estimated_quantity) || 0) * (Number(item.estimated_unit_price) || 0);
            });
            return Promise.resolve({ code: 200, message: '获取详情成功', data: detail });
        }
        return Promise.resolve({ code: 404, message: '采购计划单不存在', data: null });
    },

    createPurchaseRequisition(data) {
        console.log('[Mock /purchaseRequisitions.js] createPurchaseRequisition with data:', data);
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const newId = generateId('pr');
        const newRequisition = {
            ...data, // 展开传入的数据
            id: newId,
            requisition_no: `PR-${dateStr}-${String(purchaseRequisitions.length + 1).padStart(3, '0')}`,
            status: data.status || 'DRAFT',
            request_date: data.request_date || now.toISOString().slice(0,10),
            items: (data.items || []).map(item => ({
                ...item,
                id: generateId('prl'), // 为明细行生成ID
                purchase_requisition_id: newId, // 关联主表ID
                estimated_quantity: Number(item.estimated_quantity) || 0,
                estimated_unit_price: Number(item.estimated_unit_price) || 0,
            })),
        };
        newRequisition.totalEstimatedAmount = newRequisition.items.reduce((sum, item) => sum + (item.estimated_quantity * item.estimated_unit_price), 0);
        
        purchaseRequisitions.unshift(newRequisition);
        console.log('[Mock] Created requisition:', newRequisition);
        return Promise.resolve({ code: 200, message: '创建成功', data: { ...newRequisition } });
    },

    updatePurchaseRequisition(id, data) {
        console.log('[Mock /purchaseRequisitions.js] updatePurchaseRequisition for ID:', id, 'with data:', data);
        const index = purchaseRequisitions.findIndex(pr => pr.id === id);
        if (index !== -1) {
            // 不能修改已不在草稿状态的单据的关键信息，除非是提交审批动作本身
            if (purchaseRequisitions[index].status !== 'DRAFT' && data.status === 'DRAFT') {
                 // 仅允许从 DRAFT 更新为 DRAFT，或通过 submit API 更新为 PENDING_APPROVAL
            } else if (purchaseRequisitions[index].status !== 'DRAFT') {
                return Promise.resolve({ code: 400, message: `状态为 ${purchaseRequisitions[index].status} 的计划单无法直接编辑。`, data: null });
            }


            purchaseRequisitions[index] = {
                ...purchaseRequisitions[index],
                ...data,
                id: id, // 确保ID不变
                requisition_no: purchaseRequisitions[index].requisition_no, // 单号不变
                items: (data.items || purchaseRequisitions[index].items || []).map(item => ({
                    ...item,
                    id: item.id || generateId('prl'), // 如果是新增行，生成ID
                    purchase_requisition_id: id,
                    estimated_quantity: Number(item.estimated_quantity) || 0,
                    estimated_unit_price: Number(item.estimated_unit_price) || 0,
                })),
            };
            purchaseRequisitions[index].totalEstimatedAmount = purchaseRequisitions[index].items.reduce((sum, item) => sum + (item.estimated_quantity * item.estimated_unit_price), 0);
            console.log('[Mock] Updated requisition:', purchaseRequisitions[index]);
            return Promise.resolve({ code: 200, message: '更新成功', data: { ...purchaseRequisitions[index] } });
        }
        return Promise.resolve({ code: 404, message: '采购计划单不存在', data: null });
    },

    deletePurchaseRequisition(id) {
        console.log('[Mock /purchaseRequisitions.js] deletePurchaseRequisition for ID:', id);
        const index = purchaseRequisitions.findIndex(pr => pr.id === id);
        if (index !== -1) {
            if (purchaseRequisitions[index].status !== 'DRAFT') {
                return Promise.resolve({ code: 400, message: '只有草稿状态的计划单才能删除', data: null });
            }
            purchaseRequisitions.splice(index, 1);
            return Promise.resolve({ code: 200, message: '删除成功', data: null });
        }
        return Promise.resolve({ code: 404, message: '采购计划单不存在', data: null });
    },

    submitPurchaseRequisition(id) {
        console.log('[Mock /purchaseRequisitions.js] submitPurchaseRequisition for ID:', id);
        const index = purchaseRequisitions.findIndex(pr => pr.id === id);
        if (index !== -1 && purchaseRequisitions[index].status === 'DRAFT') {
            purchaseRequisitions[index].status = 'PENDING_APPROVAL';
            console.log('[Mock] Submitted requisition:', purchaseRequisitions[index]);
            return Promise.resolve({ code: 200, message: '提交审批成功', data: { ...purchaseRequisitions[index] } });
        }
        if (index === -1) return Promise.resolve({ code: 404, message: '采购计划单不存在', data: null });
        return Promise.resolve({ code: 400, message: `状态为 ${purchaseRequisitions[index].status} 的计划单无法提交审批`, data: null });
    },
    
    approvePurchaseRequisition(id, { approved, comment }) {
        console.log('[Mock /purchaseRequisitions.js] approvePurchaseRequisition for ID:', id, 'Approved:', approved, 'Comment:', comment);
        const index = purchaseRequisitions.findIndex(pr => pr.id === id);
        if (index !== -1 && purchaseRequisitions[index].status === 'PENDING_APPROVAL') {
            purchaseRequisitions[index].status = approved ? 'APPROVED' : 'REJECTED';
            purchaseRequisitions[index].approval_comment = comment || (approved ? '审批通过' : '审批已拒绝'); 
            purchaseRequisitions[index].approval_time = new Date().toISOString();
            console.log('[Mock] Approved/Rejected requisition:', purchaseRequisitions[index]);
            return Promise.resolve({ 
                code: 200, 
                message: approved ? '审批通过' : '审批已拒绝', 
                data: { ...purchaseRequisitions[index] } 
            });
        }
        if (index === -1) return Promise.resolve({ code: 404, message: '采购计划单不存在', data: null });
        return Promise.resolve({ code: 400, message: `状态为 ${purchaseRequisitions[index].status} 的计划单无法进行审批操作`, data: null });
    }
};

export default purchaseRequisitionsMock;