<div align="center">

# 💬 ChatHub - Real-Time Chat Application

### A modern, feature-rich chat platform built with React, Node.js, and Socket.IO

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://your-app.netlify.app)
[![Backend](https://img.shields.io/badge/backend-deployed-blue?style=for-the-badge)](https://chat-app-backend-a017.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

[🌐 Live Demo](https://chat-application-onlline.netlify.app) • [📖 Documentation](#-documentation) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

![Chat Application Preview](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Add+Your+Screenshot+Here)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📦 Deployment](#-deployment)
- [🏗️ Architecture](#️-architecture)
- [🔌 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

<details>
<summary><b>🔐 Authentication & Security</b></summary>

- JWT-based authentication with HTTP-only cookies
- Secure password hashing using bcrypt
- Email verification for new accounts
- Protected routes and API endpoints
- Token refresh mechanism
- Session management

</details>

<details>
<summary><b>💬 Messaging System</b></summary>

- **Real-time messaging** powered by Socket.IO
- **Direct messages** - Private 1-on-1 conversations
- **Group chats** - Create groups with multiple members
- **Message replies** - Thread-like conversation flow
- **Message deletion** - Delete your own messages
- **Typing indicators** - See when others are typing
- **Read receipts** - Track message delivery status
- **Unread counters** - Badge notifications on channels

</details>

<details>
<summary><b>👥 Social Features</b></summary>

- **Friend system** - Send, accept, or reject friend requests
- **User search** - Find users by name or email
- **Online status** - Real-time user presence
- **User profiles** - Customizable profiles with avatars
- **Block users** - Privacy control to block unwanted users
- **Status messages** - Share what you're up to

</details>

<details>
<summary><b>📎 File Sharing</b></summary>

- Upload images, documents, videos, and audio
- File preview before sending
- Cloud storage via Cloudinary CDN
- Support for multiple file types
- 10MB file size limit
- Automatic image optimization

</details>

<details>
<summary><b>🎨 User Experience</b></summary>

- Clean, modern UI with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Dark mode interface
- Toast notifications for real-time updates
- Smooth animations and transitions
- Emoji support in messages
- Message timestamps
- Infinite scroll for message history

</details>

---

## 🛠️ Tech Stack

### **Frontend**

| Technology | Purpose | Version |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | UI Framework | 18.x |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build Tool | 5.x |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Styling | 3.x |
| ![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) | WebSockets | 4.x |
| ![Zustand](https://img.shields.io/badge/Zustand-000000?style=flat) | State Management | 4.x |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white) | Routing | 6.x |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white) | HTTP Client | 1.x |

### **Backend**

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) | Runtime | 18.x |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) | Web Framework | 4.x |
| ![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) | WebSockets | 4.x |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | ORM | 5.x |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) | Database | 15.x |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white) | Authentication | 9.x |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white) | Cloud Storage | 2.x |

### **DevOps & Deployment**

- **Netlify** - Frontend hosting
- **Render** - Backend hosting
- **Neon** - PostgreSQL database
- **Cloudinary** - Media storage CDN

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Installation

1️⃣ **Clone the repository**

```bash
git clone https://github.com/Vamshi2629/chat-application.git
cd chat-application
```

2️⃣ **Setup Backend**

```bash
cd server
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, JWT_SECRET, EMAIL credentials, CLOUDINARY credentials

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

The backend server will start on `http://localhost:5000`

3️⃣ **Setup Frontend**

```bash
cd ../client
npm install

# Optional: Create local environment file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

4️⃣ **Open your browser**

Navigate to `http://localhost:5173` and start chatting! 🎉

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chatdb"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Service (Gmail example)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Cloudinary (Get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend Environment Variables

Create a `.env.production` file in the `client` directory:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 📦 Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `chat-app-backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push --accept-data-loss`
   - **Start Command**: `npm start`
6. Add all environment variables
7. Click **Create Web Service**

### Deploy Frontend to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click **Add new site** → **Import an existing project**
4. Connect your GitHub repository
5. Configure:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variable: `VITE_API_URL`
7. Click **Deploy site**

### Update Backend CORS

After deployment, update `server/src/app.js`:

```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-netlify-app.netlify.app'
    ],
    credentials: true
}));
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │   Zustand    │  │  Socket.IO   │     │
│  │  Components  │◄─┤    Store     │◄─┤    Client    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP/REST        │ State Sync       │ WebSocket
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Express    │  │   Socket.IO  │  │   Prisma     │     │
│  │   Routes     │  │   Handlers   │  │     ORM      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │    Database      │
                    └──────────────────┘
```

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-email` | Verify email address |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q=query` | Search users |
| GET | `/api/users/:userId` | Get user profile |
| PUT | `/api/users/profile` | Update own profile |

### Friend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | Get friends list |
| GET | `/api/friends/pending` | Get pending requests |
| POST | `/api/friends/request/:userId` | Send friend request |
| POST | `/api/friends/accept/:requestId` | Accept friend request |
| DELETE | `/api/friends/:friendshipId` | Remove friend |

### Channel Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | Get all channels |
| GET | `/api/channels/:channelId` | Get channel details |
| POST | `/api/channels/direct/:userId` | Create/get DM channel |
| POST | `/api/channels/group` | Create group channel |

### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:channelId` | Get channel messages |
| POST | `/api/messages/:channelId` | Send message |
| DELETE | `/api/messages/:messageId` | Delete message |

### WebSocket Events

**Client → Server**

- `join_room` - Join a channel
- `leave_room` - Leave a channel
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

**Server → Client**

- `new_message` - New message received
- `message_deleted` - Message was deleted
- `user_online` - User came online
- `user_offline` - User went offline
- `friend_request` - New friend request
- `channel_created` - New channel created

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

### How to Contribute

1. **Fork** the Project
2. **Create** your Feature Branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your Changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the Branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📸 Screenshots

<details>
<summary><b>View Screenshots</b></summary>

### Login & Registration
![Login](./screenshots/login.png)

### Chat Interface
![Chat](./screenshots/chat.png)

### Group Creation
![Groups](./screenshots/groups.png)

### Profile Management
![Profile](./screenshots/profile.png)

### Friend Management
![Friends](./screenshots/friends.png)

</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Vamshi**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Vamshi2629)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yourprofile)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:chatinonline27@gmail.com)

</div>

---

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js
- [Cloudinary](https://cloudinary.com/) - Cloud-based image and video management
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icon toolkit
- [React Hot Toast](https://react-hot-toast.com/) - Smoking hot React notifications

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ by [Vamshi](https://github.com/Vamshi2629)**

</div>
