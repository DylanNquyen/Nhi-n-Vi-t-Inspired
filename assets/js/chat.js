// Live Chat System
class LiveChat {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.userId = this.generateUserId();
        this.isAdmin = false;
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        
        this.initializeElements();
        this.bindEvents();
        this.connectToServer();
        this.loadChatHistory();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    initializeElements() {
        // Chat elements
        this.chatWidget = document.getElementById('chat-widget');
        this.chatToggle = document.getElementById('chat-toggle');
        this.chatModal = document.getElementById('chat-modal');
        this.chatClose = document.getElementById('chat-close');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.chatSend = document.getElementById('chat-send');
        this.chatStatus = document.getElementById('chat-status');
        this.chatNotification = document.getElementById('chat-notification');
        
        // Action buttons
        this.requestCallBtn = document.getElementById('request-call');
        this.sendEmailBtn = document.getElementById('send-email');
    }

    bindEvents() {
        // Toggle chat modal
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.chatClose.addEventListener('click', () => this.closeChat());
        
        // Send message events
        this.chatSend.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Typing indicator
        this.chatInput.addEventListener('input', () => this.handleTyping());
        
        // Action buttons
        this.requestCallBtn.addEventListener('click', () => this.requestCallback());
        this.sendEmailBtn.addEventListener('click', () => this.sendEmailRequest());
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.chatModal.contains(e.target) && !this.chatToggle.contains(e.target)) {
                if (this.chatModal.classList.contains('active')) {
                    this.closeChat();
                }
            }
        });
    }

    connectToServer() {
        try {
            // Try to connect to WebSocket server
            this.socket = io('http://localhost:3000');
            
            this.socket.on('connect', () => {
                console.log('Connected to chat server');
                this.isConnected = true;
                this.updateStatus('Đang trực tuyến');
                
                // Join user room
                this.socket.emit('join', {
                    userId: this.userId,
                    userType: 'customer',
                    userInfo: {
                        page: window.location.pathname,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    }
                });
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from chat server');
                this.isConnected = false;
                this.updateStatus('Đang kết nối lại...');
            });

            this.socket.on('message', (data) => {
                this.receiveMessage(data);
            });

            this.socket.on('admin_typing', () => {
                this.showTypingIndicator();
            });

            this.socket.on('admin_stop_typing', () => {
                this.hideTypingIndicator();
            });

            this.socket.on('admin_status', (status) => {
                this.updateStatus(status.online ? 'Đang trực tuyến' : 'Ngoại tuyến');
            });

        } catch (error) {
            console.log('WebSocket not available, using local mode');
            this.isConnected = false;
            this.updateStatus('Chế độ ngoại tuyến');
            this.simulateAdminResponse();
        }
    }

    toggleChat() {
        const isActive = this.chatModal.classList.contains('active');
        
        if (isActive) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.chatModal.classList.add('active');
        this.chatInput.focus();
        this.hideNotification();
        
        // Mark messages as read
        if (this.socket && this.isConnected) {
            this.socket.emit('messages_read', { userId: this.userId });
        }
    }

    closeChat() {
        this.chatModal.classList.remove('active');
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        const messageData = {
            id: this.generateMessageId(),
            userId: this.userId,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'user'
        };

        // Add message to UI
        this.addMessage(messageData);
        
        // Send to server if connected
        if (this.socket && this.isConnected) {
            this.socket.emit('message', messageData);
        } else {
            // Simulate admin response in offline mode
            setTimeout(() => this.simulateAdminResponse(message), 1000);
        }

        // Clear input
        this.chatInput.value = '';
        this.chatSend.disabled = false;
    }

    receiveMessage(messageData) {
        if (messageData.userId !== this.userId) {
            this.addMessage(messageData);
            
            // Show notification if chat is closed
            if (!this.chatModal.classList.contains('active')) {
                this.showNotification();
            }
        }
    }

    addMessage(messageData) {
        const messageElement = this.createMessageElement(messageData);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Store message
        this.messages.push(messageData);
        this.saveChatHistory();
    }

    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.type === 'admin' ? 'admin-message' : 'user-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textP = document.createElement('p');
        textP.textContent = messageData.message;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = this.formatTime(messageData.timestamp);
        
        contentDiv.appendChild(textP);
        contentDiv.appendChild(timeSpan);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    showTypingIndicator() {
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message admin-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'typing-dots';
        dotsDiv.innerHTML = '<span></span><span></span><span></span>';
        
        contentDiv.appendChild(dotsDiv);
        typingDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    handleTyping() {
        if (this.socket && this.isConnected && !this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing', { userId: this.userId });
        }

        // Clear previous timeout
        clearTimeout(this.typingTimeout);
        
        // Set new timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            if (this.socket && this.isConnected && this.isTyping) {
                this.isTyping = false;
                this.socket.emit('stop_typing', { userId: this.userId });
            }
        }, 1000);
    }

    requestCallback() {
        const message = "Tôi muốn được gọi lại để tư vấn. Số điện thoại của tôi là: [Vui lòng cung cấp số điện thoại]";
        
        const messageData = {
            id: this.generateMessageId(),
            userId: this.userId,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'user',
            action: 'callback_request'
        };

        this.addMessage(messageData);
        
        if (this.socket && this.isConnected) {
            this.socket.emit('message', messageData);
        }
    }

    sendEmailRequest() {
        const message = "Tôi muốn nhận thông tin chi tiết qua email. Email của tôi là: [Vui lòng cung cấp email]";
        
        const messageData = {
            id: this.generateMessageId(),
            userId: this.userId,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'user',
            action: 'email_request'
        };

        this.addMessage(messageData);
        
        if (this.socket && this.isConnected) {
            this.socket.emit('message', messageData);
        }
    }

    simulateAdminResponse(userMessage = '') {
        const responses = [
            "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ hỗ trợ bạn ngay bây giờ.",
            "Tôi có thể giúp gì cho bạn về dịch vụ của chúng tôi?",
            "Bạn quan tâm đến dịch vụ nào của NVI? Tour du lịch, vé máy bay hay dịch vụ ăn uống?",
            "Chúng tôi có các gói tour và dịch vụ rất hấp dẫn. Bạn có muốn tìm hiểu thêm không?",
            "Để tư vấn tốt nhất, bạn có thể chia sẻ thêm về nhu cầu của mình không?"
        ];

        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Contextual responses based on user message
        if (userMessage.toLowerCase().includes('tour') || userMessage.toLowerCase().includes('du lịch')) {
            response = "Chúng tôi có nhiều tour du lịch hấp dẫn! Bạn quan tâm đến tour nội địa hay quốc tế?";
        } else if (userMessage.toLowerCase().includes('vé máy bay') || userMessage.toLowerCase().includes('máy bay')) {
            response = "Chúng tôi cung cấp vé máy bay với giá cạnh tranh. Bạn muốn đi đâu và khi nào?";
        } else if (userMessage.toLowerCase().includes('visa') || userMessage.toLowerCase().includes('passport')) {
            response = "Chúng tôi hỗ trợ làm visa và passport cho nhiều quốc gia. Bạn định đi nước nào?";
        }

        setTimeout(() => {
            const messageData = {
                id: this.generateMessageId(),
                userId: 'admin',
                message: response,
                timestamp: new Date().toISOString(),
                type: 'admin'
            };
            
            this.addMessage(messageData);
        }, 500 + Math.random() * 1000);
    }

    updateStatus(status) {
        this.chatStatus.textContent = status;
    }

    showNotification() {
        this.chatNotification.style.display = 'flex';
        const currentCount = parseInt(this.chatNotification.textContent) || 0;
        this.chatNotification.textContent = currentCount + 1;
    }

    hideNotification() {
        this.chatNotification.style.display = 'none';
        this.chatNotification.textContent = '0';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) {
            return 'Vừa xong';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        } else {
            return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
    }

    generateMessageId() {
        return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    saveChatHistory() {
        try {
            localStorage.setItem('nvi_chat_history', JSON.stringify(this.messages.slice(-50))); // Keep last 50 messages
        } catch (error) {
            console.log('Could not save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const history = localStorage.getItem('nvi_chat_history');
            if (history) {
                const messages = JSON.parse(history);
                
                // Clear initial message
                this.chatMessages.innerHTML = '';
                
                // Load messages
                messages.forEach(message => {
                    const messageElement = this.createMessageElement(message);
                    this.chatMessages.appendChild(messageElement);
                });
                
                this.messages = messages;
                this.scrollToBottom();
            }
        } catch (error) {
            console.log('Could not load chat history:', error);
        }
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.liveChat = new LiveChat();
});

// Admin functions (for admin panel)
window.ChatAdmin = {
    connectAsAdmin: function(adminId) {
        if (window.liveChat && window.liveChat.socket) {
            window.liveChat.socket.emit('admin_connect', { adminId });
            window.liveChat.isAdmin = true;
        }
    },
    
    sendAdminMessage: function(userId, message) {
        if (window.liveChat && window.liveChat.socket) {
            const messageData = {
                id: window.liveChat.generateMessageId(),
                userId: 'admin',
                targetUserId: userId,
                message: message,
                timestamp: new Date().toISOString(),
                type: 'admin'
            };
            
            window.liveChat.socket.emit('admin_message', messageData);
        }
    },
    
    getActiveUsers: function() {
        if (window.liveChat && window.liveChat.socket) {
            window.liveChat.socket.emit('get_active_users');
        }
    }
};