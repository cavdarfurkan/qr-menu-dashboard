import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import api from "~/lib/api";

export async function clientLoader() {
	try {
		const response = await api.get("/test/whoami");
		return response.data;
	} catch (error) {
		console.error("Error loading user data:", error);
		return { message: "Error loading user data" };
	}
}

export default function Home({ loaderData }: { loaderData: any }) {
	const message = loaderData?.message || "";
	const usernameMatch = message.match(/username=([^,]+)/);
	const emailMatch = message.match(/email=([^,]+)/);

	const username = usernameMatch ? usernameMatch[1] : "Unknown";
	const email = emailMatch ? emailMatch[1] : "Unknown";

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold">Dashboard Home</h1>

			<div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
				You are successfully logged in! {username} {email}
			</div>

			<div className="flex flex-col gap-4 w-48">
				<Button asChild>
					<Link to="/menu" viewTransition>
						Manage Menus
					</Link>
				</Button>
				<Button asChild>
					<Link to="/settings" viewTransition>
						Settings
					</Link>
				</Button>
			</div>
		</div>
	);
}
