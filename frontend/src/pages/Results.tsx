import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Reel } from "../utils/reel";
import ReelsPage from "./ReelPage";
import { getExisting } from "../utils/api";

function Results() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "";
  const [data, setData] = useState<Record<string, Reel[]> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getExisting(city);
        setData(res);
      } catch (err) {
        setData(null);
      }
      setLoading(false);
    };

    if (city) fetch();
  }, [city]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <div className="text-gray-400 text-sm font-medium">
          Looking for reels
        </div>
      </div>
    );
  }

  return <ReelsPage city={city} data={data ?? {}} />;
}

export default Results;
