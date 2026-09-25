import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Mountain,
  RefreshCw,
  Sparkles,
  CloudRain,
  Droplets,
  Thermometer,
  Layers3,
  Plus,
  CheckCircle2,
  MessageCircle,
  Send,
  X,
  LocateFixed,
  MapPin,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./styles.css";

const configuredApiUrl = (
  import.meta.env.VITE_API_URL ||
  "https://moil-ai-full-stack-1.onrender.com/api"
).replace(/\/+$/, "");
const API = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;
const api = axios.create({ baseURL: API });
const mines = ["Dongri Buzurg", "Gumgaon", "Balaghat", "Tirodi"];

function App() {
  const [mine, setMine] = useState(mines[0]);
  const [tab, setTab] = useState("Overview");
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(null);
  const [locationAnalyses, setLocationAnalyses] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [savedLocation, setSavedLocation] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(
        `/analytics/dashboard/${encodeURIComponent(mine)}`,
      );
      setDash(r.data);
      setMsg("");
    } catch (e) {
      setMsg("Backend unavailable. Check the API URL and server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const storedLocation = localStorage.getItem(`moil-mine-location:${mine}`);
    try {
      const location = storedLocation ? JSON.parse(storedLocation) : null;
      setSavedLocation(location);
      setSelectedLocation(location);
    } catch {
      setSavedLocation(null);
      setSelectedLocation(null);
    }
    setLocationAnalyses([]);
  }, [mine]);

  const run = async () => {
    setLoading(true);
    try {
      const r = await api.post("/analytics/predict", { mine });
      setDash((d) => ({ ...d, latestPrediction: r.data }));
      setMsg("AI prediction generated from current database records.");
    } catch (e) {
      setMsg(e.response?.data?.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeLocationPoint = async (location, saveLocation = false) => {
    setLocationLoading(true);
    try {
      const r = await api.post("/analytics/location-analysis", {
        mine,
        ...location,
      });
      setSelectedLocation(location);
      setLocationAnalyses((items) => [r.data, ...items].slice(0, 12));
      if (saveLocation) {
        localStorage.setItem(
          `moil-mine-location:${mine}`,
          JSON.stringify(location),
        );
        setSavedLocation(location);
      }
      setMsg(
        saveLocation
          ? "Your location was analyzed and saved. Select another point to compare areas."
          : "Selected area analyzed. Choose another point for a separate AI assessment.",
      );
    } catch (e) {
      setMsg(e.response?.data?.message || "Location analysis failed.");
    } finally {
      setLocationLoading(false);
    }
  };

  const analyzeMyLocation = () => {
    const savedLocationKey = `moil-mine-location:${mine}`;
    const savedLocation = localStorage.getItem(savedLocationKey);
    setLocationLoading(true);

    if (savedLocation) {
      try {
        const { latitude, longitude } = JSON.parse(savedLocation);
        analyzeLocationPoint({ latitude, longitude });
        return;
      } catch {
        localStorage.removeItem(savedLocationKey);
      }
    }

    if (!navigator.geolocation) {
      setMsg("Live location is not supported by this browser.");
      return;
    }

    setMsg("Saving this mine location for future checks...");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          localStorage.setItem(savedLocationKey, JSON.stringify(location));
          setSavedLocation(location);
          await analyzeLocationPoint(location, true);
        } catch (e) {
          setMsg(e.response?.data?.message || "Live location analysis failed.");
        }
      },
      (error) => {
        setLocationLoading(false);
        setMsg(
          error.code === 1
            ? "Location permission was denied."
            : "Unable to read your live location.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const trend = useMemo(() => {
    const rows = dash?.productionTrend || [];
    return rows
      .map((x) => ({
        date: new Date(x.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        planned: +(x.plannedTons || 0),
        actual: +(x.actualTons || 0),
      }))
      .slice(-30);
  }, [dash]);

  const p = dash?.latestPrediction || {};

  return (
    <div className="min-h-screen bg-slate-100 bg-grid bg-[length:42px_42px] text-slate-900 motion-safe:animate-grid-drift">
      <div className="flex flex-col lg:flex-row">
        <aside className="w-full bg-emerald-950 px-4 py-5 text-emerald-50 shadow-sidebar lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:px-4 lg:py-6">
          <div className="flex items-center gap-3 pb-5 motion-safe:animate-rise-in">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-lg font-black text-white">
              M
            </div>
            <div>
              <div className="text-lg font-bold">MOIL AI</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                Mining Intelligence
              </div>
            </div>
          </div>

          <label className="block rounded-xl bg-emerald-900/60 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Active mine
            <select
              value={mine}
              onChange={(e) => setMine(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-emerald-700 bg-transparent px-2 py-2 text-sm font-semibold text-white outline-none"
            >
              {mines.map((x) => (
                <option key={x} value={x} className="text-slate-900">
                  {x}
                </option>
              ))}
            </select>
          </label>

          <nav className="mt-5 space-y-1">
            {[
              ["Overview", Activity],
              ["Reserves", Mountain],
              ["Production", BarChart3],
              ["Risk Analysis", AlertTriangle],
            ].map(([name, Icon], index) => (
              <button
                key={name}
                onClick={() => setTab(name)}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition motion-safe:animate-rise-in ${
                  tab === name
                    ? "bg-emerald-700 text-white shadow-lg shadow-emerald-950/30"
                    : "text-emerald-100 hover:bg-emerald-800/70"
                }`}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-emerald-800/80 pt-4 text-[10px] text-emerald-300">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> AI
              services operational
            </span>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 motion-safe:animate-rise-in">
          <header className="mb-5 flex flex-col gap-4 motion-safe:animate-rise-in xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                <Sparkles size={13} /> AI-powered mining planning
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {tab}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {mine} · Manganese reserve and production intelligence
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
              >
                <RefreshCw size={15} /> Refresh
              </button>
              {tab === "Overview" && (
                <>
                  <button
                    onClick={run}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    <Sparkles size={15} />
                    {loading ? "Running" : "Run AI Prediction"}
                  </button>
                  <button
                    onClick={analyzeMyLocation}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LocateFixed size={15} />
                    {locationLoading ? "Locating..." : "Analyze Live Location"}
                  </button>
                </>
              )}
            </div>
          </header>

          {msg && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {msg}
            </div>
          )}

          {tab === "Overview" ? (
            <Overview
              p={p}
              trend={trend}
              environment={dash?.environmentPrediction}
              locationAnalyses={locationAnalyses}
              selectedLocation={selectedLocation}
              locationLoading={locationLoading}
              onSelectLocation={setSelectedLocation}
              onAnalyzeLocation={analyzeLocationPoint}
              onAdd={setShow}
            />
          ) : (
            <Module
              tab={tab}
              mine={mine}
              dash={dash}
              savedLocation={savedLocation}
              onAdd={setShow}
            />
          )}

          <footer className="mt-6 text-xs text-slate-500">
            MOIL AI Decision Support · API: {API}
          </footer>
        </main>
      </div>

      {show && (
        <Modal
          type={show}
          mine={mine}
          close={() => setShow(null)}
          reload={load}
        />
      )}
      <MineAssistant mine={mine} dashboard={dash} />
    </div>
  );
}

function MineAssistant({ mine, dashboard }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me about risk, production, reserves, or mine conditions.",
    },
  ]);
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    const text = question.trim();
    if (!text || sending) return;
    setQuestion("");
    setMessages((items) => [...items, { role: "user", text }]);
    setSending(true);
    try {
      const response = await api.post("/analytics/chat", {
        mine,
        question: text,
        dashboard,
      });
      setMessages((items) => [
        ...items,
        { role: "assistant", text: response.data.answer },
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "The AI assistant is unavailable right now.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[min(32rem,calc(100vh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl motion-safe:animate-rise-in">
          <div className="flex items-center justify-between bg-emerald-950 px-4 py-3 text-white">
            <div>
              <div className="text-sm font-bold">MOIL AI Assistant</div>
              <div className="text-[11px] text-emerald-200">
                {mine} · Mine intelligence
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-1.5 text-emerald-100 hover:bg-emerald-800"
            >
              <X size={17} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${message.role === "user" ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="text-xs text-slate-500">
                MOIL AI is thinking...
              </div>
            )}
          </div>
          <form
            onSubmit={send}
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about this mine..."
              aria-label="Ask MOIL AI"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={sending || !question.trim()}
              aria-label="Send question"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-300"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open MOIL AI assistant"
          className="grid h-14 w-14 place-items-center rounded-full bg-emerald-700 text-white shadow-xl transition motion-safe:animate-rise-in hover:bg-emerald-600"
        >
          <MessageCircle size={23} />
        </button>
      )}
    </div>
  );
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
}

function LocationPicker({
  selectedLocation,
  locationLoading,
  onSelectLocation,
  onAnalyzeLocation,
}) {
  const center = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : [21.3, 79.1];

  return (
    <Card title="Check Another Area">
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Click any point on the satellite map, then run a separate mining
        suitability check for that area.
      </p>
      <MapContainer
        center={center}
        zoom={selectedLocation ? 13 : 6}
        scrollWheelZoom
        className="mt-3 h-72 w-full rounded-xl border border-slate-200 sm:h-80"
      >
        <TileLayer
          attribution='&copy; Esri, Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <MapClickHandler onSelect={onSelectLocation} />
        {selectedLocation && (
          <CircleMarker
            center={[selectedLocation.latitude, selectedLocation.longitude]}
            radius={9}
            pathOptions={{
              color: "#f8fafc",
              weight: 3,
              fillColor: "#059669",
              fillOpacity: 0.95,
            }}
          />
        )}
      </MapContainer>
      {selectedLocation ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Selected: {selectedLocation.latitude.toFixed(5)}, {" "}
            {selectedLocation.longitude.toFixed(5)}
          </div>
          <button
            type="button"
            onClick={() => onAnalyzeLocation(selectedLocation)}
            disabled={locationLoading}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {locationLoading ? "Analyzing..." : "Analyze Selected Area"}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          No point selected. Zoom and click the map to place a pointer.
        </p>
      )}
    </Card>
  );
}

function Overview({
  p,
  trend,
  environment = {},
  locationAnalyses,
  selectedLocation,
  locationLoading,
  onSelectLocation,
  onAnalyzeLocation,
  onAdd,
}) {
  const latest = trend[trend.length - 1] || {};
  const weather = {
    rainfallMm: environment.rainfallMm ?? latest.rainfallMm,
    soilMoisture: environment.soilMoisture ?? latest.soilMoisture,
    landTemperature: environment.landTemperature ?? latest.landTemperature,
    vegetationIndex: environment.vegetationIndex ?? latest.vegetationIndex,
    source:
      environment.source ||
      (trend.length ? "Latest mine observation" : "No observation available"),
  };

  return (
    <>
      <section className="grid gap-4 motion-safe:animate-rise-in sm:grid-cols-2 xl:grid-cols-4">
        <K
          title="Predicted Reserves"
          value={
            p.predictedReserveTons
              ? `${(+p.predictedReserveTons / 1e6).toFixed(2)}M t`
              : "—"
          }
          icon={Mountain}
        />
        <K
          title="Expected Production"
          value={
            p.predictedProductionTons
              ? `${Math.round(p.predictedProductionTons).toLocaleString()} t`
              : "—"
          }
          icon={BarChart3}
        />
        <K
          title="Shortfall Risk"
          value={p.shortfallRisk || "—"}
          danger={p.shortfallRisk === "HIGH"}
          icon={AlertTriangle}
        />
        <K
          title="Potential Shortfall"
          value={
            p.shortfallTons != null
              ? `${Math.round(p.shortfallTons).toLocaleString()} t`
              : "—"
          }
          icon={BarChart3}
        />
      </section>

      <section className="mt-6 grid gap-4 motion-safe:animate-rise-in [animation-delay:140ms] xl:grid-cols-[1.4fr_1fr]">
        <Card title="Production Trend">
          <div className="mt-3 h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#cbd5e1"
                />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="planned"
                  stroke="#94a3b8"
                  fill="none"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#0f766e"
                  fill="#0f766e22"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Risk & Recommendations">
          <Risk p={p} />
        </Card>
      </section>

      <section className="mt-6 grid gap-4 motion-safe:animate-rise-in [animation-delay:240ms] xl:grid-cols-3">
        {locationAnalyses[0] && <LocationAnalysis result={locationAnalyses[0]} />}
        <Card title="Satellite / Weather">
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Metric
              I={CloudRain}
              n="Rainfall"
              v={weather.rainfallMm != null ? `${weather.rainfallMm} mm` : "—"}
            />
            <Metric
              I={Droplets}
              n="Soil Moisture"
              v={
                weather.soilMoisture != null ? `${weather.soilMoisture}%` : "—"
              }
            />
            <Metric
              I={Thermometer}
              n="Land Temp."
              v={
                weather.landTemperature != null
                  ? `${weather.landTemperature} °C`
                  : "—"
              }
            />
            <Metric
              I={Layers3}
              n="Vegetation"
              v={
                weather.vegetationIndex != null
                  ? `${weather.vegetationIndex} NDVI`
                  : "—"
              }
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">{weather.source}</p>
        </Card>

        <Card title="Quick Data Entry">
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add live mine observations to MongoDB, then rerun AI.
          </p>
          <div className="mt-4 space-y-2">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => onAdd("production")}
            >
              <Plus size={16} /> Add Production Record
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
              onClick={() => onAdd("geology")}
            >
              <Plus size={16} /> Add Geological Record
            </button>
          </div>
        </Card>

        <Card title="AI Actions">
          <Risk p={p} />
        </Card>
      </section>

      <section className="mt-6 grid gap-4 motion-safe:animate-rise-in [animation-delay:320ms] xl:grid-cols-[1.2fr_0.8fr]">
        <LocationPicker
          selectedLocation={selectedLocation}
          locationLoading={locationLoading}
          onSelectLocation={onSelectLocation}
          onAnalyzeLocation={onAnalyzeLocation}
        />
        <Card title="Analyzed Areas">
          {locationAnalyses.length ? (
            <div className="mt-3 space-y-2">
              {locationAnalyses.map((analysis, index) => (
                <button
                  key={`${analysis.latitude}-${analysis.longitude}-${index}`}
                  type="button"
                  onClick={() =>
                    onSelectLocation({
                      latitude: Number(analysis.latitude),
                      longitude: Number(analysis.longitude),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-emerald-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-700">
                      Area {locationAnalyses.length - index}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {analysis.suitabilityStatus.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {Number(analysis.latitude).toFixed(5)}, {" "}
                    {Number(analysis.longitude).toFixed(5)} · {analysis.riskLevel} risk
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your area checks will appear here so you can compare different
              points around the mine.
            </p>
          )}
        </Card>
      </section>
    </>
  );
}

function LocationAnalysis({ result }) {
  const latitude = Number(result.latitude);
  const longitude = Number(result.longitude);
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=14&output=embed`;
  const fullMapUrl = `https://www.google.com/maps/@${latitude},${longitude},14z/data=!3m1!1e3`;
  const riskClass =
    result.riskLevel === "HIGH"
      ? "bg-red-100 text-red-700"
      : result.riskLevel === "MEDIUM"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";
  const suitabilityClass =
    result.suitabilityStatus === "SUITABLE"
      ? "bg-emerald-100 text-emerald-700"
      : result.suitabilityStatus === "NOT_SUITABLE"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <Card title="Live Location Analysis">
      <div className="mt-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <MapPin size={19} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800">
            {result.locationSummary}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </div>
        </div>
      </div>
      <iframe
        title="Live location map"
        src={mapUrl}
        className="mt-3 h-72 w-full rounded-xl border border-slate-200 shadow-map-frame transition duration-300 hover:scale-[1.01] hover:shadow-map-frame-hover sm:h-80"
        loading="lazy"
      />
      <a
        href={fullMapUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex text-xs font-semibold text-emerald-700 hover:text-emerald-600"
      >
        Open location in map
      </a>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span
          className={`rounded-full px-2.5 py-1 font-bold ${suitabilityClass}`}
        >
          {result.suitabilityStatus === "SUITABLE"
            ? "SUITABLE FOR WORK"
            : result.suitabilityStatus === "NOT_SUITABLE"
              ? "NOT SUITABLE"
              : "REVIEW BEFORE WORK"}
        </span>
        <span className={`rounded-full px-2.5 py-1 font-bold ${riskClass}`}>
          {result.riskLevel} RISK
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
          {result.confidence} confidence
        </span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        <p>
          <b className="text-slate-800">Work suitability:</b>{" "}
          {result.suitabilityReason}
        </p>
        <p>
          <b className="text-slate-800">Terrain:</b> {result.terrainStatus}
        </p>
        {result.riskFactors?.length > 0 && (
          <p>
            <b className="text-slate-800">Factors:</b>{" "}
            {result.riskFactors.join(" · ")}
          </p>
        )}
        {result.recommendations?.length > 0 && (
          <p>
            <b className="text-slate-800">Next steps:</b>{" "}
            {result.recommendations.join(" · ")}
          </p>
        )}
      </div>
      <p className="mt-3 border-t border-slate-200 pt-3 text-[11px] leading-5 text-slate-500">
        {result.disclaimer}
      </p>
    </Card>
  );
}

function SavedLocation({ mine, location }) {
  if (!location) {
    return (
      <Card title="Mine Location">
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No saved location is available for {mine}. Run the location check
          from Overview once to save this mine position.
        </p>
      </Card>
    );
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=14&output=embed`;
  const fullMapUrl = `https://www.google.com/maps/@${latitude},${longitude},14z/data=!3m1!1e3`;

  return (
    <Card title="Mine Location">
      <p className="mt-3 text-sm font-semibold text-slate-800">{mine}</p>
      <p className="mt-1 text-xs text-slate-500">
        Saved coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </p>
      <iframe
        title={`${mine} saved location map`}
        src={mapUrl}
        className="mt-3 h-72 w-full rounded-xl border border-slate-200 sm:h-80"
        loading="lazy"
      />
      <a
        href={fullMapUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex text-xs font-semibold text-emerald-700 hover:text-emerald-600"
      >
        Open saved location in map
      </a>
    </Card>
  );
}

function K({ title, value, icon: Icon, danger }) {
  return (
    <div className="group relative isolate transform-gpu rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition duration-300 ease-out motion-safe:animate-rise-in hover:-translate-y-1 hover:border-emerald-300 hover:shadow-motion-card hover:[transform:perspective(900px)_rotateX(1deg)_translateY(-4px)]">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl ${danger ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
      >
        <Icon size={20} />
      </div>
      <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="group relative isolate transform-gpu rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition duration-300 ease-out hover:-translate-y-1 hover:border-emerald-300 hover:shadow-motion-card hover:[transform:perspective(900px)_rotateX(1deg)_translateY(-4px)]">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {children}
    </div>
  );
}

function Risk({ p }) {
  const fs = p.riskFactors || [];
  return (
    <div className="space-y-3 pt-1">
      <div className="flex flex-col gap-2">
        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
            (p.shortfallRisk || "LOW").toLowerCase() === "high"
              ? "bg-red-100 text-red-700"
              : (p.shortfallRisk || "LOW").toLowerCase() === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {p.shortfallRisk || "NO PREDICTION"}
        </span>
        <span className="text-sm leading-6 text-slate-600">
          {fs.length
            ? fs.join(" · ")
            : "Run prediction after adding historical production data."}
        </span>
      </div>

      {(p.recommendations || []).map((x, i) => (
        <div
          key={i}
          className="flex items-start gap-2 border-t border-slate-200 pt-3 text-sm text-slate-700"
        >
          <CheckCircle2 size={15} className="mt-0.5 text-emerald-600" />
          <span>{x}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ I, n, v }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
      <div className="flex items-center gap-2">
        <I size={16} className="text-emerald-700" />
        <span className="text-slate-600">{n}</span>
      </div>
      <b className="text-slate-800">{v}</b>
    </div>
  );
}

function Module({ tab, mine, dash, savedLocation, onAdd }) {
  const rows = dash?.productionTrend || [];
  const geology = dash?.geologicalData || [];
  const prediction = dash?.latestPrediction || {};
  const showGeology = tab === "Reserves";

  return (
    <div className="space-y-4 motion-safe:animate-rise-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mt-1 text-sm text-slate-500">
            Dynamic data view for{" "}
            <span className="font-semibold text-slate-700">{mine}</span>. Values
            are loaded directly from the MOIL backend.
          </p>
        </div>
        {tab !== "Risk Analysis" && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            onClick={() => onAdd(tab === "Reserves" ? "geology" : "production")}
          >
            <Plus size={16} /> Add Record
          </button>
        )}
      </div>

      {showGeology ? (
        <Card title="Geological Database">
          <div className="mt-3 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Depth
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Manganese Grade
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Ore Thickness
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Lithology
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {geology.map((r) => (
                  <tr key={r._id} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-slate-700">
                      {r.depth || 0} m
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.manganeseGrade || 0}%
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.oreThickness || 0} m
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.lithology || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.source || "manual"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : tab === "Risk Analysis" ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <Card title="Operational Risk Assessment">
            <Risk p={prediction} />
          </Card>
          <SavedLocation mine={mine} location={savedLocation} />
        </div>
      ) : tab === "Production" ? (
        <Card title="Production Database">
          <div className="mt-3 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Date
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Planned
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Actual
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Downtime
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Blast Delay
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Rainfall
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-slate-700">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.plannedTons || 0}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.actualTons || 0}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.downtimeHours || 0} h
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.blastingDelayHours || 0} h
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {r.rainfallMm || 0} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          <Database size={38} className="mx-auto text-emerald-600" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">{tab}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Use the backend APIs to add geological and production observations.
            The dashboard will update after refresh.
          </p>
        </div>
      )}
    </div>
  );
}

function Modal({ type, mine, close, reload }) {
  const [f, setF] = useState(
    type === "geology"
      ? {
          mine,
          latitude: "",
          longitude: "",
          depth: "",
          manganeseGrade: "",
          oreThickness: "",
          density: "",
          lithology: "",
          source: "drilling",
        }
      : {
          mine,
          date: new Date().toISOString().slice(0, 10),
          plannedTons: "",
          actualTons: "",
          equipmentHours: "",
          downtimeHours: "",
          blastingDelayHours: "",
          rainfallMm: "",
          soilMoisture: "",
          vegetationIndex: "",
          landTemperature: "",
        },
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const labelFor = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/data/${type}`, f);
      close();
      reload();
    } catch (x) {
      setErr(x.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 motion-safe:animate-rise-in">
      <form
        onSubmit={submit}
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl motion-safe:animate-rise-in"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">
            Add {type === "geology" ? "Geological" : "Production"} Record
          </h2>
          <button
            type="button"
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-xl text-slate-700 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(f).map(([k, v]) => (
            <label
              key={k}
              className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
            >
              {labelFor(k)}
              <input
                name={k}
                value={v}
                onChange={change}
                type={k === "date" ? "date" : "text"}
                required={["mine", "date"].includes(k)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
