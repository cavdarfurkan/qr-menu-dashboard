import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { getCsrfToken } from "./csrf";

export type ApiResponse = {
	success: boolean;
	message?: string;
	data?: any;
	timestamp: string;
};

/**
 * Constructs the API base URL from environment variable or falls back to default.
 * Set VITE_API_BASE_URL in your .env file for production deployments.
 */
function getBaseUrl(): string {
	const envUrl = import.meta.env.VITE_API_BASE_URL;
	const defaultUrl = "http://localhost:8080/api";

	if (!envUrl) {
		console.warn(
			"[API] VITE_API_BASE_URL is not set. Using default:",
			defaultUrl,
			"Set this environment variable for production deployments.",
		);
		return defaultUrl;
	}

	return envUrl;
}

const api = axios.create({
	baseURL: getBaseUrl(),
	headers: {
		"Content-Type": "application/json",
	},
	skipRefreshingToken: false, // Default value
} as ExtendedAxiosRequestConfig);

let isLoggingOut = false;

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
	skipRefreshingToken: boolean;
}

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	const csrfToken = getCsrfToken();
	if (csrfToken && config.headers) {
		config.headers["X-XSRF-TOKEN"] = csrfToken;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const requestConfig = error.config as ExtendedAxiosRequestConfig;

		// If don't have a config or already tried, reject
		if (!requestConfig || (requestConfig as any)._retry) {
			return Promise.reject(error);
		}

		// If 401, try to refresh token
		if (error.response?.status === 401) {
			// If skipRefreshingToken is true, don't attempt to refresh token
			if (requestConfig.skipRefreshingToken) {
				return Promise.reject(error);
			}

			// Don't attemp refresh if already logging out
			if (isLoggingOut) {
				return Promise.reject(error);
			}

			(requestConfig as any)._retry = true;

			const isRefreshRequest = requestConfig.url?.includes("/auth/refresh");
			if (isRefreshRequest) {
				logoutUser();
				return Promise.reject(error);
			}

			try {
				// Direct refresh
				const csrfToken = getCsrfToken();

				const refreshResponse = await api.post(
					"/v1/auth/refresh",
					{},
					{
						withCredentials: true,
						headers: {
							"X-XSRF-TOKEN": csrfToken,
							"X-Request-Cookie-SameSite": "None",
							"X-Request-Cookie-Secure": "true",
						},
					},
				);

				const newToken = refreshResponse.data.data.accessToken;

				localStorage.setItem("accessToken", newToken);

				if (requestConfig.headers) {
					requestConfig.headers.Authorization = `Bearer ${newToken}`;
				}

				return api(requestConfig);
			} catch (refreshError: any) {
				console.log(
					"Error refreshing token",
					refreshError?.response?.status || refreshError,
				);
				logoutUser();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

const logoutUser = () => {
	if (isLoggingOut) {
		return;
	}

	isLoggingOut = true;

	localStorage.removeItem("accessToken");

	// Reset the flag after a delay
	setTimeout(() => {
		isLoggingOut = false;
	}, 1000);
};

export default api;
