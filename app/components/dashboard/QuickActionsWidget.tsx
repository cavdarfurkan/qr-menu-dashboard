import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Plus, Palette, List, Settings } from "lucide-react";

export default function QuickActionsWidget() {
	const { t } = useTranslation(["home", "menu", "common"]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("home:quick_actions_title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Button asChild variant="default" className="w-full">
						<Link to="/menu/create" viewTransition>
							<Plus className="h-4 w-4 mr-2" />
							{t("menu:new_menu")}
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link to="/theme" viewTransition>
							<Palette className="h-4 w-4 mr-2" />
							{t("home:manage_themes")}
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link to="/menu" viewTransition>
							<List className="h-4 w-4 mr-2" />
							{t("home:view_all_menus")}
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link to="/settings" viewTransition>
							<Settings className="h-4 w-4 mr-2" />
							{t("home:settings")}
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
