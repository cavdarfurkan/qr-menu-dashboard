import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "react-router";

export default function Menu() {
	// Dummy data for existing menus
	const menus = [
		{
			id: 1,
			name: "Breakfast Menu",
			description: "Morning specials and beverages",
		},
		{
			id: 2,
			name: "Lunch Menu",
			description: "Afternoon meals and combos",
		},
		{
			id: 3,
			name: "Dinner Menu",
			description: "Evening delights and desserts",
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Your Menus</h2>
				<Link
					to="/menu/create"
					className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
					viewTransition
				>
					+ New Menu
				</Link>
			</div>
			{menus.length === 0 ? (
				<div className="text-gray-500 text-center py-8">
					No menus found. <br />
					<Link
						to="/menu/create"
						className="text-primary underline"
						viewTransition
					>
						Create your first menu
					</Link>
				</div>
			) : (
				<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mxauto">
					{menus.map((menu) => (
						<Card
							key={menu.id}
							className="hover:shadow-lg transition-all duration-200 cursor-pointer"
						>
							<Link
								to={`/menu/${menu.id}`}
								viewTransition
								className="w-full h-full"
							>
								<CardHeader>
									<CardTitle>{menu.name}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-600">
										{menu.description}
									</p>
								</CardContent>
							</Link>
						</Card>
					))}
				</ul>
			)}
		</div>
	);
}
