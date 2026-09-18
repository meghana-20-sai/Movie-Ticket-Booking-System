# 🚀 Deploying SmartCine to Render with Blueprint (IaC)

This project is pre-configured with a **Render Blueprint (`render.yaml`)** to deploy both the **Backend API & WebSocket Web Service** and the **Frontend React Static Site** in a single click.

---

## 1. Prerequisites
1. **GitHub Account**: Push this repository to your GitHub account (`https://github.com/meghana-20-sai/Movie-Ticket-Booking-System.git`).
2. **Render Account**: Sign up or log in at [render.com](https://render.com).
3. **MongoDB Atlas Account (Free Tier)**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas/database).
   - Create a free `M0` cluster.
   - Under **Database Access**, create a user with read/write privileges.
   - Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
   - Click **Connect** -> **Drivers** -> Copy your connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/smartcine?retryWrites=true&w=majority`).

---

## 2. One-Click Blueprint Deployment on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub repository: `meghana-20-sai/Movie-Ticket-Booking-System`.
4. Render will automatically detect `render.yaml` and configure:
   - **`smartcine-backend`** (Web Service, Node.js environment)
   - **`smartcine-frontend`** (Static Site, React/Vite SPA)
5. Under Environment Variables for `smartcine-backend`, enter your **`MONGODB_URI`** connection string from MongoDB Atlas.
6. Click **Apply**. Render will automatically provision, build, and deploy both services!

---

## 3. Environment Variables Reference

### Backend (`smartcine-backend`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Service port | `10000` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/smartcine` |
| `JWT_SECRET` | Auto-generated cryptographic secret | *(Render generates automatically)* |
| `JWT_EXPIRES_IN` | Session token lifespan | `7d` |
| `AUTO_SEED` | Seeds demo movies, multiplexes, and shows on first boot | `true` |
| `CLIENT_URL` | Frontend domain | Linked automatically via Blueprint |

### Frontend (`smartcine-frontend`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public backend host URL | Linked automatically via Blueprint |

---

## 4. Default Seeded Accounts & Credentials

Once deployed and initialized with `AUTO_SEED=true`, you can immediately sign in with:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@smartcine.com` | `Admin@12345` |
| **Customer** | `customer@smartcine.com` | `Customer@12345` |
