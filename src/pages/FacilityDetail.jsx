import { useParams, Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { hotspots, timelineData } from "../data/hotspots";

export default function FacilityDetail() {
  const { id } = useParams();
  const facility = hotspots.find((h) => h.id === id) || hotspots[0];

  return (
    <div className="min-h-screen bg-ivory p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/list" className="text-xs text-gray-500 hover:text-gold">← Back to Rankings</Link>
          <h1 className="font-serif text-2xl text-teal font-bold mt-1">
            {facility.name}, {facility.state}
          </h1>
          <p className="text-sm italic text-gray-500">
            Facility profile · Hotspot {facility.id} · Classified: {facility.classification}
          </p>
        </div>
        <button className="border border-gold text-gold px-4 py-1.5 rounded text-sm font-sans">
          Export Report ↓
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div>
          <div className="font-serif text-3xl font-bold text-gold">{facility.priorityScore}</div>
          <div className="text-xs text-gray-500 mt-1">Priority Score</div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-teal">
            {facility.population.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Population within 2km</div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-charcoal">{facility.firstDetected}</div>
          <div className="text-xs text-gray-500 mt-1">First Detected</div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-gold">8.1 yrs</div>
          <div className="text-xs text-gray-500 mt-1">Time Active Unverified</div>
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-6 border border-charcoal/10">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0E4749" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0E4749" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A272410" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#2A2724" }} />
            <YAxis tick={{ fontSize: 12, fill: "#2A2724" }} label={{ value: "Monthly detections", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#F7F4EE", border: "1px solid #2A2724", fontSize: 12 }}
            />
            <ReferenceArea x1={2022.5} x2={2023} strokeOpacity={0} fill="#2A2724" fillOpacity={0.06} />
            <ReferenceArea x1={2024.5} x2={2025} strokeOpacity={0} fill="#2A2724" fillOpacity={0.06} />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="#0E4749"
              strokeWidth={2}
              fill="url(#tealFill)"
              dot={{ r: 4, fill: "#B8923A" }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-6 mt-4 text-xs">
          <div className="border-l-2 border-gold pl-3">
            <div className="font-serif font-bold text-sm">First detected here</div>
            <div className="text-gray-500 mt-1">
              Earliest FIRMS signature at this location — 8.1 years of continuous unverified activity
            </div>
          </div>
          <div className="border-l-2 border-teal pl-3">
            <div className="font-serif font-bold text-sm">Capacity expansion signature</div>
            <div className="text-gray-500 mt-1">
              41% increase in detection frequency between 2021-2022, consistent with new operational
              units coming online
            </div>
          </div>
          <div className="border-l-2 border-charcoal pl-3">
            <div className="font-serif font-bold text-sm">Steady-state operation</div>
            <div className="text-gray-500 mt-1">
              Day/night consistency 94%, seasonal variance 0.4 — strong industrial signature,
              negligible wildfire likelihood
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Trend: +41% (2021–22) · Avg monthly detections: 16.4 · Longest observation gap: 9 days
          (monsoon, Jul 2025) · Classification confidence: {facility.confidence}%
        </p>
        <p className="text-[10px] text-gray-400 mt-1 text-center uppercase tracking-wide">
          Shaded periods indicate reduced satellite visibility due to monsoon cloud cover — persistence
          calculated against observed days only, not calendar days, to avoid undercounting
        </p>
      </div>
    </div>
  );
}
