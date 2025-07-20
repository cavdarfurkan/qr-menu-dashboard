export const getCsrfToken = () => {
	const match = document.cookie.match("(^|;)\\s*XSRF-TOKEN\\s*=\\s*([^;]+)");
	return match ? decodeURIComponent(match[2]) : "";
};

export const hasCsrfToken = (): boolean => {
	return !!getCsrfToken();
};

export const fetchCsrfToken = async (): Promise<void> => {
	try {
		console.log("Fetching CSRF token...");
		const { default: api } = await import("~/lib/api");

		// Add headers to request SameSite=None, Secure cookies
		const response = await api.get("/v1/auth/csrf", {
			withCredentials: true,
			headers: {
				"X-Request-Cookie-SameSite": "None",
				"X-Request-Cookie-Secure": "true",
			},
		});

		console.log("CSRF token fetch response:", response.status);
	} catch (error) {
		console.error("Failed to fetch CSRF token", error);
		throw error;
	}
};
