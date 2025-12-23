import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  FileEdit, 
  ArrowRightLeft, 
  CheckCircle2, 
  Calculator, 
  Calendar, 
  BarChart3,
  ShoppingCart,
  FileText,
  Users,
  TrendingUp,
  UserCircle,
  Wallet,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

interface MenuItem {
  label: string
  path?: string
  icon: React.ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: '仪表盘',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: '总账会计',
    icon: <BookOpen className="w-5 h-5" />,
    children: [
      { label: '企业初始化', path: '/accounting/company-init', icon: <Building2 className="w-4 h-4" /> },
      { label: '管理会计科目', path: '/accounting/chart-of-accounts', icon: <FileText className="w-4 h-4" /> },
      { label: '做分录', path: '/accounting/journal-entry', icon: <FileEdit className="w-4 h-4" /> },
      { label: '过账', path: '/accounting/posting', icon: <ArrowRightLeft className="w-4 h-4" /> },
      { label: '总账', path: '/accounting/general-ledger', icon: <BookOpen className="w-4 h-4" /> },
      { label: '对账', path: '/accounting/reconciliation', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: '处理税务', path: '/accounting/tax', icon: <Calculator className="w-4 h-4" /> },
      { label: '定期业务', path: '/accounting/periodic', icon: <Calendar className="w-4 h-4" /> },
      { label: '会计报表', path: '/accounting/reports', icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
  {
    label: '业务管理',
    icon: <TrendingUp className="w-5 h-5" />,
    children: [
      { label: '供应商管理', path: '/business/suppliers', icon: <ShoppingCart className="w-4 h-4" /> },
      { label: '采购订单', path: '/business/purchase-orders', icon: <FileText className="w-4 h-4" /> },
      { label: '客户管理', path: '/business/customers', icon: <Users className="w-4 h-4" /> },
      { label: '销售单管理', path: '/business/sales-invoices', icon: <FileText className="w-4 h-4" /> },
      { label: '员工管理', path: '/business/employees', icon: <UserCircle className="w-4 h-4" /> },
      { label: '费用管理', path: '/business/expenses', icon: <Wallet className="w-4 h-4" /> },
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['总账会计', '业务管理'])

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (path?: string) => {
    if (!path) return false
    return location.pathname === path
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <div
            onClick={() => toggleExpand(item.label)}
            className="sidebar-item text-gray-700"
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.path}
        to={item.path || '/'}
        className={`sidebar-item ${isActive(item.path) ? 'active' : 'text-gray-700'} ${
          level > 0 ? 'text-sm' : ''
        }`}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
      </Link>
    )
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">财务会计系统</h1>
            <p className="text-xs text-gray-500">Accounting System</p>
          </div>
        </div>
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2025 财务会计系统</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  )
}


