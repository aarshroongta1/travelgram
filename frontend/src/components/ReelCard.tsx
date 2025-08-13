import type { Reel } from "../utils/reel";
import { CirclePlay, CircleUserRound, Bookmark } from "lucide-react";
import { saveReel, unsaveReel, isSaved } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

interface Prop {
  reel: Reel;
  save: Boolean;
}

export function ReelCard({ reel, save }: Prop) {
  const { id, url, category, thumbnail, username, caption } = reel;

  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(save);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    isSaved(id).then((res) => setSaved(res));
  }, [isAuthenticated, id]);

  const clickHandler = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to save reels");
    }

    if (saved) {
      await unsaveReel(id);
    } else {
      await saveReel(id);
    }
    setSaved(!saved);
  };

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-[9/16] overflow-hidden">
          {/* Thumbnail */}
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={thumbnail}
          />

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <CirclePlay className="w-6 h-6 p-3 text-foreground fill-current" />
          </div>

          {/* Category */}
          <div className="absolute top-2 left-2">
            <div>
              <span className="text-xs bg-black text-white p-2 rounded-xl">
                {category}
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* Metadata */}
      <div className="p-4">
        <p className="text-muted-foreground text-xs mb-3 line-clamp-3 leading-relaxed">
          {caption}
        </p>
        <div className="flex items-center gap-1 mb-1.5">
          <CircleUserRound className="size-4 object-cover" />
          <span className="text-muted-foreground text-xs">{username}</span>
        </div>

        {/* Save */}
        <button onClick={clickHandler}>
          <Bookmark
            className={`w-4 h-4 ${
              saved ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ReelCard;
