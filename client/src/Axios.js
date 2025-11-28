// // ...existing code...
// import axios from "axios";

// const BACKEND_URL =
//   (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

// const API_PREFIX = "/api/v1";

// const Axios = axios.create({
//   baseURL: `${BACKEND_URL}${API_PREFIX}/`, // ensure trailing slash
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Ensure every request URL has a single leading slash and no duplicate slashes
// Axios.interceptors.request.use((config) => {
//   if (config && config.url) {
//     config.url = "/" + config.url.replace(/^\/+/, "");
//     config.url = config.url.replace(/\/{2,}/g, "/");
//   }
//   return config;
// });

// export default Axios;
// // ...existing code...

// ...existing code...
import axios from "axios";

const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

// set to empty so root routes like /register resolve to http://localhost:5000/register
const API_PREFIX = "/api/v1"; // change from "/api/v1" to ""

const Axios = axios.create({
  baseURL: `${BACKEND_URL}${API_PREFIX}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

Axios.interceptors.request.use((config) => {
  if (config && config.url) {
    config.url = "/" + config.url.replace(/^\/+/, "");
    config.url = config.url.replace(/\/{2,}/g, "/");
  }
  return config;
});

export default Axios;
// ...existing code...