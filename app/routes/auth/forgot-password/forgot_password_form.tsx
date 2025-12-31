import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Link, useFetcher, Form as RouterForm } from "react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ForgotPasswordActionResult } from "./index";
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
	z.object({
		email: z.email({ message: t("validation:invalid_email") }),
	});

export default function ForgotPasswordForm() {
	const { t } = useTranslation(["auth", "validation", "common"]);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const fetcher = useFetcher();
	const isLoading = fetcher.state !== "idle";

	const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
		resolver: zodResolver(formSchema(t as (key: string) => string)),
		defaultValues: {
			email: "",
		},
	});

	useEffect(() => {
		const data = fetcher.data as ForgotPasswordActionResult;

		if (!data) return;

		if (!data.success) {
			setError(data.message);
			setSuccess(false);
		} else {
			setError(null);
			setSuccess(true);
			form.reset();
		}
	}, [fetcher.data, form]);

	const onSubmit = (data: z.infer<ReturnType<typeof formSchema>>) => {
		setError(null);
		setSuccess(false);
		fetcher.submit(data, { method: "post" });
	};

	if (success) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">
						{t("auth:forgot_password.title")}
					</h1>
					<p className="text-muted-foreground text-sm text-balance">
						{t("auth:forgot_password.success_message")}
					</p>
				</div>
				<Link to="/login" className="w-full">
					<Button type="button" className="w-full">
						{t("auth:forgot_password.back_to_login")}
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
						{t("auth:forgot_password.title")}
					</h1>
					<p className="text-muted-foreground text-sm text-balance">
						{t("auth:forgot_password.description")}
					</p>
				</div>
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
						{error}
					</div>
				)}
				<div className="grid gap-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<div className="grid gap-3">
									<FormLabel htmlFor="email">
										{t("auth:forgot_password.email")}
									</FormLabel>
									<FormControl>
										<Input
											id="email"
											type="email"
											placeholder={t("auth:forgot_password.email_placeholder")}
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
							: t("auth:forgot_password.submit")}
					</Button>
				</div>
				<div className="text-center text-sm">
					<Link
						to="/login"
						className="underline underline-offset-4"
						viewTransition
					>
						{t("auth:forgot_password.back_to_login")}
					</Link>
				</div>
			</RouterForm>
		</Form>
	);
}
