import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    socket = null;

    connect(token) {
        this.socket = io(SOCKET_URL, {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
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

    markAsRead(channelId, messageId) {
        if (this.socket) {
            this.socket.emit('read_message', { channelId, messageId });
        }
    }

    onMessage(callback) {
        if (this.socket) {
            this.socket.on('message_received', callback);
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    onReadReceipt(callback) {
        if (this.socket) {
            this.socket.on('read_receipt_update', callback);
        }
    }
}

export default new SocketService();
