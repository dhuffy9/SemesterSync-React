import z from "zod";

const termSchema = z.object({
	code: z.string(),
	name: z.string(),
});

const locationSchema = z.object({
	building: z.string(),
	abbr: z.string(),
	room: z.string(),
});

const userCourseSchema = z.object({
	id: z.uuidv4(),
	code: z.string(),
	section: z.number(),
	title: z.string(),
	instructor: z.string(),
	credits: z.number(),
	days: z.array(z.string()),
	startDate: z.date(),
	endDate: z.date(),
	startTime: z.date(),
	endTime: z.date(),
	color: z.string(),
	term: termSchema,
	location: locationSchema,
});

const userTabSchema = z.object({
	id: z.uuidv4(),
	name: z.string(),
	courses: z.array(userCourseSchema),
	totalCredits: z.number(),
	selectedDate: z.date(),
});

const userStateSchema = z.object({
	activeTab: z.uuidv4(),
	activeTerm: z.string(),
	tabs: z.array(userTabSchema),
});

const userStorePersistSchema = z.object({
	state: userStateSchema,
	version: z.number(),
});

export type Term = z.infer<typeof termSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Course = z.infer<typeof userCourseSchema>;
export type Tab = z.infer<typeof userTabSchema>;
export type UserState = z.infer<typeof userStateSchema>;
export type UserStorePersist = z.infer<typeof userStorePersistSchema>;

export interface UserActions {
	addTab: () => void;
	setActiveTab: (id: string) => void;
	getActiveTab: () => Tab;
	updateTabName: (id: string, name: string) => void;
	updateTabDate: (id: string, date: Date) => void;
	recalculateTabCredits: (id: string) => void;
	removeTab: (id: string) => void;

	setActiveTerm: (term: string) => void;

	addCourse: (tabId: string, course: Course) => void;
	updateCourse: (tabId: string, course: Course) => void;
	removeCourse: (tabId: string, courseId: string) => void;
}

export type UserStore = UserState & UserActions;
