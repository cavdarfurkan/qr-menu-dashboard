import { useParams } from "react-router";

export function useMenuId() {
	const params = useParams();
	return params.id;
}

export default function MenuDetail() {
	const menuId = useMenuId();

	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-xl font-semibold">Menu Detail</h2>
			<p>Menu ID: {menuId}</p>
		</div>
	);
}
