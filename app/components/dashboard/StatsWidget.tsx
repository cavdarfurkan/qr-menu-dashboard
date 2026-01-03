import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useTranslation } from "react-i18next";
import { FileText, CheckCircle, XCircle } from "lucide-react";

type StatsWidgetProps = {
	totalMenus: number;
	publishedMenus: number;
	unpublishedMenus: number;
};

export default function StatsWidget({
	totalMenus,
	publishedMenus,
	unpublishedMenus,
}: StatsWidgetProps) {
	const { t } = useTranslation(["home"]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("home:stats_widget_title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2 text-muted-foreground">
							<FileText className="h-4 w-4" />
							<span className="text-sm">{t("home:total_menus")}</span>
						</div>
						<div className="text-2xl font-bold">{totalMenus}</div>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<span className="text-sm">{t("home:published_menus")}</span>
						</div>
						<div className="text-2xl font-bold text-green-600">
							{publishedMenus}
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2 text-muted-foreground">
							<XCircle className="h-4 w-4 text-gray-500" />
							<span className="text-sm">{t("home:unpublished_menus")}</span>
						</div>
						<div className="text-2xl font-bold text-gray-500">
							{unpublishedMenus}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
