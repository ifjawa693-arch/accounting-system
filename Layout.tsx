/**
 * 主布局组件
 * 
 * 功能说明：
 * 1. 定义应用的整体布局结构
 * 2. 左侧边栏 + 右侧内容区的经典布局
 * 3. 使用 React Router 的 Outlet 渲染子路由页面
 * 
 * 布局结构：
 * ┌─────────────────────────────────┐
 * │ Sidebar │ Header                │
 * │         ├───────────────────────┤
 * │         │                       │
 * │         │  Main Content         │
 * │         │  (Outlet)             │
 * │         │                       │
 * └─────────────────────────────────┘
 * 
 * 技术要点：
 * - 使用 Flexbox 布局，确保响应式
 * - h-screen: 占满整个屏幕高度
 * - overflow-hidden: 防止整体滚动
 * - overflow-y-auto: 仅内容区可滚动
 */

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏：固定宽度，包含导航菜单 */}
      <Sidebar />
      
      {/* 主内容区：flex-1 占据剩余空间 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏：包含搜索、通知、用户信息 */}
        <Header />
        
        {/* 详情内容区：显示各个页面的内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Outlet: React Router 插槽，渲染当前路由对应的页面组件 */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


