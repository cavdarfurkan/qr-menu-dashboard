export interface UserDto {
	id: number;
	username: string;
	email: string;
	roles: string[];
}

export function hasDeveloperRole(user: UserDto | null | undefined): boolean {
	return user?.roles?.includes("DEVELOPER") ?? false;
}

export function hasAdminRole(user: UserDto | null | undefined): boolean {
	return user?.roles?.includes("ADMIN") ?? false;
}

export function canRegisterThemes(user: UserDto | null | undefined): boolean {
	return hasDeveloperRole(user) || hasAdminRole(user);
}

export function canUnregisterThemes(
	user: UserDto | null | undefined,
	themeOwnerUsername?: string,
): boolean {
	if (!user) return false;

	return (
		hasDeveloperRole(user) ||
		hasAdminRole(user) ||
		(!!themeOwnerUsername && user.username === themeOwnerUsername)
	);
}
