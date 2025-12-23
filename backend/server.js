const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==================== 客户管理 API ====================
// 获取所有客户
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 添加客户
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

// 更新客户
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

// 删除客户
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
app.get('/api/vouchers', (req, res) => {
  db.all('SELECT * FROM vouchers ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '后端服务运行正常' });
});

// 启动服务器
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

// 优雅关闭
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('数据库连接已关闭');
    process.exit(0);
  });
});


