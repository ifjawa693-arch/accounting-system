import { BarChart3, FileText, Download } from 'lucide-react'
import { useState } from 'react'

export default function FinancialReports() {
  const [selectedReport, setSelectedReport] = useState('balance-sheet')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const reports = [
    { id: 'balance-sheet', name: '资产负债表', icon: <FileText className="w-5 h-5" /> },
    { id: 'income-statement', name: '利润表', icon: <FileText className="w-5 h-5" /> },
    { id: 'cash-flow', name: '现金流量表', icon: <FileText className="w-5 h-5" /> },
  ]

  // 示例数据：资产负债表
  const balanceSheetData = {
    assets: [
      { name: '流动资产', items: [
        { name: '货币资金', amount: 550000 },
        { name: '应收账款', amount: 120000 },
        { name: '存货', amount: 300000 },
      ]},
      { name: '非流动资产', items: [
        { name: '固定资产', amount: 500000 },
        { name: '无形资产', amount: 100000 },
      ]}
    ],
    liabilities: [
      { name: '流动负债', items: [
        { name: '短期借款', amount: 200000 },
        { name: '应付账款', amount: 150000 },
      ]},
      { name: '非流动负债', items: [
        { name: '长期借款', amount: 300000 },
      ]}
    ],
    equity: [
      { name: '实收资本', amount: 1000000 },
      { name: '未分配利润', amount: 20000 },
    ]
  }

  const totalAssets = 1570000
  const totalLiabilities = 650000
  const totalEquity = 1020000

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">财务报表</h1>
            <p className="text-gray-500 mt-1">查看和导出企业财务报表</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出报表
        </button>
      </div>

      {/* 报表选择和筛选 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">报表类型</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input-field"
            >
              {reports.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full">生成报表</button>
          </div>
        </div>
      </div>

      {/* 资产负债表 */}
      {selectedReport === 'balance-sheet' && (
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">资产负债表</h2>
            <p className="text-gray-500 mt-1">Balance Sheet</p>
            <p className="text-sm text-gray-500 mt-1">截至 2024年1月31日</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 资产 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                资产 Assets
              </h3>
              {balanceSheetData.assets.map((section, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-semibold text-gray-900 mb-2">{section.name}</p>
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex justify-between py-1.5 px-2 hover:bg-gray-50">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium">¥{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-between py-3 px-2 mt-4 bg-primary-50 font-bold text-primary-900 rounded-lg">
                <span>资产总计</span>
                <span>¥{totalAssets.toLocaleString()}</span>
              </div>
            </div>

            {/* 负债和所有者权益 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                负债及所有者权益 Liabilities & Equity
              </h3>
              
              <div className="mb-6">
                <p className="font-semibold text-gray-900 mb-2">负债</p>
                {balanceSheetData.liabilities.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">{section.name}</p>
                    {section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between py-1.5 px-2 hover:bg-gray-50">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium">¥{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="flex justify-between py-2 px-2 mt-2 bg-gray-100 font-semibold">
                  <span>负债合计</span>
                  <span>¥{totalLiabilities.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-900 mb-2">所有者权益</p>
                {balanceSheetData.equity.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 px-2 hover:bg-gray-50">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium">¥{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-2 mt-2 bg-gray-100 font-semibold">
                  <span>所有者权益合计</span>
                  <span>¥{totalEquity.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between py-3 px-2 mt-4 bg-primary-50 font-bold text-primary-900 rounded-lg">
                <span>负债及所有者权益总计</span>
                <span>¥{(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 利润表 */}
      {selectedReport === 'income-statement' && (
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">利润表</h2>
            <p className="text-gray-500 mt-1">Income Statement</p>
            <p className="text-sm text-gray-500 mt-1">2024年1月</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>一、营业收入</span>
                <span className="font-medium">¥800,000</span>
              </div>
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>减：营业成本</span>
                <span className="font-medium">¥400,000</span>
              </div>
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>减：税金及附加</span>
                <span className="font-medium">¥20,000</span>
              </div>
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>减：销售费用</span>
                <span className="font-medium">¥50,000</span>
              </div>
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>减：管理费用</span>
                <span className="font-medium">¥80,000</span>
              </div>
              <div className="flex justify-between py-3 px-2 mt-4 bg-green-50 font-bold text-green-900 rounded-lg">
                <span>二、营业利润</span>
                <span>¥250,000</span>
              </div>
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>加：营业外收入</span>
                <span className="font-medium">¥10,000</span>
              </div>
              <div className="flex justify-between py-2 px-2 hover:bg-gray-50">
                <span>减：营业外支出</span>
                <span className="font-medium">¥5,000</span>
              </div>
              <div className="flex justify-between py-3 px-2 mt-4 bg-primary-50 font-bold text-primary-900 rounded-lg">
                <span>三、利润总额</span>
                <span>¥255,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 现金流量表 */}
      {selectedReport === 'cash-flow' && (
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">现金流量表</h2>
            <p className="text-gray-500 mt-1">Cash Flow Statement</p>
            <p className="text-sm text-gray-500 mt-1">2024年1月</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-gray-900 mb-2">一、经营活动产生的现金流量</p>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between py-1.5 hover:bg-gray-50 px-2">
                    <span>销售商品、提供劳务收到的现金</span>
                    <span>¥850,000</span>
                  </div>
                  <div className="flex justify-between py-1.5 hover:bg-gray-50 px-2">
                    <span>购买商品、接受劳务支付的现金</span>
                    <span>(¥450,000)</span>
                  </div>
                  <div className="flex justify-between py-1.5 hover:bg-gray-50 px-2">
                    <span>支付给职工的现金</span>
                    <span>(¥120,000)</span>
                  </div>
                  <div className="flex justify-between py-2 px-2 mt-2 bg-blue-50 font-semibold text-blue-900">
                    <span>经营活动现金流量净额</span>
                    <span>¥280,000</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-bold text-gray-900 mb-2">二、投资活动产生的现金流量</p>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between py-1.5 hover:bg-gray-50 px-2">
                    <span>购建固定资产支付的现金</span>
                    <span>(¥50,000)</span>
                  </div>
                  <div className="flex justify-between py-2 px-2 mt-2 bg-blue-50 font-semibold text-blue-900">
                    <span>投资活动现金流量净额</span>
                    <span>(¥50,000)</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-900 mb-2">三、筹资活动产生的现金流量</p>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between py-1.5 hover:bg-gray-50 px-2">
                    <span>吸收投资收到的现金</span>
                    <span>¥0</span>
                  </div>
                  <div className="flex justify-between py-2 px-2 mt-2 bg-blue-50 font-semibold text-blue-900">
                    <span>筹资活动现金流量净额</span>
                    <span>¥0</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-3 px-2 mt-4 bg-primary-50 font-bold text-primary-900 rounded-lg">
                <span>四、现金及现金等价物净增加额</span>
                <span>¥230,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


