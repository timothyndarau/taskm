// fetchWithAuth.js
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("access_token");
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${token}`;
  options.headers["Content-Type"] = "application/json";

  let res = await fetch(url, options);

  // Auto-refresh token if expired
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const refreshRes = await fetch("http://127.0.0.1:5000/refresh", {
        method: "POST",
        headers: { "Authorization": `Bearer ${refreshToken}` },
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access_token);
        options.headers["Authorization"] = `Bearer ${data.access_token}`;
        res = await fetch(url, options); // retry original request
      }
    }
  }
  return res;
}
