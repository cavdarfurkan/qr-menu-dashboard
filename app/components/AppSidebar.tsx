import { Home, LogOut, Menu, NotepadText, Settings } from "lucide-react";
import { Link } from "react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "~/components/ui/sidebar";

export function AppSidebar() {
	const { state, isMobile } = useSidebar();

	interface SidebarItem {
		label: string;
		icon: React.ElementType;
		url: string;
	}

	const sidebarItems: SidebarItem[] = [
		{
			label: "Home",
			icon: Home,
			url: "/",
		},
		{
			label: "Menu",
			icon: NotepadText,
			url: "/menu",
		},
		{
			label: "Settings",
			icon: Settings,
			url: "/settings",
		},
		{
			label: "Logout",
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
								state === "collapsed"
									? "w-0 hidden"
									: "w-auto block"
							}
							`}
						>
							<Link
								to="/"
								className="flex items-center gap-2"
								viewTransition
							>
								<h1 className="text-2xl font-bold">QR Menu</h1>
							</Link>
						</div>
					)}
					{!isMobile && <SidebarTrigger />}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					{/* <SidebarGroupLabel>Menu</SidebarGroupLabel> */}
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										asChild
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
