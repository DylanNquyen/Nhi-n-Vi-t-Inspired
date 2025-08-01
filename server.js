const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.'
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply rate limiting to contact endpoint
app.use('/send-contact', limiter);

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS // This should be an App Password
    }
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server đang hoạt động' });
});

// Contact form submission endpoint
app.post('/send-contact', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Nội dung tin nhắn)'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    const transporter = createTransporter();

    // Service mapping
    const serviceNames = {
      'food': 'Dịch vụ ăn uống',
      'tour': 'Tour du lịch',
      'flight': 'Vé máy bay',
      'visa': 'Visa & Passport'
    };

    const serviceName = serviceNames[service] || 'Không chọn dịch vụ';

    // Email to business
    const businessMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.BUSINESS_EMAIL || process.env.GMAIL_USER,
      subject: `🔔 Tin nhắn mới từ website - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #2d5a27; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nhiên Việt Inspired</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Tin nhắn mới từ website</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; border-bottom: 2px solid #f4c430; padding-bottom: 10px;">
              📧 Thông tin liên hệ
            </h2>
            
            <div style="margin: 20px 0;">
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5a27; display: inline-block; width: 150px;">👤 Họ và tên:</strong>
                <span style="color: #333;">${name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5a27; display: inline-block; width: 150px;">📧 Email:</strong>
                <span style="color: #333;"><a href="mailto:${email}" style="color: #2d5a27; text-decoration: none;">${email}</a></span>
              </div>
              
              ${phone ? `
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5a27; display: inline-block; width: 150px;">📞 Số điện thoại:</strong>
                <span style="color: #333;"><a href="tel:${phone}" style="color: #2d5a27; text-decoration: none;">${phone}</a></span>
              </div>
              ` : ''}
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5a27; display: inline-block; width: 150px;">🎯 Dịch vụ quan tâm:</strong>
                <span style="color: #333;">${serviceName}</span>
              </div>
            </div>
            
            <div style="margin: 25px 0;">
              <strong style="color: #2d5a27; display: block; margin-bottom: 10px;">💬 Nội dung tin nhắn:</strong>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #f4c430; font-style: italic; color: #333; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              <strong>⏰ Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${email}" style="background-color: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                📧 Phản hồi ngay
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Email này được gửi tự động từ website Nhiên Việt Inspired</p>
          </div>
        </div>
      `
    };

    // Auto-reply email to customer
    const customerMailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '✅ Cảm ơn bạn đã liên hệ - Nhiên Việt Inspired',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #2d5a27; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nhiên Việt Inspired</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Bread - Coffee - Tea</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0;">Xin chào ${name}! 👋</h2>
            
            <p style="color: #333; line-height: 1.6; margin: 20px 0;">
              Cảm ơn bạn đã quan tâm và gửi tin nhắn đến <strong style="color: #2d5a27;">Nhiên Việt Inspired</strong>. 
              Chúng tôi đã nhận được thông tin của bạn và sẽ phản hồi trong thời gian sớm nhất.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #f4c430; margin: 25px 0;">
              <h3 style="color: #2d5a27; margin-top: 0;">📋 Thông tin bạn đã gửi:</h3>
              <p style="margin: 10px 0; color: #333;"><strong>Dịch vụ quan tâm:</strong> ${serviceName}</p>
              <p style="margin: 10px 0; color: #333;"><strong>Nội dung:</strong> ${message}</p>
            </div>
            
            <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #f4c430;">🕒 Thời gian phản hồi dự kiến</h3>
              <p style="margin: 10px 0;">Trong vòng <strong>2-4 giờ</strong> (giờ hành chính)</p>
              <p style="margin: 10px 0;">Hoặc <strong>sáng hôm sau</strong> (ngoài giờ hành chính)</p>
            </div>
            
            <div style="margin: 25px 0;">
              <h3 style="color: #2d5a27;">📞 Liên hệ khẩn cấp</h3>
              <p style="color: #333; margin: 10px 0;">
                <strong>Hotline:</strong> <a href="tel:0347965648" style="color: #2d5a27; text-decoration: none;">0347 965 648</a>
              </p>
              <p style="color: #333; margin: 10px 0;">
                <strong>Email:</strong> <a href="mailto:dulichnhienviet@gmail.com" style="color: #2d5a27; text-decoration: none;">dulichnhienviet@gmail.com</a>
              </p>
              <p style="color: #333; margin: 10px 0;">
                <strong>Địa chỉ:</strong> A39, Nguyễn Sỹ Sách, Phường Tân Sơn, TP.HCM
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.facebook.com/tourvemaybaypassport" style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px; font-weight: bold;">
                📘 Facebook
              </a>
              <a href="tel:0347965648" style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px; font-weight: bold;">
                📞 Gọi ngay
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>🌟 Cảm ơn bạn đã tin tưởng Nhiên Việt Inspired! 🌟</p>
            <p style="margin-top: 10px;">
              <strong style="color: #2d5a27;">Nhiên Việt Inspired</strong> - 
              <em>Mang đến trải nghiệm dịch vụ trọn vẹn, tiện lợi, tinh tế, chất lượng</em>
            </p>
          </div>
        </div>
      `
    };

    // Send emails
    await transporter.sendMail(businessMailOptions);
    await transporter.sendMail(customerMailOptions);

    console.log(`✅ Email sent successfully from ${email} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.'
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau ít phút hoặc liên hệ trực tiếp qua điện thoại.'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tìm thấy'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Lỗi server nội bộ'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
  console.log(`🌟 Nhiên Việt Inspired Contact Form Backend`);
  console.log(`📧 Gmail user: ${process.env.GMAIL_USER || 'Chưa cấu hình'}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;