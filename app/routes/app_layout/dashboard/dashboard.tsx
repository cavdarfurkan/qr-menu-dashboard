import type { Route } from "./+types/dashboard";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import api from "~/lib/api";
import Title from "~/components/Title";
import { useTranslation } from "react-i18next";

export async function clientLoader() {
	try {
		const response = await api.get("/test/whoami");
		return response.data;
	} catch (error) {
		console.error("Error loading user data:", error);
		return { message: "Error loading user data" };
	}
}

export default function Home({
	loaderData,
}: {
	loaderData: Route.ComponentProps;
}) {
	const { t } = useTranslation(["home", "common"]);
	const message = loaderData.loaderData?.message || "";
	const usernameMatch = message.match(/username=([^,]+)/);
	const emailMatch = message.match(/email=([^,]+)/);

	const username = usernameMatch
		? usernameMatch[1]
		: t("common:empty_states.unknown");
	const email = emailMatch ? emailMatch[1] : t("common:empty_states.unknown");

	return (
		<div className="flex flex-col gap-4">
			<Title title={t("home:title")} />

			<div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
				{t("home:logged_in_success")} {username} {email}
			</div>

			<div className="flex flex-col gap-4 w-48">
				<Button asChild>
					<Link to="/menu" viewTransition>
						{t("home:manage_menus")}
					</Link>
				</Button>
				<Button asChild>
					<Link to="/settings" viewTransition>
						{t("home:settings")}
					</Link>
				</Button>
			</div>

			<div className="h-96 bg-gray-100"></div>
			<div className="h-96 bg-gray-100"></div>
			<div className="h-96 bg-gray-100"></div>
		</div>
	);
}
