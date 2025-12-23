import { Calculator, Plus, FileText, TrendingUp, TrendingDown, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { taxRecordAPI } from '../../services/api'

interface TaxRecord {
  id: string
  period: string
  type: string
  taxableAmount: number
  taxRate: number
  taxAmount: number
  status: 'pending' | 'declared' | 'paid'
}

export default function TaxManagement() {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([])

  useEffect(() => {
    loadTaxRecords()
  }, [])

  const loadTaxRecords = async () => {
    try {
      const data = await taxRecordAPI.getAll()
      setTaxRecords(data.map((item: any) => ({
        ...item,
        taxableAmount: item.taxable_amount,
        taxRate: item.tax_rate,
        taxAmount: item.tax_amount
      })))
    } catch (error) {
      console.error('加载税务记录失败:', error)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    period: '',
    type: '',
    taxableAmount: 0,
    taxRate: 0
  })

  const handleAdd = () => {
    const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    setFormData({
      period: currentMonth,
      type: '增值税',
      taxableAmount: 0,
      taxRate: 13
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const taxAmount = (formData.taxableAmount * formData.taxRate) / 100
      
      const newRecord = {
        id: Date.now().toString(),
        period: formData.period,
        type: formData.type,
        taxable_amount: formData.taxableAmount,
        tax_rate: formData.taxRate,
        tax_amount: taxAmount,
        status: 'pending'
      }
      
      await taxRecordAPI.create(newRecord)
      alert('税款记录保存成功！')
      setIsModalOpen(false)
      loadTaxRecords()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
  }

  const handleDeclare = async (id: string) => {
    try {
      await taxRecordAPI.updateStatus(id, 'declared')
      alert('申报成功！')
      loadTaxRecords()
    } catch (error) {
      console.error('申报失败:', error)
      alert('申报失败，请重试')
    }
  }

  const handlePay = async (id: string) => {
    try {
      await taxRecordAPI.updateStatus(id, 'paid')
      alert('缴税完成！')
      loadTaxRecords()
    } catch (error) {
      console.error('缴税失败:', error)
      alert('缴税失败，请重试')
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待申报',
      declared: '已申报',
      paid: '已缴税'
    }
    return statusMap[status as keyof typeof statusMap]
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-amber-100 text-amber-800',
      declared: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800'
    }
    return colorMap[status as keyof typeof colorMap]
  }

  // 统计数据
  const totalTaxThisMonth = taxRecords
    .filter(r => r.period.includes('2024年1月'))
    .reduce((sum, r) => sum + r.taxAmount, 0)
  
  const pendingCount = taxRecords.filter(r => r.status === 'pending').length
  const paidThisYear = taxRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.taxAmount, 0)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">税务管理</h1>
            <p className="text-gray-500 mt-1">管理增值税、所得税等税务事项</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          计算税款
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600">本月应缴税款</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">¥{(totalTaxThisMonth / 1000).toFixed(1)}K</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-600">待申报</p>
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-600">本年已缴</p>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">¥{(paidThisYear / 1000).toFixed(1)}K</p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-600">税负率</p>
            <Calculator className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">13%</p>
        </div>
      </div>

      {/* 税种管理 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 增值税 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">增值税</h3>
              <p className="text-sm text-gray-500">VAT</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">税率</span>
              <span className="font-medium">13%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">本月应缴</span>
              <span className="font-bold text-blue-600">¥104,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">申报期限</span>
              <span className="text-red-600">次月15日前</span>
            </div>
          </div>
        </div>

        {/* 企业所得税 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">企业所得税</h3>
              <p className="text-sm text-gray-500">Corporate Income Tax</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">税率</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">本季应缴</span>
              <span className="font-bold text-green-600">¥63,750</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">申报期限</span>
              <span className="text-red-600">季后15日内</span>
            </div>
          </div>
        </div>

        {/* 个人所得税 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">个人所得税</h3>
              <p className="text-sm text-gray-500">Personal Income Tax</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">税率</span>
              <span className="font-medium">3%-45%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">本月代扣</span>
              <span className="font-bold text-purple-600">¥8,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">申报期限</span>
              <span className="text-red-600">次月15日前</span>
            </div>
          </div>
        </div>
      </div>

      {/* 税务记录 */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">税务申报记录</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">税种</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">计税金额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">税率</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">应缴税额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taxRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ¥{record.taxableAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {record.taxRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                    ¥{record.taxAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {record.status === 'pending' && (
                      <button
                        onClick={() => handleDeclare(record.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                      >
                        申报
                      </button>
                    )}
                    {record.status === 'declared' && (
                      <button
                        onClick={() => handlePay(record.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        缴税
                      </button>
                    )}
                    {record.status === 'paid' && (
                      <span className="text-gray-400 text-sm">已完成</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 计算税款模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="计算税款"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">税款期间 *</label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="input-field"
                placeholder="例如：2024年1月"
                required
              />
            </div>
            <div>
              <label className="label">税种 *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const type = e.target.value
                  let rate = 0
                  if (type === '增值税') rate = 13
                  else if (type === '企业所得税') rate = 25
                  else if (type === '个人所得税') rate = 20
                  setFormData({ ...formData, type, taxRate: rate })
                }}
                className="input-field"
                required
              >
                <option value="增值税">增值税</option>
                <option value="企业所得税">企业所得税</option>
                <option value="个人所得税">个人所得税</option>
              </select>
            </div>
            <div>
              <label className="label">计税金额（元）*</label>
              <input
                type="number"
                value={formData.taxableAmount}
                onChange={(e) => setFormData({ ...formData, taxableAmount: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="请输入计税金额"
                required
              />
            </div>
            <div>
              <label className="label">税率（%）*</label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="请输入税率"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* 计算结果预览 */}
          {formData.taxableAmount > 0 && formData.taxRate > 0 && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-900 font-medium">应缴税额：</span>
                <span className="text-2xl font-bold text-blue-900">
                  ¥{((formData.taxableAmount * formData.taxRate) / 100).toLocaleString()}
                </span>
              </div>
            </div>
          )}

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
              保存税款记录
            </button>
          </div>
        </form>
      </Modal>

      {/* 提示信息 */}
      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-bold text-gray-900 mb-2">💡 税务申报提醒</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• 增值税：一般纳税人次月15日前申报，小规模纳税人按季申报</li>
          <li>• 企业所得税：按季预缴，次年5月31日前汇算清缴</li>
          <li>• 个人所得税：每月代扣代缴，次月15日前申报</li>
          <li>• 请按时申报纳税，避免产生滞纳金和罚款</li>
        </ul>
      </div>
    </div>
  )
}

