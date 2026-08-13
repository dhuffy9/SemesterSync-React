export type TransformedCourseEvent = {
	isCourse: true;
	credits: number;
	seatsAvailable: number;
	seatsTotal: number;
	sectionCode: string;
	campus: string;
	building: {
		long: string;
		short: string;
	};
	room: string;
	instructors: Array<{
		firstName: string;
		lastName: string;
	}>;
	courseId: number;
	sectionId: number;
};

export type TransformedNonCourseEvent = {
	isCourse: false;

	credits?: number;
	location: string;
};

export type EventCardGenerics = {
	eventId: string;
	eventKey: string;
	eventMeetingCount: number;
	startDate: Date;
	endDate: Date;
	startTime: Date;
	endTime: Date;
	cardTimeOffset: number;
	cardDayOffset: number;
	cardSpanHeight: number;
	color: string;

	title: string;
	description: string;
};

export type EventCard = EventCardGenerics &
	(TransformedCourseEvent | TransformedNonCourseEvent);

export type EventCardsObjectType = Record<
	| "sunday"
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday",
	Array<EventCard>
>;

export type CourseCalendarCardGeneric = {
	sectionCode: string;

	credits: number;

	campus: string;
	room: string;

	instructors: Array<{
		firstName: string;
		lastName: string;
	}>;
};

export type LinkedCourseCalendarCard = {
	kind: "linked-course";

	courseId: number;
	sectionId: number;

	seatsAvailable: number;
	seatsTotal: number;

	building: {
		long: string;
		short: string | null;
	};
};

export type UnlinkedCourseCalendarCard = {
	kind: "unlinked-course";

	building: string;
};

export type PersonalCalendarCard = {
	kind: "personal";

	location?: string;
};

export type CalendarCardGeneric = {
	id: string;
	key: string;

	rowOffset: number;
	columnOffset: number;
	spanHeight: number;

	title: string;
	description?: string;

	meetingCount: number;
	startDate: Date;
	endDate: Date;
	startTime: Date;
	endTime: Date;

	color: string;
};

export type CalendarCard = CalendarCardGeneric &
	(
		| (LinkedCourseCalendarCard & CourseCalendarCardGeneric)
		| (UnlinkedCourseCalendarCard & CourseCalendarCardGeneric)
		| PersonalCalendarCard
	);
export type CalendarCards = Array<CalendarCard>;
