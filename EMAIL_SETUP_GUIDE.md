# 📧 Email Setup Guide for Contact Form

This guide will help you set up EmailJS to send contact form submissions directly to your Gmail account.

## 🚀 Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## 📧 Step 2: Connect Your Gmail Account

1. After logging in, go to **Email Services**
2. Click **Add New Service**
3. Select **Gmail**
4. Click **Connect Account**
5. Follow Google OAuth flow to authorize EmailJS
6. Note down your **Service ID** (you'll need this later)

## 📝 Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template content:

### Subject:
```
Tin nhắn mới từ website - {{from_name}}
```

### Content:
```
Bạn có tin nhắn mới từ website Nhiên Việt Inspired:

👤 Họ và tên: {{from_name}}
📧 Email: {{from_email}}
📱 Số điện thoại: {{phone}}
🔧 Dịch vụ quan tâm: {{service_name}}
📅 Thời gian gửi: {{date}}

💬 Nội dung tin nhắn:
{{message}}

---
Email này được gửi tự động từ form liên hệ trên website.
```

4. Click **Save** and note down your **Template ID**

## 🔑 Step 4: Get Your Public Key

1. Go to **Account** (your profile icon)
2. Copy your **Public Key**

## ⚙️ Step 5: Update Your Website Code

Replace the following placeholders in your `assets/js/main.js` file:

```javascript
// Find these lines and replace the placeholders:

// Line ~285: Replace 'YOUR_PUBLIC_KEY' with your actual public key
emailjs.init('your_actual_public_key_here');

// Line ~361-364: Replace with your actual service and template IDs
const response = await emailjs.send(
    'your_service_id_here',     // Replace 'YOUR_SERVICE_ID'
    'your_template_id_here',    // Replace 'YOUR_TEMPLATE_ID'
    formData
);
```

### Example of what it should look like:
```javascript
// Initialize EmailJS
emailjs.init('user_1234567890abcdef');

// Send email
const response = await emailjs.send(
    'service_gmail_123',
    'template_contact_456',
    formData
);
```

## 📧 Step 6: Set Email Destination

1. In your EmailJS template, make sure the **To Email** is set to your Gmail address
2. You can set this in the template settings or add it as a variable

## 🧪 Step 7: Test the Setup

1. Open your website
2. Fill out the contact form
3. Click "Gửi tin nhắn"
4. Check your Gmail inbox (and spam folder)

## 🔧 Troubleshooting

### Common Issues:

1. **"EmailJS is not defined" error**
   - Make sure the EmailJS CDN is loaded before your main.js file

2. **403 Forbidden error**
   - Check your Public Key is correct
   - Make sure your domain is added to EmailJS allowed origins

3. **Template not found**
   - Verify your Template ID is correct
   - Make sure template is saved and active

4. **Emails not received**
   - Check spam/junk folder
   - Verify Gmail service is properly connected
   - Check EmailJS dashboard for delivery status

### How to Add Domain Restrictions:

1. Go to EmailJS **Account Settings**
2. Add your domain to **Allowed Origins**
3. Example: `https://yourdomain.com` or `*` for all domains (testing only)

## 💰 Pricing Information

- **Free Plan**: 200 emails/month
- **Paid Plans**: Start from $15/month for more emails

## 🎯 Form Data Being Sent

The form collects and sends these fields:
- `from_name`: Customer's full name
- `from_email`: Customer's email address
- `phone`: Customer's phone number (optional)
- `service`: Selected service type
- `service_name`: Service name in Vietnamese
- `message`: Customer's message
- `date`: Timestamp when form was submitted

## 🛡️ Security Notes

- Never expose your Private Key in client-side code
- Only use the Public Key in your JavaScript
- Consider adding reCAPTCHA for spam protection
- Set up domain restrictions in EmailJS settings

## 📞 Support

If you need help with the setup, you can:
- Check EmailJS documentation: https://www.emailjs.com/docs/
- Contact EmailJS support
- Review browser console for error messages

---

✅ Once you complete all steps, your contact form will automatically send emails to your Gmail account!