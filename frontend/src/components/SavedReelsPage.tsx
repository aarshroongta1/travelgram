import { useParams, useOutletContext } from "react-router-dom";
import type { Reel } from "../utils/reel";
import ReelGrid from "./ReelGrid";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";

function SavedReelsPage() {
  const { city } = useParams();
  const { savedReels } = useOutletContext<{ savedReels: Reel[] }>();

  const cityReels = savedReels.filter(
    (reel) => reel.city.toLowerCase() === city?.toLowerCase()
  );

  const grouped = cityReels.reduce((acc, reel) => {
    acc[reel.category] = acc[reel.category] || [];
    acc[reel.category].push(reel);
    return acc;
  }, {} as Record<string, Reel[]>);

  const categories = Object.keys(grouped);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Reels in {city}</h1>
      <TabGroup>
        <TabList className="mb-4">
          {["all", ...categories].map((cat) => (
            <Tab
              key={cat}
              className="px-3 py-1 mx-1 rounded-xl data-hover:bg-gray-200 data-selected:bg-black data-selected:text-white"
            >
              {cat}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {["all", ...categories].map((cat) => (
            <TabPanel key={cat}>
              <ReelGrid
                reels={cat === "all" ? cityReels : grouped[cat]}
                alreadySaved={true}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default SavedReelsPage;
