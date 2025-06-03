import { generateId, paginateData, filterData } from './index'; //

// --- 数据准备 ---
// 从你提供的 src/mock/customers.js 内容中提取客户数据
const mockCustomers = [
  { id: 'c-001', name: '北京音像有限公司', phone: '13800138000', shippingAddress: '北京市朝阳区建国路88号', isActive: true }, //
  { id: 'c-002', name: '上海唱片销售中心', phone: '13900139000', shippingAddress: '上海市徐汇区天钥桥路333号', isActive: true }, //
  { id: 'c-003', name: '广州音乐流行馆', phone: '13600136000', shippingAddress: '广州市天河区天河路385号', isActive: true }, //
  { id: 'c-004', name: '深圳星光音乐代理', phone: '13700137000', shippingAddress: '深圳市南山区科技园南区8栋', isActive: true }, //
  { id: 'c-005', name: '成都乐府唱片', phone: '13500135000', shippingAddress: '成都市锦江区红星路三段99号', isActive: true }, //
  { id: 'c-006', name: '武汉知音文化传播', phone: '13207100006', shippingAddress: '武汉市江岸区中山大道100号', isActive: true }, //
  { id: 'c-007', name: '西安古都音像发行', phone: '13302900007', shippingAddress: '西安市碑林区南大街123号', isActive: true }, //
  { id: 'c-008', name: '长沙天籁之声', phone: '18973100008', shippingAddress: '长沙市芙蓉区五一大道456号', isActive: false }, //
  { id: 'c-009', name: '沈阳北方乐章', phone: '13102400009', shippingAddress: '沈阳市和平区太原北街789号', isActive: true }, //
  { id: 'c-010', name: '南京音乐坊', phone: '15802500010', shippingAddress: '南京市玄武区中山路321号', isActive: true }, //
  { id: 'c-011', name: '杭州西湖唱片行', phone: '13005710011', shippingAddress: '杭州市西湖区保俶路654号', isActive: true }, //
  { id: 'c-012', name: '重庆山城音乐屋', phone: '15302300012', shippingAddress: '重庆市渝中区解放碑步行街90号', isActive: true }, //
  { id: 'c-gen-1', name: '天津节奏唱片零售店', phone: '13912345678', shippingAddress: '天津市和平区滨江道123号', isActive: true },
  { id: 'c-gen-2', name: '苏州经典旋律音像行', phone: '13887654321', shippingAddress: '苏州市姑苏区观前街45号', isActive: true },
  { id: 'c-gen-3', name: '青岛海岸线CD专门店', phone: '13711223344', shippingAddress: '青岛市市南区香港中路67号', isActive: true },
  { id: 'c-gen-4', name: '大连黑胶客唱片馆', phone: '13698765432', shippingAddress: '大连市中山区人民路88号', isActive: false },
  { id: 'c-gen-5', name: '厦门鼓浪屿音乐岛零售', phone: '13512341234', shippingAddress: '厦门市思明区龙头路101号', isActive: true },
  { id: 'c-gen-6', name: '哈尔滨冰城乐迷之家', phone: '13400001111', shippingAddress: '哈尔滨市道里区中央大街56号', isActive: true },
  { id: 'c-gen-7', name: '济南泉城唱片集市', phone: '18812345600', shippingAddress: '济南市历下区泉城路222号', isActive: true }
];

