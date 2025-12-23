/**
 * 财务会计系统 - 后端 API 服务器
 * 
 * 功能说明：
 * 1. 提供 RESTful API 接口给前端调用
 * 2. 处理所有业务逻辑和数据库操作
 * 3. 实现客户、供应商、员工、会计科目、凭证等管理功能
 * 
 * 技术栈：
 * - Express.js: Web 框架
 * - SQLite3: 数据库
 * - CORS: 跨域资源共享
 * - Body-parser: 解析请求体
 * 
 * 默认端口：3001
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database'); // 导入数据库实例

const app = express();
const PORT = process.env.PORT || 3001; // 端口号，优先使用环境变量

// ==================== 中间件配置 ====================

/**
 * CORS 中间件
 * 作用：允许前端跨域访问后端 API
 * 说明：开发环境前端运行在 5173 端口，后端运行在 3001 端口，需要 CORS 支持
 */
app.use(cors());

/**
 * Body-parser 中间件
 * 作用：解析请求体中的 JSON 和 URL 编码数据
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * 日志中间件
 * 作用：记录所有 API 请求，便于调试
 * 输出格式：GET /api/customers
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==================== 客户管理 API ====================

/**
 * API: GET /api/customers
 * 功能：获取所有客户列表
 * 返回：客户数组，按创建时间倒序排列
 * 
 * 响应示例：
 * [
 *   { id: 'C001', name: '客户A', contact: '张三', phone: '138xxx', ... },
 *   ...
 * ]
 */
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

/**
 * API: POST /api/customers
 * 功能：添加新客户
 * 
 * 请求体参数：
 * @param {string} id - 客户ID（前端生成）
 * @param {string} name - 客户名称（必填）
 * @param {string} contact - 联系人
 * @param {string} phone - 联系电话
 * @param {string} email - 电子邮箱
 * @param {string} address - 联系地址
 * @param {number} balance - 应收账款余额（默认0）
 * 
 * 响应示例：
 * { id: 'C001', message: '客户添加成功' }
 */
app.post('/api/customers', (req, res) => {
  const { id, name, contact, phone, email, address, balance } = req.body;
  db.run(
    'INSERT INTO customers (id, name, contact, phone, email, address, balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, contact, phone, email, address, balance || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '客户添加成功' });
      }
    }
  );
});

/**
 * API: PUT /api/customers/:id
 * 功能：更新客户信息
 * 
 * URL 参数：
 * @param {string} id - 客户ID
 * 
 * 请求体参数：
 * @param {string} name - 客户名称
 * @param {string} contact - 联系人
 * @param {string} phone - 联系电话
 * @param {string} email - 电子邮箱
 * @param {string} address - 联系地址
 * @param {number} balance - 应收账款余额
 * 
 * 响应示例：
 * { message: '客户更新成功' }
 */
app.put('/api/customers/:id', (req, res) => {
  const { name, contact, phone, email, address, balance } = req.body;
  db.run(
    'UPDATE customers SET name=?, contact=?, phone=?, email=?, address=?, balance=? WHERE id=?',
    [name, contact, phone, email, address, balance, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '客户更新成功' });
      }
    }
  );
});

/**
 * API: DELETE /api/customers/:id
 * 功能：删除客户
 * 
 * URL 参数：
 * @param {string} id - 客户ID
 * 
 * 响应示例：
 * { message: '客户删除成功' }
 */
app.delete('/api/customers/:id', (req, res) => {
  db.run('DELETE FROM customers WHERE id=?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '客户删除成功' });
    }
  });
});

// ==================== 供应商管理 API ====================

/**
 * 供应商管理 API 说明：
 * - GET /api/suppliers: 获取所有供应商
 * - POST /api/suppliers: 添加供应商
 * - PUT /api/suppliers/:id: 更新供应商
 * - DELETE /api/suppliers/:id: 删除供应商
 * 
 * 数据结构与客户管理类似，包含基本信息和应付账款余额
 */

