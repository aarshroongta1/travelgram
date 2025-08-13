import { useNavigate, useOutletContext } from "react-router-dom";
import type { Reel } from "../utils/reel";

function SavedCollections() {
  const { savedReels } = useOutletContext<{ savedReels: Reel[] }>();
  const navigate = useNavigate();

  const grouped = savedReels.reduce((acc, reel) => {
    acc[reel.city] = acc[reel.city] || [];
    acc[reel.city].push(reel);
    return acc;
  }, {} as Record<string, Reel[]>);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Collections</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.keys(grouped).map((city) => (
          <div
            key={city}
            className="p-4 rounded shadow cursor-pointer bg-white hover:bg-gray-50"
            onClick={() => navigate(`/saved/${encodeURIComponent(city)}`)}
          >
            <h2 className="text-lg font-semibold">{city}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedCollections;
