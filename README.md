# 财务会计系统 (Accounting System)

一个现代化的企业财务会计管理系统，基于 React + TypeScript + Vite 构建。

## ✨ 功能特性

### 一、总账会计
- 📋 **企业初始化** - 设置企业基本信息和会计准则
- 📖 **管理会计科目** - 完整的会计科目体系管理
- ✍️ **做分录** - 创建和编辑会计凭证，自动借贷平衡检查
- 🔄 **过账** - 将凭证数据过账至相应账户
- ✅ **对账** - 核对账目确保账实相符
- 💰 **处理税务** - 管理增值税、所得税等税务事项
- 📅 **定期业务** - 月末结账、年末结账等定期操作
- 📊 **会计报表** - 资产负债表、利润表、现金流量表

### 二、业务管理
- 🏢 **供应商管理** - 管理供应商信息和应付账款
- 📦 **采购订单** - 创建和跟踪采购订单
- 👥 **客户管理** - 管理客户信息和应收账款
- 🧾 **销售单管理** - 创建和管理销售发票
- 👤 **员工管理** - 管理员工信息和薪资
- 💳 **费用管理** - 员工费用报销审核

## 🎨 设计特点

- **简约大气** - 采用现代化设计风格，色彩搭配专业
- **布局合理** - 左侧功能导航栏，右侧详情内容区
- **交互流畅** - 丰富的悬停效果和过渡动画
- **响应式设计** - 适配各种屏幕尺寸

## 🚀 快速开始

### 前置要求

- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
打开浏览器访问: `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录下。

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
accounting-system/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Layout.tsx      # 主布局组件
│   │   ├── Sidebar.tsx     # 侧边栏导航
│   │   └── Header.tsx      # 顶部导航栏
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── accounting/     # 总账会计模块
│   │   │   ├── CompanyInit.tsx
│   │   │   ├── ChartOfAccounts.tsx
│   │   │   ├── JournalEntry.tsx
│   │   │   ├── Posting.tsx
│   │   │   ├── Reconciliation.tsx
│   │   │   ├── TaxManagement.tsx
│   │   │   ├── PeriodicOperations.tsx
│   │   │   └── FinancialReports.tsx
│   │   └── business/       # 业务管理模块
│   │       ├── Suppliers.tsx
│   │       ├── PurchaseOrders.tsx
│   │       ├── Customers.tsx
│   │       ├── SalesInvoices.tsx
│   │       ├── Employees.tsx
│   │       └── ExpenseManagement.tsx
│   ├── App.tsx             # 应用入口
│   ├── main.tsx            # 主文件
│   └── index.css           # 全局样式
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # TailwindCSS 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目说明

## 🛠 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **React Router** - 路由管理
- **TailwindCSS** - 实用优先的 CSS 框架
- **Lucide React** - 美观的图标库

## 📝 使用说明

### 1. 企业初始化
首次使用时，请先在"企业初始化"页面填写企业基本信息，包括：
- 企业名称、规模、注册资金
- 会计年度起始日期
- 会计准则选择
- 本位币设置

### 2. 设置会计科目
在"管理会计科目"页面设置企业的会计科目体系。系统已预置常用会计科目。

### 3. 做分录
在"做分录"页面创建会计凭证：
- 选择凭证日期和类型
- 添加借贷方分录行
- 系统自动检查借贷平衡
- 保存凭证

### 4. 过账
在"过账"页面将已保存的凭证过账到各个账户。

### 5. 生成报表
在"会计报表"页面选择报表类型和日期范围，生成财务报表。

## 🎯 后续开发计划

- [ ] 数据持久化（LocalStorage/后端API）
- [ ] 用户认证和权限管理
- [ ] 多货币处理功能
- [ ] 项目(jobs)管理功能
- [ ] 报表导出功能（PDF/Excel）
- [ ] 数据备份和恢复
- [ ] 审计日志
- [ ] 移动端适配优化

## 📄 许可证

MIT License

## 👨‍💻 开发者

财务会计系统 v1.0.0

---

© 2025 财务会计系统 - 现代化企业财务管理解决方案
```


