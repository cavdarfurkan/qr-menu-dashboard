import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		environmentOptions: {
			jsdom: {
				resources: "usable",
			},
		},
		setupFiles: ["./app/test/setup.ts"],
		include: ["**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"app/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/mockData",
				"app/components/ui/**",
			],
		},
	},
});
