# FoodShare

A real-time surplus food rescue platform. Donors (restaurants, shops, kitchens) post food
that's about to go to waste; nearby receivers (shelters, NGOs, neighbors) get notified
instantly, claim it before it expires, and pick it up. Built on the MERN stack with
Socket.io for live updates and MongoDB geospatial queries for proximity matching.

## Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Zustand, TanStack Query, Axios,
  Socket.io client, Leaflet for maps
- **Backend**: Node, Express, MongoDB/Mongoose, JWT auth, Socket.io, node-cron, Cloudinary
  (photo uploads)

## Project layout

```
foodshare/
  backend/     Express API, MongoDB models, sockets, cron job
  frontend/    Vite + React client
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — the free tier at https://www.mongodb.com/cloud/atlas is enough
- (Optional) A free Cloudinary account at https://cloudinary.com if you want photo uploads
  to work. Without it, listings can still be created, just without a photo.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# open .env and fill in MONGO_URI, JWT_SECRET, and (optionally) Cloudinary keys
npm install
npm run seed   # optional: creates demo donors, receivers, and listings
npm run dev    # starts on http://localhost:5000
```

`npm run seed` creates two demo donors and two demo receivers, all with the password
`password123`, plus a few sample listings, so you can log in and see the board populated
right away. Check `backend/utils/seed.js` for the exact accounts.

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so as long as the
backend is running, no extra configuration is needed for local development. If you deploy
the backend elsewhere, set `VITE_SOCKET_URL` in a `frontend/.env` file to that backend's
URL so the Socket.io client connects to the right place.

## 4. Using the app

1. Register as a **donor** (a restaurant/kitchen/shop) or a **receiver** (a shelter/NGO/
   individual). Allow location access when prompted — this drives all the proximity
   matching. If you skip it, a default location (Delhi) is used so the app stays usable.
2. As a donor, post surplus food with a quantity, category, and a rescue window (how many
   hours until it must be picked up).
3. As a receiver, browse the manifest (the board of listings), filter by category or
   radius, and claim anything available. The claim is atomic on the server, so if two
   receivers tap claim on the same listing at the same moment, only one succeeds.
4. Once the food is handed over, either party confirms the pickup, which unlocks a
   1–5 star rating for the other side. Ratings roll up into a running average shown on
   profiles.
5. Listings that pass their expiry time without being claimed are automatically marked
   expired by a server-side cron job that runs every minute.

## 5. Pushing to GitHub

```bash
cd foodshare
git init
git add .
git commit -m "Initial commit: FoodShare MERN app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Both `backend/.gitignore` and `frontend/.gitignore` already exclude `node_modules` and
`.env`, so secrets won't be committed.

## 6. Deployment

- **Frontend** → Vercel or Netlify. Point the build command at `npm run build` inside
  `frontend/`, output directory `dist`. Set an environment variable `VITE_SOCKET_URL`
  pointing at your deployed backend's URL (no trailing slash).
- **Backend** → Render or Railway. Point it at `backend/`, start command `npm start`.
  Set the same environment variables from `.env.example` in the host's dashboard,
  including `CLIENT_URL` set to your deployed frontend's URL (needed for CORS and
  Socket.io).
- **Database** → MongoDB Atlas. Whitelist `0.0.0.0/0` in Atlas's network access settings
  if your host uses dynamic IPs, or add the host's static IP if it has one.
- **Images** → Cloudinary free tier, credentials go in the backend's environment
  variables.

## Notable implementation details worth knowing about

- **Race-safe claiming**: `claimController.js` uses a single atomic
  `findOneAndUpdate({ status: 'available' }, { status: 'claimed', ... })` call, so the
  database itself resolves the race between two simultaneous claim attempts — whichever
  request's filter still matches `available` wins, and the loser gets a clean 409 response.
- **Proximity matching**: both listings and users store a GeoJSON `Point` with a
  `2dsphere` index, and browsing uses MongoDB's native `$near` operator with a
  `$maxDistance` in meters, so "nearby" needs no external geocoding service.
- **Real-time delivery**: Socket.io clients join a coarse geographic "grid cell" room
  based on their coordinates. When a listing is posted, the server broadcasts to the
  poster's cell and its eight neighbors, so nearby receivers see it appear on their board
  without refreshing.
- **Auto-expiry**: a `node-cron` job runs every minute, flips any `available` listing past
  its `expiresAt` to `expired`, and notifies the donor over the socket connection.
