/**
 * API 服务模块
 * 
 * 功能说明：
 * 1. 封装所有前端与后端的 HTTP 请求
 * 2. 提供统一的请求方法和错误处理
 * 3. 自动根据环境切换 API 地址
 * 
 * 使用方式：
 * import { customerAPI, voucherAPI } from './services/api'
 * const customers = await customerAPI.getAll()
 */

// ==================== API 基础配置 ====================

/**
 * API 基础 URL 配置
 * 
 * 说明：
 * - 开发环境：前端 localhost:5173，后端 localhost:3001，直接访问后端
 * - 生产环境：前端和后端在同一服务器，通过 Nginx 代理，使用相对路径
 * 
 * 环境判断：
 * - import.meta.env.PROD 为 true 表示生产环境
 * - 为 false 或 undefined 表示开发环境
 */
const API_BASE_URL = (import.meta as any).env?.PROD 
  ? '/api'  // 生产环境：使用相对路径，Nginx会代理到后端
  : 'http://localhost:3001/api';  // 开发环境：直接连接后端

// ==================== 通用请求方法 ====================

/**
 * 通用 HTTP 请求方法
 * 
 * @param url - API 端点路径（如 '/customers'）
 * @param options - fetch 配置选项
 * @returns Promise<any> - 返回解析后的 JSON 数据
 * 
 * 功能：
 * 1. 自动添加 Content-Type 请求头
 * 2. 处理响应错误（非 JSON、404、500 等）
 * 3. 提取并抛出后端返回的错误信息
 * 
 * 错误处理：
 * - 404 错误：API 端点不存在
 * - 非 JSON 响应：服务器返回了 HTML 错误页面
 * - 业务错误：后端返回的具体错误信息（如"凭证号已存在"）
 */
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

/**
 * 客户管理 API
 * 
 * 功能：
 * - getAll(): 获取所有客户列表
 * - create(data): 创建新客户
 * - update(id, data): 更新客户信息
 * - delete(id): 删除客户
 * 
 * 数据结构：{ id, name, contact, phone, email, address, balance }
 */
export const customerAPI = {
  getAll: () => request('/customers'),
  create: (data: any) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/customers/${id}`, { method: 'DELETE' }),
};

// ==================== 供应商管理 API ====================

/**
 * 供应商管理 API
 * 
 * 功能：与客户管理类似，用于管理供应商信息和应付账款
 * 数据结构：{ id, name, contact, phone, email, address, balance }
 */
export const supplierAPI = {
  getAll: () => request('/suppliers'),
  create: (data: any) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/suppliers/${id}`, { method: 'DELETE' }),
};

// ==================== 员工管理 API ====================

/**
 * 员工管理 API
 * 
 * 功能：管理员工信息、职位、薪资等
 * 数据结构：{ id, name, position, department, phone, email, salary, join_date }
 */
export const employeeAPI = {
  getAll: () => request('/employees'),
  create: (data: any) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/employees/${id}`, { method: 'DELETE' }),
};

// ==================== 会计科目 API ====================

/**
 * 会计科目管理 API
 * 
 * 功能：管理会计科目体系（Chart of Accounts）
 * 
 * 说明：
 * - 会计科目是财务系统的核心基础
 * - 所有凭证都需要关联会计科目
 * - 科目编码必须唯一
 * 
 * 数据结构：{ id, code, name, type, balance }
 * type 类型：asset(资产)/liability(负债)/equity(权益)/income(收入)/expense(费用)
 */
export const accountAPI = {
  getAll: () => request('/accounts'),
  create: (data: any) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/accounts/${id}`, { method: 'DELETE' }),
};

// ==================== 凭证管理 API ====================

/**
 * 凭证管理 API
 * 
 * 功能：
 * - getAll(): 获取所有凭证
 * - create(data): 创建新凭证（做分录）
 * - updateStatus(id, status): 更新凭证状态（过账）
 * 
 * 说明：
 * - 凭证是记录经济业务的基础单据
 * - 每笔凭证包含多个借贷方分录行
 * - 必须借贷平衡才能保存
 * - 过账后凭证状态变为 'posted'
 * 
 * 数据结构：{ id, voucher_no, date, description, amount, status }
 * status: 'pending'(待过账) | 'posted'(已过账)
 */
