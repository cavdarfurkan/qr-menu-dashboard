import Title from "~/components/Title";

export default function Settings() {
	return (
		<div className="flex flex-col gap-6">
			<Title title="Settings" />
			<div className="flex flex-col gap-2">
				<h1>Settings</h1>
				<h2>Active Sessions</h2>
			</div>
		</div>
	);
}
