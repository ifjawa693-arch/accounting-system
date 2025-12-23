import { BookOpen, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import { accountAPI, voucherAPI } from '../../services/api'

interface Account {
  id: string
  code: string
  name: string
  type: string
  balance: number
}

interface LedgerEntry {
  date: string
  voucherNo: string
  description: string
  debit: number
  credit: number
  balance: number
}

export default function GeneralLedger() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [vouchers, setVouchers] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])

  useEffect(() => {
    loadAccounts()
    loadVouchers()
  }, [])

  useEffect(() => {
    if (selectedAccount && vouchers.length > 0) {
      generateLedgerEntries()
    }
  }, [selectedAccount, vouchers])

  const loadAccounts = async () => {
    try {
      const data = await accountAPI.getAll()
      setAccounts(data)
    } catch (error) {
      console.error('加载科目失败:', error)
    }
  }

  const loadVouchers = async () => {
    try {
      const data = await voucherAPI.getAll()
      setVouchers(data)
    } catch (error) {
      console.error('加载凭证失败:', error)
    }
  }

  const generateLedgerEntries = () => {
    // 模拟生成总账分录（实际应该从凭证明细中提取）
    const postedVouchers = vouchers.filter(v => v.status === 'posted')
    const entries: LedgerEntry[] = postedVouchers.map((v, index) => {
      const isDebit = index % 2 === 0
      const balance = postedVouchers
        .slice(0, index + 1)
        .reduce((sum, voucher, i) => {
          return sum + (i % 2 === 0 ? voucher.amount : -voucher.amount)
        }, 0)

      return {
        date: v.date,
        voucherNo: v.voucher_no,
        description: v.description,
        debit: isDebit ? v.amount : 0,
        credit: isDebit ? 0 : v.amount,
        balance: balance
      }
    })

    setLedgerEntries(entries)
  }

  const selectedAccountData = accounts.find(a => a.id === selectedAccount)
  const totalDebit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0)
  const totalCredit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0)
  const currentBalance = ledgerEntries.length > 0 
    ? ledgerEntries[ledgerEntries.length - 1].balance 
    : selectedAccountData?.balance || 0

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">总账</h1>
          <p className="text-gray-500 mt-1">查看各科目的总账记录和余额变化</p>
        </div>
      </div>

      {/* 说明提示 */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💡 什么是总账？</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>总账</strong>是每个科目的汇总账簿，记录了该科目的所有借贷变化</li>
          <li>• 当你<strong>"做分录"</strong>并<strong>"过账"</strong>后，数据就会登记到相应科目的总账中</li>
          <li>• 总账显示了科目的<strong>期初余额、本期发生额（借方/贷方）、期末余额</strong></li>
          <li>• 通过总账，你可以看到每个科目的详细变动情况和当前余额</li>
        </ul>
      </div>

      {/* 科目选择 */}
      <div className="card">
        <label className="label">选择会计科目</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="input-field max-w-md"
        >
          <option value="">请选择科目...</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.code} - {account.name} (类型: {account.type})
            </option>
          ))}
        </select>
      </div>

      {selectedAccount && selectedAccountData && (
        <>
          {/* 科目信息卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-purple-600">科目编号</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">{selectedAccountData.code}</p>
              <p className="text-sm text-purple-700 mt-1">{selectedAccountData.name}</p>
            </div>
            
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-600">借方发生额</p>
              </div>
              <p className="text-2xl font-bold text-green-900">¥{totalDebit.toLocaleString()}</p>
            </div>
            
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">贷方发生额</p>
              </div>
              <p className="text-2xl font-bold text-red-900">¥{totalCredit.toLocaleString()}</p>
            </div>
            
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-600">当前余额</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">¥{currentBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* 总账明细表 */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedAccountData.code} - {selectedAccountData.name} 总账
            </h2>
            
            {ledgerEntries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">该科目暂无已过账的凭证</p>
                <p className="text-gray-400 text-sm mt-2">
                  去"做分录"页面创建凭证，然后在"过账"页面过账，数据就会显示在这里
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">凭证号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">借方</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">贷方</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">余额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ledgerEntries.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {entry.voucherNo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {entry.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          {entry.debit > 0 ? `¥${entry.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                          {entry.credit > 0 ? `¥${entry.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-900">
                          ¥{entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                        本期合计
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-900">
                        ¥{totalDebit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-900">
                        ¥{totalCredit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-900">
                        ¥{currentBalance.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedAccount && (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">请选择一个会计科目查看总账</p>
        </div>
      )}
    </div>
  )
}

