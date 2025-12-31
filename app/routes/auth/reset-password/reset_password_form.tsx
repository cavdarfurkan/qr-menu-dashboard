import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
	Link,
	useFetcher,
	useSearchParams,
	Form as RouterForm,
} from "react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ResetPasswordActionResult } from "./index";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { useTranslation } from "react-i18next";

export const formSchema = (t: (key: string) => string) =>
	z
		.object({
			token: z
				.string()
				.min(1, { message: t("auth:reset_password.token_required") }),
			newPassword: z.string().min(8, { message: t("validation:password_min") }),
			confirmPassword: z
				.string()
				.min(8, { message: t("validation:confirm_password_min") }),
		})
		.refine((data) => data.newPassword === data.confirmPassword, {
			error: t("validation:passwords_dont_match"),
			path: ["confirmPassword"],
		});

export default function ResetPasswordForm() {
	const { t } = useTranslation(["auth", "validation", "common"]);
	const [error, setError] = useState<string | null>(null);
	const [searchParams] = useSearchParams();
	const fetcher = useFetcher();
	const isLoading = fetcher.state !== "idle";

	const tokenFromUrl = searchParams.get("token") || "";

	const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
		resolver: zodResolver(formSchema(t as (key: string) => string)),
		defaultValues: {
			token: tokenFromUrl,
			newPassword: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		if (tokenFromUrl) {
			form.setValue("token", tokenFromUrl);
		}
	}, [tokenFromUrl, form]);

	useEffect(() => {
		const data = fetcher.data as ResetPasswordActionResult;

		if (!data) return;

		// If data is a Response, it means we got a redirect from clientAction
		// React Router will handle it automatically
		if (data instanceof Response) {
			return;
		}

		if (!data.success) {
			setError(data.message);
		} else {
			setError(null);
			// Success message will be shown, redirect is handled by clientAction
		}
	}, [fetcher.data]);

	const onSubmit = (data: z.infer<ReturnType<typeof formSchema>>) => {
		setError(null);
		fetcher.submit(data, { method: "post" });
	};

	if (!tokenFromUrl) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">
						{t("auth:reset_password.title")}
					</h1>
					<p className="text-muted-foreground text-sm text-balance">
						{t("auth:reset_password.invalid_token")}
					</p>
				</div>
				<Link to="/forgot-password" className="w-full">
					<Button type="button" className="w-full">
						{t("auth:reset_password.request_new_link")}
					</Button>
				</Link>
			</div>
		);
	}

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
					<h1 className="text-2xl font-bold">
						{t("auth:reset_password.title")}
					</h1>
					<p className="text-muted-foreground text-sm text-balance">
						{t("auth:reset_password.description")}
					</p>
				</div>
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
						{error}
					</div>
				)}
				{fetcher.data?.success && (
					<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm">
						{t("auth:reset_password.success_message")}
					</div>
				)}
				<div className="grid gap-6">
					<FormField
						control={form.control}
						name="token"
						render={({ field }) => <input type="hidden" {...field} />}
					/>

					<FormField
						control={form.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem>
								<div className="grid gap-3">
									<FormLabel htmlFor="newPassword">
										{t("auth:reset_password.new_password")}
									</FormLabel>
									<FormControl>
										<Input
											id="newPassword"
											type="password"
											placeholder={t(
												"auth:reset_password.new_password_placeholder",
											)}
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
									<FormLabel htmlFor="confirmPassword">
										{t("auth:reset_password.confirm_password")}
									</FormLabel>
									<FormControl>
										<Input
											id="confirmPassword"
											type="password"
											placeholder={t(
												"auth:reset_password.confirm_password_placeholder",
											)}
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
						{isLoading
							? t("common:buttons.loading")
							: t("auth:reset_password.submit")}
					</Button>
				</div>
				<div className="text-center text-sm">
					<Link
						to="/login"
						className="underline underline-offset-4"
						viewTransition
					>
						{t("auth:reset_password.back_to_login")}
					</Link>
				</div>
			</RouterForm>
		</Form>
	);
}
