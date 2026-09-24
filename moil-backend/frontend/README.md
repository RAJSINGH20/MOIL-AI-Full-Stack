# MOIL AI Frontend

React + Vite dashboard connected to the MOIL Express backend.

## Run
1. Start MongoDB.
2. In `../` run `npm install` and `npm run dev` (backend, port 3000).
3. In this folder run `npm install` and `npm run dev` (frontend, normally port 5173).
4. Copy `.env.example` to `.env` if the API is not on `http://localhost:3000/api`.

## Dynamic API connections
- GET `/api/analytics/dashboard/:mine`
- POST `/api/analytics/predict`
- POST `/api/data/production`
- POST `/api/data/geology`
- GET `/api/data/production/:mine`
- GET `/api/data/geology/:mine`

The UI does not use hardcoded production/reserve values when backend data exists. It loads MongoDB records, sends prediction requests, and allows adding new geology/production observations from the dashboard.
