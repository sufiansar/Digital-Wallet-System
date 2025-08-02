# 💳 Digital Wallet System (Backend)

A secure, role-based, and feature-rich **Digital Wallet System** built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This backend supports multiple user roles (`Admin`, `Agent`, `User`) and includes core functionalities like wallet management, cash in/out, transactions, agent commissions, and approval workflows.

---

## 📌 Features

### 🔐 Authentication & Authorization
- JWT-based secure login & role-based access
- Admin, Agent, and User roles with restricted actions

### 👛 Wallet System
- Create & manage user wallets
- Add balance (cash in)
- Cash out to agents
- Withdraw money (user-to-bank)

### 🔁 Transaction History
- Complete transaction log with sender, receiver, amount, and type (cash-in, cash-out, transfer)
- Filtering & search capabilities

### 🧑‍💼 Agent Management
- Agent registration with approval/suspension by Admin
- Agents can handle user cash out requests
- Commission auto-calculation on transactions

### 🧾 Admin Controls
- Access to all wallets and transactions
- Approve or suspend agents
- Block/unblock user wallets
- Add balance to any user wallet

---

## 🛠️ Tech Stack

| Tech       | Usage                                 |
|------------|----------------------------------------|
| Node.js    | Runtime                                |
| Express.js | Backend framework                      |
| TypeScript | Type safety & structure                |
| MongoDB    | Database (Mongoose ODM)                |
| JWT        | Authentication                         |
| Zod        | (Optional) Schema validation           |
| Mongoose   | MongoDB object modeling                |

---

## 📂 Project Structure
```
src/
├── modules/
│   ├── auth/           # Authentication (register/login/logout)
│   ├── user/           # User, Agent, Admin logic & roles
│   ├── wallet/         # Wallet operations & balance control
│   └── transaction/    # Transaction logging & commission tracking
│
├── middlewares/        # Custom middlewares (auth, validation, error handler)
├── config/             # Environment setup & DB config
├── utils/              # Utility functions (response, error, helper logic)
├── app.ts              # Express app setup and route bindings
```


---

## 🚀 API Endpoints

> Base URL: `http://localhost:5000/api/v1`

### 🔐 Auth Routes
| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| POST   | `/auth/userlogin` | Register user/agent      |
| POST   | `/auth/logout`    | Logout current session    |
| POST   | `/auth/refreshtoken`    | Refresh access token  |


---

### 👥 User Routes
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/user/create-user`       | Create a new user/agent  |
| PATCH  | `/user/:id`               | Update user (Admin only) |
| GET    | `/user`                   | Get all users (Admin)    |
| DELETE | `/user/:id`               | Delete user (Any role)   |
| PATCH  | `/user/approve-agent/:id` | Approve agent (Admin)    |
| PATCH  | `/user/suspend-agent/:id` | Suspend agent (Admin)    |

---

### 👛 Wallet Routes
| Method | Endpoint                         | Description                            |
|--------|----------------------------------|----------------------------------------|
| GET    | `/wallet/my-wallet`              | Get logged-in user's wallet            |
| POST   | `/wallet/add-balance/:userId`    | Admin adds balance to user wallet      |
| POST   | `/wallet/cash-in`                | Agent adds cash-in for user            |
| POST   | `/wallet/cash-out`               | User initiates cash out via agent      |
| POST   | `/wallet/send-money`             | Send money to another user             |
| POST   | `/wallet/withdraw-money`         | Withdraw to bank (User/Agent)          |
| PATCH  | `/wallet/block/:id`              | Block a wallet (Admin only)            |
| PATCH  | `/wallet/unblock/:id`            | Unblock a wallet (Admin only)          |
| GET    | `/wallet/all`                    | Get all wallets (Admin only)           |
| GET    | `/wallet/:id`                    | Get wallet by ID (Admin only)          |

---

### 💸 Transaction Routes
| Method | Endpoint                    | Description                             |
|--------|-----------------------------|-----------------------------------------|
| GET    | `/transaction/my`           | Get current user's transactions         |
| GET    | `/transaction/commissions`  | Agent's commission transaction history  |
| GET    | `/transaction/all`          | Get all transactions (Admin only)       |

---

To-Do / Upcoming Features

 Bank API integration for withdrawals

 Dashboard with analytics (future scope)

 Notification system for users


 Conclusion
The Digital Wallet System provides a robust, secure, and scalable foundation for managing digital financial transactions between users, agents, and administrators. With built-in role-based access control, wallet operations, transaction history, and commission handling, this system is designed to serve as a backend backbone for modern fintech applications.

Whether you're building a personal wallet app, an agent-based money service, or a full-scale digital payment gateway, this backend can be easily extended and integrated into larger systems.


