import { Outlet } from "react-router";
import type { Route } from "./+types/index";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/AppSidebar";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "QR Menu Dashboard" },
		{ name: "description", content: "QR Menu Dashboard" },
	];
}

export default function HomeLayout() {
	return (
		<SidebarProvider>
			<div className="p-4 flex min-h-svh w-full">
				<AppSidebar />
				<div className="flex-1 p-4">
					<div className="flex items-center md:hidden mb-4">
						<SidebarTrigger />
						<h1 className="text-xl font-bold ml-2">QR Menu</h1>
					</div>
					<div className="flex flex-col gap-4">
						<Outlet />
					</div>
				</div>
			</div>
		</SidebarProvider>
	);
}
