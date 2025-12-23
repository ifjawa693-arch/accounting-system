import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // 简单的搜索功能：根据关键词跳转到相关页面
      const term = searchTerm.toLowerCase()
      if (term.includes('客户') || term.includes('customer')) {
        navigate('/business/customers')
      } else if (term.includes('供应商') || term.includes('supplier')) {
        navigate('/business/suppliers')
      } else if (term.includes('凭证') || term.includes('voucher')) {
        navigate('/accounting/journal-entry')
      } else if (term.includes('科目') || term.includes('account')) {
        navigate('/accounting/chart-of-accounts')
      } else {
        // 默认搜索仪表盘
        navigate('/')
      }
      setSearchTerm('')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* 搜索栏 */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索功能、客户、供应商..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </form>
      </div>
    </header>
  )
}


