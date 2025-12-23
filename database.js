/**
 * 数据库配置模块
 * 
 * 功能说明：
 * 1. 创建并配置 SQLite 数据库连接
 * 2. 初始化所有业务数据表
 * 3. 为其他模块提供数据库实例
 * 
 * 使用的数据库：SQLite3（轻量级、无需独立服务器、适合中小型应用）
 * 数据库文件位置：backend/accounting.db
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ==================== 数据库连接配置 ====================

/**
 * 数据库文件路径
 * 使用 path.join 确保跨平台兼容性
 */
const dbPath = path.join(__dirname, 'accounting.db');

/**
 * 创建数据库连接实例
 * 
 * @param {string} dbPath - 数据库文件路径
 * @param {function} callback - 连接成功/失败的回调函数
 * 
 * 说明：
 * - 如果数据库文件不存在，SQLite 会自动创建
 * - 连接成功后自动调用 initDatabase() 初始化表结构
 */
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
    initDatabase();
  }
});

// ==================== 数据库表初始化 ====================

/**
 * 初始化所有数据表
 * 
 * 说明：
 * - db.serialize() 确保所有 SQL 语句按顺序执行
 * - CREATE TABLE IF NOT EXISTS 确保表不存在时才创建，避免重复创建错误
 * - 所有表都包含 created_at 字段，记录数据创建时间
 */
