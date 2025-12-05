import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    joinRoom(channelId) {
        if (this.socket) {
            this.socket.emit('join_room', channelId);
        }
    }

    leaveRoom(channelId) {
        if (this.socket) {
            this.socket.emit('leave_room', channelId);
        }
    }

    sendMessage(channelId, content, replyToId = null) {
        if (this.socket) {
            this.socket.emit('send_message', { channelId, content, replyToId });
        }
    }

    // Notify that message was delivered (received by client)
    messageDelivered(channelId, messageId, senderId) {
        if (this.socket) {
            this.socket.emit('message_delivered', { channelId, messageId, senderId });
        }
    }

    // Notify that message was read (seen by user)
    messageRead(channelId, messageId, senderId) {
        if (this.socket) {
            this.socket.emit('message_read', { channelId, messageId, senderId });
        }
    }

    startTyping(channelId) {
        if (this.socket) {
            this.socket.emit('typing_start', channelId);
        }
    }

    stopTyping(channelId) {
        if (this.socket) {
            this.socket.emit('typing_stop', channelId);
        }
    }

    // Deprecated - use messageRead instead
    markAsRead(channelId, messageId) {
        if (this.socket) {
            this.socket.emit('read_message', { channelId, messageId });
        }
    }
}

export default new SocketService();
