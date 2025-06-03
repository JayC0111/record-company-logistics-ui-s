import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import mockService from '@/mock';

const useMock = true; 

const realApiPaths = [ 
  '/auth/login',
  '/auth/logout',
];

const isRealApiPath = (url) => {
  return realApiPaths.some(prefix => url.startsWith(prefix));
};

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
});

// ... (拦截器代码与之前版本一致，此处省略以减少篇幅)
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      });
      if (res.code === 401) {
        ElMessageBox.confirm(
          '登录状态已过期，请重新登录',
          '系统提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        });
      }
      return Promise.reject(new Error(res.message || '请求失败'));
    } else {
      return res;
    }
  },
  error => {
    console.error('响应错误:', error);
    const message = error.response?.data?.message || error.message;
    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/403';
    }
    return Promise.reject(error);
  }
);


// Mock方法映射
const mockMethodMap = {
  get: (url, params) => {
    const pathParts = url.split('/');
    console.log('[request.js] Mock GET:', url, 'Params:', params);

    if (url === '/auth/info') return mockService.getCurrentUser();
    if (url.startsWith('/sales/orders')) {
      if (pathParts.length === 3) return mockService.getSalesOrderList(params);
      if (pathParts.length === 4) return mockService.getSalesOrderDetail(pathParts[3]);
    }
    if (url === '/products') return mockService.getProductList(params);
    if (url.startsWith('/products/')) return mockService.getProductDetail(pathParts[2]);
    if (url === '/customers') return mockService.getCustomerList(params);
    if (url.startsWith('/customers/')) return mockService.getCustomerDetail(pathParts[2]);
    
    // 采购计划单
    if (url === '/purchase/requisitions') return mockService.getPurchaseRequisitionList(params);
    if (url.startsWith('/purchase/requisitions/')) return mockService.getPurchaseRequisitionDetail(pathParts[3]);
    // 采购单
    if (url === '/purchase/orders') return mockService.getPurchaseOrderList(params);
    if (url.startsWith('/purchase/orders/')) return mockService.getPurchaseOrderDetail(pathParts[3]);
    
    // 供应商 (基础数据)
    if (url === '/basedata/suppliers') return mockService.getSupplierList(params);
    if (url.startsWith('/basedata/suppliers/')) return mockService.getSupplierDetail(pathParts[3]);

    // 库存及其他 (保留原有)
    if (url === '/inventory/inbound-orders') return mockService.getInboundOrderList(params);
    if (url.startsWith('/inventory/inbound-orders/')) return mockService.getInboundOrderDetail(pathParts[3]);
    if (url === '/inventory/pending-outbound-lines') return mockService.getPendingOutboundSalesOrderLines(params);
    if (url === '/inventory/outbound-orders/ready-to-ship') return mockService.getReadyToShipOutboundOrders(params);
    if (url === '/inventory/outbound-orders' && pathParts.length === 3) return mockService.getOutboundOrderList(params);
    if (url.startsWith('/inventory/outbound-orders/')) return mockService.getOutboundOrderDetail(pathParts[3]);
    if (url === '/sales/shipments') return mockService.getShipmentOrderList(params);
    if (url.startsWith('/sales/shipments/')) return mockService.getShipmentOrderDetail(pathParts[3]);
    if (url === '/basedata/logistics-carriers') return mockService.getLogisticsCarriers(params);

    console.warn(`Mock GET for ${url} not found.`);
    return Promise.resolve({ code: 404, message: `Mock API不存在: GET ${url}`, data: null });
  },
  post: (url, data) => {
    const pathParts = url.split('/');
    console.log('[request.js] Mock POST:', url, 'Data:', data);

    if (url === '/sales/orders') return mockService.createSalesOrder(data);
    if (url.endsWith('/submit') && url.includes('/sales/orders/')) return mockService.submitSalesOrder(pathParts[3]);
    if (url.endsWith('/approve') && url.includes('/sales/orders/')) return mockService.approveSalesOrder(pathParts[3], data.approved, data.comment);
    
    // 采购计划单
    if (url === '/purchase/requisitions') return mockService.createPurchaseRequisition(data);
    if (url.endsWith('/submit') && url.includes('/purchase/requisitions/')) return mockService.submitPurchaseRequisition(pathParts[3]);
    if (url.endsWith('/approve') && url.includes('/purchase/requisitions/')) return mockService.approvePurchaseRequisition(pathParts[3], data);
    // 采购单
    if (url === '/purchase/orders') return mockService.createPurchaseOrder(data);
    if (url.endsWith('/receive') && url.includes('/purchase/orders/')) return mockService.confirmReceipt(pathParts[3], data);

    // 库存及其他 (保留原有)
    if (url === '/inventory/inbound-orders') return mockService.createInboundOrder(data);
    if (url.endsWith('/cancel') && url.includes('/inventory/inbound-orders/')) return mockService.cancelInboundOrder(pathParts[3]);
    if (url === '/inventory/outbound-orders') return mockService.createOutboundOrder(data);
    if (url === '/sales/shipments') return mockService.createShipmentOrder(data);
    if (url.endsWith('/delivered') && url.includes('/sales/shipments/')) return mockService.confirmShipmentDelivery(pathParts[3]);

    console.warn(`Mock POST for ${url} not found.`);
    return Promise.resolve({ code: 404, message: `Mock API不存在: POST ${url}`, data: null });
  },
  put: (url, data) => {
    const pathParts = url.split('/');
    console.log('[request.js] Mock PUT:', url, 'Data:', data);

    if (url.startsWith('/sales/orders/')) return mockService.updateSalesOrder(pathParts[3], data);
    
    // 采购计划单
    if (url.startsWith('/purchase/requisitions/')) return mockService.updatePurchaseRequisition(pathParts[3], data);
    // 采购单
    if (url.startsWith('/purchase/orders/')) return mockService.updatePurchaseOrder(pathParts[3], data);

    // 库存及其他 (保留原有)
    if (url.startsWith('/inventory/inbound-orders/')) return mockService.updateInboundOrder(pathParts[3], data);
    if (url.startsWith('/inventory/outbound-orders/')) return mockService.updateOutboundOrder(pathParts[3], data);
    if (url.startsWith('/sales/shipments/')) return mockService.updateShipmentOrder(pathParts[3], data);
    
    console.warn(`Mock PUT for ${url} not found.`);
    return Promise.resolve({ code: 404, message: `Mock API不存在: PUT ${url}`, data: null });
  },
  delete: (url, params) => {
    const pathParts = url.split('/');
    console.log('[request.js] Mock DELETE:', url, 'Params:', params);

    if (url.startsWith('/sales/orders/')) return mockService.deleteSalesOrder(pathParts[3]);
    // 采购计划单
    if (url.startsWith('/purchase/requisitions/')) return mockService.deletePurchaseRequisition(pathParts[3]);
    // 采购单
    if (url.startsWith('/purchase/orders/')) return mockService.deletePurchaseOrder(pathParts[3]);
    
    // 库存及其他 (保留原有)
    if (url.startsWith('/inventory/outbound-orders/')) return mockService.deleteOutboundOrder(pathParts[3]);
    if (url.startsWith('/sales/shipments/')) return mockService.deleteShipmentOrder(pathParts[3]);

    console.warn(`Mock DELETE for ${url} not found.`);
    return Promise.resolve({ code: 404, message: `Mock API不存在: DELETE ${url}`, data: null });
  }
};

const request = {
  async get(url, params) {
    if (isRealApiPath(url) || !useMock) {
      return service({ url, method: 'get', params });
    }
    return mockMethodMap.get(url, params);
  },
  async post(url, data) {
    if (isRealApiPath(url) || !useMock) {
      return service({ url, method: 'post', data });
    }
    return mockMethodMap.post(url, data);
  },
  async put(url, data) {
    if (isRealApiPath(url) || !useMock) {
      return service({ url, method: 'put', data });
    }
    return mockMethodMap.put(url, data);
  },
  async delete(url, params) { 
    if (isRealApiPath(url) || !useMock) {
      return service({ url, method: 'delete', params });
    }
    return mockMethodMap.delete(url, params);
  }
};

export default request;