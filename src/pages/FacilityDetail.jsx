import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { hotspots as mockHotspots } from "../data/hotspots";
import { classStyle } from "../data/classificationStyle";
import { generateDetectionHistory, aggregateByYear, computeStats } from "../data/mockDetectionHistory";

function findMonsoonBands(series) {
  const bands = [];
  let start = null;
  series.forEach((d, i) => {
    if (d.isMonsoonGap && start === null) start = i;
    if (!d.isMonsoonGap && start !== null) {
      bands.push({ x1: series[start].label, x2: series[i - 1].label });
      start = null;
    }
  });
  if (start !== null) bands.push({ x1: series[start].label, x2: series[series.length - 1].label });
  return bands;
}

export default function FacilityDetail() {
  const { id } = useParams();
  const [granularity, setGranularity] = useState("Monthly");
  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

  const hotspot = mockHotspots.find((h) => h.id === id);

  const monthlySeries = useMemo(() => (hotspot ? generateDetectionHistory(hotspot) : []), [hotspot]);
  const yearlySeries = useMemo(() => aggregateByYear(monthlySeries), [monthlySeries]);
  const stats = useMemo(() => (hotspot ? computeStats(monthlySeries, hotspot) : null), [monthlySeries, hotspot]);
  const monsoonBands = useMemo(() => findMonsoonBands(monthlySeries), [monthlySeries]);

  const yearTicks = useMemo(
    () => monthlySeries.filter((d) => d.month === 0).map((d) => d.label),
    [monthlySeries]
  );

  if (!hotspot) {
    return (
      <div className="h-screen flex items-center justify-center font-serif text-teal">
        Facility not found. <Link to="/" className="underline ml-2">Back to map</Link>
      </div>
    );
  }

  const chartData = granularity === "Yearly" ? yearlySeries : monthlySeries;
  const color = classStyle[hotspot.classification] ? classStyle[hotspot.classification].color : "#0E4749";

  return (
    <div className="min-h-screen bg-ivory p-8 font-sans">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link to="/" className="text-xs text-gold underline">&larr; Back to map</Link>
          <h1 className="font-serif text-4xl text-teal font-bold mt-2">{hotspot.name}</h1>
          <p className="text-sm text-charcoal/70 italic mt-1">
            Facility profile &middot; Hotspot {hotspot.id} &middot; Classified: {hotspot.classification}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="border border-gold text-gold rounded-lg px-4 py-2 text-sm font-serif hover:bg-gold/10 transition-colors self-start"
        >
          Export Report &darr;
        </button>
      </div>

      <div className="flex gap-6 items-center mb-10">
        <div className="relative w-[280px] h-[180px] rounded-lg overflow-hidden border border-charcoal/20 flex-shrink-0">
          <Map
            initialViewState={{ longitude: hotspot.lng, latitude: hotspot.lat, zoom: 10, pitch: 0, bearing: 0 }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={"https://api.maptiler.com/maps/hybrid/style.json?key=" + mapTilerKey}
            interactive={false}
            attributionControl={false}
          >
            <Marker longitude={hotspot.lng} latitude={hotspot.lat}>
              <div
                style={{
                  width: 16, height: 16, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
                  background: color, border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              />
            </Marker>
          </Map>
          <div
            className="absolute rounded-full border-2 border-gold/60 pointer-events-none"
            style={{ top: "50%", left: "50%", width: 90, height: 90, transform: "translate(-50%, -50%)", background: "rgba(184,146,58,0.15)" }}
          />
          <span className="absolute bottom-1 right-2 text-[10px] text-white bg-charcoal/60 px-1 rounded">
            2km radius
          </span>
        </div>

        <div className="flex gap-10">
          <StatBlock value={hotspot.priorityScore} label="Priority Score" accent />
          <Divider />
          <StatBlock value={hotspot.population.toLocaleString()} label="Population within 2km" />
          <Divider />
          <StatBlock value={hotspot.firstDetected} label="First Detected" />
          <Divider />
          <StatBlock value={stats.yearsActive + " yrs"} label="Time Active Unverified" accent />
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData} margin={{ top: 60, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={color} stopOpacity={0.45} />
              </linearGradient>
              <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#2A2724" strokeOpacity="0.18" strokeWidth="2" />
              </pattern>
              <filter id="areaShadow" x="-20%" y="-20%" width="140%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#2A2724" floodOpacity="0.25" />
              </filter>
            </defs>

            <XAxis
              dataKey="label"
              ticks={granularity === "Monthly" ? yearTicks : undefined}
              tickFormatter={(v) => v.split(" ")[1] || v}
              tick={{ fontSize: 12, fontStyle: "italic", fill: "#2A2724" }}
              axisLine={{ stroke: "#2A2724", strokeOpacity: 0.3 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#2A2724" }}
              axisLine={false}
              tickLine={false}
              width={40}
              label={{ value: "Monthly detections", angle: -90, position: "insideLeft", fontSize: 11, fill: "#2A2724" }}
            />
            <Tooltip contentStyle={{ fontSize: 12, fontFamily: "serif", borderRadius: 8 }} formatter={(v) => [v, "Detections"]} />

            {granularity === "Monthly" &&
              monsoonBands.map((b, i) => (
                <ReferenceArea key={i} x1={b.x1} x2={b.x2} fill="url(#hatch)" ifOverflow="visible" />
              ))}

            {granularity === "Monthly" && (
              <ReferenceLine
                x={monthlySeries.find((d) => d.year === 2022 && d.month === 0)?.label}
                stroke="#B8923A"
                strokeDasharray="4 2"
                strokeWidth={1.5}
              />
            )}

            <Area
              type="natural"
              dataKey="count"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#fillColor)"
              dot={{ r: 3, fill: "#B8923A", strokeWidth: 0 }}
              filter="url(#areaShadow)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {granularity === "Monthly" && (
          <>
            <div className="absolute top-0 left-12 max-w-[210px]">
              <div className="font-serif font-bold text-[17px] text-charcoal leading-tight mb-1 tracking-tight">
                First detected here
              </div>
              <div className="font-serif italic text-[13px] text-charcoal/65 leading-snug">
                Earliest FIRMS signature at this location &mdash; {stats.yearsActive} years of continuous unverified activity
              </div>
            </div>

            <div className="absolute top-0 max-w-[230px]" style={{ left: "38%" }}>
              <div className="font-serif font-bold text-[17px] text-charcoal leading-tight mb-1 tracking-tight">
                Capacity expansion signature
              </div>
              <div className="font-serif italic text-[13px] text-charcoal/65 leading-snug">
                {stats.trendPct}% increase in detection frequency between 2021-2022, consistent with new operational units coming online
              </div>
            </div>

            <div className="absolute top-0 right-4 max-w-[230px] text-right">
              <div className="font-serif font-bold text-[17px] text-charcoal leading-tight mb-1 tracking-tight">
                Steady-state operation
              </div>
              <div className="font-serif italic text-[13px] text-charcoal/65 leading-snug">
                Day/night consistency 94%, seasonal variance 0.4 &mdash; strong industrial signature, negligible wildfire likelihood
              </div>
            </div>
          </>
        )}
      </div>

      <div className="text-xs text-charcoal/70 mt-2">
        {stats.trendPct !== null && <>Trend: +{stats.trendPct}% (2021-22) &middot; </>}
        Avg monthly detections: {stats.avgMonthly} &middot; Longest observation gap: {stats.longestGapDays} days (monsoon, Jul 2025) &middot; Classification confidence: {hotspot.confidence}%
      </div>
      <p className="text-[10px] text-charcoal/50 mt-1 uppercase tracking-wide">
        Shaded periods indicate reduced satellite visibility due to monsoon cloud cover &mdash; persistence calculated against observed days only, not calendar days, to avoid undercounting.
      </p>

      <div className="flex justify-center gap-4 mt-4 text-sm font-serif">
        {["Daily", "Monthly", "Yearly"].map((g) => (
          <button
            key={g}
            onClick={() => setGranularity(g)}
            className={granularity === g ? "text-gold underline underline-offset-4" : "text-charcoal/50 hover:text-charcoal"}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatBlock({ value, label, accent }) {
  return (
    <div>
      <div className={"font-serif text-2xl font-bold " + (accent ? "text-gold" : "text-charcoal")}>{value}</div>
      <div className="text-xs text-charcoal/60">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-charcoal/15 self-stretch" />;
}

