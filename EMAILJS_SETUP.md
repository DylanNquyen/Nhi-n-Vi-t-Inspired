# 📧 Hướng Dẫn Cấu Hình EmailJS cho Contact Form

## Tổng Quan
EmailJS cho phép gửi email trực tiếp từ website của bạn đến Gmail mà không cần backend server. Dịch vụ này miễn phí cho 200 email/tháng.

## Bước 1: Đăng Ký EmailJS

1. **Truy cập**: https://www.emailjs.com/
2. **Đăng ký tài khoản miễn phí** bằng email
3. **Xác nhận email** và đăng nhập vào dashboard

## Bước 2: Tạo Email Service (Gmail)

1. **Vào Dashboard** → Click **"Add New Service"**
2. **Chọn Gmail** từ danh sách providers
3. **Kết nối Gmail**:
   - Click "Connect Account"
   - Đăng nhập Gmail account `dulichnhienviet@gmail.com`
   - Cho phép EmailJS truy cập Gmail
4. **Đặt tên Service**: `nvi_gmail_service`
5. **Lưu** và **copy Service ID** (dạng: `service_xxxxxxx`)

## Bước 3: Tạo Email Template

1. **Vào Email Templates** → Click **"Create New Template"**
2. **Cấu hình Template**:

### Template Settings:
- **Template Name**: `NVI Contact Form`
- **Template ID**: Tự động tạo (copy ID này)

### Email Content:
```
**To:** dulichnhienviet@gmail.com
**Subject:** 🔔 Liên hệ mới từ {{from_name}} - {{service}}

**From:** {{from_name}} <{{from_email}}>
**Reply-To:** {{from_email}}
```

### Email Body (HTML):
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <header style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2d5a27; margin: 0;">Nhiên Việt Inspired</h1>
        <p style="color: #4a7c59; margin: 5px 0;">Liên hệ mới từ website</p>
    </header>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2d5a27; margin-top: 0;">Thông tin khách hàng</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 150px;">👤 Họ và tên:</td>
                <td style="padding: 8px 0; color: #333;">{{from_name}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">📧 Email:</td>
                <td style="padding: 8px 0; color: #333;">{{from_email}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">📱 Điện thoại:</td>
                <td style="padding: 8px 0; color: #333;">{{phone}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">🎯 Dịch vụ:</td>
                <td style="padding: 8px 0; color: #333;">{{service}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">📅 Thời gian:</td>
                <td style="padding: 8px 0; color: #333;">{{date}}</td>
            </tr>
        </table>
    </div>
    
    <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h3 style="color: #2d5a27; margin-top: 0;">💬 Nội dung tin nhắn:</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37;">
            {{message}}
        </div>
    </div>
    
    <footer style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
            Email này được gửi từ contact form trên website Nhiên Việt Inspired
        </p>
        <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
            Vui lòng phản hồi trực tiếp đến email: {{from_email}}
        </p>
    </footer>
</div>
```

3. **Test Template** với dữ liệu mẫu
4. **Save Template** và copy **Template ID**

## Bước 4: Lấy Public Key

1. **Vào Account** → **General Settings**
2. **Copy Public Key** (dạng: `user_xxxxxxxxxxxxxxxx`)

## Bước 5: Cấu Hình Code

Mở file `assets/js/email-service.js` và thay thế:

```javascript
// EmailJS Configuration
this.serviceID = 'service_xxxxxxx'; // Thay bằng Service ID từ bước 2
this.templateID = 'template_xxxxxxx'; // Thay bằng Template ID từ bước 3  
this.publicKey = 'user_xxxxxxxxxxxxxxxx'; // Thay bằng Public Key từ bước 4
```

**Ví dụ cấu hình:**
```javascript
this.serviceID = 'service_abc123';
this.templateID = 'template_xyz789';  
this.publicKey = 'user_1234567890abcdef';
```

## Bước 6: Test Chức Năng

1. **Mở website** trong trình duyệt
2. **Vào trang Contact** hoặc phần liên hệ
3. **Điền form** với thông tin test:
   - Họ tên: Test User
   - Email: test@example.com
   - Điện thoại: 0123456789
   - Dịch vụ: Tour du lịch
   - Tin nhắn: Đây là tin nhắn test
4. **Click "Gửi tin nhắn"**
5. **Kiểm tra Gmail** `dulichnhienviet@gmail.com`

## ⚠️ Lưu Ý Quan Trọng

### Bảo Mật:
- **Public Key** có thể hiển thị trên website (an toàn)
- **Service ID** và **Template ID** cũng có thể public
- **KHÔNG BAO GIỜ** chia sẻ Private Key

### Giới Hạn:
- **Miễn phí**: 200 email/tháng
- **Có phí**: Unlimited emails với $20/tháng

### Spam Protection:
- EmailJS có built-in spam protection
- Rate limiting tự động
- Captcha nếu cần

## 🔧 Troubleshooting

### Lỗi "Unauthorized":
- Kiểm tra Public Key
- Kiểm tra Service ID
- Đảm bảo Gmail account đã kết nối

### Lỗi "Template not found":
- Kiểm tra Template ID
- Đảm bảo template đã save

### Email không đến:
- Kiểm tra Spam folder
- Kiểm tra email template format
- Xem EmailJS dashboard logs

### Console Errors:
- Mở Developer Tools (F12)
- Xem Console tab để debug
- Kiểm tra Network tab cho request errors

## 📞 Hỗ Trợ

Nếu cần hỗ trợ:
1. Kiểm tra EmailJS Documentation: https://www.emailjs.com/docs/
2. Xem video tutorial trên YouTube
3. Liên hệ EmailJS support

---
**Cập nhật cuối:** Tháng 12, 2024  
**Phiên bản:** 1.0