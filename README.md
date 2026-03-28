# 💬 Chat App

A real-time chat application built with **vanilla JavaScript** and **Firebase**. Features include public & private chat rooms, a friend system, user profiles, and real-time messaging — all with a sleek, modern dark-themed UI.

🔗 **Live Demo:** [chat-app-267e7.web.app](https://chat-app-267e7.web.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Email/password registration & login with Firebase Auth |
| 💬 **Chat Rooms** | Create public or private rooms with real-time messaging |
| 🔍 **Browse & Join** | Discover and join public rooms created by other users |
| 👥 **Friend System** | Send/accept friend requests with online/offline status |
| 💌 **Direct Messages** | Private 1-on-1 conversations with friends |
| ⚙️ **User Settings** | Update username, bio, status, and change password |
| 🟢 **Online Presence** | Real-time online/offline status tracking |
| 🎨 **Modern UI** | Dark-themed, responsive design with smooth animations |

---

## 📸 Screenshots

### Login & Registration
Clean, centered authentication forms with toggle between Login and Register modes. Includes input validation and user-friendly error messages for duplicate emails, weak passwords, and invalid credentials.

<p align="center">
  <img src="screenshots/login.png" alt="Login Page" width="700"/>
</p>

<p align="center">
  <img src="screenshots/register_form_initial_1773092497627.png" alt="Register Page" width="700"/>
</p>

### Dashboard — Rooms
Main dashboard view showing your joined chat rooms. The sidebar provides quick navigation between Rooms, Friends, and Settings sections.

<p align="center">
  <img src="screenshots/dashboard_after_registration_1773092538335.png" alt="Dashboard" width="700"/>
</p>

### Real-Time Chat
Send and receive messages instantly across users. Each message displays the sender name, avatar, and timestamp.

<p align="center">
  <img src="screenshots/general_chat_room_messages_1773093424045.png" alt="Chat Room" width="700"/>
</p>

### Browse & Join Rooms
Discover public rooms created by the community and join them with a single click.

<p align="center">
  <img src="screenshots/browse_rooms_modal_1773093310522.png" alt="Browse Rooms" width="700"/>
</p>

### Friends List
View your friends with their online/offline status. Send friend requests by username and accept incoming requests.

<p align="center">
  <img src="screenshots/friends_list_showing_testuser1_1773093443185.png" alt="Friends List" width="700"/>
</p>

### Account Settings
Update your profile information including username, bio, and status. Change your password securely.

<p align="center">
  <img src="screenshots/screenshot_settings_1773095479960.png" alt="Settings" width="700"/>
</p>

### Error Handling
Friendly toast notifications for all edge cases — duplicate emails, invalid credentials, and more.

<p align="center">
  <img src="screenshots/register_existing_email_error_1773092599496.png" alt="Error Handling" width="700"/>
</p>

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Backend:** Firebase (Authentication, Cloud Firestore, Realtime Database)
- **Hosting:** Firebase Hosting
- **Architecture:** Single Page Application (SPA) with hash-based routing

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- A [Firebase](https://firebase.google.com/) project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Chat-App-SAP.git
   cd Chat-App-SAP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy the template config:
     ```bash
     cp src/js/firebase-config.template.js src/js/firebase-config.js
     ```
   - Get your Firebase credentials from the [Firebase Console](https://console.firebase.google.com/)
   - Replace the placeholder values in `firebase-config.js`
   - ⚠️ **Never commit** `firebase-config.js` to Git

4. **Run locally**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

### Deployment

```bash
firebase deploy
```

---

## 📁 Project Structure

```
Chat-App-SAP/
├── index.html                # Entry point with Firebase SDK
├── firebase.json             # Firebase hosting config
├── package.json              # Dependencies and scripts
├── screenshots/              # App screenshots
└── src/
    ├── css/
    │   └── styles.css        # Complete design system
    └── js/
        ├── app.js            # SPA router & event handling
        ├── firebase-config.js   # Firebase credentials (gitignored)
        ├── services/
        │   ├── authService.js   # Registration, login, logout
        │   ├── roomService.js   # Room CRUD & DM management
        │   ├── chatService.js   # Real-time messaging
        │   ├── friendService.js # Friend requests & management
        │   └── userService.js   # User profile operations
        ├── views/
        │   ├── loginView.js     # Login/Register rendering
        │   └── dashboardView.js # Dashboard layout & sections
        └── utils/
            └── toast.js         # Toast notification system
```

---

## 🔒 Firebase Security

The app uses Firebase Security Rules to protect data:

- **Users** can only read/write their own profile
- **Rooms** are accessible only to members
- **Messages** can only be sent by authenticated room members
- **Friend requests** require authentication and prevent self-requests

---
