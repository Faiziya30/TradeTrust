# E-commerce Credit Profile System

A comprehensive e-commerce platform with a built-in credit scoring system, merchant dashboard, and AI-powered financial assistant.

## features

- **Customer Credit Profile**: Real-time credit scoring based on purchase history and behavior.
- **Score Boosters**: Verifiable tasks to improve trust scores (KYC, profile completion, etc.).
- **Merchant Dashboard**: Premium UI for merchants to manage customers, orders, risk, and returns.
- **AI Chatbot**: Gemini-powered "Score Copilot" for personalized financial advice.
- **Flexible Payments**: Buy Now Pay Later (BNPL) options unlocked by credit score.

## prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas URL)

## installation

### 1. clone the repository
```bash
git clone <repository-url>
cd ecommerce-credit-profile-system
```

### 2. setup server
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder with the following credentials:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce-credit-system
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. setup client
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

## running the application

### start the backend
In the `server` directory:
```bash
npm run dev
```
*Server runs on http://localhost:5000*

### start the frontend
In the `client` directory:
```bash
npm run dev
```
*Client runs on http://localhost:5173*

## usage guide

1.  **Register a Customer**: Sign up as a new user to view your credit profile.
2.  **Place Orders**: Buy items to generate history (Score won't generate until you have activity).
3.  **Merchant Access**: Login with merchant credentials to view the dashboard at `/merchant/dashboard`.
4.  **Boost Score**: Go to `Profile > Score Boosters` to complete tasks.

## tech stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **AI**: Google Gemini 2.5 Flash

---
© 2025 E-commerce Credit System
