import ForgotPasswordForm from "~/routes/auth/forgot-password/forgot_password_form";
import type { Route } from "./+types/index";
import { z } from "zod";
import { formSchema } from "./forgot_password_form";
import api, { type ExtendedAxiosRequestConfig } from "~/lib/api";

export interface ForgotPasswordActionResult {
	success: boolean;
	message: string | null;
}

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<ForgotPasswordActionResult> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as z.infer<
		ReturnType<typeof formSchema>
	>;

	try {
		const response = await api.post(
			"/v1/auth/forgot-password",
			{
				email: data.email,
			},
			{ skipRefreshingToken: true } as ExtendedAxiosRequestConfig,
		);

		return {
			success: response.data.success,
			message: response.data.message,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || "Failed to send reset email",
		};
	}
}

export default function ForgotPassword() {
	return <ForgotPasswordForm />;
}
