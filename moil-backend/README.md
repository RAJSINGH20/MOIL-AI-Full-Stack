# MOIL AI Backend

Starter backend for the MOIL manganese-reserve and production-risk dashboard.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- Baseline analytics service, replaceable with a trained Python ML model

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

Set `HOST=0.0.0.0` and `PORT` from the deployment platform. Set `CLIENT_URL` to the frontend origin; multiple origins may be comma-separated. The frontend's `VITE_API_URL` must be configured before its production build because Vite embeds `VITE_*` variables into the bundle.

## Endpoints

- `GET /api/health`
- `POST /api/data/geology`
- `GET /api/data/geology/:mine`
- `POST /api/data/production`
- `GET /api/data/production/:mine`
- `POST /api/analytics/predict` body: `{ "mine": "Dongri Buzurg" }`
- `GET /api/analytics/dashboard/:mine`

## Important

The current AI service is a transparent baseline, not a validated geological ML model. For production use, connect a trained model using drilling assays, GIS layers, satellite features, equipment telemetry, weather data and mine-specific validation.