app.get('/api/suppliers', (req, res) => {
  db.all('SELECT * FROM suppliers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/suppliers', (req, res) => {
  const { id, name, contact, phone, email, address, balance } = req.body;
  db.run(
    'INSERT INTO suppliers (id, name, contact, phone, email, address, balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, contact, phone, email, address, balance || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '供应商添加成功' });
      }
    }
  );
});

app.put('/api/suppliers/:id', (req, res) => {
  const { name, contact, phone, email, address, balance } = req.body;
  db.run(
    'UPDATE suppliers SET name=?, contact=?, phone=?, email=?, address=?, balance=? WHERE id=?',
    [name, contact, phone, email, address, balance, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '供应商更新成功' });
      }
    }
  );
});

app.delete('/api/suppliers/:id', (req, res) => {
  db.run('DELETE FROM suppliers WHERE id=?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '供应商删除成功' });
    }
  });
});

// ==================== 员工管理 API ====================

/**
 * 员工管理 API 说明：
 * - GET /api/employees: 获取所有员工
 * - POST /api/employees: 添加员工
 * - PUT /api/employees/:id: 更新员工信息
 * - DELETE /api/employees/:id: 删除员工
 * 
 * 包含员工基本信息、职位、部门、薪资等字段
 */

app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/employees', (req, res) => {
  const { id, name, position, department, phone, email, salary, join_date } = req.body;
  db.run(
    'INSERT INTO employees (id, name, position, department, phone, email, salary, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, position, department, phone, email, salary, join_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '员工添加成功' });
      }
    }
  );
});

app.put('/api/employees/:id', (req, res) => {
  const { name, position, department, phone, email, salary, join_date } = req.body;
  db.run(
    'UPDATE employees SET name=?, position=?, department=?, phone=?, email=?, salary=?, join_date=? WHERE id=?',
    [name, position, department, phone, email, salary, join_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '员工更新成功' });
      }
    }
  );
});

app.delete('/api/employees/:id', (req, res) => {
  db.run('DELETE FROM employees WHERE id=?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '员工删除成功' });
    }
  });
});

// ==================== 会计科目 API ====================

/**
 * 会计科目管理 API 说明：
 * - GET /api/accounts: 获取所有会计科目（按科目编码排序）
 * - POST /api/accounts: 添加新科目
 * - PUT /api/accounts/:id: 更新科目信息
 * - DELETE /api/accounts/:id: 删除科目
 * 
 * 会计科目是财务系统的核心，包含：
 * - code: 科目编码（如1001、2201，必须唯一）
 * - name: 科目名称（如库存现金、应付账款）
 * - type: 科目类型（asset/liability/equity/income/expense）
 * - balance: 科目余额
 */

app.get('/api/accounts', (req, res) => {
  db.all('SELECT * FROM accounts ORDER BY code', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/accounts', (req, res) => {
  const { id, code, name, type, balance } = req.body;
  db.run(
    'INSERT INTO accounts (id, code, name, type, balance) VALUES (?, ?, ?, ?, ?)',
    [id, code, name, type, balance || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '科目添加成功' });
      }
    }
  );
});

app.put('/api/accounts/:id', (req, res) => {
  const { code, name, type, balance } = req.body;
  db.run(
    'UPDATE accounts SET code=?, name=?, type=?, balance=? WHERE id=?',
    [code, name, type, balance, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '科目更新成功' });
      }
    }
  );
});

app.delete('/api/accounts/:id', (req, res) => {
  db.run('DELETE FROM accounts WHERE id=?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '科目删除成功' });
    }
  });
});

// ==================== 凭证管理 API ====================

/**
 * 凭证管理 API 说明：
 * - GET /api/vouchers: 获取所有凭证（按日期倒序）
 * - POST /api/vouchers: 创建新凭证
 * - PUT /api/vouchers/:id: 更新凭证状态（如过账）
 * - GET /api/vouchers/posted: 获取已过账凭证
 * 
 * 凭证是会计核算的基础：
 * - 每笔经济业务都要编制凭证
 * - 凭证必须借贷平衡
 * - 过账后凭证不可修改
 * 
 * 状态流转：pending（待过账） → posted（已过账）
 */

