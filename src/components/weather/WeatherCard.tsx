import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Card } from "../ui/Card";
import {
  SunnyIcon,
  PartlyCloudyIcon,
  CloudyIcon,
  FogIcon,
  DrizzleIcon,
  RainIcon,
  HeavyRainIcon,
  SnowIcon,
  ThunderstormIcon,
  ThermometerIcon,
  HumidityIcon,
  WindIcon,
  RainProbIcon,
  LocationIcon,
} from "../icons/WeatherIcons";

// ─── Kachchh default location (Bhuj) ────────────────────────────────────────
const DEFAULT_LAT = 23.24;
const DEFAULT_LON = 69.67;

// ─── WMO weather code → Gujarati label + SVG icon ───────────────────────────
interface WeatherMeta {
  label: string;
  icon: (size: number, color?: string) => ReactNode;
}

const iconStyle = (color: string) => ({ color });

const WMO: Record<number, WeatherMeta> = {
  0:  { label: "સાફ આકાશ",       icon: (s, c = "var(--color-saffron-500)") => <span style={iconStyle(c)}><SunnyIcon size={s} /></span> },
  1:  { label: "મોટે ભાગે સાફ",  icon: (s, c = "var(--color-saffron-400)") => <span style={iconStyle(c)}><PartlyCloudyIcon size={s} /></span> },
  2:  { label: "આંશિક વાદળ",     icon: (s, c = "var(--color-saffron-400)") => <span style={iconStyle(c)}><PartlyCloudyIcon size={s} /></span> },
  3:  { label: "વાદળછાયું",       icon: (s, c = "var(--color-ink-soft)")    => <span style={iconStyle(c)}><CloudyIcon size={s} /></span> },
  45: { label: "ધુમ્મસ",         icon: (s, c = "var(--color-ink-faint)")   => <span style={iconStyle(c)}><FogIcon size={s} /></span> },
  48: { label: "ઠારવાળું ધુમ્મસ", icon: (s, c = "var(--color-ink-faint)")   => <span style={iconStyle(c)}><FogIcon size={s} /></span> },
  51: { label: "હળવો ઝરમર",      icon: (s, c = "var(--color-crop-400)")    => <span style={iconStyle(c)}><DrizzleIcon size={s} /></span> },
  53: { label: "મધ્યમ ઝરમર",     icon: (s, c = "var(--color-crop-400)")    => <span style={iconStyle(c)}><DrizzleIcon size={s} /></span> },
  55: { label: "ગાઢ ઝરમર",       icon: (s, c = "var(--color-crop-500)")    => <span style={iconStyle(c)}><RainIcon size={s} /></span> },
  61: { label: "હળવો વરસાદ",     icon: (s, c = "var(--color-crop-500)")    => <span style={iconStyle(c)}><RainIcon size={s} /></span> },
  63: { label: "મધ્યમ વરસાદ",    icon: (s, c = "var(--color-crop-600)")    => <span style={iconStyle(c)}><RainIcon size={s} /></span> },
  65: { label: "ભારે વરસાદ",     icon: (s, c = "var(--color-crop-700)")    => <span style={iconStyle(c)}><HeavyRainIcon size={s} /></span> },
  71: { label: "હળવી બરફ",       icon: (s, c = "var(--color-crop-300)")    => <span style={iconStyle(c)}><SnowIcon size={s} /></span> },
  73: { label: "બરફ",            icon: (s, c = "var(--color-crop-400)")    => <span style={iconStyle(c)}><SnowIcon size={s} /></span> },
  75: { label: "ભારે બરફ",       icon: (s, c = "var(--color-crop-500)")    => <span style={iconStyle(c)}><SnowIcon size={s} /></span> },
  80: { label: "હળવા ઝાપટા",    icon: (s, c = "var(--color-crop-400)")    => <span style={iconStyle(c)}><DrizzleIcon size={s} /></span> },
  81: { label: "ઝાપટા",          icon: (s, c = "var(--color-crop-500)")    => <span style={iconStyle(c)}><RainIcon size={s} /></span> },
  82: { label: "ભારે ઝાપટા",     icon: (s, c = "var(--color-crop-700)")    => <span style={iconStyle(c)}><HeavyRainIcon size={s} /></span> },
  95: { label: "વાવાઝોડું",       icon: (s, c = "var(--color-saffron-600)") => <span style={iconStyle(c)}><ThunderstormIcon size={s} /></span> },
  96: { label: "વાવાઝોડું + કરા", icon: (s, c = "var(--color-saffron-600)") => <span style={iconStyle(c)}><ThunderstormIcon size={s} /></span> },
  99: { label: "ભારે કરા",       icon: (s, c = "var(--color-loss-500)")    => <span style={iconStyle(c)}><ThunderstormIcon size={s} /></span> },
};

function weatherInfo(code: number): WeatherMeta {
  return WMO[code] ?? {
    label: "—",
    icon: (s, c = "var(--color-ink-faint)") => <span style={iconStyle(c)}><ThermometerIcon size={s} /></span>,
  };
}

// ─── Gujarati day-of-week abbreviations ─────────────────────────────────────
const GU_DAYS = ["રવિ", "સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"];

function guDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return GU_DAYS[d.getDay()];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
}

interface WeatherResponse {
  current: CurrentWeather;
  daily: DailyForecast;
}

