import { FileText, Plus, Search, Save, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { purchaseOrderAPI, supplierAPI } from '../../services/api'

interface PurchaseOrder {
  id: string
  orderNo: string
  date: string
  supplier: string
  items: string
  amount: number
  status: 'pending' | 'approved' | 'completed'
}

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    loadOrders()
    loadSuppliers()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await purchaseOrderAPI.getAll()
      setOrders(data.map((item: any) => ({
        ...item,
        orderNo: item.order_no
      })))
    } catch (error) {
      console.error('加载订单失败:', error)
    }
  }

  const loadSuppliers = async () => {
    try {
      const data = await supplierAPI.getAll()
      setSuppliers(data)
    } catch (error) {
      console.error('加载供应商失败:', error)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [formData, setFormData] = useState({
    orderNo: '',
    date: '',
    supplier: '',
    items: '',
    amount: 0
  })

  const handleAdd = () => {
    const nextNo = `PO-2024-${String(orders.length + 1).padStart(3, '0')}`
    setFormData({
      orderNo: nextNo,
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      items: '',
      amount: 0
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newOrder = {
        id: Date.now().toString(),
        order_no: formData.orderNo,
        date: formData.date,
        supplier: formData.supplier,
        items: formData.items,
        amount: formData.amount,
        status: 'pending'
      }
      await purchaseOrderAPI.create(newOrder)
      alert('采购订单创建成功！')
      setIsModalOpen(false)
      loadOrders()
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败，请重试')
    }
  }

  const handleViewDetail = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待审核',
      approved: '已审核',
      completed: '已完成'
    }
    return statusMap[status as keyof typeof statusMap]
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
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
            <h1 className="text-3xl font-bold text-gray-900">采购订单管理</h1>
            <p className="text-gray-500 mt-1">管理企业的采购订单</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          创建订单
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号或供应商..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已审核</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">供应商</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">采购项目</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {order.orderNo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.supplier}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ¥{order.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleViewDetail(order)}
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

      {/* 创建订单模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="创建采购订单"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">订单号</label>
              <input
                type="text"
                value={formData.orderNo}
                className="input-field bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="label">订单日期 *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">供应商 *</label>
              <select
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="input-field"
                required
              >
                <option value="">请选择供应商</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">订单金额（元）*</label>
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
              <label className="label">采购项目 *</label>
              <textarea
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="请输入采购项目明细"
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
              创建订单
            </button>
          </div>
        </form>
      </Modal>

      {/* 订单详情模态框 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="采购订单详情"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* 订单基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">订单号</label>
                <p className="text-lg font-mono font-bold text-gray-900">{selectedOrder.orderNo}</p>
              </div>
              <div>
                <label className="label">订单日期</label>
                <p className="text-lg text-gray-900">{selectedOrder.date}</p>
              </div>
              <div>
                <label className="label">供应商</label>
                <p className="text-lg text-gray-900">{selectedOrder.supplier}</p>
              </div>
              <div>
                <label className="label">订单状态</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
            </div>

            {/* 采购项目 */}
            <div>
              <label className="label">采购项目</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedOrder.items}</p>
              </div>
            </div>

            {/* 金额信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-900 font-medium">订单总额</span>
                <span className="text-3xl font-bold text-blue-900">
                  ¥{selectedOrder.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              {selectedOrder.status === 'pending' && (
                <>
                  <button 
                  onClick={async () => {
                    try {
                      await purchaseOrderAPI.updateStatus(selectedOrder.id, 'approved')
                      alert('订单已审核！')
                      setIsDetailModalOpen(false)
                      loadOrders()
                    } catch (error) {
                      alert('审核失败，请重试')
                    }
                  }}
                    className="btn-primary"
                  >
                    审核通过
                  </button>
                  <button className="btn-secondary">
                    拒绝订单
                  </button>
                </>
              )}
              {selectedOrder.status === 'approved' && (
                <button 
                  onClick={async () => {
                    try {
                      await purchaseOrderAPI.updateStatus(selectedOrder.id, 'completed')
                      alert('订单已完成！')
                      setIsDetailModalOpen(false)
                      loadOrders()
                    } catch (error) {
                      alert('操作失败，请重试')
                    }
                  }}
                  className="btn-primary"
                >
                  标记为已完成
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

