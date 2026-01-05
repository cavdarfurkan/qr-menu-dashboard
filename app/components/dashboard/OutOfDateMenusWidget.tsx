import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Link, useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import type { MenuType } from "~/routes/app_layout/dashboard/dashboard";
import api from "~/lib/api";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { useBuildPolling } from "~/hooks/use-build-polling";

type OutOfDateMenusWidgetProps = {
	menus: MenuType[];
};

function MenuRebuildButton({ menu }: { menu: MenuType }) {
	const { t } = useTranslation(["menu", "common"]);
	const revalidator = useRevalidator();
	const { buildState, initiateBuild } = useBuildPolling(menu.menuId);
	const [isStarting, setIsStarting] = useState(false);

	const handleRebuild = async () => {
		setIsStarting(true);
		try {
			const buildResponse = await api.post("/v1/menu/build", {
				menu_id: menu.menuId,
			});

			if (buildResponse.data.success) {
				const statusUrl = buildResponse.data.data.status_url;
				const jobIdMatch = statusUrl.match(/\/job\/([^/]+)$/);
				if (jobIdMatch) {
					const jobId = jobIdMatch[1];
					initiateBuild(menu.menuId, jobId);
					revalidator.revalidate();
				} else {
					toast.error(t("menu:build_error"));
				}
			} else {
				toast.error(buildResponse.data.message || t("menu:build_error"));
			}
		} catch (error) {
			let errorMessage = t("menu:build_error");
			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
			}
			toast.error(errorMessage);
		} finally {
			setIsStarting(false);
		}
	};

	const isBuilding =
		buildState?.status === "PENDING" || buildState?.status === "PROCESSING";

	return (
		<Button
			size="sm"
			variant="outline"
			onClick={handleRebuild}
			disabled={isBuilding || isStarting}
			className="h-8"
		>
			{isBuilding || isStarting ? (
				<>
					<Loader2 className="h-3 w-3 mr-1 animate-spin" />
					{t("menu:building")}
				</>
			) : (
				<>
					<RefreshCw className="h-3 w-3 mr-1" />
					{t("menu:rebuild_menu")}
				</>
			)}
		</Button>
	);
}

export default function OutOfDateMenusWidget({
	menus,
}: OutOfDateMenusWidgetProps) {
	const { t } = useTranslation(["home", "menu", "common"]);

	const outOfDateMenus = menus.filter((menu) => !menu.isLatest);

	if (outOfDateMenus.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5 text-green-600" />
						{t("home:all_menus_up_to_date")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						{t("home:all_menus_synchronized")}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-yellow-600" />
					{t("home:menus_needing_rebuild")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					{t("home:menus_needing_rebuild_count", {
						count: outOfDateMenus.length,
					})}
				</p>
				<div className="space-y-3">
					{outOfDateMenus.map((menu) => (
						<div
							key={menu.menuId}
							className="flex items-center justify-between gap-3 p-3 border rounded-md"
						>
							<div className="flex items-center gap-2 flex-1 min-w-0">
								<Link
									to={`/menu/${menu.menuId}`}
									viewTransition
									className="font-medium hover:underline truncate"
								>
									{menu.menuName}
								</Link>
								{menu.published && (
									<Badge variant="secondary" className="text-xs">
										{t("home:published")}
									</Badge>
								)}
							</div>
							<div className="flex items-center gap-2">
								<MenuRebuildButton menu={menu} />
								<Button size="sm" variant="ghost" asChild className="h-8">
									<Link to={`/menu/${menu.menuId}`} viewTransition>
										{t("common:buttons.view")}
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
				{menus.length > outOfDateMenus.length && (
					<div className="mt-4 pt-4 border-t">
						<Link
							to="/menu"
							viewTransition
							className="text-sm text-primary hover:underline"
						>
							{t("home:view_all_menus")} →
						</Link>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
