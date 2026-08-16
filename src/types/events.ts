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

// Card UI
export type CalendarCardUIData = {
	title?: string;
	description?: string;

	startTime: Date;
	endTime: Date;

	color: string;
};

export type CalendarCardUIProps = {
	event: CalendarCardUIData;
};
