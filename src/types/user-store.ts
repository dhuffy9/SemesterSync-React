export interface Term {
	code: string;
	name: string;
}

export interface Location {
	building: string;
	abbr: string;
	room: string;
}

export interface Course {
	id: string;
	code: string;
	section: string;
	title: string;
	instructor: string;
	credits: number;
	days: Array<string>;
	startDate: Date;
	endDate: Date;
	startTime: Date;
	endTime: Date;
	color: string;
	term: Term;
	location: Location;
}

export interface Tab {
	id: string;
	name: string;
	courses: Array<Course>;
	totalCredits: number;
	selectedDate: Date;
}

export interface UserState {
	activeTab: string;
	activeTerm: string;
	tabs: Array<Tab>;
}

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
