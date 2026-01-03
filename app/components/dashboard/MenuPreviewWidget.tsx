import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { MenuType } from "~/routes/app_layout/dashboard/dashboard";

type MenuPreviewWidgetProps = {
	menus: MenuType[];
	maxItems?: number;
};

export default function MenuPreviewWidget({
	menus,
	maxItems = 6,
}: MenuPreviewWidgetProps) {
	const { t } = useTranslation(["home", "menu"]);

	const displayedMenus = menus.slice(0, maxItems);

	if (displayedMenus.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t("home:menu_preview_title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						{t("home:no_published_menus")}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("home:menu_preview_title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{displayedMenus.map((menu) => (
						<Link
							key={menu.menuId}
							to={`/menu/${menu.menuId}`}
							viewTransition
							className="w-full h-full"
						>
							<Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
								<CardHeader>
									<div className="flex items-center justify-between gap-2">
										<CardTitle className="text-base">{menu.menuName}</CardTitle>
										<Badge variant="secondary">{t("home:published")}</Badge>
									</div>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
				{menus.length > maxItems && (
					<div className="mt-4 text-center">
						<Link
							to="/menu"
							viewTransition
							className="text-sm text-primary hover:underline"
						>
							{t("home:view_all_menus")} ({menus.length})
						</Link>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