app.get('/api/vouchers', (req, res) => {
  db.all('SELECT * FROM vouchers ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

/**
 * 创建凭证
 * 
 * 重要校验：
 * - 凭证号必须唯一（voucher_no 有 UNIQUE 约束）
 * - 如果凭证号重复，返回 400 错误和友好提示
 */
app.post('/api/vouchers', (req, res) => {
  const { id, voucher_no, date, description, amount, status } = req.body;
  console.log('创建凭证请求:', { id, voucher_no, date, description, amount, status });
  
  db.run(
    'INSERT INTO vouchers (id, voucher_no, date, description, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, voucher_no, date, description, amount, status || 'pending'],
    function(err) {
      if (err) {
        console.error('凭证创建失败:', err.message);
        // 如果是唯一性约束错误，返回更友好的消息
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: '凭证号已存在，请使用不同的凭证号' });
        } else {
          res.status(500).json({ error: err.message });
        }
      } else {
        console.log('凭证创建成功:', id);
        res.json({ id, message: '凭证添加成功' });
      }
    }
  );
});

/**
 * 更新凭证状态
 * 
 * 主要用于过账操作：
 * - 将凭证状态从 'pending' 更新为 'posted'
 * - 过账后凭证数据正式生效
 */
app.put('/api/vouchers/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE vouchers SET status=? WHERE id=?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '凭证状态更新成功' });
      }
    }
  );
});

// ==================== 采购订单 API ====================
app.get('/api/purchase-orders', (req, res) => {
  db.all('SELECT * FROM purchase_orders ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/purchase-orders', (req, res) => {
  const { id, order_no, date, supplier, items, amount, status } = req.body;
  db.run(
    'INSERT INTO purchase_orders (id, order_no, date, supplier, items, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, order_no, date, supplier, items, amount, status || 'pending'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '订单添加成功' });
      }
    }
  );
});

app.put('/api/purchase-orders/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE purchase_orders SET status=? WHERE id=?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '订单状态更新成功' });
      }
    }
  );
});

// ==================== 销售单 API ====================
app.get('/api/sales-invoices', (req, res) => {
  db.all('SELECT * FROM sales_invoices ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/sales-invoices', (req, res) => {
  const { id, invoice_no, date, customer, items, amount, status } = req.body;
  db.run(
    'INSERT INTO sales_invoices (id, invoice_no, date, customer, items, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, invoice_no, date, customer, items, amount, status || 'draft'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '销售单添加成功' });
      }
    }
  );
});

app.put('/api/sales-invoices/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE sales_invoices SET status=? WHERE id=?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '销售单状态更新成功' });
      }
    }
  );
});

// ==================== 费用管理 API ====================
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/expenses', (req, res) => {
  const { id, date, employee, category, description, amount, status } = req.body;
  db.run(
    'INSERT INTO expenses (id, date, employee, category, description, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, date, employee, category, description, amount, status || 'pending'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '费用添加成功' });
      }
    }
  );
});

app.put('/api/expenses/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE expenses SET status=? WHERE id=?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '费用状态更新成功' });
      }
    }
  );
});

// ==================== 税务记录 API ====================
app.get('/api/tax-records', (req, res) => {
  db.all('SELECT * FROM tax_records ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/tax-records', (req, res) => {
  const { id, period, type, taxable_amount, tax_rate, tax_amount, status } = req.body;
  db.run(
    'INSERT INTO tax_records (id, period, type, taxable_amount, tax_rate, tax_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, period, type, taxable_amount, tax_rate, tax_amount, status || 'pending'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '税务记录添加成功' });
      }
    }
  );
});

app.put('/api/tax-records/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE tax_records SET status=? WHERE id=?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '税务状态更新成功' });
      }
    }
  );
});

// ==================== 银行流水 API ====================
// 获取所有银行流水
app.get('/api/bank-records', (req, res) => {
  db.all('SELECT * FROM bank_records ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows.map(row => ({
        ...row,
        matched: Boolean(row.matched)
      })));
    }
  });
});

