import { Wallet, Plus, Search, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { expenseAPI, employeeAPI } from '../../services/api'

interface Expense {
  id: string
  date: string
  employee: string
  category: string
  description: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
}

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    loadExpenses()
    loadEmployees()
  }, [])

  const loadExpenses = async () => {
    try {
      const data = await expenseAPI.getAll()
      setExpenses(data)
    } catch (error) {
      console.error('加载费用失败:', error)
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll()
      setEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    employee: '',
    category: '',
    description: '',
    amount: 0
  })

  const handleAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      employee: '',
      category: '',
      description: '',
      amount: 0
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newExpense = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending'
      }
      await expenseAPI.create(newExpense)
      alert('费用提交成功！')
      setIsModalOpen(false)
      loadExpenses()
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await expenseAPI.updateStatus(id, 'approved')
      alert('费用已批准！')
      loadExpenses()
    } catch (error) {
      console.error('批准失败:', error)
      alert('批准失败，请重试')
    }
  }

  const handleReject = async (id: string) => {
    if (window.confirm('确定要拒绝这笔费用吗？')) {
      try {
        await expenseAPI.updateStatus(id, 'rejected')
        alert('费用已拒绝！')
        loadExpenses()
      } catch (error) {
        console.error('拒绝失败:', error)
        alert('拒绝失败，请重试')
      }
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待审核',
      approved: '已批准',
      rejected: '已拒绝'
    }
    return statusMap[status as keyof typeof statusMap]
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colorMap[status as keyof typeof colorMap]
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">费用管理</h1>
            <p className="text-gray-500 mt-1">管理员工费用报销</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          提交费用
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索员工或费用类型..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">全部类型</option>
            <option value="travel">差旅费</option>
            <option value="office">办公费</option>
            <option value="entertainment">招待费</option>
            <option value="transport">交通费</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">本月费用总计</p>
          <p className="text-3xl font-bold text-blue-900">
            ¥{(expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-600 mb-1">待审核</p>
          <p className="text-3xl font-bold text-amber-900">{expenses.filter(e => e.status === 'pending').length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">已批准</p>
          <p className="text-3xl font-bold text-green-900">{expenses.filter(e => e.status === 'approved').length}</p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-600 mb-1">已拒绝</p>
          <p className="text-3xl font-bold text-red-900">{expenses.filter(e => e.status === 'rejected').length}</p>
        </div>
      </div>

      {/* 费用列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">员工</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">费用类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">说明</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ¥{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {getStatusText(expense.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {expense.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(expense.id)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          批准
                        </button>
                        <button 
                          onClick={() => handleReject(expense.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        查看详情
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 提交费用模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="提交费用报销"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">费用日期 *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">报销人 *</label>
              <select
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="input-field"
                required
              >
                <option value="">请选择员工</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.name}>
                    {employee.name} - {employee.department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">费用类型 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
              >
                <option value="">请选择类型</option>
                <option value="差旅费">差旅费</option>
                <option value="办公费">办公费</option>
                <option value="招待费">招待费</option>
                <option value="交通费">交通费</option>
                <option value="通讯费">通讯费</option>
                <option value="培训费">培训费</option>
              </select>
            </div>
            <div>
              <label className="label">费用金额（元）*</label>
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
              <label className="label">费用说明 *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="请详细说明费用用途"
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
              提交费用
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

