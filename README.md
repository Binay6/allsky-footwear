# All Sky Footwear: MERN prototype

A working e-commerce prototype built from the Vatsin proposal, using **M**ongoDB (Atlas), **E**xpress, **R**eact and **N**ode.
Every file has simple comments explaining each section.

## What's inside

**Customer side:** home page, product catalog with filters/search/sort, product pages with size and color options,
cart, checkout (address, coupon codes, mock COD/UPI/Card payment), login/register, order history with tracking.

**Admin side** (`/admin`): sales dashboard, add/edit/delete products, view orders and change their status, create/pause/delete coupons.

## Folder map

```
allsky-footwear/
├── server/                 <- BACKEND (Node + Express + MongoDB)
│   ├── server.js           start here: creates the server, connects routes
│   ├── seed.js             fills the database with sample data
│   ├── config/db.js        connects to MongoDB Atlas
│   ├── models/             shapes of the data: User, Product, Coupon, Order
│   ├── middleware/auth.js  checks login tokens (protect / adminOnly)
│   └── routes/             API endpoints: auth, products, coupons, orders, admin
└── client/                 <- FRONTEND (React + Vite)
    └── src/
        ├── main.jsx        starts React
        ├── App.jsx         list of pages (URLs)
        ├── api.js          one helper to call the backend
        ├── context/        shared data: logged-in user, shopping cart
        ├── components/     Navbar, ProductCard
        ├── pages/          Home, Shop, ProductDetail, Cart, Checkout, Orders, Login, Admin
        └── styles.css      all the design
```

## Setup (one time)

### 1. Install Node.js
Download the LTS version from nodejs.org (v18 or newer).

### 2. Create a free MongoDB Atlas database
1. Sign up at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access** -> Add a database user (remember the username and password).
3. **Network Access** -> Add IP Address -> "Allow access from anywhere" (fine for learning).
4. **Database** -> Connect -> **Drivers** -> copy the connection string. It looks like
   `mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/`
5. Replace `<password>` with your real password, and add the database name `allsky` before the `?`.
   If your password has special characters like `@` or `#`, URL-encode them.

### 3. Set up the backend
```bash
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```
Open `.env` and paste your connection string into `MONGO_URI`. Change `JWT_SECRET` to any long random text.

Load the sample data, then start the server:
```bash
npm run seed
npm run dev
```
You should see `MongoDB connected` and `Server running on http://localhost:5000`.

### 4. Set up the frontend (open a second terminal)
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173**.

## Demo logins (created by the seed script)
| Role     | Email              | Password |
|----------|--------------------|----------|
| Admin    | admin@allsky.com   | admin123 |
| Customer | user@allsky.com    | user123  |

Coupon codes to try: `WELCOME10` (10% off), `FESTIVE15` (15% off above ₹999), `SKY20` (20% off above ₹1,999).

## How a request flows (good to understand)
Example: a customer opens the shop page.
1. `Shop.jsx` calls `api('/products?category=Men')`.
2. Vite forwards `/api/...` to the Express server (see `client/vite.config.js`).
3. `server.js` sends it to `routes/products.js`, which asks MongoDB (through `models/Product.js`).
4. The products come back as JSON and React draws them as cards.

## Ideas to practise next
- Add a wishlist (a new model + routes + a heart button on `ProductCard`).
- Replace the placeholder images with real photos, or add image upload.
- Swap the mock payment for Razorpay test mode.
- Deploy: server on Render, client on Vercel/Netlify, database stays on Atlas.

## Note on the proposal
The proposal is for WordPress/WooCommerce; this prototype recreates the same feature list in MERN so you can learn from it.
Wishlist, real payment gateways, SEO tooling and email notifications are not included.
