import z from "zod";
import { type Event, eventSchema } from "@/schemas/events";

export const termSchema = z.object({
	code: z.string(),
});

export const userTabSchema = z.object({
	id: z.uuidv4(),
	name: z.string(),
	events: z.array(eventSchema),
	totalCredits: z.number(),
	selectedDate: z.coerce.date(),
});

export const userStateSchema = z.object({
	activeTab: z.uuidv4(),
	activeTerm: z.string(),
	tabs: z.array(userTabSchema),
});

export const userStorePersistSchema = z.object({
	user: z.object({
		state: userStateSchema,
		schemaVersion: z.number(),
	}),
	version: z.number(),
});

export type Term = z.infer<typeof termSchema>;
export type Tab = z.infer<typeof userTabSchema>;
export type UserState = z.infer<typeof userStateSchema>;
export type UserStorePersist = z.infer<typeof userStorePersistSchema>;

export interface UserActions {
	addTab: () => void;
	setActiveTab: (id: string) => void;
	getActiveTab: () => Tab;
	getActiveTabCredits: () => number;
	updateTabName: (id: string, name: string) => void;
	updateTabDate: (id: string, date: Date) => void;
	recalculateTabCredits: (id: string) => void;
	removeTab: (id: string) => void;

	setActiveTerm: (term: string) => void;

	getEvents: (tabId: string) => Array<Event>;
	getEvent: (tabId: string, eventId: string) => Event | undefined;
	addEvent: (tabId: string, event: Event) => void;
	updateEvent: (tabId: string, event: Event) => void;
	removeEvent: (tabId: string, eventId: string) => void;
}

export type UserStore = UserState & UserActions;
