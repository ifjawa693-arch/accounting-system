import { UserCircle, Plus, Search, Edit2, Trash2, Phone, Mail, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { employeeAPI } from '../../services/api'

interface Employee {
  id: string
  name: string
  position: string
  department: string
  phone: string
  email: string
  salary: number
  joinDate: string
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll()
      setEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    phone: '',
    email: '',
    salary: 0,
    joinDate: ''
  })

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingEmployee(null)
    setFormData({
      name: '',
      position: '',
      department: '',
      phone: '',
      email: '',
      salary: 0,
      joinDate: new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      phone: employee.phone,
      email: employee.email,
      salary: employee.salary,
      joinDate: (employee as any).join_date || employee.joinDate // 兼容数据库字段
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个员工吗？')) {
      try {
        await employeeAPI.delete(id)
        alert('员工删除成功！')
        loadEmployees()
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = {
        ...formData,
        join_date: formData.joinDate
      }
      delete (data as any).joinDate
      
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, data)
        alert('员工更新成功！')
      } else {
        const newEmployee = {
          id: Date.now().toString(),
          ...data
        }
        await employeeAPI.create(newEmployee)
        alert('员工添加成功！')
      }
      
      setIsModalOpen(false)
      loadEmployees()
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
            <UserCircle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">员工管理</h1>
            <p className="text-gray-500 mt-1">管理企业的员工信息</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加员工
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索员工姓名、职位或部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">全部部门</option>
            <option value="finance">财务部</option>
            <option value="sales">销售部</option>
            <option value="purchase">采购部</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">员工总数</p>
          <p className="text-3xl font-bold text-blue-900">{employees.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">本月工资总额</p>
          <p className="text-3xl font-bold text-green-900">
            ¥{(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-600 mb-1">部门数量</p>
          <p className="text-3xl font-bold text-purple-900">
            {new Set(employees.map(e => e.department).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* 员工列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">职位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">联系方式</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">薪资</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入职日期</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-bold">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{employee.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{employee.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ¥{employee.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {(employee as any).join_date || employee.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(employee.id)}
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

      {/* 添加/编辑员工模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? '编辑员工' : '添加员工'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">员工姓名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="请输入员工姓名"
                required
              />
            </div>
            <div>
              <label className="label">职位 *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="input-field"
                placeholder="请输入职位"
                required
              />
            </div>
            <div>
              <label className="label">部门 *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
                required
              >
                <option value="">请选择部门</option>
                <option value="财务部">财务部</option>
                <option value="销售部">销售部</option>
                <option value="采购部">采购部</option>
                <option value="人事部">人事部</option>
                <option value="技术部">技术部</option>
                <option value="市场部">市场部</option>
              </select>
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
              <label className="label">电子邮箱 *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="请输入电子邮箱"
                required
              />
            </div>
            <div>
              <label className="label">薪资（元）*</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="请输入薪资"
                required
              />
            </div>
            <div>
              <label className="label">入职日期 *</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="input-field"
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
              {editingEmployee ? '保存修改' : '添加员工'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

