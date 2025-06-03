// src/mock/customers.js
import { paginateData, filterData, generateId } from './index'; // 假设 generateId 在 index.js 中并已导出

// 模拟客户数据
const customers = [
  {
    id: 'c-001',
    name: '北京音像有限公司', //
    phone: '13800138000', //
    shippingAddress: '北京市朝阳区建国路88号', //
    isActive: true //
  },
  {
    id: 'c-002',
    name: '上海唱片销售中心', //
    phone: '13900139000', //
    shippingAddress: '上海市徐汇区天钥桥路333号', //
    isActive: true //
  },
  {
    id: 'c-003',
    name: '广州音乐流行馆', //
    phone: '13600136000', //
    shippingAddress: '广州市天河区天河路385号', //
    isActive: true //
  },
  {
    id: 'c-004',
    name: '深圳星光音乐代理', //
    phone: '13700137000', //
    shippingAddress: '深圳市南山区科技园南区8栋', //
    isActive: true //
  },
  {
    id: 'c-005',
    name: '成都乐府唱片', //
    phone: '13500135000', //
    shippingAddress: '成都市锦江区红星路三段99号', //
    isActive: true //
  },
  {
    id: 'c-006', // 'c-006'
    name: '武汉知音文化传播', //
    phone: '13207100006', //
    shippingAddress: '武汉市江岸区中山大道100号', //
    isActive: true //
  },
  {
    id: 'c-007', // 'c-007'
    name: '西安古都音像发行', //
    phone: '13302900007', //
    shippingAddress: '西安市碑林区南大街123号', //
    isActive: true //
  },
  {
    id: 'c-008', // 'c-008'
    name: '长沙天籁之声', //
    phone: '18973100008', //
    shippingAddress: '长沙市芙蓉区五一大道456号', //
    isActive: false // 示例：一个非活跃客户
  },
  {
    id: 'c-009', // 'c-009'
    name: '沈阳北方乐章', //
    phone: '13102400009', //
    shippingAddress: '沈阳市和平区太原北街789号', //
    isActive: true //
  },
  {
    id: 'c-010', // 'c-010'
    name: '南京音乐坊', //
    phone: '15802500010', //
    shippingAddress: '南京市玄武区中山路321号', //
    isActive: true //
  },
  {
    id: 'c-011', // 'c-011'
    name: '杭州西湖唱片行', //
    phone: '13005710011', //
    shippingAddress: '杭州市西湖区保俶路654号', //
    isActive: true //
  },
  {
    id: 'c-012', // 'c-012'
    name: '重庆山城音乐屋', //
    phone: '15302300012', //
    shippingAddress: '重庆市渝中区解放碑步行街90号', //
    isActive: true //
  },
  // --- 新增客户数据 ---
  {
    id: generateId('c'),
    name: '天津节奏唱片零售店',
    phone: '13912345678',
    shippingAddress: '天津市和平区滨江道123号',
    isActive: true
  },
  {
    id: generateId('c'),
    name: '苏州经典旋律音像行',
    phone: '13887654321',
    shippingAddress: '苏州市姑苏区观前街45号',
    isActive: true
  },
  {
    id: generateId('c'),
    name: '青岛海岸线CD专门店',
    phone: '13711223344',
    shippingAddress: '青岛市市南区香港中路67号',
    isActive: true
  },
  {
    id: generateId('c'),
    name: '大连黑胶客唱片馆',
    phone: '13698765432',
    shippingAddress: '大连市中山区人民路88号',
    isActive: false // 示例非活跃
  },
  {
    id: generateId('c'),
    name: '厦门鼓浪屿音乐岛零售',
    phone: '13512341234',
    shippingAddress: '厦门市思明区龙头路101号',
    isActive: true
  },
  {
    id: generateId('c'),
    name: '哈尔滨冰城乐迷之家',
    phone: '13400001111',
    shippingAddress: '哈尔滨市道里区中央大街56号',
    isActive: true
  },
  {
    id: generateId('c'),
    name: '济南泉城唱片集市',
    phone: '18812345600',
    shippingAddress: '济南市历下区泉城路222号',
    isActive: true
  }
];

