import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/AppSidebar";
import { useTranslation } from "react-i18next";

export function meta({}: Route.MetaArgs) {
	return [{ title: "QR Menu" }, { name: "description", content: "QR Menu" }];
}

export default function AppLayout() {
	const { t } = useTranslation(["common"]);

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
