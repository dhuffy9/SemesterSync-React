import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, Tab, UserState, UserStore } from "@/types/user-store";

// This will be the default state that the user will see when they first load
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
		// stores to localstorage whenever a state change is made
		(set, get) => ({
			// spreads the default data & keys into the store
			...initialState,

			// tab management funcs
			addTab: () =>
				set({
					// set merges data into the store
					tabs: [
						...get().tabs, // get gets the latest state from the store
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
				// filter tabs by id and return the found tab
				get().tabs.filter((tab) => tab.id === get().activeTab)[0],
			updateTabName: (id: string, name: string) =>
				set({
					// Map through all tabs and update tab with matching id, otherwise keep tab as is
					tabs: get().tabs.map((tab) =>
						tab.id === id ? { ...tab, name } : tab,
					),
				}),
			updateTabDate: (id: string, date: Date) =>
				set({
					// Map through all tabs and update tab with matching id, otherwise keep tab as is
					tabs: get().tabs.map((tab) =>
						tab.id === id ? { ...tab, selectedDate: date } : tab,
					),
				}),
			recalculateTabCredits: (id: string) =>
				set({
					// Map through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === id
							? {
									...tab, // update credits by looping through all courses and adding up credits
									totalCredits: tab.courses.reduce(
										(acc, course) => acc + course.credits,
										0, // start accumulator at 0
									),
								}
							: tab,
					),
				}),
			removeTab: (
				id: string, // set tabs arr to the old arr - the tab w/ matching id
			) => set({ tabs: get().tabs.filter((tab) => tab.id !== id) }),

			setActiveTerm: (term: string) => set({ activeTerm: term }),

			addCourse: (tabId: string, course: Course) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // spread existing courses & add new course passed to func
									courses: [...tab.courses, course],
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},
			updateCourse: (tabId: string, course: Course) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // loop through all course & replace the one with matching id
									courses: tab.courses.map((c) =>
										c.id === course.id ? course : c,
									),
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},
			removeCourse: (tabId: string, courseId: string) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // loop through all courses & remove the one with matching id
									courses: tab.courses.filter((c) => c.id !== courseId),
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},
		}),
		{
			name: "user-store",
			version: 1, // if we make breaking changes to store we bump version & define a migration
		},
	),
);

export default useUserStore;
