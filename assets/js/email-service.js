// Email Service Configuration for Nhiên Việt Inspired
class EmailService {
    constructor() {
        // EmailJS Configuration
        this.serviceID = 'YOUR_SERVICE_ID'; // You'll need to replace this
        this.templateID = 'YOUR_TEMPLATE_ID'; // You'll need to replace this  
        this.publicKey = 'YOUR_PUBLIC_KEY'; // You'll need to replace this
        
        this.init();
    }

    init() {
        // Initialize EmailJS with your public key
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.error('EmailJS library not loaded');
        }
    }

    async sendContactEmail(formData) {
        try {
            // Prepare template parameters
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone || 'Không cung cấp',
                service: this.getServiceName(formData.service),
                message: formData.message,
                to_email: 'dulichnhienviet@gmail.com', // Your Gmail address
                reply_to: formData.email,
                date: new Date().toLocaleString('vi-VN'),
                subject: `Liên hệ mới từ ${formData.name} - ${this.getServiceName(formData.service)}`
            };

            console.log('Sending email with params:', templateParams);

            // Send email via EmailJS
            const response = await emailjs.send(
                this.serviceID,
                this.templateID,
                templateParams
            );

            console.log('Email sent successfully:', response);
            return {
                success: true,
                message: 'Email đã được gửi thành công!',
                response: response
            };

        } catch (error) {
            console.error('Email sending failed:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.',
                error: error
            };
        }
    }

    getServiceName(serviceCode) {
        const services = {
            'food': 'Dịch vụ ăn uống',
            'tour': 'Tour du lịch',
            'flight': 'Vé máy bay',
            'visa': 'Visa & Passport',
            '': 'Không chọn dịch vụ cụ thể'
        };
        return services[serviceCode] || 'Dịch vụ khác';
    }

    // Validate EmailJS configuration
    isConfigured() {
        return this.serviceID !== 'YOUR_SERVICE_ID' && 
               this.templateID !== 'YOUR_TEMPLATE_ID' && 
               this.publicKey !== 'YOUR_PUBLIC_KEY';
    }

    // Show configuration instructions
    showConfigInstructions() {
        const instructions = `
📧 HƯỚNG DẪN CẤU HÌNH EMAILJS:

1. Truy cập https://www.emailjs.com/
2. Đăng ký tài khoản miễn phí
3. Tạo Service (Gmail):
   - Chọn Gmail
   - Kết nối với Gmail account của bạn
   - Copy Service ID

4. Tạo Email Template:
   - Tạo template mới
   - Sử dụng các biến: {{from_name}}, {{from_email}}, {{phone}}, {{service}}, {{message}}, {{date}}
   - Copy Template ID

5. Lấy Public Key:
   - Vào Account Settings
   - Copy Public Key

6. Cập nhật file assets/js/email-service.js:
   - serviceID: 'your_service_id'
   - templateID: 'your_template_id'  
   - publicKey: 'your_public_key'

💡 EmailJS cho phép gửi 200 email/tháng miễn phí!
        `;
        
        console.log(instructions);
        return instructions;
    }
}

// Export for use in main.js
window.EmailService = EmailService;