// 从你提供的 src/mock/products.js 内容中提取商品数据
const mockProducts = [
  { id: 'p-001', productCode: 'PRD-1001', name: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 38.00, salesPrice: 68.00, safeStockLevel: 100, onHandQuantity: 350, reservedQuantity: 50, isActive: true }, //
  { id: 'p-002', productCode: 'PRD-1002', name: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 32.00, salesPrice: 58.00, safeStockLevel: 80, onHandQuantity: 220, reservedQuantity: 20, isActive: true }, //
  { id: 'p-003', productCode: 'PRD-1003', name: '薛之谦《绅士》专辑', specification: 'CD+DVD', unit: '套', category: '音乐专辑', costPrice: 48.00, salesPrice: 88.00, safeStockLevel: 60, onHandQuantity: 180, reservedQuantity: 30, isActive: true }, //
  { id: 'p-004', productCode: 'PRD-1004', name: '五月天《自传》专辑', specification: '黑胶唱片', unit: '张', category: '音乐专辑', costPrice: 95.00, salesPrice: 145.00, safeStockLevel: 30, onHandQuantity: 85, reservedQuantity: 15, isActive: true }, //
  { id: 'p-005', productCode: 'PRD-1005', name: '华语经典流行合集', specification: 'U盘装', unit: '个', category: '数字音乐', costPrice: 65.00, salesPrice: 129.00, safeStockLevel: 50, onHandQuantity: 120, reservedQuantity: 10, isActive: true }, //
  { id: 'p-006', productCode: 'PRD-1006', name: '泰勒·斯威夫特《1989》专辑', specification: '豪华版CD', unit: '张', category: '欧美流行', costPrice: 75.00, salesPrice: 128.00, safeStockLevel: 40, onHandQuantity: 150, reservedQuantity: 25, isActive: true }, //
  { id: 'p-007', productCode: 'PRD-1007', name: '陈奕迅《DUO》演唱会', specification: '蓝光DVD', unit: '套', category: '演唱会影像', costPrice: 120.00, salesPrice: 198.00, safeStockLevel: 20, onHandQuantity: 60, reservedQuantity: 5, isActive: true }, //
  { id: 'p-008', productCode: 'PRD-1008', name: '邓紫棋《G.E.M.》同名专辑', specification: '普通CD', unit: '张', category: '音乐专辑', costPrice: 30.00, salesPrice: 55.00, safeStockLevel: 70, onHandQuantity: 200, reservedQuantity: 10, isActive: false }, //
  { id: 'p-009', productCode: 'PRD-1009', name: '久石让《天空之城》原声带', specification: '黑胶唱片', unit: '张', category: '电影原声', costPrice: 110.00, salesPrice: 180.00, safeStockLevel: 25, onHandQuantity: 70, reservedQuantity: 8, isActive: true }, //
  { id: 'p-010', productCode: 'PRD-1010', name: '周深《大鱼》单曲', specification: '数字版', unit: '首', category: '数字音乐', costPrice: 5.00, salesPrice: 10.00, safeStockLevel: 0, onHandQuantity: 9999, reservedQuantity: 0, isActive: true }, //
  { id: 'p-011', productCode: 'PRD-1011', name: '毛不易《像我这样的人》EP', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 40.00, salesPrice: 72.00, safeStockLevel: 50, onHandQuantity: 130, reservedQuantity: 12, isActive: true }, //
  { id: 'p-012', productCode: 'PRD-1012', name: '古典音乐精选集', specification: '3CD套装', unit: '套', category: '古典音乐', costPrice: 90.00, salesPrice: 150.00, safeStockLevel: 30, onHandQuantity: 90, reservedQuantity: 5, isActive: true }, //
  { id: 'p-gen-1', productCode: 'PRD-2001', name: '周杰伦《范特西》CD', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 40.00, salesPrice: 70.00, safeStockLevel: 50, onHandQuantity: 200, reservedQuantity: 10, isActive: true }, //
  { id: 'p-gen-2', productCode: 'PRD-2002', name: '周杰伦《七里香》黑胶唱片', specification: '黑胶唱片', unit: '张', category: '音乐专辑', costPrice: 120.00, salesPrice: 198.00, safeStockLevel: 20, onHandQuantity: 50, reservedQuantity: 5, isActive: true }, //
  { id: 'p-gen-3', productCode: 'PRD-2003', name: '王力宏《唯一》CD', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 35.00, salesPrice: 65.00, safeStockLevel: 40, onHandQuantity: 150, reservedQuantity: 8, isActive: true }, //
  { id: 'p-gen-4', productCode: 'PRD-2004', name: '王力宏《盖世英雄》黑胶唱片', specification: '黑胶唱片', unit: '张', category: '音乐专辑', costPrice: 110.00, salesPrice: 188.00, safeStockLevel: 25, onHandQuantity: 60, reservedQuantity: 3, isActive: true }, //
  { id: 'p-gen-5', productCode: 'PRD-2005', name: '周杰伦《依然范特西》CD', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 38.00, salesPrice: 69.00, safeStockLevel: 50, onHandQuantity: 180, reservedQuantity: 12, isActive: true }, //
  { id: 'p-gen-6', productCode: 'PRD-2006', name: '王力宏《心中的日月》CD', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 36.00, salesPrice: 66.00, safeStockLevel: 30, onHandQuantity: 120, reservedQuantity: 6, isActive: false }, //
  { id: 'p-gen-7', productCode: 'PRD-2007', name: '周杰伦《我很忙》CD', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 37.00, salesPrice: 67.00, safeStockLevel: 45, onHandQuantity: 220, reservedQuantity: 15, isActive: true }, //
  { id: 'p-gen-8', productCode: 'PRD-2008', name: '王力宏《改变自己》CD', specification: 'CD', unit: '张', category: '音乐专辑', costPrice: 39.00, salesPrice: 72.00, safeStockLevel: 35, onHandQuantity: 160, reservedQuantity: 7, isActive: true }, //
  { id: 'p-gen-9', productCode: 'PRD-2009', name: '周杰伦《魔杰座》黑胶唱片', specification: '黑胶唱片', unit: '张', category: '音乐专辑', costPrice: 130.00, salesPrice: 210.00, safeStockLevel: 15, onHandQuantity: 40, reservedQuantity: 2, isActive: true }, //
  { id: 'p-gen-10', productCode: 'PRD-2010', name: '王力宏《火力全开 新歌+精选》2CD', specification: '2CD', unit: '套', category: '音乐专辑', costPrice: 55.00, salesPrice: 98.00, safeStockLevel: 30, onHandQuantity: 100, reservedQuantity: 10, isActive: true } //
];

