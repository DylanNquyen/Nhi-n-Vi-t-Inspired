# 📧 Hướng Dẫn Cài Đặt Contact Form với Gmail

Hướng dẫn này sẽ giúp bạn thiết lập tính năng gửi email từ form liên hệ trên website đến Gmail của bạn.

## 🚀 Tính Năng

- ✅ Gửi email thông báo đến Gmail business khi có khách hàng liên hệ
- ✅ Tự động gửi email xác nhận đến khách hàng 
- ✅ Giao diện email đẹp mắt với branding công ty
- ✅ Validation form chi tiết
- ✅ Rate limiting để tránh spam
- ✅ Security headers và CORS protection
- ✅ Toast notifications hiện đại

## 📋 Yêu Cầu Hệ Thống

- Node.js 14+ 
- NPM hoặc Yarn
- Gmail account với 2-Step Verification
- Internet connection

## 🔧 Cài Đặt Backend

### Bước 1: Cài đặt dependencies

```bash
# Chạy lệnh này trong thư mục root của project
npm install
```

Hoặc nếu chưa có package.json:
```bash
npm init -y
npm install express nodemailer cors dotenv body-parser helmet express-rate-limit
npm install --save-dev nodemon
```

### Bước 2: Cấu hình Gmail App Password

#### 2.1 Bật 2-Step Verification cho Gmail:
1. Đăng nhập Gmail của bạn
2. Vào [myaccount.google.com](https://myaccount.google.com)
3. Chọn "Security" (Bảo mật)
4. Tìm "2-Step Verification" và bật nó lên
5. Theo hướng dẫn để thiết lập (thường dùng số điện thoại)

#### 2.2 Tạo App Password:
1. Vẫn trong phần "Security" 
2. Tìm "App passwords" (Mật khẩu ứng dụng)
3. Chọn "Select app" > "Mail"
4. Chọn "Select device" > "Other" > nhập "Website Contact Form"
5. Click "Generate"
6. **LƯU Ý**: Sao chép App Password này (16 ký tự), bạn sẽ cần nó ở bước tiếp theo

### Bước 3: Cấu hình Environment Variables

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Mở file `.env` và điền thông tin:
```env
# Thay thế bằng Gmail của bạn
GMAIL_USER=your-business-email@gmail.com

# Thay thế bằng App Password vừa tạo (16 ký tự)
GMAIL_PASS=abcd efgh ijkl mnop

# Email nhận tin nhắn khách hàng (có thể giống GMAIL_USER)
BUSINESS_EMAIL=dulichnhienviet@gmail.com

# Cấu hình server
PORT=3000
NODE_ENV=production
FRONTEND_URL=*
```

## 🏃‍♂️ Chạy Ứng Dụng

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 🌐 Cấu Hình Frontend

Frontend đã được cập nhật tự động trong file `assets/js/main.js` để:

- Gửi dữ liệu form đến endpoint `/send-contact`
- Hiển thị loading state khi đang gửi
- Hiển thị toast notifications đẹp mắt
- Xử lý lỗi một cách thân thiện với người dùng

## 📧 Cấu Trúc Email

### Email gửi đến Business:
- Subject: `🔔 Tin nhắn mới từ website - [Tên khách hàng]`
- Chứa đầy đủ thông tin: Tên, Email, SĐT, Dịch vụ quan tâm, Nội dung
- Thiết kế đẹp với branding công ty
- Button "Phản hồi ngay" để reply khách hàng

### Email Auto-reply cho khách hàng:
- Subject: `✅ Cảm ơn bạn đã liên hệ - Nhiên Việt Inspired`
- Xác nhận đã nhận tin nhắn
- Thông tin thời gian phản hồi dự kiến
- Thông tin liên hệ khẩn cấp
- Links social media và hotline

## 🔒 Bảo Mật

- ✅ Rate limiting: Tối đa 5 request/15 phút per IP
- ✅ Helmet.js cho security headers
- ✅ CORS protection
- ✅ Input validation và sanitization
- ✅ Environment variables cho sensitive data

## 🧪 Kiểm Tra

### 1. Kiểm tra server:
```bash
curl http://localhost:3000/health
```

Kết quả mong đợi:
```json
{"status":"OK","message":"Server đang hoạt động"}
```

### 2. Test gửi email:
```bash
curl -X POST http://localhost:3000/send-contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "phone": "0123456789",
    "service": "food",
    "message": "Test message"
  }'
```

### 3. Test trên website:
1. Mở `contact.html` trong browser
2. Điền form và click "Gửi tin nhắn"
3. Kiểm tra email business có nhận được tin nhắn
4. Kiểm tra email test có nhận được auto-reply

## 🚀 Deployment

### Localhost:
- Chạy `npm start` 
- Website frontend và backend cùng port 3000

### Production:
- Upload code lên server
- Cài đặt Node.js và dependencies
- Cấu hình `.env` với thông tin production
- Chạy `npm start` hoặc dùng PM2:

```bash
npm install -g pm2
pm2 start server.js --name "contact-form"
pm2 startup
pm2 save
```

### Với reverse proxy (Nginx):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve static files
    location / {
        root /path/to/your/website;
        try_files $uri $uri/ =404;
    }
    
    # Proxy API requests
    location /send-contact {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /health {
        proxy_pass http://localhost:3000;
    }
}
```

## ❗ Xử Lý Lỗi Thường Gặp

### 1. "Invalid login" khi gửi email:
- ✅ Kiểm tra GMAIL_USER có đúng không
- ✅ Kiểm tra GMAIL_PASS có phải App Password 16 ký tự không
- ✅ Đảm bảo 2-Step Verification đã bật

### 2. "Authentication failed":
- ✅ Thử tạo lại App Password mới
- ✅ Kiểm tra không có space thừa trong .env file
- ✅ Đảm bảo Gmail account không bị khóa

### 3. Form không gửi được:
- ✅ Kiểm tra server có chạy không (`http://localhost:3000/health`)
- ✅ Mở Developer Tools > Network tab để xem lỗi
- ✅ Kiểm tra CORS settings nếu frontend và backend khác domain

### 4. Email không đến:
- ✅ Kiểm tra Spam folder
- ✅ Kiểm tra BUSINESS_EMAIL có đúng không
- ✅ Thử gửi đến email khác để test

## 📞 Hỗ Trợ

Nếu gặp vấn đề, bạn có thể:

1. Kiểm tra console logs của server để xem lỗi chi tiết
2. Mở Developer Tools trong browser để xem network errors  
3. Test với Postman/curl để kiểm tra API endpoint
4. Kiểm tra file `.env` có đúng format và không bị lỗi syntax

## 🎯 Tuỳ Chỉnh

### Thay đổi email template:
- Chỉnh sửa HTML trong `server.js` tại phần `businessMailOptions.html` và `customerMailOptions.html`

### Thêm field mới:
1. Thêm input trong `contact.html`
2. Cập nhật `formData` trong `assets/js/main.js`
3. Cập nhật email template trong `server.js`

### Thay đổi rate limiting:
- Chỉnh sửa `windowMs` và `max` trong `server.js`

---

🌟 **Chúc bạn thành công với việc triển khai Contact Form!** 🌟