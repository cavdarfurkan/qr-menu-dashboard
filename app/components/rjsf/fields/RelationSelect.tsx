import type { FieldProps } from "@rjsf/utils";
import { useState } from "react";
import AsyncSelect from "react-select/async";
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
	} = props;

	const menuId = useMenuStore((state) => state.menuId);
	const contentName = name;

	const isLoading = useUiStore((state) => state.isLoading);
	const setLoading = useUiStore((state) => state.setLoading);

	const [relationOptions, setRelationOptions] = useState<Array<any>>([]);

	const { relationValue, relationLabel } = uiSchema?.["ui:options"] || {
		relationLabel: "name",
		relationValue: "id",
	};

	const promiseOptions = (
		inputValue: string,
		callback: (options: any) => void,
	) => {
		setLoading(true);

		api
			.get<ApiResponse>(`/v1/menu/${menuId}/content/${contentName}`)
			.then((contentResponse) => {
				const data = contentResponse.data.data;
				setRelationOptions(data);
				const options = Array.isArray(data)
					? data.map((item) => ({
							label: item.data[relationLabel],
							value: item[relationValue],
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
			onChange(null);
			return;
		}

		const selectedRelation = relationOptions.find(
			(option) => option[relationValue] === selectedOption.value,
		);

		console.log("onChange", selectedRelation);
		// console.log("formData", formData);

		onChange(selectedRelation || null);
	};

	// const { textSize = "sm" } = (options ?? {}) as { textSize?: "sm" | "lg"; };
	// const enumOptions = (options as any)?.enumOptions as | Array<{ value: any; label: string }> | undefined;
	const isDisabled = disabled || readonly;

	return (
		<AsyncSelect
			cacheOptions
			loadOptions={promiseOptions}
			defaultOptions
			placeholder={`Select ${contentName}`}
			isClearable
			isSearchable
			isLoading={isLoading}
			isDisabled={isDisabled}
			onChange={handleChange}
			value={
				formData && typeof formData === "object" && formData[relationValue]
					? {
							value: formData.data[relationValue],
							label: formData.data[relationLabel],
					  }
					: null
			}
		/>
	);
}
