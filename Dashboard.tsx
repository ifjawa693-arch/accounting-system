/**
 * 仪表盘页面
 * 
 * 功能说明：
 * 1. 显示系统的核心统计数据（会计科目、凭证、订单、客户数量）
 * 2. 提供快速操作入口（做分录、过账、查看客户、管理订单）
 * 3. 展示最近交易记录
 * 
 * 数据来源：
 * - 统计数据：从后端 API 动态加载
 * - 实时更新：页面加载时自动获取最新数据
 * 
 * 页面结构：
 * - 顶部：统计卡片（4个关键指标）
 * - 中间：快速操作按钮（常用功能入口）
 * - 底部：最近交易列表（最新的业务活动）
 */

import { TrendingUp, DollarSign, ShoppingCart, Users, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { accountAPI, voucherAPI, purchaseOrderAPI, customerAPI } from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // 状态：统计数据
  const [accountCount, setAccountCount] = useState(0)        // 会计科目数量
  const [voucherCount, setVoucherCount] = useState(0)        // 已过账凭证数量
  const [pendingOrderCount, setPendingOrderCount] = useState(0)  // 待处理订单数量
  const [customerCount, setCustomerCount] = useState(0)      // 客户数量

  /**
   * 副作用：加载统计数据
   * 
   * 说明：
   * - 组件挂载时自动加载
   * - 使用 Promise.all 并行请求多个 API，提高性能
   * - 统计已过账凭证和待处理订单
   */
  useEffect(() => {
    loadStats()
  }, [])

  /**
   * 加载统计数据
   * 
   * 功能：
   * - 并行请求4个 API 获取数据
   * - 过滤已过账凭证和待处理订单
   * - 更新状态，触发页面重新渲染
   */
  const loadStats = async () => {
    try {
      // 并行请求多个 API，提高加载速度
      const [accounts, vouchers, orders, customers] = await Promise.all([
        accountAPI.getAll(),
        voucherAPI.getAll(),
        purchaseOrderAPI.getAll(),
        customerAPI.getAll()
      ])
      
      // 设置统计数据
      setAccountCount(accounts.length)
      setVoucherCount(vouchers.filter((v: any) => v.status === 'posted').length)  // 只统计已过账凭证
      setPendingOrderCount(orders.filter((o: any) => o.status === 'pending').length)  // 只统计待处理订单
      setCustomerCount(customers.length)
    } catch (error) {
      console.error('❌ 加载统计数据失败:', error)
    }
  }

  const stats = [
    {
      label: '会计科目',
      value: accountCount.toString(),
      change: '个科目',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      label: '已过账凭证',
      value: voucherCount.toString(),
      change: '张凭证',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      label: '待处理订单',
      value: pendingOrderCount.toString(),
      change: '个订单',
      trend: 'up',
      icon: <ShoppingCart className="w-6 h-6" />
    },
    {
      label: '客户数量',
      value: customerCount.toString(),
      change: '个客户',
      trend: 'up',
      icon: <Users className="w-6 h-6" />
    }
  ]

  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    loadRecentTransactions()
  }, [])

  const loadRecentTransactions = async () => {
    try {
      const vouchers = await voucherAPI.getAll()
      const recent = vouchers
        .filter((v: any) => v.status === 'posted')
        .slice(0, 4)
        .map((v: any, index: number) => ({
          id: v.id,
          date: v.date,
          description: v.description,
          amount: (index % 2 === 0 ? '+' : '-') + '¥' + v.amount.toLocaleString(),
          type: index % 2 === 0 ? 'income' : 'expense'
        }))
      setRecentTransactions(recent)
    } catch (error) {
      console.error('加载最近交易失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-2">欢迎回来，这是您企业财务的概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">vs 上月</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近交易 */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">最近交易</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              查看全部
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <span className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无交易记录</p>
                <p className="text-sm mt-2">开始创建分录并过账后，交易记录会显示在这里</p>
              </div>
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">快速操作</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/accounting/journal-entry')}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              新建分录
            </button>
            <button 
              onClick={() => navigate('/business/customers')}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              添加客户
            </button>
            <button 
              onClick={() => navigate('/business/purchase-orders')}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              创建订单
            </button>
            <button 
              onClick={() => navigate('/accounting/reports')}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              查看报表
            </button>
          </div>
        </div>
      </div>

      {/* 待办事项提醒 */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">待办事项</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                {pendingOrderCount}笔采购订单待审核
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                {accountCount}个会计科目已创建
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                {customerCount}个客户档案
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