// 创建银行流水
app.post('/api/bank-records', (req, res) => {
  const { id, date, description, amount, type } = req.body;
  db.run(
    'INSERT INTO bank_records (id, date, description, amount, type, matched) VALUES (?, ?, ?, ?, ?, 0)',
    [id, date, description, amount, type],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, message: '银行流水添加成功' });
      }
    }
  );
});

// 更新银行流水匹配状态
app.put('/api/bank-records/:id/match', (req, res) => {
  const { matched, matched_voucher_id } = req.body;
  db.run(
    'UPDATE bank_records SET matched=?, matched_voucher_id=? WHERE id=?',
    [matched ? 1 : 0, matched_voucher_id || null, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: '匹配状态更新成功' });
      }
    }
  );
});

// 删除银行流水
app.delete('/api/bank-records/:id', (req, res) => {
  db.run('DELETE FROM bank_records WHERE id=?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: '银行流水删除成功' });
    }
  });
});

// 获取已过账凭证（用于账簿记录）
app.get('/api/vouchers/posted', (req, res) => {
  db.all(
    'SELECT * FROM vouchers WHERE status=? ORDER BY date DESC',
    ['posted'],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows.map(row => ({
          ...row,
          lines: JSON.parse(row.lines || '[]')
        })));
      }
    }
  );
});

// 内部对账检查（检查借贷是否平衡）
app.get('/api/reconciliation/internal-check', (req, res) => {
  db.all(
    `SELECT 
      v.id,
      v.voucher_no,
      v.date,
      v.description,
      v.amount,
      v.lines
    FROM vouchers v
    WHERE v.status = 'posted'
    ORDER BY v.date DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const issues = [];
        rows.forEach(row => {
          const lines = JSON.parse(row.lines || '[]');
          const debitTotal = lines.filter(l => l.type === 'debit').reduce((sum, l) => sum + (l.amount || 0), 0);
          const creditTotal = lines.filter(l => l.type === 'credit').reduce((sum, l) => sum + (l.amount || 0), 0);
          if (Math.abs(debitTotal - creditTotal) > 0.01) {
            issues.push({
              voucher_no: row.voucher_no,
              date: row.date,
              description: row.description,
              debitTotal,
              creditTotal,
              difference: debitTotal - creditTotal
            });
          }
        });
        res.json({
          totalVouchers: rows.length,
          balancedVouchers: rows.length - issues.length,
          unbalancedVouchers: issues.length,
          issues
        });
      }
    }
  );
});

// ==================== 健康检查 API ====================

/**
 * API: GET /api/health
 * 功能：健康检查端点
 * 
 * 说明：
 * - 用于检查后端服务是否正常运行
 * - 可用于监控系统或负载均衡器的健康检查
 * 
 * 响应示例：
 * { status: 'ok', message: '后端服务运行正常' }
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '后端服务运行正常' });
});

// ==================== 启动服务器 ====================

/**
 * 启动 Express 服务器
 * 
 * 说明：
 * - 监听指定端口（默认 3001）
 * - 打印服务器信息和可用的 API 端点
 * - 支持开发环境和生产环境
 */
app.listen(PORT, () => {
  console.log(`\n🚀 后端服务器启动成功！`);
  console.log(`📡 API地址: http://localhost:${PORT}`);
  console.log(`💾 数据库: SQLite (accounting.db)`);
  console.log(`\n可用的API端点:`);
  console.log(`  - GET  /api/customers`);
  console.log(`  - POST /api/customers`);
  console.log(`  - GET  /api/suppliers`);
  console.log(`  - GET  /api/employees`);
  console.log(`  ... 更多端点请查看server.js\n`);
});

// ==================== 优雅关闭 ====================

/**
 * 处理进程终止信号（Ctrl+C）
 * 
 * 说明：
 * - 捕获 SIGINT 信号（通常是 Ctrl+C）
 * - 关闭数据库连接，防止数据损坏
 * - 优雅退出进程
 * 
 * 重要性：确保数据完整性，避免数据库文件锁定
 */
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('❌ 数据库关闭失败:', err.message);
    }
    console.log('✅ 数据库连接已关闭');
    console.log('👋 服务器已停止');
    process.exit(0);
  });
});


