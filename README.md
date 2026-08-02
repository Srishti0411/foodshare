# FoodShare

A real-time surplus food rescue platform. Donors — restaurants, kitchens, shops,
households — post food that would otherwise go to waste. Nearby receivers — shelters,
NGOs, neighbors — get notified instantly, claim it before it expires, and pick it up.
Built on the MERN stack with Socket.io for live updates and MongoDB geospatial queries
for proximity matching.

**Live app:** _add your Vercel URL here_
**API:** _add your Render URL here_

## Features

- Role-based accounts — donor, receiver, admin
- Geospatial matching via MongoDB `2dsphere` / `$near` — no external geocoding needed
- Real-time updates over Socket.io — new listings, claims, and expirations push instantly
- Race-safe claiming — an atomic `findOneAndUpdate` guarantees a listing can never be
  double-claimed
- Countdown-driven expiry with a server-side cron job to auto-expire stale listings
- Two-way trust ratings after each confirmed pickup, rolled up via aggregation
- Optional photo uploads (Cloudinary) and an interactive Leaflet map

## Tech stack

**Frontend:** React (Vite), Tailwind, React Router, Zustand, TanStack Query, Axios,
Socket.io client, Leaflet
**Backend:** Node, Express, MongoDB/Mongoose, JWT, Socket.io, node-cron, Cloudinary

## How the interesting parts work

**Race-safe claiming** — one atomic operation resolves simultaneous claim attempts:
```js
FoodListing.findOneAndUpdate(
  { _id: req.params.id, status: 'available' },
  { status: 'claimed', claimedBy: req.user._id },
  { new: true }
);
```
If two requests hit at once, only one can still match `available` — the loser gets a
clean 409 instead of corrupting state.

**Proximity matching** — a native geospatial query, no third-party geocoding service:
```js
FoodListing.find({
  location: { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: radiusKm * 1000 } },
});
```

**Real-time delivery** — clients join a coarse geographic "grid cell" room by
coordinates; new listings broadcast to that cell and its neighbors, so nearby receivers
see updates within seconds without polling.

## Running it locally

**Backend**
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed             # optional demo data, password123 for all seeded users
npm run dev               # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

The dev server proxies `/api` to `localhost:5000` automatically — no extra config needed
locally.

### Environment variables

| Variable | Where | Required |
|---|---|---|
| `MONGO_URI` | backend | yes |
| `JWT_SECRET` | backend | yes |
| `CLIENT_URL` | backend | yes in production |
| `VITE_SOCKET_URL` | frontend | yes in production |
| `CLOUDINARY_*` | backend | only for photo uploads |

## Deployment

- **Frontend** → Vercel. Root dir `frontend`, build `npm run build`, output `dist`. Set
  `VITE_SOCKET_URL` to your backend URL.
- **Backend** → Render. Root dir `backend`, build `npm install`, start `npm start`. Set
  `CLIENT_URL` to your frontend URL.
- **Database** → MongoDB Atlas, images → Cloudinary free tier.

## API overview

`POST /api/auth/register|login` · `GET/PATCH /api/auth/me` · `GET/POST /api/listings` ·
`GET /api/listings/:id` · `POST /api/listings/:id/claim` · `GET /api/claims/mine` ·
`PATCH /api/claims/:id/confirm|cancel` · `POST /api/ratings`

All routes except register/login require a `Bearer` JWT in the `Authorization` header.

## License

MIT