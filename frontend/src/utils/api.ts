import axios from "axios";
import { supabase } from "../lib/supabase";

export interface Reel {
  id: number;
  url: string;
  city: string;
  category: string;
  thumbnail: string;
  username: string;
  caption: string;
}

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
};

export const getExisting = async (city: string) => {
  const response = await axios.get("/api/existing/" + city);
  return response.data as Record<string, Reel[]>;
};

export const fetchCategory = async (
  city: string,
  category: string,
  num: number = 6,
  signal?: AbortSignal
) => {
  const response = await axios.get("/api/search", {
    params: { city, category, num },
    signal,
  });
  return response.data as Record<string, Reel[]>;
};

export const fetchAll = async (city: string, signal?: AbortSignal) => {
  const response = await axios.get("/api/search/all", {
    params: { city },
    signal,
  });
  return response.data as Record<string, Reel[]>;
};

export const saveReel = async (reelId: number) => {
  const headers = await getAuthHeaders();
  await axios.post(
    "/api/save",
    {},
    {
      params: { reel_id: reelId },
      headers,
    }
  );
  return;
};

export const unsaveReel = async (reelId: number) => {
  const headers = await getAuthHeaders();
  await axios.post(
    "/api/unsave",
    {},
    {
      params: { reel_id: reelId },
      headers,
    }
  );
  return;
};

export const getSavedReels = async () => {
  const headers = await getAuthHeaders();
  const res = await axios.get("/api/saved", {
    headers,
  });
  return res.data as Reel[];
};

export const isSaved = async (reelId: number) => {
  const headers = await getAuthHeaders();
  const res = await axios.get("/api/check-saved", {
    params: { reel_id: reelId },
    headers,
  });
  return Boolean(res.data.saved);
};

export const getSavedReelsByCity = async (): Promise<Record<string, Reel[]>> => {
  const all = await getSavedReels();
  return all.reduce((acc, reel) => {
    acc[reel.city] = acc[reel.city] || [];
    acc[reel.city].push(reel);
    return acc;
  }, {} as Record<string, Reel[]>);
};
