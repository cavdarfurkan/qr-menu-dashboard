import { Navigate, Outlet } from "react-router";
import { useAuth } from "../auth_context";

export default function NoAuthRoute() {
	const { accessToken } = useAuth();

	if (accessToken) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
