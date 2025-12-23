/**
 * 财务会计系统 - 主应用组件
 * 
 * 功能说明：
 * 1. 配置应用的路由系统
 * 2. 导入所有页面组件
 * 3. 定义应用的整体结构
 * 
 * 路由结构：
 * - / : 首页（仪表盘）
 * - /accounting/* : 总账会计模块
 * - /business/* : 业务管理模块
 * 
 * 技术栈：
 * - React Router v6: 客户端路由
 * - 嵌套路由: Layout 组件包裹所有页面
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CompanyInit from './pages/accounting/CompanyInit'
import ChartOfAccounts from './pages/accounting/ChartOfAccounts'
import JournalEntry from './pages/accounting/JournalEntry'
import Posting from './pages/accounting/Posting'
import GeneralLedger from './pages/accounting/GeneralLedger'
import Reconciliation from './pages/accounting/Reconciliation'
import TaxManagement from './pages/accounting/TaxManagement'
import PeriodicOperations from './pages/accounting/PeriodicOperations'
import FinancialReports from './pages/accounting/FinancialReports'
import Suppliers from './pages/business/Suppliers'
import PurchaseOrders from './pages/business/PurchaseOrders'
import Customers from './pages/business/Customers'
import SalesInvoices from './pages/business/SalesInvoices'
import Employees from './pages/business/Employees'
import ExpenseManagement from './pages/business/ExpenseManagement'

/**
 * 应用主组件
 * 
 * 路由配置说明：
 * - 使用 BrowserRouter 提供路由功能
 * - Layout 组件作为根路由，包含侧边栏和顶栏
 * - 所有页面都嵌套在 Layout 中，保持统一布局
 * - 使用嵌套路由组织会计和业务两大模块
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* 总账会计 */}
          <Route path="accounting">
            <Route path="company-init" element={<CompanyInit />} />
            <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
            <Route path="journal-entry" element={<JournalEntry />} />
            <Route path="posting" element={<Posting />} />
            <Route path="general-ledger" element={<GeneralLedger />} />
            <Route path="reconciliation" element={<Reconciliation />} />
            <Route path="tax" element={<TaxManagement />} />
            <Route path="periodic" element={<PeriodicOperations />} />
            <Route path="reports" element={<FinancialReports />} />
          </Route>
          
          {/* 业务管理 */}
          <Route path="business">
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="sales-invoices" element={<SalesInvoices />} />
            <Route path="employees" element={<Employees />} />
            <Route path="expenses" element={<ExpenseManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App


