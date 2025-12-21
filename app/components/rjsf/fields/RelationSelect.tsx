import type { FieldProps } from "@rjsf/utils";
import { useState } from "react";
import AsyncSelect from "react-select/async";
import type { StylesConfig } from "react-select";
import { useTheme } from "next-themes";
import api, { type ApiResponse } from "~/lib/api";
import { useMenuStore, useUiStore } from "~/stores";

export default function RelationSelect(props: FieldProps) {
	const {
		id,
		required,
		readonly,
		disabled,
		idSchema,
		formData,
		onChange,
		schema,
		uiSchema,
		registry,
		name,
		formContext,
	} = props;

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	const menuId = useMenuStore((state) => state.menuId);
	const contentName = name;

	const isLoading = useUiStore((state) => state.isLoading);
	const setLoading = useUiStore((state) => state.setLoading);

	// Check if content list was pre-fetched (from edit page)
	const prefetchedContentList =
		formContext?.relationContentLists?.[contentName];
	const [relationOptions, setRelationOptions] = useState<Array<any>>(
		prefetchedContentList || [],
	);

	const {
		relationValue = "id",
		relationLabel = "name",
		isMultiple = false,
	} = uiSchema?.["ui:options"] as {
		relationValue?: string;
		relationLabel?: string;
		isMultiple?: boolean;
	};

	// console.log("RelationSelect formData for", contentName, ":", formData);

	const promiseOptions = (
		inputValue: string,
		callback: (options: any) => void,
	) => {
		// If we have pre-fetched data, use it without making a request
		if (prefetchedContentList && prefetchedContentList.length > 0) {
			const options = prefetchedContentList.map((item: any) => ({
				label: item.data[relationLabel],
				value: item.data[relationValue],
			}));

			if (inputValue) {
				const filteredOptions = options.filter((option: any) =>
					option.label.toLowerCase().includes(inputValue.toLowerCase()),
				);
				callback(filteredOptions);
			} else {
				callback(options);
			}
			return;
		}

		// No pre-fetched data, fetch from API
		setLoading(true);

		api
			.get<ApiResponse>(`/v1/menu/${menuId}/content/${contentName}`)
			.then((contentResponse) => {
				const data = contentResponse.data.data;
				setRelationOptions(data);
				const options = Array.isArray(data)
					? data.map((item) => ({
							label: item.data[relationLabel],
							// Use data.id for matching (content ID), not the wrapper UUID
							value: item.data[relationValue],
						}))
					: [];

				if (inputValue) {
					const filteredOptions = options.filter((option) =>
						option.label.toLowerCase().includes(inputValue.toLowerCase()),
					);
					callback(filteredOptions);
				} else {
					callback(options);
				}
			})
			.catch((error) => {
				console.error("Error fetching options", error);
				callback([]);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const handleChange = (selectedOption: any) => {
		if (!selectedOption) {
			onChange(isMultiple ? [] : null);
			return;
		}

		if (isMultiple) {
			// Handle multiple selections
			const selectedRelations = selectedOption
				.map((option: any) => {
					// Match by data.id (content ID) since that's what options use
					return relationOptions.find(
						(relOption) => relOption.data[relationValue] === option.value,
					);
				})
				.filter(Boolean); // Remove any undefined values

			onChange(selectedRelations);
		} else {
			// Handle single selection - match by data.id
			const selectedRelation = relationOptions.find(
				(option) => option.data[relationValue] === selectedOption.value,
			);

			onChange(selectedRelation || null);
		}
	};

	// const { textSize = "sm" } = (options ?? {}) as { textSize?: "sm" | "lg"; };
	// const enumOptions = (options as any)?.enumOptions as | Array<{ value: any; label: string }> | undefined;
	const isDisabled = disabled || readonly;

	// Styles matching the Input component design
	const customStyles: StylesConfig = {
		control: (provided, state) => ({
			...provided,
			minHeight: "2.25rem", // h-9
			backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "transparent",
			borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
			borderWidth: "1px",
			borderRadius: "0.375rem", // rounded-md
			boxShadow: state.isFocused
				? "0 0 0 3px var(--ring) / 0.5"
				: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-xs
			outline: "none",
			transition: "color 150ms, box-shadow 150ms",
			"&:hover": {
				borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
			},
		}),
		valueContainer: (provided) => ({
			...provided,
			padding: "0.25rem 0.5rem",
		}),
		input: (provided) => ({
			...provided,
			margin: 0,
			padding: 0,
			color: "var(--foreground)",
			fontSize: "0.875rem", // text-sm
		}),
		placeholder: (provided) => ({
			...provided,
			color: "var(--muted-foreground)",
			fontSize: "0.875rem",
		}),
		singleValue: (provided) => ({
			...provided,
			color: "var(--foreground)",
			fontSize: "0.875rem",
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor: "var(--popover)",
			border: "1px solid var(--border)",
			borderRadius: "0.375rem",
			boxShadow:
				"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
			marginTop: "0.25rem",
			overflow: "hidden",
		}),
		menuList: (provided) => ({
			...provided,
			padding: "0.25rem",
			maxHeight: "15rem",
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected
				? "var(--accent)"
				: state.isFocused
					? isDark
						? "rgba(255, 255, 255, 0.1)"
						: "rgba(0, 0, 0, 0.05)"
					: "transparent",
			color: state.isSelected
				? "var(--accent-foreground)"
				: "var(--foreground)",
			cursor: state.isDisabled ? "not-allowed" : "pointer",
			borderRadius: "0.25rem",
			padding: "0.5rem 0.75rem",
			fontSize: "0.875rem",
			"&:active": {
				backgroundColor: "var(--accent)",
			},
		}),
		multiValue: (provided) => ({
			...provided,
			backgroundColor: "var(--accent)",
			borderRadius: "0.25rem",
		}),
		multiValueLabel: (provided) => ({
			...provided,
			color: "var(--accent-foreground)",
			fontSize: "0.875rem",
			padding: "0.125rem 0.25rem",
		}),
		multiValueRemove: (provided) => ({
			...provided,
			color: "var(--accent-foreground)",
			borderRadius: "0 0.25rem 0.25rem 0",
			"&:hover": {
				backgroundColor: "var(--destructive)",
				color: "var(--destructive-foreground)",
			},
		}),
		indicatorSeparator: () => ({
			display: "none", // Remove separator like in Input
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			color: "var(--muted-foreground)",
			padding: "0.5rem",
			transition: "color 150ms",
			"&:hover": {
				color: "var(--foreground)",
			},
		}),
		clearIndicator: (provided) => ({
			...provided,
			color: "var(--muted-foreground)",
			padding: "0.5rem",
			transition: "color 150ms",
			"&:hover": {
				color: "var(--foreground)",
			},
		}),
		loadingIndicator: (provided) => ({
			...provided,
			color: "var(--muted-foreground)",
		}),
	};

	return (
		<AsyncSelect
			cacheOptions
			loadOptions={promiseOptions}
			isMulti={isMultiple}
			defaultOptions
			placeholder={`Select ${contentName}`}
			isClearable
			isSearchable
			isLoading={isLoading}
			isDisabled={isDisabled}
			onChange={handleChange}
			value={
				isMultiple
					? Array.isArray(formData)
						? formData.map((item) => ({
								// Use data.id if available (after selection), otherwise use id (initial load)
								value: item.data?.[relationValue] || item[relationValue],
								label: item.data?.[relationLabel] || item[relationLabel],
							}))
						: []
					: formData && typeof formData === "object"
						? {
								// Use data.id if available (after selection), otherwise use id (initial load)
								value:
									formData.data?.[relationValue] || formData[relationValue],
								label:
									formData.data?.[relationLabel] || formData[relationLabel],
							}
						: null
			}
			styles={customStyles}
		/>
	);
}
