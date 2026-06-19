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
- A MongoDB Atlas cluster and connection string

## local setup

### 1. clone the repository
```bash
git clone <repository-url>
cd E-commerce-Credit-Profile-System-1
```

### 2. configure the server
Copy the example env file and install dependencies:
```bash
cd server
npm install
copy .env.example .env
```

Set `MONGO_URI` to your MongoDB Atlas connection string.

### 3. configure the client
```bash
cd ..\client
npm install
copy .env.example .env
```

## running locally

### backend
```bash
cd server
npm run dev
```

### frontend
```bash
cd client
npm run dev
```

## deployment

This project is deployment-friendly with MongoDB Atlas. For production:

1. Create a MongoDB Atlas cluster.
2. Set the backend environment variables in your hosting provider:
	- `MONGO_URI` = Atlas connection string
	- `JWT_SECRET` = strong random secret
	- `NODE_ENV=production`
	- `CLIENT_URL` or `CLIENT_URLS` = your deployed frontend URL(s)
	- `GEMINI_API_KEY` = your Gemini API key if chatbot features are enabled
3. Allow your hosting IP or use Atlas network access settings appropriate for your platform.
4. Build and deploy the client as a static frontend.

This project uses MongoDB Atlas as its database source.

## usage guide

1. Register a customer account.
2. Place orders to generate history.
3. Login as a merchant to view the merchant dashboard.
4. Use profile boosters to improve the score.

## tech stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io, Mongoose
- **Database**: MongoDB Atlas / in-memory dev fallback
- **AI**: Google Gemini

---
© 2025 E-commerce Credit System
