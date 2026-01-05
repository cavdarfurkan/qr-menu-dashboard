import type { Route } from "./+types/dashboard";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import Title from "~/components/Title";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import {
	StatsWidget,
	QuickActionsWidget,
	MenuPreviewWidget,
	OutOfDateMenusWidget,
} from "~/components/dashboard";

export type MenuType = {
	menuId: number;
	menuName: string;
	published?: boolean;
	isLatest: boolean;
};

export async function clientLoader() {
	try {
		const [whoamiResponse, menusResponse] = await Promise.all([
			api
				.get("/test/whoami")
				.then((res) => res.data)
				.catch((err) => {
					console.error("Error loading whoami:", err);
					return { message: "Error loading user data" };
				}),
			api
				.get("/v1/menu/all")
				.then((res) => res.data)
				.catch((err) => {
					console.error("Error loading menus:", err);
					if (isAxiosError(err)) {
						const errorResponse = err.response;
						return {
							success: errorResponse?.data?.success ?? false,
							message:
								errorResponse?.data?.message ??
								i18n.t("error:error_getting_menus"),
							data: null,
							timestamp: errorResponse?.data?.timestamp,
						};
					}
					return {
						success: false,
						data: [],
						message: "An unexpected error occurred",
					};
				}),
		]);

		return {
			whoami: whoamiResponse,
			menus: menusResponse,
		};
	} catch (error) {
		console.error("Error loading dashboard data:", error);
		return {
			whoami: { message: "Error loading user data" },
			menus: { success: false, data: [], message: "Error loading menus" },
		};
	}
}

export default function Home({
	loaderData,
}: {
	loaderData: Route.ComponentProps;
}) {
	const { t } = useTranslation(["home", "common", "menu"]);

	// In React Router v7, loader data is accessed via loaderData.loaderData
	// But if that's empty, try accessing loaderData directly
	const dashboardData =
		loaderData.loaderData && Object.keys(loaderData.loaderData).length > 0
			? loaderData.loaderData
			: (loaderData as any);

	const whoamiData = dashboardData.whoami || {};
	const menusData = dashboardData.menus || { success: false, data: [] };

	const message = whoamiData.message || "";
	const usernameMatch = message.match(/username=([^,]+)/);
	const emailMatch = message.match(/email=([^,]+)/);

	const username = usernameMatch
		? usernameMatch[1]
		: t("common:empty_states.unknown");
	const email = emailMatch ? emailMatch[1] : t("common:empty_states.unknown");

	// Handle both array and null/undefined cases
	// Filter to only show published menus
	const allMenus: Array<MenuType> =
		menusData.success && menusData.data && Array.isArray(menusData.data)
			? menusData.data
			: [];

	const publishedMenus = allMenus.filter((menu) => menu.published === true);
	const unpublishedMenus = allMenus.filter((menu) => menu.published === false);

	return (
		<div className="flex flex-col gap-6">
			<Title title={t("home:title")} />

			{/* Welcome Message */}
			<div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-md">
				{t("home:logged_in_success")} {username} {email}
			</div>

			{/* Widget Grid Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Stats Widget - Full Width */}
				<div className="lg:col-span-12">
					<StatsWidget
						totalMenus={allMenus.length}
						publishedMenus={publishedMenus.length}
						unpublishedMenus={unpublishedMenus.length}
					/>
				</div>

				{/* Out of Date Menus Widget - Full Width */}
				<div className="lg:col-span-12">
					<OutOfDateMenusWidget menus={allMenus} />
				</div>

				{/* Quick Actions */}
				<div className="lg:col-span-12">
					<QuickActionsWidget />
				</div>

				{/* Menu Preview - Full Width */}
				<div className="lg:col-span-12">
					<MenuPreviewWidget menus={publishedMenus} />
				</div>
			</div>
		</div>
	);
}
