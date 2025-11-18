import { Home, LogOut, NotepadText, Palette, Settings } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "~/components/ui/sidebar";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
	const { t } = useTranslation("sidebar");
	const location = useLocation();
	const currentPath = location.pathname;

	const { state, isMobile, setOpen } = useSidebar();

	const SIDEBAR_COOKIE_NAME = "sidebar_state";

	useEffect(() => {
		const cookieVal = getCookie(SIDEBAR_COOKIE_NAME);
		if (cookieVal) {
			const cookieState = cookieVal === "true" ? true : false;
			setOpen(cookieState);
		}
	}, []);

	interface SidebarItem {
		label: string;
		icon: React.ElementType;
		url: string;
	}

	const sidebarItems: SidebarItem[] = [
		{
			label: t("home"),
			icon: Home,
			url: "/",
		},
		{
			label: t("menu"),
			icon: NotepadText,
			url: "/menu",
		},
		{
			label: t("themes"),
			icon: Palette,
			url: "/theme",
		},
		{
			label: t("settings"),
			icon: Settings,
			url: "/settings",
		},
		{
			label: t("logout"),
			icon: LogOut,
			url: "/logout",
		},
	];

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center justify-between">
					{!isMobile && (
						<div
							className={`flex items-center gap-2 transition-all duration-200 ${
								state === "collapsed" ? "w-0 hidden" : "w-auto block"
							}
							`}
						>
							<Link to="/" className="flex items-center gap-2" viewTransition>
								<h1 className="text-2xl font-bold">{t("app_name")}</h1>
							</Link>
						</div>
					)}
					{!isMobile && <SidebarTrigger />}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										asChild
										isActive={item.url === currentPath}
										tooltip={item.label}
									>
										<Link to={item.url} viewTransition>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}

function getCookie(name: string) {
	let cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i].trim();
		if (cookie.startsWith(name + "=")) {
			return cookie.substring(name.length + 1);
		}
	}
	return null; // If cookie not found
}
