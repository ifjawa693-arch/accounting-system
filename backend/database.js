const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'accounting.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  db.serialize(() => {
    // 客户表
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

    // 供应商表
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

    // 员工表
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

    // 会计科目表
    db.run(`CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 凭证表
    db.run(`CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      voucher_no TEXT NOT NULL UNIQUE,
      date TEXT,
      description TEXT,
      amount REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 采购订单表
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

    // 销售单表
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

    // 费用表
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

    // 税务记录表
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

    // 银行流水表
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

module.exports = db;


