/**
 * 做分录页面 (Journal Entry)
 * 
 * 功能说明：
 * 1. 创建会计凭证（记录经济业务）
 * 2. 添加多行借贷方分录
 * 3. 自动检查借贷平衡（借方总额 = 贷方总额）
 * 4. 保存凭证到数据库
 * 
 * 业务规则：
 * - 每笔凭证至少包含2行分录（一借一贷或多借多贷）
 * - 借方总额必须等于贷方总额（会计恒等式）
 * - 凭证号必须唯一
 * - 保存后凭证状态为 'pending'（待过账）
 * 
 * 会计分录示例：
 * 借：库存现金      1000
 *   贷：银行存款      1000
 * （从银行提取现金）
 * 
 * 使用流程：
 * 1. 填写凭证日期和凭证号
 * 2. 添加分录行，选择科目，填写借方或贷方金额
 * 3. 确保借贷平衡
 * 4. 保存凭证
 */

import { FileEdit, Plus, Trash2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { voucherAPI, accountAPI } from '../../services/api'

// 分录行数据结构
interface EntryLine {
  id: string           // 行ID
  account: string      // 会计科目
  debit: string        // 借方金额
  credit: string       // 贷方金额
  description: string  // 摘要说明
}

export default function JournalEntry() {
  // 状态：凭证基本信息
  const [entryDate, setEntryDate] = useState('')
  const [voucherNo, setVoucherNo] = useState('JE-2024-001')
  
  // 状态：分录行列表（至少2行）
  const [lines, setLines] = useState<EntryLine[]>([
    { id: '1', account: '', debit: '', credit: '', description: '' },
    { id: '2', account: '', debit: '', credit: '', description: '' },
  ])
  
  // 状态：会计科目列表（用于下拉选择）
  const [accounts, setAccounts] = useState<any[]>([])

  /**
   * 副作用：加载会计科目列表
   * 
   * 说明：
   * - 组件挂载时自动加载
   * - 用于科目选择下拉框
   */
  useEffect(() => {
    loadAccounts()
  }, [])

  /**
   * 加载会计科目列表
   * 
   * 功能：
   * - 从后端获取所有会计科目
   * - 用于分录行的科目选择
   */
  const loadAccounts = async () => {
    try {
      const data = await accountAPI.getAll()
      setAccounts(data)
    } catch (error) {
      console.error('❌ 加载科目失败:', error)
    }
  }

  const addLine = () => {
    setLines([...lines, {
      id: Date.now().toString(),
      account: '',
      debit: '',
      credit: '',
      description: ''
    }])
  }

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(line => line.id !== id))
    }
  }

  const updateLine = (id: string, field: keyof EntryLine, value: string) => {
    setLines(lines.map(line =>
      line.id === id ? { ...line, [field]: value } : line
    ))
  }

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)
    return { totalDebit, totalCredit }
  }

  const { totalDebit, totalCredit } = calculateTotals()
  const isBalanced = totalDebit === totalCredit && totalDebit > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isBalanced) {
      alert('借贷不平衡，请检查分录！')
      return
    }

    try {
      const voucher = {
        id: Date.now().toString(),
        date: entryDate,
        voucher_no: voucherNo,
        description: lines[0].description || '会计分录',
        amount: totalDebit,
        status: 'pending'
      }
      
      console.log('准备保存凭证:', voucher)
      const result = await voucherAPI.create(voucher)
      console.log('保存结果:', result)
      
      alert('凭证保存成功！\n\n您可以前往"过账"页面查看待过账凭证。')
      
      // 重置表单
      setEntryDate('')
      const nextNo = `JE-2024-${String(parseInt(voucherNo.split('-')[2]) + 1).padStart(3, '0')}`
      setVoucherNo(nextNo)
      setLines([
        { id: '1', account: '', debit: '', credit: '', description: '' },
        { id: '2', account: '', debit: '', credit: '', description: '' },
      ])
    } catch (error: any) {
      console.error('保存失败:', error)
      const errorMessage = error.message || '保存失败，请重试'
      alert(`保存失败：${errorMessage}\n\n如果提示凭证号已存在，请修改凭证号后重试。`)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <FileEdit className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">做分录</h1>
          <p className="text-gray-500 mt-1">创建和编辑会计凭证</p>
        </div>
      </div>

      {/* 分录表单 */}
      <form onSubmit={handleSubmit} className="card">
        {/* 凭证信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
          <div>
            <label className="label">凭证日期 *</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">凭证号 *</label>
            <input
              type="text"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">凭证类型</label>
            <select className="input-field">
              <option value="general">记账凭证</option>
              <option value="receipt">收款凭证</option>
              <option value="payment">付款凭证</option>
              <option value="transfer">转账凭证</option>
            </select>
          </div>
        </div>

        {/* 分录明细 */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">会计科目</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">借方金额</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">贷方金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">摘要</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <select
                      value={line.account}
                      onChange={(e) => updateLine(line.id, 'account', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">选择科目</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.code}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={line.debit}
                      onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={line.credit}
                      onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="填写摘要"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={lines.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900">合计</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  ¥{totalDebit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  ¥{totalCredit.toFixed(2)}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 添加行按钮 */}
        <button
          type="button"
          onClick={addLine}
          className="btn-secondary flex items-center gap-2 mb-6"
        >
          <Plus className="w-4 h-4" />
          添加分录行
        </button>

        {/* 平衡提示 */}
        <div className={`p-4 rounded-lg mb-6 ${
          isBalanced 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            isBalanced ? 'text-green-800' : 'text-red-800'
          }`}>
            {isBalanced 
              ? '✓ 借贷平衡，可以保存' 
              : `✗ 借贷不平衡，差额：¥${Math.abs(totalDebit - totalCredit).toFixed(2)}`
            }
          </p>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button type="button" className="btn-secondary">
            取消
          </button>
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2"
            disabled={!isBalanced}
          >
            <Save className="w-4 h-4" />
            保存凭证
          </button>
        </div>
      </form>
    </div>
  )
}