const salespersons = [
    { id: 'user-zhangsan', name: '张三' },
    { id: 'user-lisi', name: '李四' },
    { id: 'user-wangwu', name: '王五' },
    { id: 'user-zhaoliu', name: '赵六' },
    { id: 'user-sunqi', name: '孙七' },
    { id: 'user-zhouba', name: '周八' },
    { id: 'user-wujiu', name: '吴九' },
    { id: 'user-zhengshi', name: '郑十' },
    { id: 'user-fengshiyi', name: '冯十一' },
    { id: 'user-chenshier', name: '陈十二' }
];

const statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_SHIPPED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
const remarksOptions = [
  '常规订单', '客户急需，请尽快处理', '大客户订单，注意服务质量', '活动促销订单', 
  '新品预订', '请安排优质物流', '已与客户电话确认', '月底结算订单'
];


// --- 已有销售单数据 (12条) ---
const existingSalesOrders = [
  {
    id: 'so-001',
    orderNo: 'SO-20241001-001',
    customerId: 'c-001',
    customerName: '北京音像有限公司',
    customerPhone: '13800138000',
    customerAddress: '北京市朝阳区建国路88号',
    totalAmount: 12580.50,
    status: 'DRAFT',
    salespersonId: 'user-zhangsan',
    salespersonName: '张三',
    createdBy: '张三',
    orderTime: '2024-05-15 10:30:00',
    createTime: '2024-05-15 10:30:45',
    remarks: '测试销售单，请优先处理',
    items: [
      { id: 'soitem-001', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 100, lineTotal: 6800.00, outboundQuantity: 0 },
      { id: 'soitem-002', productId: 'p-002', productCode: 'PRD-1002', productName: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', unitPrice: 58.00, quantity: 100, lineTotal: 5800.00, outboundQuantity: 0 }
    ]
  },
  {
    id: 'so-002',
    orderNo: 'SO-20241001-002',
    customerId: 'c-002',
    customerName: '上海唱片销售中心',
    customerPhone: '13900139000',
    customerAddress: '上海市徐汇区天钥桥路333号',
    totalAmount: 23650.00,
    status: 'PENDING_APPROVAL',
    salespersonId: 'user-lisi',
    salespersonName: '李四',
    createdBy: '李四',
    orderTime: '2024-05-16 14:25:00',
    createTime: '2024-05-16 14:25:30',
    remarks: '急件，请尽快处理，客户要求发顺丰',
    items: [
      { id: 'soitem-003', productId: 'p-003', productCode: 'PRD-1003', productName: '薛之谦《绅士》专辑', specification: 'CD+DVD', unit: '套', unitPrice: 88.00, quantity: 150, lineTotal: 13200.00, outboundQuantity: 0 },
      { id: 'soitem-004', productId: 'p-004', productCode: 'PRD-1004', productName: '五月天《自传》专辑', specification: '黑胶唱片', unit: '张', unitPrice: 145.00, quantity: 72, lineTotal: 10440.00, outboundQuantity: 0 }
    ]
  },
  { 
    id: 'so-gen-003', // Was generateId('so')
    orderNo: `SO-20240520-003`, 
    customerId: 'c-003',  
    customerName: '广州音乐流行馆', // Updated from '广州流行前线音像店' to match customers.js
    customerPhone: '13600136000', // Updated
    customerAddress: '广州市天河区天河路385号', // Updated
    totalAmount: 9850.00, 
    status: 'APPROVED', 
    salespersonId: 'user-wangwu', 
    salespersonName: '王五', 
    createdBy: '王五', 
    orderTime: '2024-05-20 09:14:00', 
    createTime: '2024-05-20 09:15:00', 
    remarks: '新客户首单，赠送海报', 
    items: [ 
      { id: 'soi-gen-003-1', productId: 'p-005', productCode: 'PRD-1005', productName: '华语经典流行合集', specification: 'U盘装', unit: '个', unitPrice: 129.00, quantity: 50, lineTotal: 6450.00, outboundQuantity: 0 },
      { id: 'soi-gen-003-2', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 50, lineTotal: 3400.00, outboundQuantity: 0 }
    ] 
  }, 
  { 
    id: 'so-gen-004', // Was generateId('so')
    orderNo: `SO-20240519-001`, 
    customerId: 'c-004', 
    customerName: '深圳星光音乐代理', // Updated
    totalAmount: 17600.00, 
    status: 'SHIPPED',
    salespersonId: 'user-zhaoliu', 
    salespersonName: '赵六', 
    createdBy: '赵六', 
    orderTime: '2024-05-19 11:39:00', 
    createTime: '2024-05-19 11:40:20', 
    customerPhone: '13700137000', // Updated
    customerAddress: '深圳市南山区科技园南区8栋', // Updated
    remarks: '客户指定快递：圆通', 
    items: [ 
      { id: 'soi-gen-004-1', productId: 'p-003', productCode: 'PRD-1003', productName: '薛之谦《绅士》专辑', specification: 'CD+DVD', unit: '套', unitPrice: 88.00, quantity: 200, lineTotal: 17600.00, outboundQuantity: 200 }
    ] 
  }, 
  { 
    id: 'so-gen-005', // Was generateId('so')
    orderNo: `SO-20240518-005`, 
    customerId: 'c-005', 
    customerName: '成都乐府唱片', 
    totalAmount: 5820.00, 
    status: 'COMPLETED',
    salespersonId: 'user-sunqi', 
    salespersonName: '孙七', 
    createdBy: '孙七', 
    orderTime: '2024-05-18 16:05:00', 
    createTime: '2024-05-18 16:05:55', 
    customerPhone: '13500135000', 
    customerAddress: '成都市锦江区红星路三段99号', 
    remarks: '已签收，用户满意', 
    items: [ 
      { id: 'soi-gen-005-1', productId: 'p-002', productCode: 'PRD-1002', productName: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', unitPrice: 58.00, quantity: 60, lineTotal: 3480.00, outboundQuantity: 60 }, 
      { id: 'soi-gen-005-2', productId: 'p-004', productCode: 'PRD-1004', productName: '五月天《自传》专辑', specification: '黑胶唱片', unit: '张', unitPrice: 145.00, quantity: 10, lineTotal: 1450.00, outboundQuantity: 10 }, 
      { id: 'soi-gen-005-3', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 10, lineTotal: 680.00, outboundQuantity: 10 }, 
    ] 
  }, 
  { 
    id: 'so-gen-006', // Was generateId('so')
    orderNo: `SO-20240517-010`, 
    customerId: 'c-006', 
    customerName: '武汉知音文化传播', // Updated
    totalAmount: 34000.00, 
    status: 'DRAFT', 
    salespersonId: 'user-zhouba', 
    salespersonName: '周八', 
    createdBy: '周八', 
    orderTime: '2024-05-17 09:55:00', 
    createTime: '2024-05-17 10:00:00', 
    customerPhone: '13207100006', // Updated
    customerAddress: '武汉市江岸区中山大道100号', // Updated
    remarks: '大客户订单，待确认细节', 
    items: [ 
      { id: 'soi-gen-006-1', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 500, lineTotal: 34000.00, outboundQuantity: 0 }
    ] 
  }, 
  {  
    id: 'mock-id-009', 
    orderNo: `SO-20240517-009`, 
    customerId: 'c-007', 
    customerName: '西安古都音像发行', // Updated
    totalAmount: 12070.00, 
    status: 'DRAFT', 
    salespersonId: 'user-wujiu', 
    salespersonName: '吴九', 
    createdBy: '吴九', 
    orderTime: '2024-05-17 13:10:00', 
    createTime: '2024-05-17 13:12:10', 
    customerPhone: '13302900007', // Updated
    customerAddress: '西安市碑林区南大街123号', // Updated
    remarks: '客户信息有误，审核打回，请修改后重新提交。',
    items: [ 
      { id: 'soi-gen-009-1', productId: 'p-002', productCode: 'PRD-1002', productName: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', unitPrice: 58.00, quantity: 150, lineTotal: 8700.00, outboundQuantity: 0 }, 
      { id: 'soi-gen-009-2', productId: 'p-005', productCode: 'PRD-1005', productName: '华语经典流行合集', specification: 'U盘装', unit: '个', unitPrice: 129.00, quantity: 20, lineTotal: 2580.00, outboundQuantity: 0 }, 
      { id: 'soi-gen-009-3', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 10, lineTotal: 680.00, outboundQuantity: 0 }, 
    ] 
  }, 
  { 
    id: 'so-gen-008', // Was generateId('so')
    orderNo: `SO-20240515-008`, 
    customerId: 'c-008', 
    customerName: '长沙天籁之声', // Updated
    totalAmount: 6800.00, 
    status: 'PENDING_APPROVAL', 
    salespersonId: 'user-zhengshi', 
    salespersonName: '郑十', 
    createdBy: '郑十', 
    orderTime: '2024-05-15 17:45:00', 
    createTime: '2024-05-15 17:50:30', 
    customerPhone: '18973100008', // Updated
    customerAddress: '长沙市芙蓉区五一大道456号', // Updated
    remarks: '加急订单', 
    items: [ 
      { id: 'soi-gen-008-1', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 100, lineTotal: 6800.00, outboundQuantity: 0 }
    ] 
  }, 
  { 
    id: 'so-gen-009', // Was generateId('so') // Renamed for uniqueness from mock-id-009
    orderNo: `SO-20240514-002`, 
    customerId: 'c-009', 
    customerName: '沈阳北方乐章', // Updated
    totalAmount: 19980.00, 
    status: 'PARTIALLY_SHIPPED', 
    salespersonId: 'user-fengshiyi', 
    salespersonName: '冯十一', 
    createdBy: '冯十一', 
    orderTime: '2024-05-14 10:20:00', 
    createTime: '2024-05-14 10:22:15', 
    customerPhone: '13102400009', // Updated
    customerAddress: '沈阳市和平区太原北街789号', // Updated
    remarks: '部分商品先发，剩余待补', 
    items: [ 
      { id: 'soi-gen-010-1', productId: 'p-004', productCode: 'PRD-1004', productName: '五月天《自传》专辑', specification: '黑胶唱片', unit: '张', unitPrice: 145.00, quantity: 80, lineTotal: 11600.00, outboundQuantity: 80 }, 
      { id: 'soi-gen-010-2', productId: 'p-003', productCode: 'PRD-1003', productName: '薛之谦《绅士》专辑', specification: 'CD+DVD', unit: '套', unitPrice: 88.00, quantity: 95, lineTotal: 8380.00, outboundQuantity: 0 }
    ] 
  }, 
  { 
    id: 'so-gen-010', // Was generateId('so')
    orderNo: `SO-20240513-001`, 
    customerId: 'c-010', 
    customerName: '南京音乐坊', // Updated
    totalAmount: 4290.00, 
    status: 'CANCELLED', 
    salespersonId: 'user-chenshier', 
    salespersonName: '陈十二', 
    createdBy: '陈十二', 
    orderTime: '2024-05-13 14:55:00', 
    createTime: '2024-05-13 15:00:00', 
    customerPhone: '15802500010', // Updated
    customerAddress: '南京市玄武区中山路321号', // Updated
    remarks: '客户取消订单', 
    items: [ 
      { id: 'soi-gen-011-1', productId: 'p-005', productCode: 'PRD-1005', productName: '华语经典流行合集', specification: 'U盘装', unit: '个', unitPrice: 129.00, quantity: 30, lineTotal: 3870.00, outboundQuantity: 0 }, 
      { id: 'soi-gen-011-2', productId: 'p-002', productCode: 'PRD-1002', productName: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', unitPrice: 58.00, quantity: 5, lineTotal: 290.00, outboundQuantity: 0 }, 
    ] 
  }, 
  { 
    id: 'so-gen-011', // Was generateId('so')
    orderNo: `SO-20240512-007`, 
    customerId: 'c-001', 
    customerName: '北京音像有限公司',  
    totalAmount: 2760.00, 
    status: 'COMPLETED', 
    salespersonId: 'user-zhangsan', 
    salespersonName: '张三', 
    createdBy: '张三', 
    orderTime: '2024-05-12 11:10:00', 
    createTime: '2024-05-12 11:11:11', 
    customerPhone: '13800138000', 
    customerAddress: '北京市朝阳区建国路88号', 
    remarks: '老客户补单，已完成', 
    items: [ 
      { id: 'soi-gen-012-1', productId: 'p-002', productCode: 'PRD-1002', productName: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', unitPrice: 58.00, quantity: 40, lineTotal: 2320.00, outboundQuantity: 40 }, 
      { id: 'soi-gen-012-2', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 5, lineTotal: 340.00, outboundQuantity: 5 }, 
    ] 
  }, 
  { 
    id: 'so-gen-012', // Was generateId('so')
    orderNo: `SO-20240510-004`, 
    customerId: 'c-002', 
    customerName: '上海唱片销售中心',  
    totalAmount: 16880.00, 
    status: 'APPROVED', 
    salespersonId: 'user-lisi', 
    salespersonName: '李四', 
    createdBy: '李四', 
    orderTime: '2024-05-10 18:00:00', 
    createTime: '2024-05-10 18:00:45', 
    customerPhone: '13900139000', 
    customerAddress: '上海市徐汇区天钥桥路333号', 
    remarks: '月末大单，准备出库', 
    items: [ 
      { id: 'soi-gen-013-1', productId: 'p-003', productCode: 'PRD-1003', productName: '薛之谦《绅士》专辑', specification: 'CD+DVD', unit: '套', unitPrice: 88.00, quantity: 100, lineTotal: 8800.00, outboundQuantity: 0 }, 
      { id: 'soi-gen-013-2', productId: 'p-001', productCode: 'PRD-1001', productName: '周杰伦《叶惠美》专辑', specification: 'CD', unit: '张', unitPrice: 68.00, quantity: 100, lineTotal: 6800.00, outboundQuantity: 0 }, 
      { id: 'soi-gen-013-3', productId: 'p-002', productCode: 'PRD-1002', productName: '林俊杰《曹操》专辑', specification: 'CD', unit: '张', unitPrice: 58.00, quantity: 20, lineTotal: 1160.00, outboundQuantity: 0 }, 
    ] 
  }
];

// --- 生成新的99条销售单数据 ---
const newOrders = [];
let orderNoCounter = 13; // Start from next number after existing 12 (001 to 012)
const baseYear = 2023; // For generating order dates

for (let i = 0; i < 99; i++) {
  const randomCustomer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
  const randomSalesperson = salespersons[Math.floor(Math.random() * salespersons.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomRemark = remarksOptions[Math.floor(Math.random() * remarksOptions.length)];

  // Generate random date for orderTime (within last 2 years for example)
  const orderDate = new Date(baseYear + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  const createDate = new Date(orderDate.getTime() + Math.floor(Math.random() * 5 * 60000) + 30000); // 30s to 5min after orderTime

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${MM}:${ss}`;
  };
  
  const orderTimeStr = formatDate(orderDate);
  const dateForOrderNo = orderDate.getFullYear() + String(orderDate.getMonth() + 1).padStart(2, '0') + String(orderDate.getDate()).padStart(2, '0');


  const newOrder = {
    id: generateId('so'),
    orderNo: `SO-${dateForOrderNo}-${String(orderNoCounter++).padStart(3, '0')}`,
    customerId: randomCustomer.id,
    customerName: randomCustomer.name,
    customerPhone: randomCustomer.phone,
    customerAddress: randomCustomer.shippingAddress,
    totalAmount: 0, // Will be calculated
    status: randomStatus,
    salespersonId: randomSalesperson.id,
    salespersonName: randomSalesperson.name,
    createdBy: randomSalesperson.name,
    orderTime: orderTimeStr,
    createTime: formatDate(createDate),
    remarks: randomRemark,
    items: []
  };

  const itemCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
  let calculatedTotalAmount = 0;

  for (let j = 0; j < itemCount; j++) {
    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const quantity = Math.floor(Math.random() * 50) + 1; // 1 to 50 units
    const unitPrice = Number(randomProduct.salesPrice) || 50; // Default to 50 if salesPrice is invalid
    const lineTotal = parseFloat((unitPrice * quantity).toFixed(2));
    calculatedTotalAmount += lineTotal;

    let outboundQuantity = 0;
    if (randomStatus === 'COMPLETED' || randomStatus === 'SHIPPED') {
      outboundQuantity = quantity;
    } else if (randomStatus === 'PARTIALLY_SHIPPED' && quantity > 1) {
      outboundQuantity = Math.floor(Math.random() * (quantity - 1)) + 1;
    } else if (randomStatus === 'PARTIALLY_SHIPPED' && quantity === 1){ // if quantity is 1, can't be partially shipped in this simple logic
      newOrder.status = 'APPROVED'; // Change status if logic conflict
      outboundQuantity = 0;
    }


    newOrder.items.push({
      id: generateId('soi'),
      productId: randomProduct.id,
      productCode: randomProduct.productCode,
      productName: randomProduct.name,
      specification: randomProduct.specification,
      unit: randomProduct.unit,
      unitPrice: unitPrice,
      quantity: quantity,
      lineTotal: lineTotal,
      outboundQuantity: outboundQuantity
    });
  }
  newOrder.totalAmount = parseFloat(calculatedTotalAmount.toFixed(2));
  
  // Ensure totalAmount is not zero if items exist, can happen if all products had 0 salesPrice
  if (newOrder.items.length > 0 && newOrder.totalAmount === 0) {
      let validTotal = newOrder.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
      newOrder.totalAmount = parseFloat(validTotal.toFixed(2)) || 100; // Fallback if all line totals are zero
  }


  newOrders.push(newOrder);
}

// 合并现有数据和新生成的数据
export const salesOrders = [...existingSalesOrders, ...newOrders];


// 模拟API服务对象 (保持原有逻辑不变，仅数据源更新为扩充后的 salesOrders)
const salesOrdersMock = {
  getSalesOrderList(params) {
    let result = [...salesOrders]; // 操作的是本文件顶部的 salesOrders 数组
    if (params) {
      const filters = {}; //
      if (params.orderNo) filters.orderNo = params.orderNo; //
      if (params.customerName) filters.customerName = params.customerName; //
      if (params.status) filters.status = params.status; //
      result = filterData(result, filters); //
      if (params.startDate && params.endDate) {
        result = result.filter(order => {
          const orderDateValue = order.orderTime || order.createTime; //
          if (!orderDateValue) return false; //
          const orderDate = new Date(orderDateValue.split(' ')[0]); //
          const startDate = new Date(params.startDate); //
          const endDate = new Date(params.endDate); //
          return orderDate >= startDate && orderDate <= endDate; //
        });
      }
    }
    result.sort((a, b) => {
        const dateA = new Date(a.orderTime || a.createTime || 0); //
        const dateB = new Date(b.orderTime || b.createTime || 0); //
        return dateB - dateA; //
    });
    return {
      code: 200, //
      message: '获取成功', //
      data: paginateData(result, params?.page || 0, params?.size || 10) //
    };
  },

  getSalesOrderDetail(id) {
    const order = salesOrders.find(order => order.id === id); // 操作的是本文件顶部的 salesOrders 数组
    if (order) {
      return {
        code: 200, //
        message: '获取成功', //
        data: { 
          ...order, //
          salespersonId: order.salespersonId || (order.createdBy === '张三' ? 'user-zhangsan' : (order.createdBy === '李四' ? 'user-lisi' : '')), //
          salespersonName: order.salespersonName || order.createdBy || '', //
          orderTime: order.orderTime || order.createTime || '', //
          createTime: order.createTime || order.orderTime || '',  //
          remarks: order.remarks || '', //
          status: order.status || 'DRAFT', //
          items: (order.items || []).map(item => ({...item, outboundQuantity: item.outboundQuantity === undefined ? 0 : item.outboundQuantity})) // 确保 outboundQuantity 存在
        }
      };
    } else {
      return { code: 404, message: '销售单不存在', data: null }; //
    }
  },

  createSalesOrder(data) { 
    const newOrder = {
      id: generateId('so'), //
      orderNo: `SO-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${String(salesOrders.length + 1).padStart(3,'0')}`, //
      orderTime: data.orderTime,  //
      createTime: data.orderTime,  //
      salespersonId: data.salespersonId, //
      salespersonName: data.salespersonName, //
      createdBy: data.salespersonName || '未知创建人', //
      status: data.status || 'DRAFT',  //
      customerId: data.customerId, //
      customerName: data.customerName, //
      customerPhone: data.customerPhone, //
      customerAddress: data.customerAddress, //
      totalAmount: data.totalAmount, //
      remarks: data.remarks || '', //
      items: (data.items || []).map(item => ({  //
        ...item,  //
        id: generateId('soi'), //
        outboundQuantity: 0  //
      }))
    };
    salesOrders.unshift(newOrder); // 操作的是本文件顶部的 salesOrders 数组
    console.log('[Mock /salesOrders.js] New sales order created:', JSON.stringify(newOrder, null, 2)); //
    return { code: 200, message: '创建成功', data: { ...newOrder } }; //
  },

  updateSalesOrder(id, data) {
    const index = salesOrders.findIndex(order => order.id === id); // 操作的是本文件顶部的 salesOrders 数组
    if (index !== -1) {
      const originalOrder = salesOrders[index]; //
      salesOrders[index] = {
        ...originalOrder, //
        ...data,  //
        orderTime: data.orderTime || originalOrder.orderTime, //
        createTime: data.orderTime || originalOrder.orderTime || originalOrder.createTime, //
        salespersonId: data.salespersonId || originalOrder.salespersonId, //
        salespersonName: data.salespersonName || originalOrder.salespersonName, //
        createdBy: data.salespersonName || originalOrder.createdBy, //
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19), //
        items: (data.items || originalOrder.items).map(item => {
            // 查找原始行项目的 outboundQuantity
            const originalItem = originalOrder.items.find(origItem => origItem.id === item.id); //
            const existingOutboundQuantity = originalItem ? (originalItem.outboundQuantity === undefined ? 0 : originalItem.outboundQuantity) : 0; //
            
            return {  //
                ...item,  //
                id: item.id || generateId('soi'), //
                // 如果更新时没有传递 outboundQuantity，则保留原有的，否则使用传递的值或默认为0
                outboundQuantity: item.outboundQuantity === undefined ? existingOutboundQuantity : (item.outboundQuantity || 0) //
            };
        }),
      };
      console.log('[Mock /salesOrders.js] Sales order updated:', JSON.stringify(salesOrders[index], null, 2)); //
      return { code: 200, message: '更新成功', data: { ...salesOrders[index] } }; //
    } else {
      return { code: 404, message: '销售单不存在', data: null }; //
    }
  },

  deleteSalesOrder(id) {
    const index = salesOrders.findIndex(order => order.id === id); // 操作的是本文件顶部的 salesOrders 数组
    if (index !== -1) {
      salesOrders.splice(index, 1); //
      return { code: 200, message: '删除成功', data: null }; //
    }
    return { code: 404, message: '销售单不存在', data: null }; //
  },

  submitSalesOrder(id) {
    const order = salesOrders.find(order => order.id === id); // 操作的是本文件顶部的 salesOrders 数组
    if (order) {
      if (order.status === 'DRAFT') {
        order.status = 'PENDING_APPROVAL'; //
        order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19); //
        console.log('[Mock /salesOrders.js] Sales order submitted for approval:', order); //
        return { code: 200, message: '提交成功', data: { ...order } }; //
      } else {
        return { code: 400, message: `状态为 ${order.status} 的订单无法提交审核`, data: null }; //
      }
    }
    return { code: 404, message: '销售单不存在', data: null }; //
  },

  approveSalesOrder(id, approved, comment) {
    const order = salesOrders.find(order => order.id === id); // 操作的是本文件顶部的 salesOrders 数组
    if (order) {
      if (order.status === 'PENDING_APPROVAL') {
        order.status = approved ? 'APPROVED' : 'DRAFT';  //
        order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19); //
        const approvalLogAction = approved ? `[审核通过]` : `[审核不通过, 打回草稿]`; //
        const commentEntry = comment ? `${approvalLogAction}: ${comment}` : approvalLogAction; //
        const timestamp = new Date().toLocaleString('zh-CN', { hour12: false }); //
        if (order.remarks) {
          order.remarks += `\n${timestamp} - ${commentEntry}`; //
        } else {
          order.remarks = `${timestamp} - ${commentEntry}`; //
        }
        console.log('[Mock /salesOrders.js] Sales order approval processed. Order updated:', JSON.stringify(order, null, 2)); //
        return { 
            code: 200,  //
            message: approved ? '审核通过' : '审核不通过，已打回草稿',  //
            data: { ...order }  //
        };
      } else {
        return { code: 400, message: `状态为 ${order.status} 的订单无法执行审核操作`, data: null }; //
      }
    }
    return { code: 404, message: '销售单不存在', data: null }; //
  }
};

export default salesOrdersMock; // 默认导出API服务对象