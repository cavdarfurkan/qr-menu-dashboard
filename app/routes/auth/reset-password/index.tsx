import ResetPasswordForm from "~/routes/auth/reset-password/reset_password_form";
import type { Route } from "./+types/index";
import { z } from "zod";
import { formSchema } from "./reset_password_form";
import api, { type ExtendedAxiosRequestConfig } from "~/lib/api";
import { redirect } from "react-router";

export interface ResetPasswordActionResult {
	success: boolean;
	message: string | null;
}

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<ResetPasswordActionResult | Response> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as z.infer<
		ReturnType<typeof formSchema>
	>;

	try {
		const response = await api.post(
			"/v1/auth/reset-password",
			{
				token: data.token,
				new_password: data.newPassword,
			},
			{ skipRefreshingToken: true } as ExtendedAxiosRequestConfig,
		);

		// If successful, redirect to login
		if (response.data?.success) {
			return redirect("/login");
		}

		return {
			success: response.data.success,
			message: response.data.message,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || "Failed to reset password",
		};
	}
}

export default function ResetPassword() {
	return <ResetPasswordForm />;
}
