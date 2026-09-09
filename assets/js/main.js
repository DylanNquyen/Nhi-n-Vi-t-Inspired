// Mobile Menu functionality is handled by the Enhanced MobileMenu class below

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to top button
const scrollTopBtn = document.querySelector('.scroll-top');
const header = document.querySelector('.header');

let scrollFrame = null;
const updateScrollState = () => {
    const scrollPosition = window.pageYOffset;

    if (scrollTopBtn) {
        scrollTopBtn.classList.toggle('visible', scrollPosition > 300);
    }

    if (header) {
        header.style.background = scrollPosition > 100
            ? 'rgba(45, 90, 39, 0.95)'
            : 'linear-gradient(135deg, var(--primary-green), var(--secondary-green))';
    }

    const hero = document.querySelector('.hero');
    if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hero.style.transform = `translateY(${scrollPosition * -0.5}px)`;
    }

    scrollFrame = null;
};

const requestScrollUpdate = () => {
    if (scrollFrame === null) {
        scrollFrame = requestAnimationFrame(updateScrollState);
    }
};

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
requestScrollUpdate();

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        // Custom smooth scroll với tốc độ có thể điều chỉnh
        const scrollToTop = () => {
            const currentPosition = window.pageYOffset;
            if (currentPosition > 0) {
                // Tốc độ cuộn: thay đổi số này để điều chỉnh tốc độ
                // Số càng nhỏ = cuộn càng nhanh
                // Số càng lớn = cuộn càng chậm
                const scrollStep = Math.max(currentPosition / 22, 1); // Điều chỉnh 20 thành số khác
                window.scrollTo(0, currentPosition - scrollStep);
                requestAnimationFrame(scrollToTop);
            }
        };
        scrollToTop();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.about-card, .service-card, .value-card, .contact-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Service cards hover effect
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Initialize counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe counter elements
document.querySelectorAll('[data-target]').forEach(counter => {
    counterObserver.observe(counter);
});

// Lazy loading for images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Initialize tooltips (if any)
const tooltips = document.querySelectorAll('[data-tooltip]');
tooltips.forEach(tooltip => {
    tooltip.addEventListener('mouseenter', function() {
        const tooltipText = this.getAttribute('data-tooltip');
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip';
        tooltipElement.textContent = tooltipText;
        document.body.appendChild(tooltipElement);
        
        const rect = this.getBoundingClientRect();
        tooltipElement.style.left = rect.left + (rect.width / 2) - (tooltipElement.offsetWidth / 2) + 'px';
        tooltipElement.style.top = rect.top - tooltipElement.offsetHeight - 10 + 'px';
    });
    
    tooltip.addEventListener('mouseleave', function() {
        const tooltipElement = document.querySelector('.tooltip');
        if (tooltipElement) {
            tooltipElement.remove();
        }
    });
}); 

// Toast Notification System
class Toast {
    constructor() {
        this.createToastContainer();
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

        const content = document.createElement('div');
        content.style.cssText = 'display: flex; align-items: center; gap: 10px;';
        const messageElement = document.createElement('span');
        messageElement.textContent = message;
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Đóng thông báo');
        closeButton.textContent = '×';
        closeButton.style.cssText = 'background: none; border: none; color: white; cursor: pointer; font-size: 18px;';
        closeButton.addEventListener('click', () => toast.remove());
        content.append(messageElement, closeButton);
        toast.appendChild(content);
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

const toast = new Toast();



// Enhanced Form Handling with EmailJS Integration
class EmailFormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.initEmailJS();
        this.init();
    }

