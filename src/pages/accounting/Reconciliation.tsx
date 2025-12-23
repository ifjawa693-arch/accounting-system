import { CheckCircle2, AlertCircle, Check, Search, Plus, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import { bankRecordAPI, reconciliationAPI } from '../../services/api'

interface BankRecord {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  matched: boolean
  matched_voucher_id?: string
}

interface BookRecord {
  id: string
  voucher_no: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  matched: boolean
  lines?: any[]
}

interface InternalCheckResult {
  totalVouchers: number
  balancedVouchers: number
  unbalancedVouchers: number
  issues: Array<{
    voucher_no: string
    date: string
    description: string
    debitTotal: number
    creditTotal: number
    difference: number
  }>
}

export default function Reconciliation() {
  const [bankRecords, setBankRecords] = useState<BankRecord[]>([])
  const [bookRecords, setBookRecords] = useState<BookRecord[]>([])
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [showBankForm, setShowBankForm] = useState(false)
  const [showInternalCheck, setShowInternalCheck] = useState(false)
  const [internalCheckResult, setInternalCheckResult] = useState<InternalCheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchBank, setSearchBank] = useState('')
  const [searchBook, setSearchBook] = useState('')

  // 银行流水表单
  const [bankForm, setBankForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense'
  })

  // 加载数据
  useEffect(() => {
    loadBankRecords()
    loadBookRecords()
  }, [])

  const loadBankRecords = async () => {
    try {
      const data = await bankRecordAPI.getAll()
      setBankRecords(data)
    } catch (error) {
      console.error('加载银行流水失败:', error)
    }
  }

  const loadBookRecords = async () => {
    try {
      const vouchers = await reconciliationAPI.getPostedVouchers()
      // 将凭证转换为账簿记录
      const records: BookRecord[] = vouchers.map((v: any) => {
        const lines = v.lines || []
        // 计算总金额（取借方或贷方的最大值）
        const debitTotal = lines.filter((l: any) => l.type === 'debit').reduce((sum: number, l: any) => sum + (l.amount || 0), 0)
        const creditTotal = lines.filter((l: any) => l.type === 'credit').reduce((sum: number, l: any) => sum + (l.amount || 0), 0)
        const amount = Math.max(debitTotal, creditTotal)
        
        // 判断类型：如果有银行存款科目，根据借贷方向判断
        const hasBankAccount = lines.some((l: any) => l.account_name?.includes('银行') || l.account_name?.includes('现金'))
        const type = hasBankAccount 
          ? (lines.find((l: any) => l.account_name?.includes('银行') || l.account_name?.includes('现金'))?.type === 'debit' ? 'income' : 'expense')
          : (amount > 0 ? 'income' : 'expense')
        
        return {
          id: v.id,
          voucher_no: v.voucher_no,
          date: v.date,
          description: v.description,
          amount,
          type,
          matched: false,
          lines
        }
      })
      setBookRecords(records)
    } catch (error) {
      console.error('加载账簿记录失败:', error)
    }
  }

  const handleAddBankRecord = async () => {
    if (!bankForm.date || !bankForm.description || !bankForm.amount) {
      alert('请填写完整信息')
      return
    }

    try {
      const id = `bank_${Date.now()}`
      await bankRecordAPI.create({
        id,
        date: bankForm.date,
        description: bankForm.description,
        amount: parseFloat(bankForm.amount),
        type: bankForm.type
      })
      setShowBankForm(false)
      setBankForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'income'
      })
      loadBankRecords()
      alert('银行流水添加成功！')
    } catch (error: any) {
      alert('添加失败：' + error.message)
    }
  }

  const handleMatch = async () => {
    if (selectedBankId && selectedBookId) {
      try {
        await bankRecordAPI.updateMatch(selectedBookId, true, selectedBookId)
        setBankRecords(bankRecords.map(r => 
          r.id === selectedBankId ? { ...r, matched: true, matched_voucher_id: selectedBookId } : r
        ))
        setBookRecords(bookRecords.map(r => 
          r.id === selectedBookId ? { ...r, matched: true } : r
        ))
        setSelectedBankId(null)
        setSelectedBookId(null)
        alert('对账成功！')
      } catch (error: any) {
        alert('对账失败：' + error.message)
      }
    } else {
      alert('请选择银行流水和账簿记录进行匹配')
    }
  }

  const handleUnmatch = async (type: 'bank' | 'book', id: string) => {
    try {
      if (type === 'bank') {
        await bankRecordAPI.updateMatch(id, false)
        setBankRecords(bankRecords.map(r => 
          r.id === id ? { ...r, matched: false, matched_voucher_id: undefined } : r
        ))
      } else {
        // 找到对应的银行流水并取消匹配
        const bankRecord = bankRecords.find(r => r.matched_voucher_id === id)
        if (bankRecord) {
          await bankRecordAPI.updateMatch(bankRecord.id, false)
          setBankRecords(bankRecords.map(r => 
            r.id === bankRecord.id ? { ...r, matched: false, matched_voucher_id: undefined } : r
          ))
        }
        setBookRecords(bookRecords.map(r => 
          r.id === id ? { ...r, matched: false } : r
        ))
      }
      alert('取消匹配成功！')
    } catch (error: any) {
      alert('取消匹配失败：' + error.message)
    }
  }

  const handleDeleteBankRecord = async (id: string) => {
    if (!confirm('确定要删除这条银行流水吗？')) return
    try {
      await bankRecordAPI.delete(id)
      loadBankRecords()
      alert('删除成功！')
    } catch (error: any) {
      alert('删除失败：' + error.message)
    }
  }

  const handleInternalCheck = async () => {
    setLoading(true)
    try {
      const result = await reconciliationAPI.internalCheck()
      setInternalCheckResult(result)
      setShowInternalCheck(true)
    } catch (error: any) {
      alert('内部对账检查失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const matchedCount = bankRecords.filter(r => r.matched).length
  const unmatchedBankCount = bankRecords.filter(r => !r.matched).length
  const unmatchedBookCount = bookRecords.filter(r => !r.matched).length
  
  // 计算对账差异
  const bankTotal = bankRecords.reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0)
  const bookTotal = bookRecords.reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0)
  const difference = Math.abs(bankTotal - bookTotal)

  // 过滤记录
  const filteredBankRecords = bankRecords.filter(r => 
    r.description.toLowerCase().includes(searchBank.toLowerCase()) ||
    r.date.includes(searchBank)
  )
  const filteredBookRecords = bookRecords.filter(r => 
    r.description.toLowerCase().includes(searchBook.toLowerCase()) ||
    r.voucher_no.includes(searchBook) ||
    r.date.includes(searchBook)
  )

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">对账管理</h1>
            <p className="text-gray-500 mt-1">核对银行流水与账簿记录，检查账目平衡</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleInternalCheck}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            内部对账检查
          </button>
          <button
            onClick={() => setShowBankForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加银行流水
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">已对账</p>
          <p className="text-3xl font-bold text-green-900">{matchedCount}</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-600 mb-1">未对账银行流水</p>
          <p className="text-3xl font-bold text-amber-900">{unmatchedBankCount}</p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-600 mb-1">未对账账簿记录</p>
          <p className="text-3xl font-bold text-red-900">{unmatchedBookCount}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">对账差异</p>
          <p className="text-3xl font-bold text-blue-900">¥{difference.toLocaleString()}</p>
        </div>
      </div>

      {/* 对账操作区 */}
      {(selectedBankId || selectedBookId) && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900 font-medium">
                已选择：{selectedBankId ? '银行流水 ' : ''}{selectedBookId ? '账簿记录' : ''}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMatch}
                className="btn-primary"
                disabled={!selectedBankId || !selectedBookId}
              >
                确认匹配
              </button>
              <button
                onClick={() => {
                  setSelectedBankId(null)
                  setSelectedBookId(null)
                }}
                className="btn-secondary"
              >
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 对账区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 银行流水 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">银行流水</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchBank}
                onChange={(e) => setSearchBank(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredBankRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {bankRecords.length === 0 ? '暂无银行流水，点击右上角"添加银行流水"按钮添加' : '没有匹配的搜索结果'}
              </div>
            ) : (
              filteredBankRecords.map(record => (
                <div
                  key={record.id}
                  onClick={() => !record.matched && setSelectedBankId(record.id)}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    record.matched
                      ? 'bg-green-50 border-green-200'
                      : selectedBankId === record.id
                      ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200'
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {record.matched ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="text-sm text-gray-500">{record.date}</span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{record.description}</p>
                      <p className={`text-lg font-bold ${
                        record.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}¥{record.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {record.matched && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnmatch('bank', record.id)
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          取消匹配
                        </button>
                      )}
                      {!record.matched && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteBankRecord(record.id)
                          }}
                          className="text-gray-400 hover:text-red-600 text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 账簿记录 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">账簿记录（已过账凭证）</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredBookRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {bookRecords.length === 0 ? '暂无已过账凭证，请先在做分录页面创建凭证并过账' : '没有匹配的搜索结果'}
              </div>
            ) : (
              filteredBookRecords.map(record => (
                <div
                  key={record.id}
                  onClick={() => !record.matched && setSelectedBookId(record.id)}
                  className={`p-4 border rounded-lg transition-all ${
                    record.matched
                      ? 'bg-green-50 border-green-200 cursor-default'
                      : selectedBookId === record.id
                      ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200 cursor-pointer'
                      : 'bg-white border-gray-200 hover:border-primary-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {record.matched ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="text-sm text-gray-500">{record.date}</span>
                        <span className="text-xs text-gray-400">凭证号：{record.voucher_no}</span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{record.description}</p>
                      <p className={`text-lg font-bold ${
                        record.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}¥{record.amount.toLocaleString()}
                      </p>
                    </div>
                    {record.matched && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUnmatch('book', record.id)
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        取消匹配
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 添加银行流水模态框 */}
      <Modal
        isOpen={showBankForm}
        onClose={() => setShowBankForm(false)}
        title="添加银行流水"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              value={bankForm.date}
              onChange={(e) => setBankForm({ ...bankForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              type="text"
              value={bankForm.description}
              onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })}
              placeholder="例如：客户A公司转账"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
            <input
              type="number"
              value={bankForm.amount}
              onChange={(e) => setBankForm({ ...bankForm, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              value={bankForm.type}
              onChange={(e) => setBankForm({ ...bankForm, type: e.target.value as 'income' | 'expense' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleAddBankRecord} className="btn-primary flex-1">
              保存
            </button>
            <button onClick={() => setShowBankForm(false)} className="btn-secondary flex-1">
              取消
            </button>
          </div>
        </div>
      </Modal>

      {/* 内部对账检查结果模态框 */}
      <Modal
        isOpen={showInternalCheck}
        onClose={() => setShowInternalCheck(false)}
        title="内部对账检查结果"
      >
        {internalCheckResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="card bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-600 mb-1">总凭证数</p>
                <p className="text-2xl font-bold text-blue-900">{internalCheckResult.totalVouchers}</p>
              </div>
              <div className="card bg-green-50 border-green-200">
                <p className="text-sm text-green-600 mb-1">平衡凭证</p>
                <p className="text-2xl font-bold text-green-900">{internalCheckResult.balancedVouchers}</p>
              </div>
              <div className="card bg-red-50 border-red-200">
                <p className="text-sm text-red-600 mb-1">不平衡凭证</p>
                <p className="text-2xl font-bold text-red-900">{internalCheckResult.unbalancedVouchers}</p>
              </div>
            </div>

            {internalCheckResult.issues.length > 0 ? (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">不平衡凭证详情：</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {internalCheckResult.issues.map((issue, index) => (
                    <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">凭证号：{issue.voucher_no}</span>
                        <span className="text-sm text-gray-500">{issue.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">借方：¥{issue.debitTotal.toLocaleString()}</span>
                        <span className="text-gray-600">贷方：¥{issue.creditTotal.toLocaleString()}</span>
                        <span className="text-red-600 font-bold">
                          差异：¥{Math.abs(issue.difference).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">所有凭证借贷平衡！</p>
                <p className="text-sm text-gray-500 mt-2">账目核对无误</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowInternalCheck(false)} className="btn-primary flex-1">
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 使用说明 */}
      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-bold text-gray-900 mb-2">💡 对账说明</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• <strong>银行对账</strong>：点击"添加银行流水"手动输入银行流水，然后与已过账凭证进行匹配</li>
          <li>• <strong>内部对账</strong>：点击"内部对账检查"检查所有已过账凭证的借贷是否平衡</li>
          <li>• 点击选择未对账的银行流水和账簿记录，确认金额和日期相符后点击"确认匹配"</li>
          <li>• 已对账的记录显示为绿色，可以点击"取消匹配"重新对账</li>
          <li>• 账簿记录来自已过账的凭证，请先在做分录页面创建凭证并过账</li>
        </ul>
      </div>
    </div>
  )
}
