import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/menu";
import { Link } from "react-router";
import api, { type ApiResponse } from "~/lib/api";
import { isAxiosError } from "axios";
import Title from "~/components/Title";
import { Button } from "~/components/ui/button";

type MenuType = {
	menuId: number;
	menuName: string;
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
				message: errorResponse?.data?.message ?? "Error getting menus",
				data: null,
				timestamp: errorResponse?.data.timestamp,
			};
		}

		return {
			success: false,
			message: "An unexpected error occured",
			data: null,
			timestamp: Date.now().toString(),
		};
	}
}

export default function Menu({ loaderData }: Route.ComponentProps) {
	const response = loaderData;
	if (!response.success) {
		return <p> {response.message} </p>;
	}

	const menus: Array<MenuType> = loaderData.data;

	return (
		<div className="flex flex-col gap-6">
			<Title title="Your Menus">
				<Button asChild>
					<Link to="/menu/create" viewTransition>
						+ New Menu
					</Link>
				</Button>
			</Title>

			{menus.length === 0 ? (
				<div className="text-muted-foreground text-center py-8">
					No menus found. <br />
					<Link
						to="/menu/create"
						className="text-primary underline"
						viewTransition>
						Create your first menu
					</Link>
				</div>
			) : (
				<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mxauto">
					{menus.map((menu: MenuType) => (
						<Link
							key={menu.menuId}
							to={`/menu/${menu.menuId}`}
							viewTransition
							className="w-full h-full">
							<Card
								key={menu.menuId}
								className="hover:shadow-lg transition-all duration-200 cursor-pointer">
								<CardHeader>
									<CardTitle>{menu.menuName}</CardTitle>
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
