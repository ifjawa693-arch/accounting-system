import { FileText, Plus, Search, Edit2, Trash2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { accountAPI } from '../../services/api'

interface Account {
  id: string
  code: string
  name: string
  type: string
  balance: number
}

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const data = await accountAPI.getAll()
      setAccounts(data)
    } catch (error) {
      console.error('加载会计科目失败:', error)
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    balance: 0
  })

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.includes(searchTerm)
    const matchesType = !selectedType || account.type === selectedType
    return matchesSearch && matchesType
  })

  const handleAdd = () => {
    setEditingAccount(null)
    setFormData({
      code: '',
      name: '',
      type: '',
      balance: 0
    })
    setIsModalOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      balance: account.balance
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个会计科目吗？')) {
      try {
        await accountAPI.delete(id)
        alert('科目删除成功！')
        loadAccounts()
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingAccount) {
        await accountAPI.update(editingAccount.id, formData)
        alert('科目更新成功！')
      } else {
        const newAccount = {
          id: Date.now().toString(),
          ...formData
        }
        await accountAPI.create(newAccount)
        alert('科目添加成功！')
      }
      
      setIsModalOpen(false)
      loadAccounts()
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
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">管理会计科目</h1>
            <p className="text-gray-500 mt-1">设置和管理企业的会计科目体系</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加科目
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索科目名称或编码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部类型</option>
            <option value="资产类">资产类</option>
            <option value="负债类">负债类</option>
            <option value="所有者权益">所有者权益</option>
            <option value="损益类">损益类</option>
            <option value="成本类">成本类</option>
          </select>
        </div>
      </div>

      {/* 科目列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  科目编码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  科目名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  科目类型
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  余额（元）
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.map(account => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {account.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{account.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">
                      ¥{account.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(account)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">资产类科目</p>
          <p className="text-2xl font-bold text-blue-900">{accounts.filter(a => a.type === '资产类').length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">负债类科目</p>
          <p className="text-2xl font-bold text-green-900">{accounts.filter(a => a.type === '负债类').length}</p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-600 mb-1">所有者权益科目</p>
          <p className="text-2xl font-bold text-purple-900">{accounts.filter(a => a.type === '所有者权益').length}</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-600 mb-1">损益类科目</p>
          <p className="text-2xl font-bold text-amber-900">{accounts.filter(a => a.type === '损益类').length}</p>
        </div>
      </div>

      {/* 添加/编辑科目模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? '编辑会计科目' : '添加会计科目'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">科目编码 *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                placeholder="例如：1001"
                required
              />
            </div>
            <div>
              <label className="label">科目名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="例如：库存现金"
                required
              />
            </div>
            <div>
              <label className="label">科目类型 *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
                required
              >
                <option value="">请选择类型</option>
                <option value="资产类">资产类</option>
                <option value="负债类">负债类</option>
                <option value="所有者权益">所有者权益</option>
                <option value="损益类">损益类</option>
                <option value="成本类">成本类</option>
              </select>
            </div>
            <div>
              <label className="label">期初余额（元）</label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="请输入金额"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 科目编码规则</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 1开头：资产类科目</li>
              <li>• 2开头：负债类科目</li>
              <li>• 4开头：所有者权益类科目</li>
              <li>• 5开头：成本类科目</li>
              <li>• 6开头：损益类科目</li>
            </ul>
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
              {editingAccount ? '保存修改' : '添加科目'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

