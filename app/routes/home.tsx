import { Link } from "react-router";
import type { Route } from "./+types/home";
// import { Welcome } from "../welcome/welcome";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "QR Menu Dashboard" },
		{ name: "description", content: "QR Menu Dashboard" },
	];
}

export default function Home() {
	// return <Welcome />;
	return (
		<div className="flex min-h-svh flex-col items-center justify-center">
			<Link to="/login" viewTransition>
				<Button>Login</Button>
			</Link>
			<Link to="/register" viewTransition>
				<Button>Register</Button>
			</Link>
		</div>
	);
}
