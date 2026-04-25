# 🍱 DabbaSync — Hyperlocal Tiffin Subscription Platform

A production-ready MERN stack SaaS platform for managing daily tiffin subscriptions with smart skip logic, live tracking, auto-billing, and real-time vendor operations.

---

## 🚀 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Tailwind CSS, Recharts, Socket.io-client |
| Backend    | Node.js, Express.js |
| Database   | MongoDB + Mongoose |
| Real-time  | Socket.io |
| Payments   | Razorpay |
| Scheduler  | node-cron |
| Notifications | Twilio WhatsApp/SMS |
| Auth       | JWT |

---

## 📁 Project Structure

```
DabbaSync/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # authController, vendorController, orderController, paymentController, adminController
│   ├── middleware/     # JWT auth + role guard
│   ├── models/         # User, Vendor, MealPlan, Subscription, Order, Payment, Notification
│   ├── routes/         # auth, vendor, customer, order, subscription, payment, mealPlan, admin
│   ├── utils/          # cron jobs, seed script, notifications (Twilio)
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── context/    # AuthContext (JWT, socket connect)
│       ├── pages/
│       │   ├── Auth/       # Login, Register
│       │   ├── Customer/   # Dashboard, BrowsePlans, PlanDetail, MySubscriptions,
│       │   │               # SkipCalendar, TrackOrder, Wallet, Profile
│       │   ├── Vendor/     # Dashboard, Orders, MealPlans, Subscriptions, Analytics
│       │   └── Admin/      # Dashboard
│       ├── components/
│       │   └── common/     # CustomerLayout (bottom nav), VendorLayout (sidebar)
│       └── utils/          # api.js (axios), socket.js, helpers.js
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd DabbaSync

# Backend
cd backend
cp .env.example .env        # fill in your secrets
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure `.env` (backend)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dabbsync
JWT_SECRET=your_secret_here
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP=whatsapp:+14155238886
CLIENT_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
cd backend
node utils/seed.js
```

Creates 3 demo accounts:
| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@dabbsync.in        | password123 |
| Vendor   | vendor@dabbsync.in       | password123 |
| Customer | customer@dabbsync.in     | password123 |

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

App runs at → **http://localhost:3000**

---

## 🐳 Docker (Production)

