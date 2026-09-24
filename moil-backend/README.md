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
