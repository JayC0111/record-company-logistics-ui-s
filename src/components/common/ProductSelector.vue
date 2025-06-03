<template>
    <div class="product-selector">
      <el-dialog
        v-model="dialogVisible"
        title="选择商品"
        width="80%"
        destroy-on-close
      >
        <!-- 搜索区域 -->
        <div class="selector-search">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="商品编码">
              <el-input v-model="searchForm.productCode" placeholder="请输入商品编码" clearable />
            </el-form-item>
            <el-form-item label="商品名称">
              <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchProducts">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 商品列表 -->
        <el-table
          ref="productTable"
          :data="productList"
          border
          style="width: 100%"
          height="400px"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" width="50" label="序号" />
          <el-table-column prop="productCode" label="商品编码" min-width="120" show-overflow-tooltip />
          <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="specification" label="规格型号" min-width="120" show-overflow-tooltip />
          <el-table-column prop="unit" label="单位" min-width="80" align="center" />
          <el-table-column prop="salesPrice" label="销售价" min-width="100" align="right">
            <template #default="scope">
              ¥{{ formatNumber(scope.row.salesPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="onHandQuantity" label="库存数量" min-width="100" align="right">
            <template #default="scope">
              {{ formatNumber(scope.row.onHandQuantity) }}
            </template>
          </el-table-column>
          <el-table-column label="选择数量" min-width="150" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.selectedQuantity"
                :min="1"
                :precision="2"
                :step="1"
                :max="10000"
                size="small"
                @change="validateQuantity(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 底部分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
        
        <!-- 底部按钮 -->
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmSelection">
              确认选择
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, defineExpose, defineEmits } from 'vue'
  import { ElMessage } from 'element-plus'
  
  // 定义事件
  const emit = defineEmits(['select'])
  
  // 对话框可见性
  const dialogVisible = ref(false)
  const loading = ref(false)
  const productList = ref([])
  const selectedProducts = ref([])
  const productTable = ref(null)
  
  // 搜索表单
  const searchForm = reactive({
    productCode: '',
    name: ''
  })
  
  // 分页
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })
  
  // 模拟获取产品列表（实际项目中会从API获取）
  const fetchProductList = async () => {
    loading.value = true
    
    try {
      // 模拟API请求
      // const res = await getProductList(searchForm)
      // 这里用模拟数据
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        id: `p${i + 1}`,
        productCode: `PRD-${1000 + i}`,
        name: `测试商品 ${i + 1}`,
        specification: `规格${i % 3 + 1}`,
        unit: i % 2 === 0 ? '个' : '盒',
        salesPrice: (100 + Math.random() * 900).toFixed(2),
        onHandQuantity: (50 + Math.random() * 200).toFixed(2),
        selectedQuantity: 1 // 默认选择数量
      }))
      
      // 模拟分页
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      
      productList.value = mockData.slice(startIndex, endIndex)
      pagination.total = mockData.length
      
      // 如果有预选的商品，设置已选中状态
      if (selectedProducts.value.length > 0) {
        setTimeout(() => {
          selectedProducts.value.forEach(sp => {
            const matchedProduct = productList.value.find(p => p.id === sp.id)
            if (matchedProduct) {
              productTable.value.toggleRowSelection(matchedProduct, true)
              matchedProduct.selectedQuantity = sp.selectedQuantity || 1
            }
          })
        }, 100)
      }
    } catch (error) {
      console.error('获取商品列表失败', error)
      ElMessage.error('获取商品列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索商品
  const searchProducts = () => {
    pagination.currentPage = 1
    fetchProductList()
  }
  
  // 重置搜索
  const resetSearch = () => {
    searchForm.productCode = ''
    searchForm.name = ''
    pagination.currentPage = 1
    fetchProductList()
  }
  
  // 分页相关
  const handleSizeChange = (size) => {
    pagination.pageSize = size
    fetchProductList()
  }
  
  const handleCurrentChange = (page) => {
    pagination.currentPage = page
    fetchProductList()
  }
  
  // 表格选择变更
  const handleSelectionChange = (selection) => {
    // 仅保存ID和数量信息以避免循环引用
    selectedProducts.value = selection.map(item => ({
      id: item.id,
      selectedQuantity: item.selectedQuantity || 1
    }))
  }
  
  // 验证输入数量
  const validateQuantity = (row) => {
    if (row.selectedQuantity <= 0) {
      row.selectedQuantity = 1
      ElMessage.warning('选择数量必须大于0')
    }
  }
  
  // 确认选择
  const confirmSelection = () => {
    const selection = productTable.value.getSelectionRows()
    
    if (selection.length === 0) {
      ElMessage.warning('请至少选择一个商品')
      return
    }
    
    // 带上数量信息发送事件
    emit('select', selection)
    dialogVisible.value = false
  }
  
  // 打开对话框
  const open = (preSelectedProducts = []) => {
    // 存储预选商品
    selectedProducts.value = preSelectedProducts
    dialogVisible.value = true
    // 重置分页并获取数据
    pagination.currentPage = 1
    fetchProductList()
  }
  
  // 格式化数字
  const formatNumber = (num) => {
    return num ? parseFloat(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
  }
  
  // 暴露方法供父组件调用
  defineExpose({
    open
  })
  </script>
  
  <style scoped>
  .product-selector {
    /* 样式可能为空，因为主要样式来自El-Dialog */
  }
  
  .selector-search {
    margin-bottom: 15px;
  }
  
  .pagination-container {
    margin-top: 15px;
    text-align: right;
  }
  </style>