function initDatabase() {
  db.serialize(() => {
    // ========== 客户表 (customers) ==========
    /**
     * 客户信息表
     * 
     * 字段说明：
     * - id: 客户唯一标识（主键）
     * - name: 客户名称（必填）
     * - contact: 联系人姓名
     * - phone: 联系电话
     * - email: 电子邮箱
     * - address: 联系地址
     * - balance: 应收账款余额（默认0）
     * - created_at: 创建时间（自动生成）
     */
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 供应商表 (suppliers) ==========
    /**
     * 供应商信息表
     * 
     * 字段说明：
     * - id: 供应商唯一标识（主键）
     * - name: 供应商名称（必填）
     * - contact: 联系人姓名
     * - phone: 联系电话
     * - email: 电子邮箱
     * - address: 联系地址
     * - balance: 应付账款余额（默认0）
     * - created_at: 创建时间（自动生成）
     */
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 员工表 (employees) ==========
    /**
     * 员工信息表
     * 
     * 字段说明：
     * - id: 员工唯一标识（主键）
     * - name: 员工姓名（必填）
     * - position: 职位
     * - department: 部门
     * - phone: 联系电话
     * - email: 电子邮箱
     * - salary: 薪资
     * - join_date: 入职日期
     * - created_at: 创建时间（自动生成）
     */
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT,
      department TEXT,
      phone TEXT,
      email TEXT,
      salary REAL,
      join_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 会计科目表 (accounts) ==========
    /**
     * 会计科目表（Chart of Accounts）
     * 
     * 字段说明：
     * - id: 科目唯一标识（主键）
     * - code: 科目编码（必填，唯一，如：1001、2201）
     * - name: 科目名称（必填，如：库存现金、应付账款）
     * - type: 科目类型（asset资产/liability负债/equity权益/income收入/expense费用）
     * - balance: 科目余额（默认0）
     * - created_at: 创建时间（自动生成）
     * 
     * 说明：code 字段有 UNIQUE 约束，确保科目编码不重复
     */
    db.run(`CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 凭证表 (vouchers) ==========
    /**
     * 会计凭证表（Journal Vouchers）
     * 
     * 字段说明：
     * - id: 凭证唯一标识（主键）
     * - voucher_no: 凭证号（必填，唯一，如：2024-001）
     * - date: 凭证日期
     * - description: 摘要说明
     * - amount: 凭证金额
     * - status: 凭证状态（pending待过账/posted已过账）
     * - created_at: 创建时间（自动生成）
     * 
     * 说明：voucher_no 字段有 UNIQUE 约束，确保凭证号不重复
     */
    db.run(`CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      voucher_no TEXT NOT NULL UNIQUE,
      date TEXT,
      description TEXT,
      amount REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 采购订单表 (purchase_orders) ==========
    /**
     * 采购订单表
     * 
     * 字段说明：
     * - id: 订单唯一标识（主键）
     * - order_no: 订单号（必填，唯一，如：PO-001）
     * - date: 订单日期
     * - supplier: 供应商名称
     * - items: 采购项目（JSON 格式存储）
     * - amount: 订单总金额
     * - status: 订单状态（pending待审批/approved已审批/completed已完成）
     * - created_at: 创建时间（自动生成）
     * 
     * 说明：order_no 字段有 UNIQUE 约束，确保订单号不重复
     */
    db.run(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      date TEXT,
      supplier TEXT,
      items TEXT,
      amount REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 销售单表 (sales_invoices) ==========
    /**
     * 销售发票表
     * 
     * 字段说明：
     * - id: 发票唯一标识（主键）
     * - invoice_no: 发票号（必填，唯一，如：SI-001）
     * - date: 发票日期
     * - customer: 客户名称
     * - items: 销售项目（JSON 格式存储）
     * - amount: 发票总金额
     * - status: 发票状态（draft草稿/paid已收款）
     * - created_at: 创建时间（自动生成）
     * 
     * 说明：invoice_no 字段有 UNIQUE 约束，确保发票号不重复
     */
    db.run(`CREATE TABLE IF NOT EXISTS sales_invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT NOT NULL UNIQUE,
      date TEXT,
      customer TEXT,
      items TEXT,
      amount REAL,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 费用报销表 (expenses) ==========
    /**
     * 员工费用报销表
     * 
     * 字段说明：
     * - id: 费用唯一标识（主键）
     * - date: 费用发生日期
     * - employee: 报销员工姓名
     * - category: 费用类别（差旅费/办公费/业务招待费等）
     * - description: 费用说明
     * - amount: 费用金额
     * - status: 审批状态（pending待审批/approved已批准/rejected已拒绝）
     * - created_at: 创建时间（自动生成）
     */
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT,
      employee TEXT,
      category TEXT,
      description TEXT,
      amount REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 税务记录表 (tax_records) ==========
    /**
     * 税务记录表
     * 
     * 字段说明：
     * - id: 税务记录唯一标识（主键）
     * - period: 税务期间（如：2024-01）
     * - type: 税种（增值税/所得税/印花税等）
     * - taxable_amount: 计税金额
     * - tax_rate: 税率（如：0.13 表示 13%）
     * - tax_amount: 应纳税额
     * - status: 申报状态（pending待申报/declared已申报/paid已缴纳）
     * - created_at: 创建时间（自动生成）
     */
    db.run(`CREATE TABLE IF NOT EXISTS tax_records (
      id TEXT PRIMARY KEY,
      period TEXT,
      type TEXT,
      taxable_amount REAL,
      tax_rate REAL,
      tax_amount REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ========== 银行流水表 (bank_records) ==========
    /**
     * 银行流水记录表（用于银行对账）
     * 
     * 字段说明：
     * - id: 流水唯一标识（主键）
     * - date: 交易日期
     * - description: 交易说明
     * - amount: 交易金额
     * - type: 交易类型（income收入/expense支出）
     * - matched: 是否已匹配（0未匹配/1已匹配）
     * - matched_voucher_id: 匹配的凭证ID
     * - created_at: 创建时间（自动生成）
     * 
     * 说明：用于手动输入银行流水，与系统凭证进行对账
     */
    db.run(`CREATE TABLE IF NOT EXISTS bank_records (
      id TEXT PRIMARY KEY,
      date TEXT,
      description TEXT,
      amount REAL,
      type TEXT,
      matched BOOLEAN DEFAULT 0,
      matched_voucher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ 数据库表初始化完成');
  });
}

// ==================== 导出数据库实例 ====================

/**
 * 导出数据库连接实例
 * 
 * 说明：
 * - 其他模块通过 require('./database') 获取数据库实例
 * - 可直接使用 db.run()、db.get()、db.all() 等方法操作数据库
 * 
 * 常用方法：
 * - db.run(sql, params, callback): 执行 INSERT、UPDATE、DELETE 等操作
 * - db.get(sql, params, callback): 查询单行数据
 * - db.all(sql, params, callback): 查询多行数据
 * - db.serialize(callback): 按顺序执行多个 SQL 语句
 */
module.exports = db;


