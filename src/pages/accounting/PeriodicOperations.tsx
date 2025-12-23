import { Calendar, CheckCircle, AlertCircle, Lock, Unlock, TrendingUp, FileText, DollarSign } from 'lucide-react'
import { useState } from 'react'

interface Period {
  id: string
  period: string
  type: 'month' | 'year'
  status: 'open' | 'closed'
  closedDate?: string
  closedBy?: string
}

export default function PeriodicOperations() {
  const [periods, setPeriods] = useState<Period[]>([
    { id: '1', period: '2023年12月', type: 'month', status: 'closed', closedDate: '2024-01-05', closedBy: '张三' },
    { id: '2', period: '2024年1月', type: 'month', status: 'closed', closedDate: '2024-02-05', closedBy: '李四' },
    { id: '3', period: '2024年2月', type: 'month', status: 'open' },
    { id: '4', period: '2024年3月', type: 'month', status: 'open' },
  ])

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [checkResults, setCheckResults] = useState({
    hasUnpostedVouchers: false,
    hasPendingReconciliation: false,
    hasTaxIssues: false
  })

  const handleCheck = (periodId: string) => {
    setSelectedPeriod(periodId)
    // 模拟检查
    setCheckResults({
      hasUnpostedVouchers: Math.random() > 0.7,
      hasPendingReconciliation: Math.random() > 0.7,
      hasTaxIssues: Math.random() > 0.7
    })
  }

  const handleClose = (periodId: string) => {
    const period = periods.find(p => p.id === periodId)
    if (!period) return

    const { hasUnpostedVouchers, hasPendingReconciliation, hasTaxIssues } = checkResults
    
    if (hasUnpostedVouchers || hasPendingReconciliation || hasTaxIssues) {
      alert('存在未处理的问题，请先解决后再结账！')
      return
    }

    if (window.confirm(`确定要结账【${period.period}】吗？结账后将无法修改当期数据。`)) {
      setPeriods(periods.map(p =>
        p.id === periodId
          ? { ...p, status: 'closed' as const, closedDate: new Date().toLocaleDateString(), closedBy: '管理员' }
          : p
      ))
      setSelectedPeriod(null)
      alert('结账成功！')
    }
  }

  const handleReopen = (periodId: string) => {
    if (window.confirm('重新打开账期后，可以继续录入和修改数据。确定要重新打开吗？')) {
      setPeriods(periods.map(p =>
        p.id === periodId
          ? { ...p, status: 'open' as const, closedDate: undefined, closedBy: undefined }
          : p
      ))
      alert('账期已重新打开！')
    }
  }

  const openPeriods = periods.filter(p => p.status === 'open')
  const closedPeriods = periods.filter(p => p.status === 'closed')

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">定期业务</h1>
          <p className="text-gray-500 mt-1">月末结账、年末结账等定期操作</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-600">开放期间</p>
            <Unlock className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{openPeriods.length}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600">已结账期间</p>
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{closedPeriods.length}</p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-600">当前期间</p>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-purple-900">2024年2月</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-600">待结账</p>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">1</p>
        </div>
      </div>

      {/* 结账前检查 */}
      {selectedPeriod && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-4">结账前检查</h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              checkResults.hasUnpostedVouchers ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {checkResults.hasUnpostedVouchers ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  checkResults.hasUnpostedVouchers ? 'text-red-900' : 'text-green-900'
                }`}>
                  {checkResults.hasUnpostedVouchers ? '存在未过账凭证' : '所有凭证已过账'}
                </p>
                {checkResults.hasUnpostedVouchers && (
                  <p className="text-sm text-red-700">请先在"过账"页面完成凭证过账</p>
                )}
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              checkResults.hasPendingReconciliation ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {checkResults.hasPendingReconciliation ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  checkResults.hasPendingReconciliation ? 'text-red-900' : 'text-green-900'
                }`}>
                  {checkResults.hasPendingReconciliation ? '存在未完成对账' : '对账已完成'}
                </p>
                {checkResults.hasPendingReconciliation && (
                  <p className="text-sm text-red-700">请先在"对账"页面完成银行对账</p>
                )}
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              checkResults.hasTaxIssues ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {checkResults.hasTaxIssues ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  checkResults.hasTaxIssues ? 'text-red-900' : 'text-green-900'
                }`}>
                  {checkResults.hasTaxIssues ? '存在税务未申报' : '税务已申报'}
                </p>
                {checkResults.hasTaxIssues && (
                  <p className="text-sm text-red-700">请先在"处理税务"页面完成税务申报</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 定期业务操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 月末结账 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">月末结账</h2>
              <p className="text-sm text-gray-500">Monthly Closing</p>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            月末结账会自动完成以下操作：
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <TrendingUp className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span>结转本月损益到本年利润</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <FileText className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span>生成本月财务报表</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <DollarSign className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span>计算各科目期末余额</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <Lock className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span>锁定账期，禁止修改</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">当前开放月份：</p>
            <div className="space-y-2">
              {openPeriods.filter(p => p.type === 'month').map(period => (
                <div key={period.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">{period.period}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheck(period.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      检查
                    </button>
                    {selectedPeriod === period.id && (
                      <button
                        onClick={() => handleClose(period.id)}
                        className="btn-primary text-sm"
                      >
                        执行结账
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 年末结账 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">年末结账</h2>
              <p className="text-sm text-gray-500">Year-end Closing</p>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            年末结账会自动完成以下操作：
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <TrendingUp className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>结转本年利润到利润分配</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <FileText className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>生成年度财务报表</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <DollarSign className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>结转所有损益类科目</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <Lock className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>归档年度账套数据</span>
            </li>
          </ul>

           <div className="pt-4 border-t border-gray-200">
             <p className="text-sm font-medium text-gray-700 mb-2">可执行年末结账：</p>
             <div className="space-y-2">
               <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                 <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-purple-600" />
                   <span className="font-medium text-gray-900">2023年度</span>
                 </div>
                 <button
                   onClick={() => {
                     if (window.confirm('确定要执行2023年度年末结账吗？\n\n这将：\n• 结转本年利润到利润分配\n• 生成年度财务报表\n• 归档年度账套数据\n• 锁定整个年度数据')) {
                       alert('✅ 2023年度年末结账成功！\n\n已完成：\n• 本年利润结转到利润分配\n• 年度财务报表已生成\n• 2023年度数据已锁定\n\n💡 提示：实际应用中会将年度数据归档到数据库。')
                     }
                   }}
                   className="btn-primary text-sm"
                 >
                   执行年末结账
                 </button>
               </div>
             </div>
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
               <div className="flex items-start gap-2">
                 <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                 <div>
                   <p className="font-medium text-amber-900">年末结账说明</p>
                   <p className="text-sm text-amber-700 mt-1">
                     年末结账前，请确保所有月份已完成结账，且企业所得税汇算清缴已完成。
                   </p>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* 已结账期间 */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">已结账期间</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期间</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">结账日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">结账人</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {closedPeriods.map(period => (
                <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {period.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {period.type === 'month' ? '月结' : '年结'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Lock className="w-3 h-3 mr-1" />
                      已结账
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {period.closedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {period.closedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleReopen(period.id)}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      重新打开
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-bold text-gray-900 mb-2">💡 结账流程提示</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• 结账前请确保所有凭证已过账、对账已完成、税务已申报</li>
          <li>• 点击"检查"按钮会自动检查结账前置条件</li>
          <li>• 结账后当期数据将被锁定，无法修改</li>
          <li>• 如需修改已结账期间数据，请先点击"重新打开"</li>
          <li>• 建议按顺序结账，不要跳过月份</li>
        </ul>
      </div>
    </div>
  )
}

