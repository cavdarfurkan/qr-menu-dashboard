import RegisterForm from "~/routes/auth/register/register_form";
import type { Route } from "./+types/index";
import { z } from "zod";
import { formSchema } from "./register_form";
import api, { type ExtendedAxiosRequestConfig } from "~/lib/api";

export interface RegisterActionResult {
	success: boolean;
	message: string | null;
}

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<RegisterActionResult> {
	let formData = await request.formData();
	const data = Object.fromEntries(formData) as z.infer<
		ReturnType<typeof formSchema>
	>;

	try {
		const response = await api.post(
			"/v1/auth/register",
			{
				username: data.username,
				email: data.email,
				password: data.password,
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
			message: error.response?.data?.message || "Registration failed",
		};
	}
}

export default function Register() {
	return <RegisterForm />;
}
