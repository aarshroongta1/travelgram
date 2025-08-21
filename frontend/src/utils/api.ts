import axios from "axios";

export interface Reel {
  id: number;
  url: string;
  city: string;
  category: string;
  thumbnail: string;
  username: string;
  caption: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const getExisting = async (city: string) => {
  const response = await api.get("/api/existing/" + city);
  return response.data as Record<string, Reel[]>;
};

export const fetchCategory = async (
  city: string,
  category: string,
  num: number = 6,
  signal?: AbortSignal
) => {
  const response = await api.get("/api/search", {
    params: { city, category, num },
    signal,
  });
  return response.data as Record<string, Reel[]>;
};

export const fetchAll = async (city: string, signal?: AbortSignal) => {
  const response = await api.get("/api/search/all", {
    params: { city },
    signal,
  });
  return response.data as Record<string, Reel[]>;
};

export const saveReel = async (reelId: number) => {
  await api.post("/api/save", {}, { params: { reel_id: reelId } });
};

export const unsaveReel = async (reelId: number) => {
  await api.post("/api/unsave", {}, { params: { reel_id: reelId } });
};

export const getSavedReels = async () => {
  const res = await api.get("/api/saved");
  return res.data as Reel[];
};

export const isSaved = async (reelId: number) => {
  const res = await api.get("/api/check-saved", {
    params: { reel_id: reelId },
  });
  return Boolean(res.data.saved);
};

export const getSavedReelsByCity = async (): Promise<
  Record<string, Reel[]>
> => {
  const all = await getSavedReels();
  return all.reduce((acc, reel) => {
    acc[reel.city] = acc[reel.city] || [];
    acc[reel.city].push(reel);
    return acc;
  }, {} as Record<string, Reel[]>);
};
