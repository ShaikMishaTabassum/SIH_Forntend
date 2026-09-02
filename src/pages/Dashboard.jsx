import { useState, useEffect } from "react";
import ThermalMap from "../components/ThermalMap";
import PriorityWatchlist from "../components/PriorityWatchlist";
import { fetchHotspots } from "../api/hotspots";
import { hotspots as mockHotspots } from "../data/hotspots";

export default function Dashboard() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      const liveData = await fetchHotspots();
      if (liveData && liveData.length > 0) {
        setHotspots(liveData);
      } else {
        setHotspots(mockHotspots);
        setUsingMockData(true);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-serif text-teal">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-ivory overflow-hidden">
      <header className="flex justify-between items-center px-6 py-4 border-b border-charcoal/10 flex-shrink-0">
        <h1 className="font-serif text-2xl text-teal font-bold">Thermal Intelligence</h1>
        <span className="text-xs text-charcoal font-mono">
          {hotspots.length} sources - updated 2 min ago
          {usingMockData && " (demo data)"}
        </span>
      </header>
      <div className="flex flex-1 min-h-0">
        <div className="w-[68%] h-full">
          <ThermalMap
            hotspots={hotspots}
            selectedId={selectedId}
            onSelectHotspot={setSelectedId}
          />
        </div>
        <div className="w-[32%] h-full">
          <PriorityWatchlist
            hotspots={hotspots}
            selectedId={selectedId}
            onSelectHotspot={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
