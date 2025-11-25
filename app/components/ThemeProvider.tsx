import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_VALUES, THEME_CONFIG } from "~/constants/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute={THEME_CONFIG.ATTRIBUTE}
			defaultTheme={THEME_VALUES.SYSTEM}
			enableSystem
			disableTransitionOnChange={false}
			storageKey={THEME_CONFIG.STORAGE_KEY}
		>
			{children}
		</NextThemesProvider>
	);
}