```bash
cp backend/.env.example backend/.env   # fill secrets
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:5000

---

## 🔑 API Reference

### Auth
| Method | Endpoint            | Access  | Description           |
|--------|---------------------|---------|-----------------------|
| POST   | /api/auth/register  | Public  | Register user/vendor  |
| POST   | /api/auth/login     | Public  | Login, returns JWT    |
| GET    | /api/auth/me        | Private | Get current user      |
| PUT    | /api/auth/profile   | Private | Update profile        |

### Customer
| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| GET    | /api/subscriptions/my            | My active subscriptions        |
| POST   | /api/subscriptions               | Create subscription            |
| POST   | /api/subscriptions/skip          | Skip meal dates (bill adjusts) |
| POST   | /api/subscriptions/unskip        | Un-skip a date                 |
| PUT    | /api/subscriptions/:id/pause     | Pause (vacation mode)          |
| PUT    | /api/subscriptions/:id/resume    | Resume subscription            |
| GET    | /api/orders/today                | Today's meals                  |
| PUT    | /api/orders/:id/cancel           | Cancel (within 1hr window)     |
| PUT    | /api/orders/:id/rate             | Rate a delivered meal          |
| GET    | /api/customer/wallet             | Wallet balance + referral code |
| GET    | /api/customer/notifications      | Notification feed              |

### Vendor
| Method | Endpoint                      | Description               |
|--------|-------------------------------|---------------------------|
| GET    | /api/vendor/dashboard         | Live metrics + today's orders |
| GET    | /api/vendor/orders            | Filterable order list     |
| PUT    | /api/orders/:id/status        | Update order status       |
| GET    | /api/vendor/analytics         | Revenue, skip rate, charts |
| GET    | /api/vendor/subscriptions     | Active subscriber ledger  |
| POST   | /api/vendor/meal-plans        | Create meal plan          |
| PUT    | /api/vendor/meal-plans/:id    | Edit meal plan            |

### Payments
| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | /api/payments/create-order    | Create Razorpay order          |
| POST   | /api/payments/verify          | Verify payment, activate sub   |
| POST   | /api/payments/wallet-topup    | Add money to wallet            |
| GET    | /api/payments/history         | Transaction history            |

### Admin
| Method | Endpoint                         | Description           |
|--------|----------------------------------|-----------------------|
| GET    | /api/admin/stats                 | Platform overview     |
| GET    | /api/admin/vendors               | All vendor accounts   |
| PUT    | /api/admin/vendors/:id/approve   | Approve vendor        |
| GET    | /api/admin/revenue               | Revenue report        |

---

## ⏰ Automated Cron Jobs

| Schedule         | Job                                          |
|------------------|----------------------------------------------|
| Every minute     | Lock cancellations 1hr before delivery       |
| 7:30 AM daily    | Send breakfast reminders via notification    |
| 1:00 PM daily    | Send lunch reminders                         |
| 7:30 PM daily    | Send dinner reminders                        |
| 10:00 PM daily   | Auto-expire ended subscriptions              |
| 11:00 PM daily   | Auto-mark unresolved orders as delivered     |

---

## 🔌 Real-Time Events (Socket.io)

| Event           | Direction       | Payload                                   |
|-----------------|-----------------|-------------------------------------------|
| `skip_update`   | Server → Vendor | `{ customerId, skippedDates, newCount }`  |
| `order_status`  | Server → Customer | `{ orderId, status }`                   |
| `order_cancelled` | Server → Vendor | `{ orderId }`                          |

---

## 📱 User Flows

### Customer Flow
1. Register → Browse plans → Subscribe → Pay via Razorpay
2. Dashboard shows today's meals with live status
3. Skip calendar → bill auto-adjusts in real time
4. Cancel order within 1-hour window → wallet refund
5. Rate delivered meals → contribute to vendor ratings

### Vendor Flow
1. Register as vendor → Admin approves account
2. Create meal plans with menus + delivery slots
3. Control tower dashboard: live skip feed + order table
4. Update order status (preparing → out for delivery → delivered)
5. Analytics: revenue charts, skip rate, meal type breakdown

---

## 🌱 Environment Variables

| Variable              | Required | Description                     |
|-----------------------|----------|---------------------------------|
| MONGO_URI             | ✅       | MongoDB connection string       |
| JWT_SECRET            | ✅       | Secret for signing tokens       |
| RAZORPAY_KEY_ID       | ⚠️ Optional | Razorpay test key              |
| RAZORPAY_KEY_SECRET   | ⚠️ Optional | Razorpay secret                |
| TWILIO_ACCOUNT_SID    | ⚠️ Optional | For WhatsApp notifications     |
| TWILIO_AUTH_TOKEN     | ⚠️ Optional | Twilio auth                    |
| CLIENT_URL            | ✅       | Frontend URL (CORS)             |

> **Note:** Razorpay and Twilio are optional for local dev. The app degrades gracefully — payments will use test mode and notifications will log to console.

---

## 📦 Deployment

### Backend (Railway / Render)
1. Push `backend/` as root
2. Set all env variables in dashboard
3. Build command: `npm install`
4. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Push `frontend/` as root
2. Set `REACT_APP_API_URL=https://your-backend.railway.app/api`
3. Build command: `npm run build`
4. Output dir: `build/`

---

## 🏗️ Extending the Project

- **Push Notifications** → Add Firebase Cloud Messaging (FCM) with device tokens stored in `User.deviceTokens`
- **Multi-vendor marketplace** → MealPlan model already supports multiple vendors; add a discovery page
- **AI meal recommendations** → Feed `Order` history to an LLM via the Anthropic API
- **Delivery boy tracking** → Add a `DeliveryBoy` model; stream GPS coords via Socket.io to the customer tracking page
- **Coupon engine** → Add a `Coupon` model; apply at checkout in `paymentController.createRazorpayOrder`

---

Made with ❤️ — DabbaSync
