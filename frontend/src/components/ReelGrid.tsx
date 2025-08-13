import { ReelCard } from "./ReelCard";
import type { Reel } from "../utils/reel";

interface Prop {
  reels: Reel[];
  alreadySaved: Boolean;
}

function ReelGrid({ reels, alreadySaved }: Prop) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} save={alreadySaved} />
      ))}
    </div>
  );
}

export default ReelGrid;