// 模拟API服务
const customersMock = {
  // 获取客户列表
  getCustomerList(params) {
    // 在函数入口打印接收到的参数
    // 使用 try-catch 避免 JSON.parse(JSON.stringify(params)) 在 params 为 undefined 或包含循环引用时报错
    try {
      console.log('[MOCK /customers.js] getCustomerList 被调用，接收到的 params:', params ? JSON.parse(JSON.stringify(params)) : params); //
    } catch (e) {
      console.log('[MOCK /customers.js] getCustomerList 被调用，接收到的 params (无法序列化):', params); //
    }

    let result = [...customers]; //
    console.log('[MOCK /customers.js] 初始 result 长度:', result.length); //

    if (params) {
      const filters = {}; //
      if (params.name) filters.name = params.name; //
      if (params.phone) filters.phone = params.phone; //
      if (params.address) filters.shippingAddress = params.address; // 假设 filterData 会用 shippingAddress 作为 item 的 key

      try {
        console.log('[MOCK /customers.js] 构建的 filters 对象:', JSON.parse(JSON.stringify(filters))); //
      } catch (e) {
        console.log('[MOCK /customers.js] 构建的 filters 对象 (无法序列化):', filters); //
      }


      result = filterData(result, filters); // filterData 来自 index.js
      console.log('[MOCK /customers.js] 调用 filterData 后，result 长度:', result.length); //
      if (result.length > 0 && result.length !== customers.length) {
         try {
            console.log('[MOCK /customers.js] filterData 后的第一条数据 (如果过滤了):', JSON.parse(JSON.stringify(result[0]))); //
         } catch (e) {
            console.log('[MOCK /customers.js] filterData 后的第一条数据 (如果过滤了, 无法序列化):', result[0]); //
         }
      } else if (result.length === customers.length && Object.keys(filters).length > 0) {
         console.log('[MOCK /customers.js] filterData 未改变 result 数量，但 filters 不为空，请检查 filterData 逻辑是否符合预期。'); //
      } else if (result.length === customers.length && Object.keys(filters).length === 0) {
         console.log('[MOCK /customers.js] filterData 未改变 result 数量 (因为 filters 为空)，符合预期。'); //
      }
    } else {
      console.log('[MOCK /customers.js] params 对象不存在，不执行过滤。'); //
    }

    // 确保正确使用从 params 传入的 page 和 size，如果不存在则使用默认值
    const page = (params && typeof params.page !== 'undefined') ? Number(params.page) : 0; //
    const size = (params && typeof params.size !== 'undefined') ? Number(params.size) : 10; // 前端请求的是 5
    console.log(`[MOCK /customers.js] 即将分页，使用 page: ${page}, size: ${size}`); //

    const paginatedResult = paginateData(result, page, size); // paginateData 来自 index.js
    console.log('[MOCK /customers.js] 调用 paginateData 后，返回的 content 长度:', paginatedResult.content.length); //
    try {
        // 打印整个分页结果，但注意如果数据量大，content 会很多, 可以只打印关键信息
        const overviewPaginatedResult = {...paginatedResult, content: `Array of ${paginatedResult.content.length} items`}; //
        console.log('[MOCK /customers.js] paginateData 返回的概览对象:', JSON.parse(JSON.stringify(overviewPaginatedResult))); //
        // 如果需要查看具体内容，可以取消下面一行的注释，但内容可能很长
        // console.log('[MOCK /customers.js] paginateData 返回的完整对象 (可能很长):', JSON.parse(JSON.stringify(paginatedResult)));
    } catch (e) {
        console.log('[MOCK /customers.js] paginateData 返回的概览对象 (无法序列化)'); //
    }


    const finalResponse = {
      code: 200, //
      message: '获取成功', //
      data: paginatedResult //
    };
    try {
        const overviewFinalResponse = {...finalResponse, data: {...finalResponse.data, content: `Array of ${finalResponse.data.content.length} items`}}; //
        console.log('[MOCK /customers.js] 最终返回的响应 (概览):', JSON.parse(JSON.stringify(overviewFinalResponse))); //
    } catch (e) {
        console.log('[MOCK /customers.js] 最终返回的响应 (概览, 无法序列化)'); //
    }
    return finalResponse;
  },

  // 获取客户详情
  getCustomerDetail(id) {
    const customer = customers.find(c => c.id === id); //

    if (customer) {
      return {
        code: 200, //
        message: '获取成功', //
        data: customer //
      };
    } else {
      return {
        code: 404, //
        message: '客户不存在', //
        data: null //
      };
    }
  },

  // 更多客户相关API... (例如创建、更新，如果需要Mock的话)
};

export default customersMock;