type Status = "loading" | "ok" | "error";

// ─── Component ──────────────────────────────────────────────────────────────
export default function WeatherCard() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [usingGPS, setUsingGPS] = useState(false);

  // Try to get GPS location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setUsingGPS(true);
      },
      () => {
        /* silently fall back to default */
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }, []);

  const fetchWeather = useCallback(async () => {
    setStatus("loading");
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${coords.lat}&longitude=${coords.lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=Asia%2FKolkata&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const json: WeatherResponse = await res.json();
      setData(json);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }, [coords]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--color-crop-500)]"><CloudyIcon size={20} /></span>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">હવામાન</p>
        </div>
        <div className="flex items-center justify-center py-8 gap-2">
          <div
            className="animate-spin"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "2px solid var(--color-crop-500)",
              borderTopColor: "transparent",
            }}
          />
          <span className="text-[13px] text-[var(--color-ink-faint)]">હવામાન લોડ થઈ રહ્યું છે…</span>
        </div>
      </Card>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === "error" || !data) {
    return (
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--color-crop-500)]"><CloudyIcon size={20} /></span>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">હવામાન</p>
        </div>
        <div className="flex flex-col items-center gap-2 py-6">
          <span className="text-[var(--color-saffron-500)]"><ThunderstormIcon size={32} /></span>
          <p className="text-[13px] text-[var(--color-ink-faint)]">હવામાન ડેટા લોડ કરી શકાયો નથી.</p>
          <button
            onClick={fetchWeather}
            className="text-[13px] font-medium text-[var(--color-crop-600)] mt-1 active:opacity-70"
          >
            ફરી પ્રયાસ કરો ↻
          </button>
        </div>
      </Card>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const { current, daily } = data;
  const currentInfo = weatherInfo(current.weather_code);
  const todayRainProb = daily.precipitation_probability_max[0] ?? 0;

  return (
    <Card className="p-5 mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-crop-500)]"><CloudyIcon size={20} /></span>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">હવામાન</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-[var(--color-ink-faint)]">
          <LocationIcon size={12} />
          {usingGPS ? "GPS" : "કચ્છ"}
        </span>
      </div>

      {/* Current Weather — Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--color-crop-50), var(--color-saffron-50))",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          marginBottom: "16px",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <div style={{ width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {currentInfo.icon(48)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[32px] font-bold text-[var(--color-ink)] leading-none tnum">
              {Math.round(current.temperature_2m)}°C
            </p>
            <p className="text-[14px] text-[var(--color-ink-soft)] mt-1">{currentInfo.label}</p>
          </div>
        </div>

        {/* Metrics row */}
        <div
          className="grid grid-cols-3 gap-2 mt-4 pt-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <MetricPill
            icon={<HumidityIcon size={17} />}
            iconColor="var(--color-crop-500)"
            label="ભેજ"
            value={`${current.relative_humidity_2m}%`}
          />
          <MetricPill
            icon={<WindIcon size={17} />}
            iconColor="var(--color-ink-soft)"
            label="પવન"
            value={`${Math.round(current.wind_speed_10m)} km/h`}
          />
          <MetricPill
            icon={<RainProbIcon size={17} />}
            iconColor="var(--color-crop-600)"
            label="વરસાદ"
            value={`${todayRainProb}%`}
          />
        </div>
      </div>

      {/* 7-day forecast */}
      <p className="text-[13px] font-semibold text-[var(--color-ink-soft)] mb-3">7 દિવસ આગાહી</p>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
        {daily.time.map((date, i) => {
          const info = weatherInfo(daily.weather_code[i]);
          const isToday = i === 0;
          return (
            <div
              key={date}
              className="shrink-0 flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-[14px] transition-colors"
              style={{
                scrollSnapAlign: "start",
                minWidth: 68,
                background: isToday ? "var(--color-crop-50)" : "var(--color-paper-dim)",
                border: isToday ? "1px solid var(--color-crop-200)" : "1px solid transparent",
              }}
            >
              <span
                className="text-[11px] font-semibold"
                style={{ color: isToday ? "var(--color-crop-600)" : "var(--color-ink-faint)" }}
              >
                {isToday ? "આજે" : guDay(date)}
              </span>
              <span className="text-[10px] text-[var(--color-ink-faint)] tnum">{formatDate(date)}</span>
              <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {info.icon(24)}
              </div>
              <span className="text-[12px] font-bold text-[var(--color-ink)] tnum">
                {Math.round(daily.temperature_2m_max[i])}°
              </span>
              <span className="text-[11px] text-[var(--color-ink-faint)] tnum">
                {Math.round(daily.temperature_2m_min[i])}°
              </span>
              {daily.precipitation_probability_max[i] > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-crop-600)] font-medium tnum">
                  <RainProbIcon size={10} />
                  {daily.precipitation_probability_max[i]}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Sub-component ──────────────────────────────────────────────────────────
function MetricPill({ icon, iconColor, label, value }: { icon: ReactNode; iconColor: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 rounded-[10px] bg-[var(--color-surface)]">
      <span style={{ color: iconColor }}>{icon}</span>
      <span className="text-[10.5px] text-[var(--color-ink-faint)]">{label}</span>
      <span className="text-[13px] font-semibold text-[var(--color-ink)] tnum">{value}</span>
    </div>
  );
}
