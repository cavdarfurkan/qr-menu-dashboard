import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./auth_context";
import Loader from "./components/Loader";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang={i18n.language || "en"} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<Toaster />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export function HydrateFallback() {
	return (
		<ThemeProvider>
			<Loader fullScreen />
		</ThemeProvider>
	);
}

export default function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<I18nextProvider i18n={i18n}>
					<Outlet />
				</I18nextProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = i18n.t("error:unexpected_error") as string;
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message =
			error.status === 404 ? i18n.t("error:404") : i18n.t("error:error");
		details =
			error.status === 404
				? i18n.t("error:404_description")
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
