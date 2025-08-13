import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Reel } from "../utils/reel";
import { getSavedReels } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function SavedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [reels, setReels] = useState<Reel[] | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    getSavedReels().then((res) => setReels(res));
  }, [isAuthenticated, loading, navigate]);

  if (loading || !reels) {
    return <div className="p-6">Loading...</div>;
  }

  return <Outlet context={{ savedReels: reels }} />;
}

export default SavedLayout;
