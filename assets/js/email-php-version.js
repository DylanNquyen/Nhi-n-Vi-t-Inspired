// Alternative Email Form Handler using PHP Backend
// Use this instead of the EmailJS version if you prefer PHP backend

class PHPEmailFormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add floating labels
            if (input.type !== 'submit' && input.type !== 'button') {
                this.addFloatingLabel(input);
            }
            
            // Add real-time validation
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Enhanced form submission with PHP backend
        form.addEventListener('submit', (e) => this.handlePHPEmailSubmit(e, form));
    }

    addFloatingLabel(input) {
        const label = input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
            label.classList.add('floating-label');
            
            if (input.value) {
                label.classList.add('active');
            }
            
            input.addEventListener('focus', () => label.classList.add('active'));
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.classList.remove('active');
                }
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Remove existing error
        this.clearFieldError(field);

        // Validation rules
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Trường này là bắt buộc';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Email không hợp lệ';
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            message = 'Số điện thoại không hợp lệ';
        }

        if (!isValid) {
            this.showFieldError(field, message);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
    }

    async handlePHPEmailSubmit(e, form) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            toast.show('Vui lòng kiểm tra lại thông tin', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent || submitBtn.innerText;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = {
                name: form.querySelector('input[name="name"]').value,
                email: form.querySelector('input[name="email"]').value,
                phone: form.querySelector('input[name="phone"]').value || '',
                service: form.querySelector('select[name="service"]').value || '',
                message: form.querySelector('textarea[name="message"]').value
            };

            // Send data to PHP backend
            const response = await fetch('send_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Email sent successfully via PHP');
                toast.show(result.message, 'success', 5000);
                form.reset();
                
                // Reset floating labels
                form.querySelectorAll('.floating-label').forEach(label => {
                    label.classList.remove('active');
                });
            } else {
                throw new Error(result.message || 'Server error');
            }
            
        } catch (error) {
            console.error('Email sending failed:', error);
            toast.show('Có lỗi xảy ra khi gửi email. Vui lòng thử lại hoặc liên hệ trực tiếp qua điện thoại.', 'error', 6000);
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Initialize PHP Email Form Handler
// Uncomment the line below and comment out the EmailJS version in main.js if you want to use PHP backend
// const phpEmailFormHandler = new PHPEmailFormHandler();