export const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In the browser, default to origin so it uses absolute paths to the same domain
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // On the server (SSR), default to the backend container name if in Docker, 
  // or localhost if running locally.
  return "http://localhost:8080";
};
