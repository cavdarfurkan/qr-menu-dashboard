import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
	Link,
	useFetcher,
	useNavigate,
	Form as RouterForm,
} from "react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RegisterActionResult } from "./index";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { useTranslation } from "react-i18next";

export const formSchema = (t: (key: string) => string) => z
	.object({
		username: z
			.string()
			.min(3, { message: t("validation:username_min") }),
		email: z.email({ message: t("validation:invalid_email") }),
		password: z
			.string()
			.min(8, { message: t("validation:password_min") }),
		confirmPassword: z
			.string()
			.min(8, { message: t("validation:confirm_password_min") }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		error: t("validation:passwords_dont_match"),
		path: ["confirmPassword"],
	});

export default function RegisterForm() {
	const { t } = useTranslation(["auth", "validation", "common"]);
	const [error, setError] = useState<string | null>(null);
	const fetcher = useFetcher();
	const isLoading = fetcher.state !== "idle";
	const navigate = useNavigate();

	const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
		resolver: zodResolver(formSchema(t)),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		const data = fetcher.data as RegisterActionResult;

		if (!data) return;

		if (!data.success) {
			setError(data.message);
		} else {
			navigate("/login");
		}
	}, [fetcher.data]);

	const onSubmit = (data: z.infer<ReturnType<typeof formSchema>>) => {
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
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">{t("auth:register.title")}</h1>
					<FormDescription className="text-muted-foreground text-sm text-balance">
						{t("auth:register.description")}
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
										<FormLabel htmlFor="username">{t("auth:register.username")}</FormLabel>
										<FormControl>
											<Input
												id="username"
												type="text"
												placeholder={t("auth:register.username_placeholder")}
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
						name="email"
							render={({ field }) => (
								<FormItem>
									<div className="grid gap-3">
										<FormLabel htmlFor="email">{t("auth:register.email")}</FormLabel>
										<FormControl>
											<Input
												id="email"
												type="email"
												placeholder={t("auth:register.email_placeholder")}
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
										<FormLabel htmlFor="password">{t("auth:register.password")}</FormLabel>
									</div>
									<FormControl>
										<Input
											id="password"
											type="password"
											placeholder={t("auth:register.password_placeholder")}
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
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<div className="grid gap-3">
									<div className="flex items-center">
										<FormLabel htmlFor="confirmPassword">
											{t("auth:register.confirm_password")}
										</FormLabel>
									</div>
									<FormControl>
										<Input
											id="confirmPassword"
											type="password"
											placeholder={t("auth:register.confirm_password_placeholder")}
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

					<Button type="submit" className="w-full" disabled={isLoading}>
						{t("common:buttons.register")}
					</Button>

					<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
						<span className="bg-background text-muted-foreground relative z-10 px-2">
							{t("common:messages.or_continue_with")}
						</span>
					</div>

					<Button variant="outline" className="w-full">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path
								d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
								fill="currentColor"
							/>
						</svg>
						{t("auth:register.register_with_github")}
					</Button>
				</div>

				<div className="text-center text-sm">
					{t("auth:register.has_account")}{" "}
					<Link
						to="/login"
						className="underline underline-offset-4"
						viewTransition
					>
						{t("auth:register.log_in")}
					</Link>
				</div>
			</RouterForm>
		</Form>
	);
}
