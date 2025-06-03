// src/mock/products.js
import { paginateData, filterData, generateId } from './index'; //

// --- 修改这里：添加 export 关键字 ---
export const products = [ // 确保 products 数组被具名导出
  {
    id: 'p-001',
    productCode: 'PRD-1001', //
    name: '周杰伦《叶惠美》专辑', //
    specification: 'CD', //
    unit: '张', //
    category: '音乐专辑', //
    costPrice: 38.00, //
    salesPrice: 68.00, //
    safeStockLevel: 100, //
    onHandQuantity: 350, // 可用库存
    reservedQuantity: 50, // 已预留库存
    isActive: true //
  },
  {
    id: 'p-002',
    productCode: 'PRD-1002', //
    name: '林俊杰《曹操》专辑', //
    specification: 'CD', //
    unit: '张', //
    category: '音乐专辑', //
    costPrice: 32.00, //
    salesPrice: 58.00, //
    safeStockLevel: 80, //
    onHandQuantity: 220, //
    reservedQuantity: 20, //
    isActive: true //
  },
  {
    id: 'p-003',
    productCode: 'PRD-1003', //
    name: '薛之谦《绅士》专辑', //
    specification: 'CD+DVD', //
    unit: '套', //
    category: '音乐专辑', //
    costPrice: 48.00, //
    salesPrice: 88.00, //
    safeStockLevel: 60, //
    onHandQuantity: 180, //
    reservedQuantity: 30, //
    isActive: true //
  },
  {
    id: 'p-004',
    productCode: 'PRD-1004', //
    name: '五月天《自传》专辑', //
    specification: '黑胶唱片', //
    unit: '张', //
    category: '音乐专辑', //
    costPrice: 95.00, //
    salesPrice: 145.00, //
    safeStockLevel: 30, //
    onHandQuantity: 85, //
    reservedQuantity: 15, //
    isActive: true //
  },
  {
    id: 'p-005',
    productCode: 'PRD-1005', //
    name: '华语经典流行合集', //
    specification: 'U盘装', //
    unit: '个', //
    category: '数字音乐', //
    costPrice: 65.00, //
    salesPrice: 129.00, //
    safeStockLevel: 50, //
    onHandQuantity: 120, //
    reservedQuantity: 10, //
    isActive: true //
  },
  {
    id: 'p-006', // 之前可能是 generateId()，为了稳定性，可以给示例数据固定ID
    productCode: 'PRD-1006', //
    name: '泰勒·斯威夫特《1989》专辑', //
    specification: '豪华版CD', //
    unit: '张', //
    category: '欧美流行', //
    costPrice: 75.00, //
    salesPrice: 128.00, //
    safeStockLevel: 40, //
    onHandQuantity: 150, //
    reservedQuantity: 25, //
    isActive: true //
  },
  {
    id: 'p-007',
    productCode: 'PRD-1007', //
    name: '陈奕迅《DUO》演唱会', //
    specification: '蓝光DVD', //
    unit: '套', //
    category: '演唱会影像', //
    costPrice: 120.00, //
    salesPrice: 198.00, //
    safeStockLevel: 20, //
    onHandQuantity: 60, //
    reservedQuantity: 5, //
    isActive: true //
  },
  {
    id: 'p-008',
    productCode: 'PRD-1008', //
    name: '邓紫棋《G.E.M.》同名专辑', //
    specification: '普通CD', //
    unit: '张', //
    category: '音乐专辑', //
    costPrice: 30.00, //
    salesPrice: 55.00, //
    safeStockLevel: 70, //
    onHandQuantity: 200, //
    reservedQuantity: 10, //
    isActive: false //
  },
  {
    id: 'p-009',
    productCode: 'PRD-1009', //
    name: '久石让《天空之城》原声带', //
    specification: '黑胶唱片', //
    unit: '张', //
    category: '电影原声', //
    costPrice: 110.00, //
    salesPrice: 180.00, //
    safeStockLevel: 25, //
    onHandQuantity: 70, //
    reservedQuantity: 8, //
    isActive: true //
  },
  {
    id: 'p-010',
    productCode: 'PRD-1010', //
    name: '周深《大鱼》单曲', //
    specification: '数字版', //
    unit: '首', //
    category: '数字音乐', //
    costPrice: 5.00, //
    salesPrice: 10.00, //
    safeStockLevel: 0, //
    onHandQuantity: 9999, //
    reservedQuantity: 0, //
    isActive: true //
  },
  {
    id: 'p-011',
    productCode: 'PRD-1011', //
    name: '毛不易《像我这样的人》EP', //
    specification: 'CD', //
    unit: '张', //
    category: '音乐专辑', //
    costPrice: 40.00, //
    salesPrice: 72.00, //
    safeStockLevel: 50, //
    onHandQuantity: 130, //
    reservedQuantity: 12, //
    isActive: true //
  },
  {
    id: 'p-012',
    productCode: 'PRD-1012', //
    name: '古典音乐精选集', //
    specification: '3CD套装', //
    unit: '套', //
    category: '古典音乐', //
    costPrice: 90.00, //
    salesPrice: 150.00, //
    safeStockLevel: 30, //
    onHandQuantity: 90, //
    reservedQuantity: 5, //
    isActive: true //
  },
  // --- 新增商品数据 ---
  {
    id: generateId('p'),
    productCode: 'PRD-2001',
    name: '周杰伦《范特西》CD',
    specification: 'CD',
    unit: '张',
    category: '音乐专辑',
    costPrice: 40.00,
    salesPrice: 70.00,
    safeStockLevel: 50,
    onHandQuantity: 200,
    reservedQuantity: 10,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2002',
    name: '周杰伦《七里香》黑胶唱片',
    specification: '黑胶唱片',
    unit: '张',
    category: '音乐专辑',
    costPrice: 120.00,
    salesPrice: 198.00,
    safeStockLevel: 20,
    onHandQuantity: 50,
    reservedQuantity: 5,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2003',
    name: '王力宏《唯一》CD',
    specification: 'CD',
    unit: '张',
    category: '音乐专辑',
    costPrice: 35.00,
    salesPrice: 65.00,
    safeStockLevel: 40,
    onHandQuantity: 150,
    reservedQuantity: 8,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2004',
    name: '王力宏《盖世英雄》黑胶唱片',
    specification: '黑胶唱片',
    unit: '张',
    category: '音乐专辑',
    costPrice: 110.00,
    salesPrice: 188.00,
    safeStockLevel: 25,
    onHandQuantity: 60,
    reservedQuantity: 3,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2005',
    name: '周杰伦《依然范特西》CD',
    specification: 'CD',
    unit: '张',
    category: '音乐专辑',
    costPrice: 38.00,
    salesPrice: 69.00,
    safeStockLevel: 50,
    onHandQuantity: 180,
    reservedQuantity: 12,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2006',
    name: '王力宏《心中的日月》CD',
    specification: 'CD',
    unit: '张',
    category: '音乐专辑',
    costPrice: 36.00,
    salesPrice: 66.00,
    safeStockLevel: 30,
    onHandQuantity: 120,
    reservedQuantity: 6,
    isActive: false // 示例非活跃
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2007',
    name: '周杰伦《我很忙》CD',
    specification: 'CD',
    unit: '张',
    category: '音乐专辑',
    costPrice: 37.00,
    salesPrice: 67.00,
    safeStockLevel: 45,
    onHandQuantity: 220,
    reservedQuantity: 15,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2008',
    name: '王力宏《改变自己》CD',
    specification: 'CD',
    unit: '张',
    category: '音乐专辑',
    costPrice: 39.00,
    salesPrice: 72.00,
    safeStockLevel: 35,
    onHandQuantity: 160,
    reservedQuantity: 7,
    isActive: true
  },
   {
    id: generateId('p'),
    productCode: 'PRD-2009',
    name: '周杰伦《魔杰座》黑胶唱片',
    specification: '黑胶唱片',
    unit: '张',
    category: '音乐专辑',
    costPrice: 130.00,
    salesPrice: 210.00,
    safeStockLevel: 15,
    onHandQuantity: 40,
    reservedQuantity: 2,
    isActive: true
  },
  {
    id: generateId('p'),
    productCode: 'PRD-2010',
    name: '王力宏《火力全开 新歌+精选》2CD',
    specification: '2CD',
    unit: '套',
    category: '音乐专辑',
    costPrice: 55.00,
    salesPrice: 98.00,
    safeStockLevel: 30,
    onHandQuantity: 100,
    reservedQuantity: 10,
    isActive: true
  }
];
// --- 结束修改 ---

// 模拟API服务
const productsMock = {
  getProductList(params) {
    let result = JSON.parse(JSON.stringify(products)); // 使用深拷贝以避免意外修改原始数据
    if (params) {
      const filters = {}; //
      if (params.productCode) filters.productCode = params.productCode; //
      if (params.name) filters.name = params.name; //
      if (params.category) filters.category = params.category; //
      if (params.specification) filters.specification = params.specification; //
      result = filterData(result, filters); //
    }
    return {
      code: 200, //
      message: '获取成功', //
      data: paginateData(result, params?.page || 0, params?.size || 10) //
    };
  },

  getProductDetail(id) {
    const product = products.find(p => p.id === id); //
    if (product) {
      return {
        code: 200, //
        message: '获取成功', //
        data: JSON.parse(JSON.stringify(product)) // 深拷贝返回
      };
    } else {
      return {
        code: 404, //
        message: '商品不存在', //
        data: null //
      };
    }
  },
  // createProduct, updateProduct, deleteProduct 等 mock 函数可以根据需要添加
};

export default productsMock; // 默认导出 mock 服务对象