import { generateId, paginateData, filterData } from './index';

export const mockSuppliers = [
    {
        id: 'sup-001', //
        name: '索尼音乐供应商', //
        contact_person: '李经理', //
        phone: '13812345678', //
        address: '上海市徐汇区漕溪北路100号', //
        is_active: true //
    },
    {
        id: 'sup-002',
        name: '华纳唱片直供中心',
        contact_person: '王芳',
        phone: '13987654321',
        address: '北京市朝阳区建国路88号',
        is_active: true
    },
    {
        id: 'sup-003',
        name: '环球音乐代理商（广州）',
        contact_person: '张伟',
        phone: '13711112222',
        address: '广州市天河区体育西路191号',
        is_active: true
    },
    {
        id: 'sup-004',
        name: '滚石唱片周边制作厂',
        contact_person: '赵小明',
        phone: '13600001111',
        address: '深圳市福田区深南大道6007号',
        is_active: false // 示例：非活跃供应商
    },
    {
        id: 'sup-005',
        name: 'EMI百代物料供应商',
        contact_person: '孙燕',
        phone: '13588889999',
        address: '杭州市西湖区文三路300号',
        is_active: true
    }
];

const suppliersMock = {
    getSupplierList(params) {
        console.log('[Mock /suppliers.js] getSupplierList called with params:', params);
        let result = JSON.parse(JSON.stringify(mockSuppliers.filter(s => s.is_active))); // 通常只选择活跃的
        
        const filters = {};
        if (params && params.name) filters.name = params.name;
        if (params && params.contact_person) filters.contact_person = params.contact_person;
        if (params && params.phone) filters.phone = params.phone;
        
        result = filterData(result, filters);
        
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        return Promise.resolve({
            code: 200,
            message: '获取供应商列表成功',
            data: paginateData(result, params?.page, params?.size)
        });
    },
    // getSupplierDetail mock (如果需要)
};

export default suppliersMock;