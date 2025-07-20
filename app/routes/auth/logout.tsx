import { useEffect } from "react";
import { Navigate } from "react-router";
import { useAuth } from "~/auth_context";
import api from "~/lib/api";

export async function clientAction() {
	try {
		await api.post("/v1/auth/logout", {}, { withCredentials: true });
	} catch (error) {
		console.error("Logout API call failed:", error);
	}
}

export default function Logout() {
	const { logout } = useAuth();

	useEffect(() => {
		const performLogout = async () => {
			await clientAction();
			await logout();
		};
		performLogout();
	}, [logout]);

	return <Navigate to="/login" replace />;
}
