import LoginForm from "~/routes/auth/login/login_form";
import type { Route } from "./+types/index";
import { formSchema } from "./login_form";
import { z } from "zod";
import api, { type ExtendedAxiosRequestConfig } from "~/lib/api";

export interface LoginActionResult {
	success: boolean;
	accessToken: string | null;
	message: string | null;
}

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<LoginActionResult> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as z.infer<typeof formSchema>;

	try {
		const response = await api.post(
			"/v1/auth/login",
			{
				username: data.username,
				password: data.password,
			},
			{
				withCredentials: true,
				headers: {
					"X-Request-Cookie-SameSite": "None",
					"X-Request-Cookie-Secure": "true",
				},
				skipRefreshingToken: true,
			} as ExtendedAxiosRequestConfig
		);

		return {
			success: response.data.success,
			accessToken: response.data.data.accessToken,
			message: response.data.message,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			accessToken: null,
			message: error.response?.data?.message || "Login failed",
		};
	}
}

export default function Login() {
	return <LoginForm />;
}
