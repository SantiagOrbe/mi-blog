const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const Global = {
  url: (configuredApiUrl || "http://localhost:3000").replace(/\/+$/, ""),
}