    initEmailJS() {
        // Initialize EmailJS with your public key
        // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
        if (window.emailjs) {
            window.emailjs.init('is48xsDmZIpobLamF');
        }
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

        // Enhanced form submission with EmailJS
        form.addEventListener('submit', (e) => this.handleEmailSubmit(e, form));
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

    async handleEmailSubmit(e, form) {
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
        submitBtn.setAttribute('aria-busy', 'true');

        try {
            // Collect form data
            const formData = {
                from_name: form.querySelector('input[name="name"]').value,
                from_email: form.querySelector('input[name="email"]').value,
                phone: form.querySelector('input[name="phone"]').value || 'Không cung cấp',
                service: form.querySelector('select[name="service"]').value || 'Không chọn',
                message: form.querySelector('textarea[name="message"]').value,
                date: new Date().toLocaleString('vi-VN')
            };

            // Get service name in Vietnamese
            const serviceNames = {
                'food': 'Dịch vụ ăn uống',
                'tour': 'Tour du lịch',
                'flight': 'Vé máy bay',
                'visa': 'Visa & Passport'
            };
            formData.service_name = serviceNames[formData.service] || 'Không chọn';

            // Send email using EmailJS
            // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS configuration
            if (!window.emailjs) {
                throw new Error('Email service is unavailable');
            }

            const response = await window.emailjs.send(
                'service_6rqy91s',
                'template_v8zhd9c',
                formData
            );

            console.log('Email sent successfully:', response);
            toast.show('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success', 5000);
            form.reset();
            
            // Reset floating labels
            form.querySelectorAll('.floating-label').forEach(label => {
                label.classList.remove('active');
            });
            
        } catch (error) {
            console.error('Email sending failed:', error);
            toast.show('Có lỗi xảy ra khi gửi email. Vui lòng thử lại hoặc liên hệ trực tiếp qua điện thoại.', 'error', 6000);
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-busy', 'false');
        }
    }
}

// Initialize Email Form Handler (replace the old FormHandler)
const emailFormHandler = new EmailFormHandler();

// Performance Optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeAnimations();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('fade-in');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalResources() {
        const criticalImages = [
            'assets/images/LOGO.png',
            'assets/images/3.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    optimizeAnimations() {
        // Use requestAnimationFrame for smooth animations
        const animatedElements = document.querySelectorAll('.service-card, .value-card, .about-card');
        
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });
    }
}

// Initialize Performance Optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Enhanced Mobile Menu
class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.navMenu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        if (this.menuBtn && this.navMenu) {
            this.lastFocusedElement = this.menuBtn;
            this.menuBtn.setAttribute('aria-expanded', 'false');
            this.menuBtn.setAttribute('aria-controls', 'primary-navigation');
            this.menuBtn.addEventListener('click', () => this.toggle());

            this.navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.close());
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.menuBtn.contains(e.target) && !this.navMenu.contains(e.target)) {
                    this.close();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close(true);
                }
            });
        }
    }

    toggle() {
        const isOpening = !this.navMenu.classList.contains('active');
        if (isOpening) {
            this.lastFocusedElement = document.activeElement;
        }
        this.navMenu.classList.toggle('active', isOpening);
        this.menuBtn.classList.toggle('active', isOpening);
        this.menuBtn.setAttribute('aria-expanded', String(isOpening));
        this.menuBtn.setAttribute('aria-label', isOpening ? 'Đóng menu điều hướng' : 'Mở menu điều hướng');
        
        // Animate menu items
        const menuItems = this.navMenu.querySelectorAll('li');
        menuItems.forEach((item, index) => {
            if (this.navMenu.classList.contains('active')) {
                item.style.animation = `slideInRight 0.3s ease ${index * 0.1}s both`;
            } else {
                item.style.animation = '';
            }
        });

        if (isOpening) {
            this.navMenu.querySelector('a')?.focus();
        }
    }

    close(restoreFocus = false) {
        this.navMenu.classList.remove('active');
        this.menuBtn.classList.remove('active');
        this.menuBtn.setAttribute('aria-expanded', 'false');
        this.menuBtn.setAttribute('aria-label', 'Mở menu điều hướng');
        if (restoreFocus) {
            this.lastFocusedElement?.focus();
        }
    }
}

// Initialize Mobile Menu after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = new MobileMenu();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .floating-label {
        position: absolute;
        top: 1rem;
        left: 1rem;
        color: var(--text-light);
        transition: var(--transition);
        pointer-events: none;
        background: var(--white);
        padding: 0 0.5rem;
    }
    
    .floating-label.active {
        top: -0.5rem;
        font-size: 0.875rem;
        color: var(--accent-gold);
    }
    
    .form-group {
        position: relative;
    }
    
    .form-group input.error,
    .form-group textarea.error,
    .form-group select.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style); 