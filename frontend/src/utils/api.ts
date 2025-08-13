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
  await axios.post(
    "/api/save",
    {},
    {
      params: { reel_id: reelId },
      withCredentials: true,
    }
  );
  return;
};

export const unsaveReel = async (reelId: number) => {
  await axios.post(
    "/api/unsave",
    {},
    {
      params: { reel_id: reelId },
      withCredentials: true,
    }
  );
  return;
};

export const getSavedReels = async () => {
  const res = await axios.get("/api/saved", {
    withCredentials: true,
  });
  return res.data as Reel[];
};

export const isSaved = async(reelId: number) => {
  const res = await axios.get("/api/check-saved", {
    params: {reel_id: reelId},
    withCredentials: true
  })
  return Boolean(res.data.saved)
}

export const getSavedReelsByCity = async (): Promise<Record<string, Reel[]>> => {
  const all = await getSavedReels();
  return all.reduce((acc, reel) => {
    acc[reel.city] = acc[reel.city] || [];
    acc[reel.city].push(reel);
    return acc;
  }, {} as Record<string, Reel[]>);
};
