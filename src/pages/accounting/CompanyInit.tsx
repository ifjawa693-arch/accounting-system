import { Building2, Save } from 'lucide-react'
import { useState } from 'react'

export default function CompanyInit() {
  const [formData, setFormData] = useState({
    companyName: '',
    scale: '',
    registeredCapital: '',
    taxNumber: '',
    legalRepresentative: '',
    address: '',
    phone: '',
    email: '',
    fiscalYearStart: '',
    accountingStandard: '',
    baseCurrency: 'CNY'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('公司信息:', formData)
    alert('企业初始化成功！')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">企业初始化</h1>
          <p className="text-gray-500 mt-1">设置企业基本信息和会计准则</p>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 企业名称 */}
          <div>
            <label className="label">企业名称 *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入企业名称"
              required
            />
          </div>

          {/* 企业规模 */}
          <div>
            <label className="label">企业规模 *</label>
            <select
              name="scale"
              value={formData.scale}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">请选择</option>
              <option value="micro">微型企业</option>
              <option value="small">小型企业</option>
              <option value="medium">中型企业</option>
              <option value="large">大型企业</option>
            </select>
          </div>

          {/* 注册资金 */}
          <div>
            <label className="label">注册资金（元）*</label>
            <input
              type="number"
              name="registeredCapital"
              value={formData.registeredCapital}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入注册资金"
              required
            />
          </div>

          {/* 税号 */}
          <div>
            <label className="label">统一社会信用代码</label>
            <input
              type="text"
              name="taxNumber"
              value={formData.taxNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入税号"
            />
          </div>

          {/* 法定代表人 */}
          <div>
            <label className="label">法定代表人</label>
            <input
              type="text"
              name="legalRepresentative"
              value={formData.legalRepresentative}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入法定代表人"
            />
          </div>

          {/* 联系电话 */}
          <div>
            <label className="label">联系电话</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入联系电话"
            />
          </div>

          {/* 电子邮箱 */}
          <div>
            <label className="label">电子邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入电子邮箱"
            />
          </div>

          {/* 会计年度开始日期 */}
          <div>
            <label className="label">会计年度开始日期 *</label>
            <input
              type="date"
              name="fiscalYearStart"
              value={formData.fiscalYearStart}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* 会计准则 */}
          <div>
            <label className="label">会计准则 *</label>
            <select
              name="accountingStandard"
              value={formData.accountingStandard}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">请选择</option>
              <option value="enterprise">企业会计准则</option>
              <option value="small">小企业会计准则</option>
              <option value="institution">事业单位会计准则</option>
            </select>
          </div>

          {/* 本位币 */}
          <div>
            <label className="label">本位币 *</label>
            <select
              name="baseCurrency"
              value={formData.baseCurrency}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="CNY">人民币（CNY）</option>
              <option value="USD">美元（USD）</option>
              <option value="EUR">欧元（EUR）</option>
              <option value="HKD">港币（HKD）</option>
            </select>
          </div>

          {/* 企业地址 */}
          <div className="md:col-span-2">
            <label className="label">企业地址</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="请输入企业地址"
            />
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button type="button" className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存企业信息
          </button>
        </div>
      </form>

      {/* 提示信息 */}
      <div className="card max-w-4xl bg-amber-50 border-amber-200">
        <h3 className="font-bold text-gray-900 mb-2">💡 温馨提示</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• 企业初始化信息将影响后续的会计处理和报表生成</li>
          <li>• 标记 * 的字段为必填项</li>
          <li>• 会计年度开始日期通常为每年1月1日</li>
          <li>• 初始化完成后，部分信息可在设置中修改</li>
        </ul>
      </div>
    </div>
  )
}


