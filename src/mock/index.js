// src/mock/index.js
import salesOrdersMock from './salesOrders'; //
import productsMock from './products'; //
import customersMock from './customers'; //
import usersMock from './users'; //
import suppliersMock from './suppliers';
import outboundOrdersMock from './outboundOrders'; //
import shipmentOrdersMock from './shipmentOrders'; // 
import purchaseRequisitionsMock from './purchaseRequisitions';
import purchaseOrdersMock from './purchaseOrders';
import inboundOrdersMock from './inboundOrders';

// 统一导出所有Mock服务
export default {
  ...salesOrdersMock,
  ...productsMock,
  ...customersMock,
  ...usersMock,
  ...suppliersMock,
  ...outboundOrdersMock,
  ...shipmentOrdersMock, // 如果 shipmentOrdersMock 正确导入，这里就不会报错
  ...purchaseRequisitionsMock,
  ...purchaseOrdersMock,
  ...inboundOrdersMock,
};

// 辅助函数：随机ID生成
export function generateId(prefix = '') {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}

// 辅助函数：分页处理
export function paginateData(data, page = 0, size = 10) {
  const pageNumber = Number(page) || 0;
  const pageSize = Number(size) || 10;
  
  const startIndex = pageNumber * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    content: paginatedData,
    totalElements: data.length,
    totalPages: Math.ceil(data.length / pageSize),
    size: pageSize,
    number: pageNumber, // Spring Pageable's 'number' is 0-indexed
    numberOfElements: paginatedData.length,
    first: pageNumber === 0,
    last: endIndex >= data.length
  };
}

// 辅助函数：过滤数据
export function filterData(data, filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return data; 
  }
  return data.filter(item => {
    for (const key in filters) {
      const filterValue = String(filters[key]).trim(); // Ensure filterValue is a string for comparison
      if (filterValue !== '' && key in item) { // Only filter if filterValue is not empty
        const itemValue = String(item[key]); // Ensure itemValue is a string
        if (typeof itemValue === 'string' && typeof filterValue === 'string') {
          if (!itemValue.toLowerCase().includes(filterValue.toLowerCase())) {
            return false;
          }
        } else if (itemValue !== filterValue) { 
          return false;
        }
      }
    }
    return true;
  });
}