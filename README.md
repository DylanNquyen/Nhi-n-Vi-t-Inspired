# Nhiên Việt Inspired - Website

Website chính thức của Công ty TNHH Phát triển Thương mại Dịch vụ NVI, chuyên cung cấp dịch vụ ăn uống, tour du lịch, vé máy bay, visa và passport.

## 🌟 Tính Năng Mới Được Thêm Vào

### 🎨 UI/UX Improvements
- **Loading States**: Skeleton loading và loading animations
- **Micro-interactions**: Hover effects và button animations
- **Toast Notifications**: Thông báo đẹp mắt cho user actions
- **Floating Labels**: Labels động cho form inputs
- **Enhanced Forms**: Validation real-time và error handling
- **Breadcrumbs**: Navigation breadcrumbs cho các trang
- **Skip Links**: Accessibility improvements
- **Responsive Design**: Tối ưu cho mọi thiết bị

### ⚡ Performance Optimizations
- **Lazy Loading**: Images load khi cần thiết
- **Preload Critical Resources**: Tải trước tài nguyên quan trọng
- **Optimized Animations**: Sử dụng requestAnimationFrame
- **CSS Optimizations**: Will-change properties cho smooth animations

### 🔧 Technical Features
- **Modern JavaScript**: ES6+ classes và modules
- **Accessibility**: ARIA labels, focus management
- **Cross-browser Support**: Tương thích với mọi trình duyệt
- **Print Styles**: CSS cho in ấn
- **SEO Optimized**: Meta tags và semantic HTML

## 📁 Cấu Trúc Dự Án

```
Test/
├── index.html              # Trang chủ
├── about.html              # Trang giới thiệu
├── services.html           # Trang dịch vụ
├── contact.html            # Trang liên hệ
├── assets/
│   ├── css/
│   │   └── style.css       # CSS chính
│   ├── js/
│   │   └── main.js         # JavaScript chính
│   └── images/             # Hình ảnh
├── Word/                   # Tài liệu Word
└── README.md              # File này
```

## 🚀 Cách Sử Dụng

### Chạy Website
1. Mở file `index.html` trong trình duyệt
2. Hoặc sử dụng local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   ```

### Form Validation
- Tất cả forms có validation real-time
- Error messages hiển thị ngay lập tức
- Success notifications khi submit thành công

## 🎯 Các Trang Chính

### 1. Trang Chủ (`index.html`)
- Hero section với call-to-action
- Giới thiệu công ty
- Dịch vụ nổi bật
- Giá trị cốt lõi
- Form liên hệ

### 2. Giới Thiệu (`about.html`)
- Văn hóa doanh nghiệp
- Sứ mệnh và tầm nhìn
- Hành vi văn hóa
- Triết lý dịch vụ
- Trách nhiệm cộng đồng

### 3. Dịch Vụ (`services.html`)
- Dịch vụ ăn uống
- Tour du lịch
- Vé máy bay
- Visa & Passport
- Lý do chọn chúng tôi

### 4. Liên Hệ (`contact.html`)
- Thông tin liên hệ
- Form gửi tin nhắn
- Bản đồ vị trí
- FAQ
- Social media links

## 🛠️ Công Nghệ Sử Dụng

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Animations
- **JavaScript ES6+**: Classes, Modules, Async/Await
- **Font Awesome**: Icons
- **Responsive Design**: Mobile-first approach

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Color Scheme

- Primary Green: `#2d5a27`
- Secondary Green: `#4a7c59`
- Accent Gold: `#d4af37`
- Light Gold: `#f4e4bc`
- White: `#ffffff`
- Light Gray: `#f8f9fa`

## 🔧 Customization

### Thay Đổi Màu Sắc
Chỉnh sửa CSS variables trong `assets/css/style.css`:
```css
:root {
    --primary-green: #your-color;
    --accent-gold: #your-color;
    /* ... */
}
```

### Thêm Trang Mới
1. Tạo file HTML mới
2. Copy structure từ trang hiện có
3. Thêm breadcrumbs và skip link
4. Update navigation menu

### Thêm Tính Năng JavaScript
1. Tạo class mới trong `assets/js/main.js`
2. Initialize trong DOMContentLoaded
3. Follow existing patterns

## 📊 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Security

- Form validation client-side và server-side
- XSS protection
- CSRF protection (cần implement server-side)
- Secure headers (cần configure server)

## 📈 SEO

- Semantic HTML structure
- Meta tags đầy đủ
- Alt text cho images
- Structured data (có thể thêm)
- Sitemap (cần tạo)

## 🐛 Troubleshooting

### Form Không Submit
- Kiểm tra validation rules
- Kiểm tra network tab cho errors
- Verify form action URL

### Images Không Load
- Kiểm tra đường dẫn file
- Verify file permissions
- Check lazy loading implementation

## 📞 Support

Nếu có vấn đề hoặc cần hỗ trợ:
- Email: dulichnhienviet@gmail.com
- Phone: 0347 965 648

## 📄 License

© 2024 Nhiên Việt Inspired. Tất cả quyền được bảo lưu.

---

**Lưu ý**: Website này được tối ưu cho trải nghiệm người dùng tốt nhất trên mọi thiết bị và trình duyệt. 