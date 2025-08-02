const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data storage (in production, use a proper database)
const activeUsers = new Map();
const conversations = new Map();
const adminUsers = new Map();
const chatHistory = new Map();

// Configuration
const PORT = process.env.PORT || 3000;
const CHAT_HISTORY_FILE = path.join(__dirname, 'chat-history.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nvi_admin_2024';

// Load chat history on startup
async function loadChatHistory() {
    try {
        if (await fs.pathExists(CHAT_HISTORY_FILE)) {
            const data = await fs.readJson(CHAT_HISTORY_FILE);
            Object.entries(data).forEach(([userId, messages]) => {
                chatHistory.set(userId, messages);
            });
            console.log('Chat history loaded successfully');
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Save chat history to file
async function saveChatHistory() {
    try {
        const data = Object.fromEntries(chatHistory);
        await fs.writeJson(CHAT_HISTORY_FILE, data, { spaces: 2 });
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

// Save chat history every 30 seconds
setInterval(saveChatHistory, 30000);

// User management functions
function addUser(socketId, userId, userType, userInfo) {
    const user = {
        socketId,
        userId,
        userType,
        userInfo,
        joinTime: moment().toISOString(),
        lastSeen: moment().toISOString(),
        isOnline: true
    };
    
    activeUsers.set(socketId, user);
    
    if (!chatHistory.has(userId)) {
        chatHistory.set(userId, []);
    }
    
    console.log(`User ${userId} (${userType}) connected`);
    return user;
}

function removeUser(socketId) {
    const user = activeUsers.get(socketId);
    if (user) {
        user.isOnline = false;
        user.lastSeen = moment().toISOString();
        activeUsers.delete(socketId);
        console.log(`User ${user.userId} disconnected`);
    }
    return user;
}

function getUserBySocketId(socketId) {
    return activeUsers.get(socketId);
}

function getActiveCustomers() {
    return Array.from(activeUsers.values()).filter(user => user.userType === 'customer');
}

function getActiveAdmins() {
    return Array.from(activeUsers.values()).filter(user => user.userType === 'admin');
}

// Message handling
function saveMessage(userId, messageData) {
    if (!chatHistory.has(userId)) {
        chatHistory.set(userId, []);
    }
    
    const messages = chatHistory.get(userId);
    messages.push({
        ...messageData,
        timestamp: moment().toISOString()
    });
    
    // Keep only last 100 messages per user
    if (messages.length > 100) {
        messages.splice(0, messages.length - 100);
    }
    
    chatHistory.set(userId, messages);
}

// Broadcast to all admins
function broadcastToAdmins(event, data) {
    getActiveAdmins().forEach(admin => {
        io.to(admin.socketId).emit(event, data);
    });
}

// Express routes
app.get('/', (req, res) => {
    res.json({
        status: 'NVI Live Chat Server Running',
        timestamp: moment().toISOString(),
        activeUsers: activeUsers.size,
        activeCustomers: getActiveCustomers().length,
        activeAdmins: getActiveAdmins().length
    });
});

// Admin authentication endpoint
app.post('/admin/auth', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        const token = uuidv4();
        res.json({
            success: true,
            token,
            message: 'Admin authenticated successfully'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid admin password'
        });
    }
});

// Get chat history for admin
app.get('/admin/chat-history/:userId', (req, res) => {
    const { userId } = req.params;
    const messages = chatHistory.get(userId) || [];
    
    res.json({
        userId,
        messages,
        messageCount: messages.length
    });
});

// Get all active conversations
app.get('/admin/conversations', (req, res) => {
    const conversations = [];
    
    chatHistory.forEach((messages, userId) => {
        const user = Array.from(activeUsers.values()).find(u => u.userId === userId);
        const lastMessage = messages[messages.length - 1];
        
        conversations.push({
            userId,
            isOnline: user ? user.isOnline : false,
            lastMessage: lastMessage ? lastMessage.message : 'No messages',
            lastMessageTime: lastMessage ? lastMessage.timestamp : null,
            messageCount: messages.length,
            userInfo: user ? user.userInfo : null
        });
    });
    
    // Sort by last message time
    conversations.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return moment(b.lastMessageTime).valueOf() - moment(a.lastMessageTime).valueOf();
    });
    
    res.json(conversations);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins the chat
    socket.on('join', (data) => {
        const { userId, userType, userInfo } = data;
        const user = addUser(socket.id, userId, userType, userInfo);
        
        // Send chat history to user
        const history = chatHistory.get(userId) || [];
        socket.emit('chat_history', history);
        
        // Notify admins about new customer
        if (userType === 'customer') {
            broadcastToAdmins('customer_connected', {
                user,
                timestamp: moment().toISOString()
            });
        }
        
        // Send admin status to customer
        const adminsOnline = getActiveAdmins().length > 0;
        if (userType === 'customer') {
            socket.emit('admin_status', { online: adminsOnline });
        }
    });

    // Admin authentication
    socket.on('admin_connect', (data) => {
        const { adminId, token } = data;
        const user = getUserBySocketId(socket.id);
        
        if (user) {
            user.userType = 'admin';
            user.adminId = adminId;
            console.log(`Admin ${adminId} connected`);
            
            // Send list of active customers
            const customers = getActiveCustomers();
            socket.emit('active_customers', customers);
            
            // Notify customers that admin is online
            customers.forEach(customer => {
                io.to(customer.socketId).emit('admin_status', { online: true });
            });
        }
    });

    // Handle customer messages
    socket.on('message', (messageData) => {
        const user = getUserBySocketId(socket.id);
        if (!user) return;

        const fullMessageData = {
            ...messageData,
            timestamp: moment().toISOString(),
            userInfo: user.userInfo
        };

        // Save message
        saveMessage(user.userId, fullMessageData);

        // If user is customer, forward to all admins
        if (user.userType === 'customer') {
            broadcastToAdmins('customer_message', {
                ...fullMessageData,
                fromUser: user
            });
        }

        // If user is admin, forward to target customer
        if (user.userType === 'admin' && messageData.targetUserId) {
            const targetCustomer = Array.from(activeUsers.values())
                .find(u => u.userId === messageData.targetUserId && u.userType === 'customer');
            
            if (targetCustomer) {
                io.to(targetCustomer.socketId).emit('message', fullMessageData);
                saveMessage(targetCustomer.userId, fullMessageData);
            }
        }
    });

    // Handle admin messages
    socket.on('admin_message', (messageData) => {
        const admin = getUserBySocketId(socket.id);
        if (!admin || admin.userType !== 'admin') return;

        const { targetUserId } = messageData;
        const targetCustomer = Array.from(activeUsers.values())
            .find(u => u.userId === targetUserId && u.userType === 'customer');

        if (targetCustomer) {
            const fullMessageData = {
                ...messageData,
                timestamp: moment().toISOString(),
                adminInfo: {
                    adminId: admin.adminId,
                    socketId: admin.socketId
                }
            };

            // Send to customer
            io.to(targetCustomer.socketId).emit('message', fullMessageData);
            
            // Save message
            saveMessage(targetUserId, fullMessageData);

            // Confirm to admin
            socket.emit('message_sent', {
                success: true,
                targetUserId,
                messageId: messageData.id
            });
        }
    });

    // Typing indicators
    socket.on('typing', (data) => {
        const user = getUserBySocketId(socket.id);
        if (!user) return;

        if (user.userType === 'customer') {
            // Notify admins that customer is typing
            broadcastToAdmins('customer_typing', {
                userId: user.userId,
                userInfo: user.userInfo
            });
        }
    });

    socket.on('stop_typing', (data) => {
        const user = getUserBySocketId(socket.id);
        if (!user) return;

        if (user.userType === 'customer') {
            // Notify admins that customer stopped typing
            broadcastToAdmins('customer_stop_typing', {
                userId: user.userId
            });
        }
    });

    socket.on('admin_typing', (data) => {
        const admin = getUserBySocketId(socket.id);
        if (!admin || admin.userType !== 'admin') return;

        const { targetUserId } = data;
        const targetCustomer = Array.from(activeUsers.values())
            .find(u => u.userId === targetUserId && u.userType === 'customer');

        if (targetCustomer) {
            io.to(targetCustomer.socketId).emit('admin_typing');
        }
    });

    socket.on('admin_stop_typing', (data) => {
        const admin = getUserBySocketId(socket.id);
        if (!admin || admin.userType !== 'admin') return;

        const { targetUserId } = data;
        const targetCustomer = Array.from(activeUsers.values())
            .find(u => u.userId === targetUserId && u.userType === 'customer');

        if (targetCustomer) {
            io.to(targetCustomer.socketId).emit('admin_stop_typing');
        }
    });

    // Get active users (admin only)
    socket.on('get_active_users', () => {
        const user = getUserBySocketId(socket.id);
        if (user && user.userType === 'admin') {
            const customers = getActiveCustomers();
            socket.emit('active_customers', customers);
        }
    });

    // Mark messages as read
    socket.on('messages_read', (data) => {
        const user = getUserBySocketId(socket.id);
        if (user) {
            // Mark messages as read (implement read status if needed)
            broadcastToAdmins('messages_read', {
                userId: user.userId,
                timestamp: moment().toISOString()
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        
        if (user) {
            if (user.userType === 'customer') {
                // Notify admins about customer disconnect
                broadcastToAdmins('customer_disconnected', {
                    user,
                    timestamp: moment().toISOString()
                });
            } else if (user.userType === 'admin') {
                // Notify customers that admin went offline
                const adminsOnline = getActiveAdmins().length > 0;
                getActiveCustomers().forEach(customer => {
                    io.to(customer.socketId).emit('admin_status', { online: adminsOnline });
                });
            }
        }
        
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await saveChatHistory();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

// Load data and start server
loadChatHistory().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 NVI Live Chat Server running on port ${PORT}`);
        console.log(`📝 Chat history file: ${CHAT_HISTORY_FILE}`);
        console.log(`🔐 Admin password: ${ADMIN_PASSWORD}`);
        console.log(`📊 Server status: http://localhost:${PORT}`);
    });
});

module.exports = app;