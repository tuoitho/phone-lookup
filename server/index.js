const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// Cấu hình kết nối MSSQL
const sqlConfig = {
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  server: process.env.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for Azure
    trustServerCertificate: true // Chỉ dùng cho development
  }
};


// Khởi tạo kết nối tới MSSQL và thiết lập cấu trúc database
let pool;

async function setupDatabase() {
  try {
    // Tạo kết nối pool đến SQL Server
    pool = await sql.connect(sqlConfig);
    console.log('Đã kết nối thành công đến SQL Server');
    
    // Tạo các bảng nếu chưa tồn tại
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='phones' AND xtype='U')
      CREATE TABLE phones (
        id INT PRIMARY KEY IDENTITY(1,1),
        phone_number VARCHAR(20) UNIQUE,
        name NVARCHAR(100),
        address NVARCHAR(255),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reviews' AND xtype='U')
      CREATE TABLE reviews (
        id INT PRIMARY KEY IDENTITY(1,1),
        phone_id INT,
        rating INT CHECK(rating >= 1 AND rating <= 5),
        comment NVARCHAR(MAX),
        reviewer_name NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (phone_id) REFERENCES phones(id)
      )
    `);
    
    console.log('Các bảng đã được tạo hoặc đã tồn tại');
    return pool;
  } catch (err) {
    console.error('Lỗi khi thiết lập database:', err);
    throw err;
  }
}

// Khởi tạo database trước khi server bắt đầu lắng nghe
async function initializeDatabase() {
  try {
    await setupDatabase();
    console.log('Database đã được khởi tạo thành công');
  } catch (err) {
    console.error('Không thể khởi tạo database:', err);
    process.exit(1); // Thoát nếu không thể kết nối đến database
  }
}
// API Routes

// Route lấy thông tin số điện thoại
app.get('/api/phones', async (req, res) => {
  const query = req.query.q || '';

  if (!query) {
    return res.status(400).json({ error: 'Vui lòng nhập số điện thoại để tìm kiếm' });
  }

  try {
    // Chỉ tìm kiếm số điện thoại chính xác
    const result = await pool.request()
      .input('phone', sql.VarChar(20), query.trim())
      .query('SELECT * FROM phones WHERE phone_number = @phone');
    
    // Nếu không tìm thấy số điện thoại, tạo mới
    if (result.recordset.length === 0) {
      console.log(`Không tìm thấy số điện thoại: ${query}`, 'Tạo mới số điện thoại');
      // Chỉ tạo mới khi đây là số điện thoại hợp lệ
      if (!/^\d+$/.test(query.replace(/\D/g, ''))) {
        return res.json([]);
      }
      
      const phoneNumber = query.trim();
      
      try {
        // Thêm số điện thoại mới
        const insertResult = await pool.request()
          .input('phone', sql.VarChar(20), phoneNumber)
          .query(`
            INSERT INTO phones (phone_number, name, address)
            OUTPUT INSERTED.*
            VALUES (@phone, NULL, NULL)
          `);
        
        const newPhone = insertResult.recordset[0];
        
        // Trả về thông tin số điện thoại vừa tạo
        res.json([{
          ...newPhone,
          is_new: true // Đánh dấu đây là số mới tạo
        }]);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Lỗi khi tạo số điện thoại mới' });
      }
    } else {
      // Trả về kết quả dưới dạng mảng để giữ nhất quán API
      res.json(result.recordset);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route lấy thông tin chi tiết của một số điện thoại
app.get('/api/phones/:id', async (req, res) => {
  const phoneId = req.params.id;

  try {
    // Lấy thông tin số điện thoại
    const phoneResult = await pool.request()
      .input('id', sql.Int, phoneId)
      .query('SELECT * FROM phones WHERE id = @id');

    if (phoneResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin số điện thoại' });
    }

    const phone = phoneResult.recordset[0];

    // Lấy đánh giá cho số điện thoại này
    const reviewsResult = await pool.request()
      .input('phoneId', sql.Int, phoneId)
      .query('SELECT * FROM reviews WHERE phone_id = @phoneId ORDER BY created_at DESC');

    const reviews = reviewsResult.recordset;

    // Tính trung bình đánh giá
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      avgRating = sum / reviews.length;
    }

    res.json({
      ...phone,
      reviews,
      avgRating
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route thêm số điện thoại mới
app.post('/api/phones', async (req, res) => {
  const { phone_number, name, address } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });
  }

  try {
    // Thêm số điện thoại mới và trả về thông tin được thêm
    const result = await pool.request()
      .input('phone', sql.VarChar(20), phone_number)
      .input('name', sql.NVarChar(100), name || null)
      .input('address', sql.NVarChar(255), address || null)
      .query(`
        INSERT INTO phones (phone_number, name, address)
        OUTPUT INSERTED.*
        VALUES (@phone, @name, @address)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    // Kiểm tra nếu lỗi là do trùng số điện thoại
    if (err.number === 2627 || err.number === 2601) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
    }
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route thêm đánh giá mới cho số điện thoại
app.post('/api/phones/:id/reviews', async (req, res) => {
  const phoneId = req.params.id;
  const { rating, comment, reviewer_name } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Đánh giá phải từ 1-5 sao' });
  }

  try {
    // Kiểm tra xem số điện thoại có tồn tại không
    const phoneResult = await pool.request()
      .input('id', sql.Int, phoneId)
      .query('SELECT id FROM phones WHERE id = @id');

    if (phoneResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin số điện thoại' });
    }

    // Thêm đánh giá mới
    const reviewerNameValue = reviewer_name || 'Người dùng ẩn danh';
    
    const result = await pool.request()
      .input('phoneId', sql.Int, phoneId)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar(sql.MAX), comment || null)
      .input('reviewerName', sql.NVarChar(100), reviewerNameValue)
      .query(`
        INSERT INTO reviews (phone_id, rating, comment, reviewer_name)
        OUTPUT INSERTED.*
        VALUES (@phoneId, @rating, @comment, @reviewerName)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Server is running' });
});

// Khởi tạo database và sau đó khởi động server
(async () => {
  try {
    // Đảm bảo database được khởi tạo trước khi server bắt đầu
    await initializeDatabase();
    
    // Khởi động server sau khi database đã sẵn sàng
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Không thể khởi động server:', err);
    process.exit(1);
  }
})();
