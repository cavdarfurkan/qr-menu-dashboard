import api, { type ApiResponse } from "./api";
import type { UserDto } from "~/types/user";
import type { ExtendedAxiosRequestConfig } from "./api";

export type UserResponse = ApiResponse & {
	data?: UserDto;
};

export async function fetchCurrentUser(): Promise<UserResponse> {
	const response = await api.get<UserResponse>("/v1/auth/me");
	return response.data;
}

export async function switchDeveloperRole(
	activate: boolean,
): Promise<UserResponse> {
	const response = await api.post<UserResponse>(
		"/v1/auth/switch-developer-role",
		{ activate },
		{
			skipRefreshingToken: false,
		} as ExtendedAxiosRequestConfig,
	);

	return response.data;
}

export async function unregisterTheme(themeId: number): Promise<ApiResponse> {
	const response = await api.post<ApiResponse>("/v1/theme/unregister", {
		theme_id: themeId,
	});

	return response.data;
}
