// API基础配置
// 生产环境使用相对路径（通过Nginx代理），开发环境使用完整URL
const API_BASE_URL = (import.meta as any).env?.PROD 
  ? '/api'  // 生产环境：使用相对路径，Nginx会代理到后端
  : 'http://localhost:3001/api';  // 开发环境：直接连接后端

// 通用请求方法
async function request(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // 如果不是JSON，可能是HTML错误页面
      if (response.status === 404) {
        throw new Error(`API端点不存在: ${url}`);
      }
      await response.text(); // 读取响应内容但不使用
      throw new Error(`服务器返回了非JSON响应: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // 如果后端返回了错误信息，使用后端的错误信息
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

// ==================== 客户管理 API ====================
export const customerAPI = {
  getAll: () => request('/customers'),
  create: (data: any) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/customers/${id}`, { method: 'DELETE' }),
};

// ==================== 供应商管理 API ====================
export const supplierAPI = {
  getAll: () => request('/suppliers'),
  create: (data: any) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/suppliers/${id}`, { method: 'DELETE' }),
};

// ==================== 员工管理 API ====================
export const employeeAPI = {
  getAll: () => request('/employees'),
  create: (data: any) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/employees/${id}`, { method: 'DELETE' }),
};

// ==================== 会计科目 API ====================
export const accountAPI = {
  getAll: () => request('/accounts'),
  create: (data: any) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/accounts/${id}`, { method: 'DELETE' }),
};

// ==================== 凭证管理 API ====================
export const voucherAPI = {
  getAll: () => request('/vouchers'),
  create: (data: any) => request('/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/vouchers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 采购订单 API ====================
export const purchaseOrderAPI = {
  getAll: () => request('/purchase-orders'),
  create: (data: any) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 销售单 API ====================
export const salesInvoiceAPI = {
  getAll: () => request('/sales-invoices'),
  create: (data: any) => request('/sales-invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/sales-invoices/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 费用管理 API ====================
export const expenseAPI = {
  getAll: () => request('/expenses'),
  create: (data: any) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 税务记录 API ====================
export const taxRecordAPI = {
  getAll: () => request('/tax-records'),
  create: (data: any) => request('/tax-records', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/tax-records/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 银行流水 API ====================
export const bankRecordAPI = {
  getAll: () => request('/bank-records'),
  create: (data: any) => request('/bank-records', { method: 'POST', body: JSON.stringify(data) }),
  updateMatch: (id: string, matched: boolean, matchedVoucherId?: string) => 
    request(`/bank-records/${id}/match`, { method: 'PUT', body: JSON.stringify({ matched, matched_voucher_id: matchedVoucherId }) }),
  delete: (id: string) => request(`/bank-records/${id}`, { method: 'DELETE' }),
};

// ==================== 对账 API ====================
export const reconciliationAPI = {
  getPostedVouchers: () => request('/vouchers/posted'),
  internalCheck: () => request('/reconciliation/internal-check'),
};

// 健康检查
export const healthCheck = () => request('/health');


