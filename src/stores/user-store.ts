import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, Tab, UserState, UserStore } from "@/types/user-store";

const defaultTab: Tab = {
	id: uuid(),
	name: `Schedule 1`,
	courses: [],
	totalCredits: 0,
	selectedDate: new Date(),
};

const initialState: UserState = {
	activeTab: defaultTab.id,
	activeTerm: "",
	tabs: [defaultTab],
};

const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			...initialState,

			addTab: () =>
				set({
					tabs: [
						...get().tabs,
						{
							id: uuid(),
							name: `Schedule ${get().tabs.length + 1}`,
							courses: [],
							totalCredits: 0,
							selectedDate: new Date(),
						},
					],
				}),
			setActiveTab: (id: string) => set({ activeTab: id }),
			getActiveTab: () =>
				get().tabs.filter((tab) => tab.id === get().activeTab)[0],
			updateTabName: (id: string, name: string) =>
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === id ? { ...tab, name } : tab,
					),
				}),
			updateTabDate: (id: string, date: Date) =>
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === id ? { ...tab, selectedDate: date } : tab,
					),
				}),
			recalculateTabCredits: (id: string) =>
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === id
							? {
									...tab,
									totalCredits: tab.courses.reduce(
										(acc, course) => acc + course.credits,
										0,
									),
								}
							: tab,
					),
				}),
			removeTab: (id: string) =>
				set({ tabs: get().tabs.filter((tab) => tab.id !== id) }),

			setActiveTerm: (term: string) => set({ activeTerm: term }),

			addCourse: (tabId: string, course: Course) => {
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab,
									courses: [...tab.courses, course],
								}
							: tab,
					),
				});

				get().recalculateTabCredits(tabId);
			},
			updateCourse: (tabId: string, course: Course) => {
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab,
									courses: tab.courses.map((c) =>
										c.id === course.id ? course : c,
									),
								}
							: tab,
					),
				});

				get().recalculateTabCredits(tabId);
			},
			removeCourse: (tabId: string, courseId: string) => {
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab,
									courses: tab.courses.filter((c) => c.id !== courseId),
								}
							: tab,
					),
				});

				get().recalculateTabCredits(tabId);
			},
		}),
		{
			name: "user-store",
			version: 1,
		},
	),
);

export default useUserStore;
