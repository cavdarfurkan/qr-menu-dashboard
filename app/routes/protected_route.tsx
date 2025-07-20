import { Navigate, Outlet } from "react-router";
import { useAuth } from "../auth_context";

export default function ProtectedRoute() {
	const { accessToken } = useAuth();

	if (!accessToken) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
