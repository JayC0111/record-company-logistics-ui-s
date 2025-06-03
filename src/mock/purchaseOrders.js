import { generateId, paginateData, filterData } from './index';
import { products } from './products'; // 引入商品数据用于填充明细

// 直接定义模拟供应商数据，因为 suppliers.js 文件尚不存在
const mockSuppliers = [
    { id: 'sup-001', name: '索尼音乐供应商', contactPerson: '李经理', phone: '13812345678' },
    { id: 'sup-002', name: '华纳唱片直供', contactPerson: '王经理', phone: '13987654321' },
    { id: 'sup-003', name: '环球音乐代理', contactPerson: '张代理', phone: '13711112222' },
];

export const purchaseOrders = [
    {
        id: generateId('po'),
        po_number: 'PO-20241030-001', //
        status: 'PENDING_RECEIPT', // 状态: 已确认/待收货
        supplier_id: 'sup-001', //
        supplierName: '索尼音乐供应商',
        order_date: '2024-05-28', //
        total_amount: 14000.00, //
        creator_id: 'user-purchaser-01', //
        creatorName: '采购员小王',
        notes: '第一批采购，请注意质量检验。', //
        items: [
            {
                id: generateId('poli'),
                product_id: 'p-001', //
                productName: '周杰伦《叶惠美》专辑', //
                specification: 'CD', //
                unit: '张', //
                ordered_quantity: 200, //
                unit_price: 35.00, //
                received_quantity: 0, //
                putaway_quantity: 0, //
            },
            {
                id: generateId('poli'),
                product_id: 'p-002',
                productName: '林俊杰《曹操》专辑', //
                specification: 'CD', //
                unit: '张', //
                ordered_quantity: 200, //
                unit_price: 35.00, //
                received_quantity: 0, //
                putaway_quantity: 0, //
            }
        ]
    },
    {
        id: generateId('po'),
        po_number: 'PO-20241029-001',
        status: 'PARTIALLY_RECEIVED', // 状态: 部分收货
        supplier_id: 'sup-002',
        supplierName: '华纳唱片直供',
        order_date: '2024-05-25',
        total_amount: 19600.00,
        creator_id: 'user-purchaser-01',
        creatorName: '采购员小王',
        notes: '客户急单补货。',
        items: [
             {
                id: generateId('poli'),
                product_id: 'p-003',
                productName: '薛之谦《绅士》专辑', //
                specification: 'CD+DVD', //
                unit: '套', //
                ordered_quantity: 400, //
                unit_price: 49.00, //
                received_quantity: 200, //
                putaway_quantity: 200, //
            }
        ]
    },
    {
        id: generateId('po'),
        po_number: 'PO-20241028-002',
        status: 'FULLY_RECEIVED', // 状态: 全部收货
        supplier_id: 'sup-003',
        supplierName: '环球音乐代理',
        order_date: '2024-05-22',
        total_amount: 27000.00,
        creator_id: 'user-purchaser-02',
        creatorName: '采购员小李',
        notes: '常规补货。',
        items: [
            {
                id: generateId('poli'),
                product_id: 'p-004',
                productName: '五月天《自传》专辑', //
                specification: '黑胶唱片', //
                unit: '张', //
                ordered_quantity: 200, //
                unit_price: 90.00, //
                received_quantity: 200, //
                putaway_quantity: 200, //
            },
            {
                id: generateId('poli'),
                product_id: 'p-009',
                productName: '久石让《天空之城》原声带', //
                specification: '黑胶唱片', //
                unit: '张', //
                ordered_quantity: 50, //
                unit_price: 180.00, //
                received_quantity: 50, //
                putaway_quantity: 50, //
            }
        ]
    }
];


const purchaseOrdersMock = {
    getPurchaseOrderList(params) {
        console.log('[Mock] getPurchaseOrderList with:', params);
        let result = JSON.parse(JSON.stringify(purchaseOrders));
        const filters = {};
        if (params.po_number) filters.po_number = params.po_number;
        if (params.supplierName) filters.supplierName = params.supplierName;
        if (params.status) filters.status = params.status;
        result = filterData(result, filters);
        return Promise.resolve({
            code: 200,
            message: '获取成功',
            data: paginateData(result, params?.page, params?.size)
        });
    },
    deletePurchaseOrder(id) {
        const index = purchaseOrders.findIndex(p => p.id === id);
        if (index !== -1) {
            // 根据ZERO.pdf中的流程，通常只有特定状态的订单可以删除，例如草稿或待确认
            // 这里我们放宽到'待收货'之前，更精细的逻辑应在后端实现
            if (purchaseOrders[index].status !== 'PENDING_RECEIPT') {
                 return Promise.resolve({ code: 400, message: '只有待收货状态的订单才能删除', data: null });
            }
            purchaseOrders.splice(index, 1);
            return Promise.resolve({ code: 200, message: '删除成功', data: null });
        }
        return Promise.resolve({ code: 404, message: '采购单不存在', data: null });
    }
    //... 您可以继续在这里添加 getPurchaseOrderDetail, create, update 等mock函数
};

export default purchaseOrdersMock;