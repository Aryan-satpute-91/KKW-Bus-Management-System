# Smart Digital Bus Maintenance Management System

Full-stack bus maintenance management app with a Vite React client, Express API, Firebase Auth, Firestore, and Firebase Storage.

## Prerequisites

- Node.js 20 or newer
- Firebase project, for the next migration step
- Firebase Auth, Firestore, and Firebase Storage enabled

## Environment Setup

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PASSWORD_RESET_CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=kkw-bus-management-system
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kkw-bus-management-system.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=kkw-bus-management-system.firebasestorage.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=System Administrator
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Never commit real `.env` files or Firebase service account secrets.

## Firebase Setup

Enable these Firebase products:

- Authentication: Email/Password
- Firestore Database
- Storage

Create the first admin account by setting `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`, then run:

```bash
cd server
npm run seed
```

The seed script creates a Firebase Auth user and a matching Firestore document in `users`.

## Run Locally

Install and start the API:

```bash
cd server
npm install
npm run dev
```

Install and start the client:

```bash
cd client
npm install
npm run dev
```

If port `5000` is already used, set a different `PORT` in `server/.env` and update `client/.env` to match.

## Verification

Client:

```bash
cd client
npm run lint
npm run build
```

Server syntax checks:

```bash
cd server
node -c server.js
node -c controllers/authController.js
node -c controllers/busController.js
node -c controllers/maintenanceController.js
node -c controllers/reportController.js
```
