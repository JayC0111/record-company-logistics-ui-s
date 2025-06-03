import { generateId, paginateData, filterData } from './index';
import usersMock from './users'; // 用于获取创建人信息

// 模拟入库单数据
export const mockInboundOrders = [
    {
        id: generateId('ib'),
        putaway_order_no: 'PUT-20241030-001', // [cite: 1]
        status: 'PENDING', // 待处理 [cite: 1]
        creation_time: '2024-06-01 10:00:00', // [cite: 1]
        creator_id: 'user-wh-01', // [cite: 1]
        creatorName: '仓库管理员张三', // 冗余，方便显示
        related_purchase_order_nos: 'PO-20240520-001, PO-20240520-002', // 假设关联的采购单号
        notes: '第一批货物已到，等待上架。', // [cite: 1]
    },
    {
        id: generateId('ib'),
        putaway_order_no: 'PUT-20241029-001',
        status: 'COMPLETED', // 已完成 [cite: 1]
        creation_time: '2024-05-30 14:30:00',
        creator_id: 'user-wh-02',
        creatorName: '仓库管理员李四',
        related_purchase_order_nos: 'PO-20240518-001',
        notes: '全部上架完毕。',
    },
    {
        id: generateId('ib'),
        putaway_order_no: 'PUT-20241028-001',
        status: 'PENDING',
        creation_time: '2024-05-28 09:15:00',
        creator_id: 'user-wh-01',
        creatorName: '仓库管理员张三',
        related_purchase_order_nos: 'PO-20240515-003',
        notes: '',
    },
    {
        id: generateId('ib'),
        putaway_order_no: 'PUT-20241027-002',
        status: 'CANCELLED', // 假设有已取消状态
        creation_time: '2024-05-27 11:00:00',
        creator_id: 'user-wh-02',
        creatorName: '仓库管理员李四',
        related_purchase_order_nos: 'PO-20240512-001',
        notes: '供应商通知部分商品无法到货，此入库单取消。',
    }
];

const inboundOrdersMock = {
    getInboundOrderList(params) {
        console.log('[Mock /inboundOrders.js] getInboundOrderList called with params:', params);
        let result = JSON.parse(JSON.stringify(mockInboundOrders));

        // 处理日期筛选
        if (params.startDate && params.endDate) {
            result = result.filter(item => {
                const itemDate = new Date(item.creation_time.split(' ')[0]); // 仅比较日期部分
                return itemDate >= new Date(params.startDate) && itemDate <= new Date(params.endDate);
            });
        }
        
        const filters = {};
        if (params.putaway_order_no) filters.putaway_order_no = params.putaway_order_no;
        if (params.creatorName) filters.creatorName = params.creatorName;
        if (params.status) filters.status = params.status;
        result = filterData(result, filters);
        
        result.sort((a, b) => new Date(b.creation_time) - new Date(a.creation_time));

        return Promise.resolve({
            code: 200,
            message: '获取成功',
            data: paginateData(result, params?.page, params?.size)
        });
    },

    updateInboundOrder(id, data) {
        console.log('[Mock /inboundOrders.js] updateInboundOrder called for ID:', id, 'with data:', data);
        const index = mockInboundOrders.findIndex(o => o.id === id);
        if (index !== -1) {
            if (data.status && data.status === 'COMPLETED' && mockInboundOrders[index].status === 'PENDING') {
                mockInboundOrders[index].status = 'COMPLETED';
                mockInboundOrders[index].notes = (mockInboundOrders[index].notes || '') + `\n${new Date().toLocaleString()} 完成入库。`;
                 // 实际后端操作：更新库存 (inventory.on_hand_quantity增加), 更新采购单已入库数量 (purchase_order_line.putaway_quantity) 等 [cite: 1]
                console.log(`[Mock] Inbound Order ${id} status updated to COMPLETED. Real backend would update inventory and PO.`);
            } else if (data.status) {
                 mockInboundOrders[index].status = data.status;
            }
            // 其他更新...
            return Promise.resolve({ code: 200, message: '入库单更新成功', data: { ...mockInboundOrders[index] } });
        }
        return Promise.resolve({ code: 404, message: '入库单不存在', data: null });
    },
    // ... 其他 mock 函数如 getInboundOrderDetail, createInboundOrder, cancelInboundOrder
};

export default inboundOrdersMock;