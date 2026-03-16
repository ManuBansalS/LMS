
import axios from "axios"

const api = axios.create({
	baseURL: (import.meta as any).env?.VITE_API_URL || "/api",
})

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Clear stale/expired token and redirect to login on 401
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			if (window.location.pathname !== "/userLogin") {
				window.location.href = "/userLogin";
			}
		}
		return Promise.reject(error);
	}
);

export default api
