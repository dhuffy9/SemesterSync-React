"use client";

import AppHeader from "@/components/header/app-header";
import TabList from "@/components/tab-list";

export default function Page() {
	return (
		<div className="w-full">
			<AppHeader />

			<main>
				<TabList />
			</main>
		</div>
	);
}
