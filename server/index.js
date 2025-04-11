const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// Kết nối SQLite database
const dbPath = path.resolve(__dirname, 'phone_lookup.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không thể kết nối đến SQLite database', err);
  } else {
    console.log('Đã kết nối đến SQLite database');
    
    // Tạo bảng phones nếu chưa tồn tại
    db.run(`CREATE TABLE IF NOT EXISTS phones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE,
      name TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Tạo bảng reviews nếu chưa tồn tại
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      reviewer_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (phone_id) REFERENCES phones (id)
    )`);

    // // Thêm dữ liệu mẫu nếu bảng phones trống
    // db.get("SELECT COUNT(*) as count FROM phones", (err, row) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
      
    //   if (row.count === 0) {
    //     console.log('Thêm dữ liệu mẫu vào database...');
        
    //     // Thêm một số số điện thoại mẫu
    //     const samplePhones = [
    //       { phone_number: '0901234567', name: 'Nguyễn Văn A', address: 'Hà Nội' },
    //       { phone_number: '0912345678', name: 'Trần Thị B', address: 'TP.HCM' },
    //       { phone_number: '0923456789', name: 'Lê Văn C', address: 'Đà Nẵng' },
    //       { phone_number: '0934567890', name: 'Phạm Thị D', address: 'Cần Thơ' },
    //       { phone_number: '0945678901', name: 'Hoàng Văn E', address: 'Hải Phòng' }
    //     ];
        
    //     samplePhones.forEach(phone => {
    //       db.run(
    //         'INSERT INTO phones (phone_number, name, address) VALUES (?, ?, ?)',
    //         [phone.phone_number, phone.name, phone.address],
    //         function(err) {
    //           if (err) {
    //             console.error('Lỗi khi thêm số điện thoại:', err);
    //             return;
    //           }
              
    //           // Thêm đánh giá mẫu cho mỗi số điện thoại
    //           const phoneId = this.lastID;
    //           const reviewCount = Math.floor(Math.random() * 5) + 1; // 1-5 đánh giá
              
    //           for (let i = 0; i < reviewCount; i++) {
    //             const rating = Math.floor(Math.random() * 5) + 1; // 1-5 sao
    //             const reviewers = ['Người dùng ẩn danh', 'Khách hàng', 'Người dùng', 'Khách'];
    //             const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
    //             const comments = [
    //               'Dịch vụ tốt',
    //               'Phục vụ nhanh',
    //               'Thái độ không tốt',
    //               'Chất lượng cao',
    //               'Giá cả hợp lý',
    //               'Không hài lòng'
    //             ];
    //             const comment = comments[Math.floor(Math.random() * comments.length)];
                
    //             db.run(
    //               'INSERT INTO reviews (phone_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?)',
    //               [phoneId, rating, comment, reviewer]
    //             );
    //           }
    //         }
    //       );
    //     });
    //   }
    // });
  }
});

// API Routes

// Route lấy thông tin số điện thoại
app.get('/api/phones', (req, res) => {
  const query = req.query.q || '';
  
  if (!query) {
    return res.status(400).json({ error: 'Vui lòng nhập số điện thoại để tìm kiếm' });
  }
    // Chỉ tìm kiếm số điện thoại chính xác
  db.get(
    `SELECT * FROM phones WHERE phone_number = ?`,
    [query.trim()],
    (err, phone) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Lỗi server' });
      }
      
      // Nếu không tìm thấy số điện thoại, tạo mới
      if (!phone) {
        console.log(`Không tìm thấy số điện thoại: ${query}`, 'Tạo mới số điện thoại');
        // Chỉ tạo mới khi đây là số điện thoại hợp lệ
        if (!/^\d+$/.test(query.replace(/\D/g, ''))) {
          return res.json([]);
        }
        
        const phoneNumber = query.trim();
        db.run(
          'INSERT INTO phones (phone_number, name, address) VALUES (?, ?, ?)',
          [phoneNumber, null, null],          function(err) {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Lỗi khi tạo số điện thoại mới' });
            }
            
            // Trả về thông tin số điện thoại vừa tạo
            res.json([{
              id: this.lastID,
              phone_number: phoneNumber,
              name: null,
              address: null,
              created_at: new Date().toISOString(),
              is_new: true // Đánh dấu đây là số mới tạo
            }]);
          }
        );
      } else {
        // Trả về kết quả dưới dạng mảng để giữ nhất quán API
        res.json([phone]);
      }
    }
  );
});

// Route lấy thông tin chi tiết của một số điện thoại
app.get('/api/phones/:id', (req, res) => {
  const phoneId = req.params.id;
  
  db.get('SELECT * FROM phones WHERE id = ?', [phoneId], (err, phone) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    
    if (!phone) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin số điện thoại' });
    }
    
    // Lấy đánh giá cho số điện thoại này
    db.all('SELECT * FROM reviews WHERE phone_id = ? ORDER BY created_at DESC', [phoneId], (err, reviews) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Lỗi server' });
      }
      
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
    });
  });
});

// Route thêm số điện thoại mới
app.post('/api/phones', (req, res) => {
  const { phone_number, name, address } = req.body;
  
  if (!phone_number) {
    return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });
  }
  
  db.run(
    'INSERT INTO phones (phone_number, name, address) VALUES (?, ?, ?)',
    [phone_number, name || null, address || null],
    function(err) {
      if (err) {
        console.error(err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
        }
        return res.status(500).json({ error: 'Lỗi server' });
      }
      
      res.status(201).json({
        id: this.lastID,
        phone_number,
        name,
        address
      });
    }
  );
});

// Route thêm đánh giá mới cho số điện thoại
app.post('/api/phones/:id/reviews', (req, res) => {
  const phoneId = req.params.id;
  const { rating, comment, reviewer_name } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Đánh giá phải từ 1-5 sao' });
  }
  
  db.get('SELECT id FROM phones WHERE id = ?', [phoneId], (err, phone) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    
    if (!phone) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin số điện thoại' });
    }
    
    db.run(
      'INSERT INTO reviews (phone_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?)',
      [phoneId, rating, comment || null, reviewer_name || 'Người dùng ẩn danh'],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Lỗi server' });
        }
        
        res.status(201).json({
          id: this.lastID,
          phone_id: phoneId,
          rating,
          comment,
          reviewer_name: reviewer_name || 'Người dùng ẩn danh',
          created_at: new Date().toISOString()
        });
      }
    );
  });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Server is running' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
