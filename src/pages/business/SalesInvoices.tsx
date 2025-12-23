import { FileText, Plus, Search, Save, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { salesInvoiceAPI, customerAPI } from '../../services/api'

interface SalesInvoice {
  id: string
  invoiceNo: string
  date: string
  customer: string
  items: string
  amount: number
  status: 'draft' | 'sent' | 'paid'
}

export default function SalesInvoices() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    loadInvoices()
    loadCustomers()
  }, [])

  const loadInvoices = async () => {
    try {
      const data = await salesInvoiceAPI.getAll()
      setInvoices(data.map((item: any) => ({
        ...item,
        invoiceNo: item.invoice_no
      })))
    } catch (error) {
      console.error('加载销售单失败:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const data = await customerAPI.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('加载客户失败:', error)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null)
  const [formData, setFormData] = useState({
    invoiceNo: '',
    date: '',
    customer: '',
    items: '',
    amount: 0
  })

  const handleAdd = () => {
    const nextNo = `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`
    setFormData({
      invoiceNo: nextNo,
      date: new Date().toISOString().split('T')[0],
      customer: '',
      items: '',
      amount: 0
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newInvoice = {
        id: Date.now().toString(),
        invoice_no: formData.invoiceNo,
        date: formData.date,
        customer: formData.customer,
        items: formData.items,
        amount: formData.amount,
        status: 'draft'
      }
      await salesInvoiceAPI.create(newInvoice)
      alert('销售单创建成功！')
      setIsModalOpen(false)
      loadInvoices()
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败，请重试')
    }
  }

  const handleViewDetail = (invoice: SalesInvoice) => {
    setSelectedInvoice(invoice)
    setIsDetailModalOpen(true)
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      draft: '草稿',
      sent: '已发送',
      paid: '已收款'
    }
    return statusMap[status as keyof typeof statusMap]
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800'
    }
    return colorMap[status as keyof typeof colorMap]
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">销售单管理</h1>
            <p className="text-gray-500 mt-1">管理企业的销售发票</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          创建销售单
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索发票号或客户..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="sent">已发送</option>
            <option value="paid">已收款</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">本月销售单</p>
          <p className="text-3xl font-bold text-blue-900">{invoices.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">已收款</p>
          <p className="text-3xl font-bold text-green-900">{invoices.filter(i => i.status === 'paid').length}</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-600 mb-1">待收款</p>
          <p className="text-3xl font-bold text-amber-900">{invoices.filter(i => i.status !== 'paid').length}</p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-600 mb-1">本月销售额</p>
          <p className="text-3xl font-bold text-purple-900">
            ¥{(invoices.reduce((sum, i) => sum + (i.amount || 0), 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* 发票列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发票号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">项目</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {invoice.invoiceNo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ¥{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleViewDetail(invoice)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建销售单模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="创建销售单"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">发票号</label>
              <input
                type="text"
                value={formData.invoiceNo}
                className="input-field bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="label">开票日期 *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">客户 *</label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="input-field"
                required
              >
                <option value="">请选择客户</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.name}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">销售金额（元）*</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="请输入金额"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">销售项目 *</label>
              <textarea
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="请输入销售项目明细"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              创建销售单
            </button>
          </div>
        </form>
      </Modal>

      {/* 销售单详情模态框 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="销售单详情"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* 发票基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">发票号</label>
                <p className="text-lg font-mono font-bold text-gray-900">{selectedInvoice.invoiceNo}</p>
              </div>
              <div>
                <label className="label">开票日期</label>
                <p className="text-lg text-gray-900">{selectedInvoice.date}</p>
              </div>
              <div>
                <label className="label">客户</label>
                <p className="text-lg text-gray-900">{selectedInvoice.customer}</p>
              </div>
              <div>
                <label className="label">发票状态</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                  {getStatusText(selectedInvoice.status)}
                </span>
              </div>
            </div>

            {/* 销售项目 */}
            <div>
              <label className="label">销售项目</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedInvoice.items}</p>
              </div>
            </div>

            {/* 金额信息 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-green-900 font-medium">销售总额</span>
                <span className="text-3xl font-bold text-green-900">
                  ¥{selectedInvoice.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              {selectedInvoice.status === 'draft' && (
                <button 
                  onClick={async () => {
                    try {
                      await salesInvoiceAPI.updateStatus(selectedInvoice.id, 'sent')
                      alert('发票已发送给客户！')
                      setIsDetailModalOpen(false)
                      loadInvoices()
                    } catch (error) {
                      alert('发送失败，请重试')
                    }
                  }}
                  className="btn-primary"
                >
                  发送给客户
                </button>
              )}
              {selectedInvoice.status === 'sent' && (
                <button 
                  onClick={async () => {
                    try {
                      await salesInvoiceAPI.updateStatus(selectedInvoice.id, 'paid')
                      alert('款项已收到！')
                      setIsDetailModalOpen(false)
                      loadInvoices()
                    } catch (error) {
                      alert('操作失败，请重试')
                    }
                  }}
                  className="btn-primary"
                >
                  确认收款
                </button>
              )}
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

