import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Event } from "@/schemas/events";
import type {
	CourseEvent,
	NonCourseEvent,
	Tab,
	UserState,
	UserStore,
} from "@/types/user-store";

// This will be the default state that the user will see when they first load
const defaultTab: Tab = {
	id: uuid(),
	name: `Schedule 1`,
	events: [],
	courseEvents: [],
	nonCourseEvents: [],
	totalCredits: 0,
	selectedDate: new Date(),
};

const initialState: UserState = {
	activeTab: defaultTab.id,
	activeTerm: "",
	tabs: [defaultTab],
};

const EMPTY_EVENT_ARR: Array<Event> = [];

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
							events: [],
							courseEvents: [],
							nonCourseEvents: [],
							totalCredits: 0,
							selectedDate: new Date(),
						},
					],
				}),
			setActiveTab: (id: string) => set({ activeTab: id }),
			getActiveTab: () =>
				// filter tabs by id and return the found tab
				get().tabs.filter((tab) => tab.id === get().activeTab)[0],
			getActiveTabCredits: () =>
				get().tabs.find((tab) => tab.id === get().activeTab)?.totalCredits || 0,
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
									totalCredits: tab.events.reduce(
										(acc, course) => {
											switch (course.kind) {
												case "linked-course":
													return acc + 3; //FIXME - Need to replace this after updating how course data is distributed through app
												case "unlinked-course":
													return acc + course.credits;
												default:
													return acc;
											}
										},
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

			addCourseEvent: (tabId: string, course: CourseEvent) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // spread existing courses & add new course passed to func
									courseEvents: [...tab.courseEvents, course],
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},
			updateCourseEvent: (tabId: string, course: CourseEvent) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // loop through all course & replace the one with matching id
									courseEvents: tab.courseEvents.map((c) =>
										c.eventId === course.eventId ? course : c,
									),
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},

			addNonCourseEvent: (tabId: string, event: NonCourseEvent) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // spread existing courses & add new course passed to func
									nonCourseEvents: [...tab.nonCourseEvents, event],
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},
			updateNonCourseEvent: (tabId: string, event: NonCourseEvent) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // loop through all course & replace the one with matching id
									nonCourseEvents: tab.nonCourseEvents.map((c) =>
										c.eventId === event.eventId ? event : c,
									),
								}
							: tab,
					),
				});

				// re-calc the total credits
				get().recalculateTabCredits(tabId);
			},

			getEvent: (tabId, eventId) =>
				get()
					.tabs.find((tab) => tab.id === tabId)
					?.events.find((event) => event.eventId === eventId),
			getEvents: (tabId: string) =>
				get().tabs.find((tab) => tab.id === tabId)?.events || EMPTY_EVENT_ARR,
			addEvent: (tabId: string, event: Event) => {
				set({
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab,
									events: [...tab.events, event],
								}
							: tab,
					),
				});

				get().recalculateTabCredits(tabId);
			},
			updateEvent: (tabId: string, event: Event) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab,
									events: tab.events.map((e) =>
										e.eventId === event.eventId ? event : e,
									),
								}
							: tab,
					),
				});

				get().recalculateTabCredits(tabId);
			},
			removeEvent: (tabId: string, eventId: string) => {
				set({
					// loop through all tabs, find with matching id
					tabs: get().tabs.map((tab) =>
						tab.id === tabId
							? {
									...tab, // loop through all courses & remove the one with matching id
									events: tab.events.filter((c) => c.eventId !== eventId),
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
			storage: createJSONStorage(() => localStorage),
			version: 2, // if we make breaking changes to store we bump version & define a migration
			migrate: (persistedState, version) => {
				if (version === 1) {
					// @ts-expect-error
					for (let i = 0; i < persistedState.tabs.length; i++) {
						// @ts-expect-error
						delete persistedState.tabs[i].courses;
						// @ts-expect-error
						persistedState.tabs[i].courseEvents = [];
						// @ts-expect-error
						persistedState.tabs[i].nonCourseEvents = [];
					}

					version += 1;
				}

				if (version === 2) {
					// @ts-expect-error
					for (let i = 0; i < persistedState.tabs.length; i++) {
						// @ts-expect-error
						persistedState.tabs[i].events = [];
					}

					version += 1;
				}

				return persistedState;
			},
		},
	),
);

export default useUserStore;
