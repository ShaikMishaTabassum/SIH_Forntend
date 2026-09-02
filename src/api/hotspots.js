import apiClient from "./client";

export async function fetchHotspots() {
  try {
    const response = await apiClient.get("/hotspots");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch hotspots:", error);
    return [];
  }
}
