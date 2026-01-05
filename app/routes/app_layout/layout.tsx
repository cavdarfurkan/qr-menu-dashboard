import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/AppSidebar";
import { useTranslation } from "react-i18next";
import { fetchCurrentUser } from "~/lib/auth-api";
import { useUserStore } from "~/stores";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
	return [{ title: "QR Menu" }, { name: "description", content: "QR Menu" }];
}

export async function clientLoader() {
	try {
		const userResponse = await fetchCurrentUser();
		return {
			user: userResponse,
		};
	} catch (error) {
		console.error("Error loading user data in layout:", error);
		return {
			user: {
				success: false,
				message: "Error loading user data",
				data: undefined,
				timestamp: new Date().toISOString(),
			},
		};
	}
}

export default function AppLayout({
	loaderData,
}: {
	loaderData: Route.ComponentProps;
}) {
	const { t } = useTranslation(["common"]);
	const { setUser, user } = useUserStore();

	// Get loader data (React Router v7 structure)
	const layoutData =
		loaderData.loaderData && Object.keys(loaderData.loaderData).length > 0
			? loaderData.loaderData
			: (loaderData as any);

	const userData = layoutData?.user;

	// Populate user store when user data is loaded
	useEffect(() => {
		if (userData?.success && userData?.data && !user) {
			setUser(userData.data);
		}
	}, [userData, setUser, user]);

	return (
		<SidebarProvider>
			<div className="flex min-h-svh w-full p-4">
				<AppSidebar />
				<div className="flex-1 p-4">
					<div className="flex items-center md:hidden mb-4">
						<SidebarTrigger />
						<h1 className="text-xl font-bold ml-2">{t("common:app_name")}</h1>
					</div>
					<div className="flex flex-col gap-4">
						<Outlet />
					</div>
				</div>
			</div>
		</SidebarProvider>
	);
}
