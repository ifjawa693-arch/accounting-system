/**
 * 模态框组件
 * 
 * 功能说明：
 * 1. 提供弹窗功能，用于显示表单、详情等内容
 * 2. 支持多种尺寸（sm、md、lg、xl）
 * 3. 点击遮罩层或关闭按钮可关闭弹窗
 * 4. 打开时禁止页面滚动
 * 
 * 使用示例：
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="添加客户">
 *   <form>...</form>
 * </Modal>
 * 
 * Props 说明：
 * @param isOpen - 是否显示模态框
 * @param onClose - 关闭回调函数
 * @param title - 模态框标题
 * @param children - 模态框内容
 * @param size - 模态框尺寸（默认 md）
 */

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean      // 是否显示
  onClose: () => void  // 关闭回调
  title: string        // 标题
  children: React.ReactNode  // 内容
  size?: 'sm' | 'md' | 'lg' | 'xl'  // 尺寸
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  /**
   * 副作用：控制页面滚动
   * 
   * 说明：
   * - 模态框打开时，禁止页面滚动（防止背景内容滚动）
   * - 模态框关闭时，恢复页面滚动
   * - 组件卸载时，确保恢复页面滚动
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'  // 禁止滚动
    } else {
      document.body.style.overflow = 'unset'   // 恢复滚动
    }
    return () => {
      document.body.style.overflow = 'unset'   // 清理：恢复滚动
    }
  }, [isOpen])

  // 未打开时不渲染
  if (!isOpen) return null

  // 尺寸样式映射
  const sizeClasses = {
    sm: 'max-w-md',    // 小：最大宽度 448px
    md: 'max-w-2xl',   // 中：最大宽度 672px
    lg: 'max-w-4xl',   // 大：最大宽度 896px
    xl: 'max-w-6xl'    // 超大：最大宽度 1152px
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩：半透明黑色，点击关闭模态框 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* 模态框容器：居中显示 */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* 模态框内容：阻止点击事件冒泡，避免点击内容时关闭 */}
        <div 
          className={`relative bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部：标题和关闭按钮 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容区：可滚动，最大高度 90vh - 头部高度 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}


