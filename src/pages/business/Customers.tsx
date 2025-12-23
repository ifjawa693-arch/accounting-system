import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { customerAPI } from '../../services/api'

interface Customer {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  balance: number
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  // 加载客户数据
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerAPI.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('加载客户失败:', error)
      alert('加载客户数据失败，请检查后端服务是否运行')
    } finally {
      setLoading(false)
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    balance: 0
  })

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingCustomer(null)
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      balance: 0
    })
    setIsModalOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      contact: customer.contact,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      balance: customer.balance
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个客户吗？')) {
      try {
        await customerAPI.delete(id)
        alert('客户删除成功！')
        loadCustomers() // 重新加载数据
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCustomer) {
        // 编辑现有客户
        await customerAPI.update(editingCustomer.id, formData)
        alert('客户更新成功！')
      } else {
        // 添加新客户
        const newCustomer = {
          id: Date.now().toString(),
          ...formData
        }
        await customerAPI.create(newCustomer)
        alert('客户添加成功！')
      }
      
      setIsModalOpen(false)
      loadCustomers() // 重新加载数据
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">客户管理</h1>
            <p className="text-gray-500 mt-1">管理企业的客户信息</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加客户
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索客户名称或联系人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">客户总数</p>
          <p className="text-3xl font-bold text-blue-900">{customers.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">本月新增客户</p>
          <p className="text-3xl font-bold text-green-900">
            {customers.filter(c => {
              const createdDate = new Date((c as any).created_at || Date.now())
              const now = new Date()
              return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-600 mb-1">活跃客户数</p>
          <p className="text-3xl font-bold text-amber-900">{customers.length}</p>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="card text-center py-8">
          <p className="text-gray-600">加载中...</p>
        </div>
      )}

      {/* 客户列表 */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-600">暂无客户数据，点击"添加客户"开始添加</p>
        </div>
      )}

      {!loading && filteredCustomers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCustomers.map(customer => (
          <div key={customer.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">联系人：{customer.contact}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(customer)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
              <p className="text-sm text-gray-600">{customer.address}</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">应收账款</span>
                <span className={`text-lg font-bold ${
                  customer.balance > 0 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {customer.balance > 0 ? `¥${customer.balance.toLocaleString()}` : '无欠款'}
                </span>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* 添加/编辑客户模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? '编辑客户' : '添加客户'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">客户名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="请输入客户名称"
                required
              />
            </div>
            <div>
              <label className="label">联系人 *</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="input-field"
                placeholder="请输入联系人"
                required
              />
            </div>
            <div>
              <label className="label">联系电话 *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="请输入联系电话"
                required
              />
            </div>
            <div>
              <label className="label">电子邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="请输入电子邮箱"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                placeholder="请输入地址"
              />
            </div>
            <div>
              <label className="label">应收账款</label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="请输入金额"
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
              {editingCustomer ? '保存修改' : '添加客户'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

