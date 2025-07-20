import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
	Form as RouterForm,
	Link,
	redirect,
	useFetcher,
	useNavigate,
} from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "~/auth_context";
import api from "~/lib/api";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginActionResult } from "./index";
import { fetchCsrfToken } from "~/lib/csrf";

export const formSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Username or email must be at least 3 characters" })
		.refine(
			(val) =>
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
				/^[a-zA-Z0-9_.-]+$/.test(val),
			{
				message: "Must be a valid username or email",
			}
		),
	password: z
		.string()
		.min(3, { message: "Password must be at least 3 characters" }),
});

export default function LoginForm() {
	const [error, setError] = useState<string | null>(null);
	const { setAccessToken } = useAuth();
	const navigate = useNavigate();
	const fetcher = useFetcher();
	const isLoading = fetcher.state !== "idle";

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	useEffect(() => {
		const data = fetcher.data as LoginActionResult;

		if (!data) return;

		if (!data.success) {
			setError(data.message);
		} else {
			handleLogin(data);
		}
	}, [fetcher.data, navigate, setAccessToken]);

	const handleLogin = async (data: LoginActionResult) => {
		setError(null);
		setAccessToken(data.accessToken || "");

		try {
			await fetchCsrfToken();
			navigate("/");
		} catch (error) {
			setError(data.message || "Login failed");
		}
	};

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		setError(null);
		fetcher.submit(data, { method: "post" });
	};

	return (
		<Form {...form}>
			<RouterForm
				className="flex flex-col gap-6"
				method="post"
				replace
				viewTransition
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">
							Login to your account
						</h1>
						{/* <p className="text-muted-foreground text-sm text-balance">
					Enter your email below to login to your account
				</p> */}
						<FormDescription className="text-muted-foreground text-sm text-balance">
							Enter your email below to login to your account
						</FormDescription>
					</div>
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
							{error}
						</div>
					)}
					{fetcher.data?.error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
							{fetcher.data.error}
						</div>
					)}
					<div className="grid gap-6">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<div className="grid gap-3">
										<FormLabel htmlFor="username">
											Username or Email
										</FormLabel>
										<FormControl>
											<Input
												id="username"
												type="text"
												placeholder="Enter your username or email"
												required
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<div className="grid gap-3">
										<div className="flex items-center">
											<FormLabel htmlFor="password">
												Password
											</FormLabel>
											<Link
												to="/forgot-password"
												className="ml-auto text-sm underline-offset-4 hover:underline"
												viewTransition
											>
												Forgot your password?
											</Link>
										</div>
										<FormControl>
											<Input
												id="password"
												type="password"
												placeholder="Enter your password"
												required
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* <div className="grid gap-3">
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						type="text"
						placeholder="username"
						name="username"
						required
						disabled={isLoading}
					/>
				</div> */}
						{/* <div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor="password">Password</Label>
						<a
							href="#"
							className="ml-auto text-sm underline-offset-4 hover:underline"
						>
							Forgot your password?
						</a>
					</div>
					<Input
						id="password"
						type="password"
						name="password"
						required
						disabled={isLoading}
					/>
				</div> */}
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
						<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
							<span className="bg-background text-muted-foreground relative z-10 px-2">
								Or continue with
							</span>
						</div>
						<Button
							variant="outline"
							className="w-full"
							disabled={isLoading}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
									fill="currentColor"
								/>
							</svg>
							Login with GitHub
						</Button>
					</div>
					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link
							to="/register"
							className="underline underline-offset-4"
							viewTransition
						>
							Sign up
						</Link>
					</div>
				</div>
			</RouterForm>
		</Form>
	);
}

// function zodResolver(
// 	formSchema: z.ZodObject<
// 		{ username: z.ZodString; password: z.ZodString },
// 		z.core.$strip
// 	>
// ):
// 	| import("react-hook-form").Resolver<
// 			{ username: string; password: string },
// 			any,
// 			{ username: string; password: string }
// 	  >
// 	| undefined {
// 	throw new Error("Function not implemented.");
// }
