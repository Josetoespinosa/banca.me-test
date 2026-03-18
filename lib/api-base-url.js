export function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (typeof window === "undefined") {
    return (configuredBaseUrl || "http://localhost:8000").replace(/\/$/, "");
  }

  if (!configuredBaseUrl) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  try {
    const url = new URL(configuredBaseUrl);
    const isLocalFrontend = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const isLocalApi = ["localhost", "127.0.0.1"].includes(url.hostname);

    if (isLocalFrontend && isLocalApi) {
      url.hostname = window.location.hostname;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return configuredBaseUrl.replace(/\/$/, "");
  }
}
