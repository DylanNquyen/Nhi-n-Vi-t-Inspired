# NVI Live Chat System - Hướng dẫn cài đặt

## Tổng quan
Hệ thống chat trực tuyến 24/7 cho website NVI với các tính năng:
- ✅ Chat widget nổi trên website
- ✅ Modal chat đẹp mắt với UI hiện đại
- ✅ Hệ thống admin quản lý cuộc trò chuyện
- ✅ Real-time messaging với WebSocket
- ✅ Lưu trữ lịch sử chat
- ✅ Typing indicators
- ✅ Thông báo tin nhắn mới
- ✅ Responsive design
- ✅ Offline mode với bot tự động

## Cấu trúc files

```
/workspace/
├── index.html              # Trang chính với chat widget
├── admin.html              # Panel admin quản lý chat
├── chat-server.js          # Server WebSocket
├── package.json            # Dependencies
├── assets/
│   ├── css/
│   │   └── style.css       # CSS đã có chat styles
│   └── js/
│       ├── main.js         # JS gốc
│       └── chat.js         # Chat functionality (MỚI)
└── CHAT_SETUP.md          # File này
```

## Cài đặt

### Bước 1: Cài đặt Node.js dependencies
```bash
npm install
```

### Bước 2: Khởi động server chat
```bash
# Chế độ production
npm start

# Hoặc chế độ development (auto-restart)
npm run dev
```

Server sẽ chạy trên: http://localhost:3000

### Bước 3: Mở website
Mở `index.html` trong browser và bạn sẽ thấy:
- Nút chat nổi ở góc phải dưới
- Click vào để mở modal chat

### Bước 4: Truy cập admin panel
1. Mở `admin.html` trong browser
2. Đăng nhập với mật khẩu: `nvi_admin_2024`
3. Quản lý cuộc trò chuyện với khách hàng

## Tính năng chính

### Cho khách hàng:
- **Chat widget nổi**: Nút chat màu gradient bắt mắt
- **Modal chat đẹp**: Thiết kế hiện đại với header có logo
- **Real-time messaging**: Tin nhắn tức thời khi admin online
- **Offline mode**: Bot tự động trả lời khi admin offline
- **Typing indicator**: Hiển thị khi admin đang gõ
- **Quick actions**: Nút yêu cầu gọi lại, gửi email
- **Chat history**: Lưu lịch sử chat trong localStorage
- **Responsive**: Hoạt động tốt trên mobile

### Cho admin:
- **Dashboard quản lý**: Giao diện admin chuyên nghiệp
- **Danh sách cuộc trò chuyện**: Xem tất cả customer đang chat
- **Real-time chat**: Chat trực tiếp với khách hàng
- **Online status**: Biết khách hàng nào đang online
- **Typing indicator**: Hiển thị khi customer đang gõ
- **Chat history**: Xem lịch sử chat đầy đủ
- **Auto refresh**: Tự động cập nhật cuộc trò chuyện mới

## Cấu hình

### Thay đổi mật khẩu admin:
Trong file `chat-server.js`, dòng 32:
```javascript
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nvi_admin_2024';
```

Hoặc set environment variable:
```bash
export ADMIN_PASSWORD=your_new_password
```

### Thay đổi port server:
Trong file `chat-server.js`, dòng 31:
```javascript
const PORT = process.env.PORT || 3000;
```

### Tùy chỉnh địa chỉ server:
Trong file `assets/js/chat.js`, dòng 67:
```javascript
this.socket = io('http://localhost:3000');
```

Trong file `admin.html`, dòng 835:
```javascript
this.socket = io('http://localhost:3000');
```

## Triển khai Production

### 1. Sử dụng PM2 (Recommended)
```bash
# Cài đặt PM2
npm install -g pm2

# Khởi động với PM2
pm2 start chat-server.js --name "nvi-chat"

# Xem logs
pm2 logs nvi-chat

# Restart
pm2 restart nvi-chat
```

### 2. Chạy với systemd (Linux)
Tạo file `/etc/systemd/system/nvi-chat.service`:
```ini
[Unit]
Description=NVI Live Chat Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/website
ExecStart=/usr/bin/node chat-server.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nvi-chat
sudo systemctl start nvi-chat
sudo systemctl status nvi-chat
```

### 3. Nginx Reverse Proxy
Thêm vào config Nginx:
```nginx
# WebSocket support
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Admin API
location /admin/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Database (Tùy chọn)

Hiện tại hệ thống lưu chat history vào file JSON. Để scale lớn hơn, có thể tích hợp database:

### MongoDB Example:
```javascript
// Trong chat-server.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: String,
    message: String,
    type: String,
    timestamp: Date
});

const Message = mongoose.model('Message', messageSchema);
```

### MySQL/PostgreSQL Example:
```javascript
// Sử dụng Sequelize hoặc Prisma
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password');

const Message = sequelize.define('Message', {
    userId: DataTypes.STRING,
    message: DataTypes.TEXT,
    type: DataTypes.STRING,
    timestamp: DataTypes.DATE
});
```

## Bảo mật

### 1. Rate Limiting
Thêm vào `chat-server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/admin/', limiter);
```

### 2. CORS Configuration
Trong `chat-server.js`, dòng 15-19, thay đổi:
```javascript
const io = socketIo(server, {
    cors: {
        origin: "https://yourdomain.com", // Thay bằng domain thực
        methods: ["GET", "POST"]
    }
});
```

### 3. HTTPS
Để sử dụng HTTPS:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

const server = https.createServer(options, app);
```

## Monitoring

### 1. Health Check Endpoint
Server đã có endpoint status tại: `GET /`

### 2. Logs
Server tự động log các events:
- User connections/disconnections
- Messages sent/received
- Errors

### 3. Metrics
Có thể thêm metrics với libraries như:
- `prom-client` cho Prometheus
- `newrelic` cho New Relic
- Custom analytics

## Troubleshooting

### Chat widget không hiện
- Kiểm tra `assets/js/chat.js` đã được load
- Kiểm tra console có errors không
- Kiểm tra CSS chat đã được include

### Không kết nối được WebSocket
- Kiểm tra server đang chạy: `http://localhost:3000`
- Kiểm tra firewall/port
- Kiểm tra CORS settings

### Admin không đăng nhập được
- Kiểm tra mật khẩu: `nvi_admin_2024`
- Kiểm tra server logs
- Kiểm tra network tab trong browser

### Messages không real-time
- Kiểm tra WebSocket connection
- Reload admin panel
- Kiểm tra server logs

## Support

Nếu có vấn đề, kiểm tra:
1. Server logs: `pm2 logs nvi-chat` hoặc `node chat-server.js`
2. Browser console: F12 > Console
3. Network tab: F12 > Network

## Customization

### Thay đổi giao diện:
- Edit `assets/css/style.css` cho chat widget
- Edit inline CSS trong `admin.html` cho admin panel

### Thêm tính năng:
- File upload trong chat
- Emoji picker
- Audio/Video call
- Chat bot với AI
- Multi-language support

### Notifications:
- Desktop notifications với Notification API
- Email alerts cho admin
- SMS notifications
- Push notifications

---

**Chúc bạn triển khai thành công! 🚀**