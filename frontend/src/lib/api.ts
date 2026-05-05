export const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In the browser, default to empty string so it uses relative paths (e.g. /api/...)
  if (typeof window !== "undefined") {
    return "";
  }
  
  // On the server (SSR), default to the backend container name if in Docker, 
  // or localhost if running locally.
  return "http://localhost:8080";
};
