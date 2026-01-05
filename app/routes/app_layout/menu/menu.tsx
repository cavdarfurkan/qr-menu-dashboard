import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/menu";
import { Link } from "react-router";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import Title from "~/components/Title";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { AlertTriangle } from "lucide-react";

type MenuType = {
	menuId: number;
	menuName: string;
	published?: boolean;
	isLatest: boolean;
};

export async function clientLoader(): Promise<ApiResponse> {
	try {
		const response = await api.get("/v1/menu/all");
		return { ...response.data };
	} catch (error) {
		if (isAxiosError(error)) {
			const errorResponse = error.response;

			return {
				success: errorResponse?.data?.success ?? false,
				message:
					errorResponse?.data?.message ?? i18n.t("error:error_getting_menus"),
				data: null,
				timestamp: errorResponse?.data.timestamp,
			};
		}

		return {
			success: false,
			message: "An unexpected error occurred",
			data: null,
			timestamp: Date.now().toString(),
		};
	}
}

export default function Menu({ loaderData }: Route.ComponentProps) {
	const { t } = useTranslation(["menu", "common", "home"]);
	const response = loaderData;
	if (!response.success) {
		return <p> {response.message} </p>;
	}

	const menus: Array<MenuType> = loaderData.data;

	return (
		<div className="flex flex-col gap-6">
			<Title title={t("menu:title")}>
				<Button asChild>
					<Link to="/menu/create" viewTransition>
						{t("menu:new_menu")}
					</Link>
				</Button>
			</Title>

			{menus.length === 0 ? (
				<div className="text-muted-foreground text-center py-8">
					{t("menu:no_menus")} <br />
					<Link
						to="/menu/create"
						className="text-primary underline"
						viewTransition
					>
						{t("menu:create_first_menu")}
					</Link>
				</div>
			) : (
				<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mxauto">
					{menus.map((menu: MenuType) => (
						<Link
							key={menu.menuId}
							to={`/menu/${menu.menuId}`}
							viewTransition
							className="w-full h-full"
						>
							<Card
								key={menu.menuId}
								className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
									!menu.isLatest
										? "border-yellow-500 dark:border-yellow-600"
										: ""
								}`}
							>
								<CardHeader>
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2 flex-1 min-w-0">
											<CardTitle className="truncate">
												{menu.menuName}
											</CardTitle>
											{!menu.isLatest && (
												<Badge
													variant="outline"
													className="border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950"
													aria-label={t("menu:needs_rebuild")}
												>
													<AlertTriangle className="h-3 w-3 mr-1" />
													{t("menu:needs_rebuild")}
												</Badge>
											)}
										</div>
										{menu.published ? (
											<Badge variant="secondary">{t("home:published")}</Badge>
										) : (
											<Badge variant="outline">{t("home:unpublished")}</Badge>
										)}
									</div>
								</CardHeader>
								{/* <CardContent>
									<p className="text-gray-600">
										Woaw
									</p>
								</CardContent> */}
							</Card>
						</Link>
					))}
				</ul>
			)}
		</div>
	);
}
