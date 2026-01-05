import { useEffect, useRef, useState } from "react";
import api from "~/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useRevalidator } from "react-router";

export type BuildStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export type BuildState = {
	jobId: string;
	status: BuildStatus;
	startedAt: number;
	menuId: number;
};

const BUILD_STORAGE_PREFIX = "menu_build_";
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_ATTEMPTS = 60; // 2 minutes max
const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Global polling state to prevent duplicate polling
const activePollers = new Map<number, NodeJS.Timeout>();

function getBuildStateKey(menuId: number): string {
	return `${BUILD_STORAGE_PREFIX}${menuId}`;
}

function getBuildState(menuId: number): BuildState | null {
	const key = getBuildStateKey(menuId);
	const stored = localStorage.getItem(key);
	if (!stored) return null;

	try {
		const state: BuildState = JSON.parse(stored);
		// Check if state is stale
		if (Date.now() - state.startedAt > STALE_THRESHOLD) {
			localStorage.removeItem(key);
			return null;
		}
		return state;
	} catch (e) {
		localStorage.removeItem(key);
		return null;
	}
}

function saveBuildState(menuId: number, state: BuildState): void {
	const key = getBuildStateKey(menuId);
	localStorage.setItem(key, JSON.stringify(state));
	// Trigger custom event for other components to react
	window.dispatchEvent(
		new CustomEvent("buildStateChanged", { detail: { menuId, state } }),
	);
}

function clearBuildState(menuId: number): void {
	const key = getBuildStateKey(menuId);
	localStorage.removeItem(key);
	window.dispatchEvent(
		new CustomEvent("buildStateChanged", { detail: { menuId, state: null } }),
	);
}

function stopPolling(menuId: number): void {
	const timeout = activePollers.get(menuId);
	if (timeout) {
		clearTimeout(timeout);
		activePollers.delete(menuId);
	}
}

export function useBuildPolling(menuId: number) {
	const { t } = useTranslation(["menu"]);
	const revalidator = useRevalidator();
	const [buildState, setBuildState] = useState<BuildState | null>(() =>
		getBuildState(menuId),
	);
	const pollingRef = useRef<boolean>(false);
	const attemptsRef = useRef<number>(0);

	// Listen for build state changes from other components
	useEffect(() => {
		const handleStateChange = (event: CustomEvent) => {
			if (event.detail.menuId === menuId) {
				setBuildState(event.detail.state);
			}
		};

		window.addEventListener(
			"buildStateChanged",
			handleStateChange as EventListener,
		);
		return () => {
			window.removeEventListener(
				"buildStateChanged",
				handleStateChange as EventListener,
			);
		};
	}, [menuId]);

	function startPolling(menuId: number, jobId: string): void {
		// Prevent duplicate polling
		if (activePollers.has(menuId) || pollingRef.current) {
			return;
		}

		pollingRef.current = true;
		attemptsRef.current = 0;

		const poll = async (): Promise<void> => {
			// Check if we should continue polling
			const currentState = getBuildState(menuId);
			if (!currentState || currentState.jobId !== jobId) {
				// Build state changed or removed, stop polling
				stopPolling(menuId);
				pollingRef.current = false;
				return;
			}

			if (attemptsRef.current >= MAX_ATTEMPTS) {
				const failedState: BuildState = {
					jobId,
					status: "FAILED",
					startedAt: Date.now(),
					menuId,
				};
				saveBuildState(menuId, failedState);
				stopPolling(menuId);
				pollingRef.current = false;
				toast.error(t("menu:build_error"));
				return;
			}

			try {
				const statusResponse = await api.get(`/v1/menu/job/${jobId}`);
				if (statusResponse.data.success) {
					const status = statusResponse.data.data
						.menu_job_status as BuildStatus;

					const newState: BuildState = {
						jobId,
						status,
						startedAt: Date.now(),
						menuId,
					};
					saveBuildState(menuId, newState);

					if (status === "DONE") {
						stopPolling(menuId);
						pollingRef.current = false;
						toast.success(t("menu:build_success"));
						// Revalidate to get updated menu data
						revalidator.revalidate();
						// Keep state visible for dialog to show completion status
						// State will be cleared after delay, but keep it in hook's local state
						setBuildState(newState);
						// Delay clearing state from localStorage to allow dialog to show completion status
						setTimeout(() => {
							clearBuildState(menuId);
							setBuildState(null);
						}, 3000); // Keep state for 3 seconds to show in dialog
						return;
					} else if (status === "FAILED") {
						stopPolling(menuId);
						pollingRef.current = false;
						toast.error(t("menu:build_error"));
						// Keep state visible for dialog to show failure status
						setBuildState(newState);
						// Delay clearing state from localStorage to allow dialog to show failure status
						setTimeout(() => {
							clearBuildState(menuId);
							setBuildState(null);
						}, 3000); // Keep state for 3 seconds to show in dialog
						return;
					} else {
						// PENDING or PROCESSING - continue polling
						attemptsRef.current++;
						const timeoutId = setTimeout(() => {
							poll();
						}, POLL_INTERVAL);
						activePollers.set(menuId, timeoutId);
					}
				} else {
					const failedState: BuildState = {
						jobId,
						status: "FAILED",
						startedAt: Date.now(),
						menuId,
					};
					saveBuildState(menuId, failedState);
					stopPolling(menuId);
					pollingRef.current = false;
					toast.error(t("menu:build_error"));
				}
			} catch (error) {
				const failedState: BuildState = {
					jobId,
					status: "FAILED",
					startedAt: Date.now(),
					menuId,
				};
				saveBuildState(menuId, failedState);
				stopPolling(menuId);
				pollingRef.current = false;
				toast.error(t("menu:build_error"));
			}
		};

		// Start polling immediately
		poll();
	}

	function initiateBuild(menuId: number, jobId: string): void {
		const pendingState: BuildState = {
			jobId,
			status: "PENDING",
			startedAt: Date.now(),
			menuId,
		};
		saveBuildState(menuId, pendingState);
		startPolling(menuId, jobId);
	}

	// Start polling if build is active
	useEffect(() => {
		const state = getBuildState(menuId);
		setBuildState(state);

		if (
			state &&
			(state.status === "PENDING" || state.status === "PROCESSING") &&
			!activePollers.has(menuId)
		) {
			startPolling(menuId, state.jobId);
		}

		return () => {
			stopPolling(menuId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [menuId]);

	return {
		buildState,
		isPolling: activePollers.has(menuId) || pollingRef.current,
		initiateBuild,
	};
}
