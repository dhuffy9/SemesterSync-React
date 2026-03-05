"use client"

import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import useUserStore from "@/stores/user-store";

export default function Page() {
	const tabs = useUserStore((state) => state.tabs);
	const addTab = useUserStore((state) => state.addTab);
	
	return (
		<div className="w-full">
			<AppHeader />

			<main>
				{/* Temp to make sure state is working */}
				{tabs.map((tab) => (
					<div key={tab.id}>
						<h1>{tab.name}</h1>
						<Button onClick={addTab}>Add</Button>
					</div>
				))}
			</main>
		</div>
	);
}
