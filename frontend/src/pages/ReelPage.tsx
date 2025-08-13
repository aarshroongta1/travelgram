import { useEffect, useRef, useState } from "react";
import ReelGrid from "../components/ReelGrid";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import type { Reel } from "../utils/reel";
import { fetchAll, fetchCategory } from "../utils/api";
import { MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  city: string;
  data: Record<string, Reel[]>;
}

function ReelsPage({ city, data }: Props) {
  const navigate = useNavigate()
  const categories = Object.keys(data);
  const initial = Object.fromEntries(categories.map((cat) => [cat, data[cat]]));
  const [tabIndex, setTabIndex] = useState(0);
  const [reelsByCategory, setReelsByCategory] = useState<
    Record<string, Reel[]>
  >({
    all: Object.values(data).flat(),
    ...initial,
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const activeCategory = ["all", ...categories][tabIndex];

  // tab switch
  useEffect(() => {
    const controller = new AbortController();
    
    setLoading(false);
    
    if (reelsByCategory[activeCategory]?.length > 12) return;

    const loadInitial = async () => {
      setLoading(true);
      try {
        if (activeCategory === "all") {
          const newReelsMap = await fetchAll(city, controller.signal);
          setReelsByCategory((prev) => {
            const updated = { ...prev };

            for (const cat of Object.keys(newReelsMap)) {
              const existing = prev[cat] ?? [];
              const fresh = newReelsMap[cat] ?? [];
              updated[cat] = [...existing, ...fresh];
            }

            updated["all"] = Object.values(updated).flat();

            return updated;
          });
        } else {
          const newReels = await fetchCategory(
            city,
            activeCategory,
            6,
            controller.signal
          );
          const reels = newReels[activeCategory] ?? [];
          setReelsByCategory((prev) => {
            const existing = prev[activeCategory] ?? [];
            const merged = [...existing, ...reels];
            return { ...prev, [activeCategory]: merged };
          });

          if (reels.length === 0) setHasMore(false);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadInitial();

    return () => controller.abort();
  }, [tabIndex]);

  // scroll down
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && hasMore) {
          setLoading(true);
          try {
            if (activeCategory === "all") {
              const newReelsMap = await fetchAll(city);
              setReelsByCategory((prev) => {
                const updated = { ...prev };
                for (const cat of Object.keys(newReelsMap)) {
                  const existing = prev[cat] ?? [];
                  updated[cat] = [...existing, ...newReelsMap[cat]];
                }
                updated["all"] = Object.values(updated).flat();
                return updated;
              });
            } else {
              const newReels = await fetchCategory(city, activeCategory, 6);
              const reels = newReels[activeCategory] ?? [];
              setReelsByCategory((prev) => {
                const existing = prev[activeCategory] ?? [];
                const merged = [...existing, ...reels];
                return { ...prev, [activeCategory]: merged };
              });
              if (reels.length === 0) setHasMore(false);
            }
          } catch (err) {
            console.error("Scroll fetch failed", err);
          } finally {
            setLoading(false);
          }
        }
      },
      { root: null, rootMargin: "300px", threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [activeCategory, loading, hasMore]);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-3 py-3 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm text-sm flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MapPin />
        {city}
      </h1>

      <TabGroup
        onChange={(i) => {
          setTabIndex(i);
          setHasMore(true);
        }}
      >
        <TabList className="mb-8">
          {["all", ...categories].map((cat) => (
            <Tab
              key={cat}
              className="border-gray-400 border-1 px-3 py-1 mx-1 rounded-xl data-hover:bg-gray-200 data-selected:outline-none data-selected:border-none data-selected:bg-black data-selected:text-white"
            >
              {cat}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {["all", ...categories].map((cat) => (
            <TabPanel key={cat}>
              {loading && (reelsByCategory[cat]?.length ?? 0) === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Loading...
                </div>
              ) : (reelsByCategory[cat]?.length ?? 0) === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reels found
                </div>
              ) : (
                <>
                  <ReelGrid
                    reels={reelsByCategory[cat] ?? []}
                    alreadySaved={false}
                  />
                  <div
                    ref={observerRef}
                    className="h-12 flex items-center justify-center text-md text-gray-700 text-muted-foreground"
                  >
                    {loading
                      ? "Loading more..."
                      : hasMore
                      ? "Scroll to load more"
                      : "No more reels"}
                  </div>
                </>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default ReelsPage;