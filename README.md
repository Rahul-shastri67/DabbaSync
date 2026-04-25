# 🍱 DabbaSync

### Hyperlocal Tiffin Subscription Platform

A production-ready **MERN Stack SaaS platform** for managing daily tiffin subscriptions with smart skip logic, real-time order tracking, auto billing, and vendor operations.

## 🚀 Features

* 🔐 JWT Authentication & Role-Based Access
* 📅 Smart Skip Calendar with Auto Billing Adjustment
* ⏱️ 1-Hour Delivery Cancellation Lock
* 📡 Real-Time Order Tracking with Socket.io
* 💳 Wallet + Subscription Billing
* 📊 Vendor Analytics Dashboard
* 👨‍💼 Admin Management Panel
* ⏰ Automated Cron Jobs & Meal Reminders

---

## 🛠 Tech Stack

**Frontend:** React, Tailwind CSS, Socket.io Client
**Backend:** Node.js, Express.js
**Database:** MongoDB + Mongoose
**Realtime:** Socket.io
**Payments:** Razorpay
**Scheduler:** Node-Cron
**Authentication:** JWT

---

## 📂 Project Structure

```bash
DabbaSync/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   └── src/
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### Clone Repository

```bash
git clone https://github.com/Rahul-shastri67/DabbaSync.git
cd DabbaSync
```

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Configure Environment

Create `.env` in backend:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dabbsync
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
```

### Seed Demo Data

```bash
node utils/seed.js
```

Demo Accounts:

| Role     | Email                                               | Password    |
| -------- | --------------------------------------------------- | ----------- |
| Admin    | [admin@dabbsync.in](mailto:admin@dabbsync.in)       | password123 |
| Vendor   | [vendor@dabbsync.in](mailto:vendor@dabbsync.in)     | password123 |
| Customer | [customer@dabbsync.in](mailto:customer@dabbsync.in) | password123 |

---

## ▶ Run Project

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

App runs at:

```bash
http://localhost:3000
```

---

## 🔌 Core Modules

* Authentication System
* Subscription & Skip Logic
* Vendor Dashboard
* Real-Time Order Tracking
* Wallet & Billing Engine
* Admin Control Panel

---

## 📈 Future Enhancements

* AI Demand Forecasting
* Push Notifications
* Multi-Vendor Marketplace
* Delivery GPS Tracking

---

## 👨‍💻 Author

**Rahul Shastri**

GitHub: https://github.com/Rahul-shastri67

---

⭐ If you like this project, give it a star.
