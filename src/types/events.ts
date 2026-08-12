type TransformedCourseEvent = {};

export type EventCardGenerics = {
	eventId: string;
	startDate: Date;
	endDate: Date;
	startTime: Date;
	endTime: Date;
	cardTimeOffset: number;
	cardDayOffset: number;
	cardSpanHeight: number;
	color: string;
};

export type EventCardsObjectType = Record<
	| "sunday"
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday",
	Array<EventCardGenerics>
>;
