import { ArrowRightLeft, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { voucherAPI } from '../../services/api'

interface Voucher {
  id: string
  date: string
  voucherNo: string
  description: string
  amount: number
  status: 'pending' | 'posted'
}

export default function Posting() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])

  useEffect(() => {
    loadVouchers()
  }, [])

  const loadVouchers = async () => {
    try {
      const data = await voucherAPI.getAll()
      setVouchers(data.map((item: any) => ({
        ...item,
        voucherNo: item.voucher_no
      })))
    } catch (error) {
      console.error('加载凭证失败:', error)
    }
  }

  const pendingVouchers = vouchers.filter(v => v.status === 'pending')
  const postedVouchers = vouchers.filter(v => v.status === 'posted')

  const handlePost = async (id: string) => {
    try {
      await voucherAPI.updateStatus(id, 'posted')
      alert('凭证已过账成功！')
      loadVouchers()
    } catch (error) {
      console.error('过账失败:', error)
      alert('过账失败，请重试')
    }
  }

  const handleBatchPost = async () => {
    try {
      const count = pendingVouchers.length
      await Promise.all(
        pendingVouchers.map(v => voucherAPI.updateStatus(v.id, 'posted'))
      )
      alert(`批量过账 ${count} 张凭证成功！`)
      loadVouchers()
    } catch (error) {
      console.error('批量过账失败:', error)
      alert('批量过账失败，请重试')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">过账管理</h1>
            <p className="text-gray-500 mt-1">将凭证数据过账至相应账户</p>
          </div>
        </div>
        <button
          onClick={handleBatchPost}
          className="btn-primary"
          disabled={pendingVouchers.length === 0}
        >
          批量过账 ({pendingVouchers.length})
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-600 mb-1">待过账凭证</p>
          <p className="text-3xl font-bold text-amber-900">{pendingVouchers.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">已过账凭证</p>
          <p className="text-3xl font-bold text-green-900">{postedVouchers.length}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600 mb-1">本月过账总额</p>
          <p className="text-3xl font-bold text-blue-900">
            ¥{(postedVouchers.reduce((sum, v) => sum + (v.amount || 0), 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* 待过账凭证 */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">待过账凭证</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">凭证号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingVouchers.map(voucher => (
                <tr key={voucher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {voucher.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {voucher.voucherNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {voucher.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    ¥{voucher.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      待过账
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handlePost(voucher.id)}
                      className="btn-primary text-sm"
                    >
                      过账
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 已过账凭证 */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">已过账凭证</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">凭证号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {postedVouchers.map(voucher => (
                <tr key={voucher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {voucher.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {voucher.voucherNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {voucher.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    ¥{voucher.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已过账
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