export const voucherAPI = {
  getAll: () => request('/vouchers'),
  create: (data: any) => request('/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/vouchers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 采购订单 API ====================

/**
 * 采购订单管理 API
 * 
 * 功能：管理企业的采购订单流程
 * 
 * 状态流转：
 * pending(待审批) → approved(已审批) → completed(已完成)
 * 
 * 数据结构：{ id, order_no, date, supplier, items, amount, status }
 */
export const purchaseOrderAPI = {
  getAll: () => request('/purchase-orders'),
  create: (data: any) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 销售单 API ====================

/**
 * 销售发票管理 API
 * 
 * 功能：管理企业的销售发票和收款
 * 
 * 状态流转：
 * draft(草稿) → paid(已收款)
 * 
 * 数据结构：{ id, invoice_no, date, customer, items, amount, status }
 */
export const salesInvoiceAPI = {
  getAll: () => request('/sales-invoices'),
  create: (data: any) => request('/sales-invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/sales-invoices/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 费用管理 API ====================

/**
 * 费用报销管理 API
 * 
 * 功能：员工费用报销的提交和审批
 * 
 * 状态流转：
 * pending(待审批) → approved(已批准) 或 rejected(已拒绝)
 * 
 * 数据结构：{ id, date, employee, category, description, amount, status }
 */
export const expenseAPI = {
  getAll: () => request('/expenses'),
  create: (data: any) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 税务记录 API ====================

/**
 * 税务记录管理 API
 * 
 * 功能：管理增值税、所得税等税务申报和缴纳
 * 
 * 状态流转：
 * pending(待申报) → declared(已申报) → paid(已缴纳)
 * 
 * 数据结构：{ id, period, type, taxable_amount, tax_rate, tax_amount, status }
 */
export const taxRecordAPI = {
  getAll: () => request('/tax-records'),
  create: (data: any) => request('/tax-records', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/tax-records/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== 银行流水 API ====================

/**
 * 银行流水管理 API
 * 
 * 功能：
 * - 手动输入银行流水记录
 * - 与系统凭证进行匹配对账
 * 
 * 说明：
 * - 银行流水用于与企业内部凭证进行核对
 * - 确保账实相符，发现账务差异
 * 
 * 数据结构：{ id, date, description, amount, type, matched, matched_voucher_id }
 * type: 'income'(收入) | 'expense'(支出)
 */
export const bankRecordAPI = {
  getAll: () => request('/bank-records'),
  create: (data: any) => request('/bank-records', { method: 'POST', body: JSON.stringify(data) }),
  updateMatch: (id: string, matched: boolean, matchedVoucherId?: string) => 
    request(`/bank-records/${id}/match`, { method: 'PUT', body: JSON.stringify({ matched, matched_voucher_id: matchedVoucherId }) }),
  delete: (id: string) => request(`/bank-records/${id}`, { method: 'DELETE' }),
};

// ==================== 对账 API ====================

/**
 * 对账功能 API
 * 
 * 功能：
 * - getPostedVouchers(): 获取所有已过账凭证
 * - internalCheck(): 内部对账检查（检查凭证借贷是否平衡）
 * 
 * 说明：
 * - 对账是确保账目准确的重要环节
 * - 内部对账检查所有已过账凭证的借贷平衡性
 * - 返回不平衡的凭证列表和差异金额
 */
export const reconciliationAPI = {
  getPostedVouchers: () => request('/vouchers/posted'),
  internalCheck: () => request('/reconciliation/internal-check'),
};

// ==================== 健康检查 API ====================

/**
 * 健康检查
 * 
 * 功能：检查后端服务是否正常运行
 * 返回：{ status: 'ok', message: '后端服务运行正常' }
 */
export const healthCheck = () => request('/health');


