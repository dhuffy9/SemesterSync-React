export interface Course {
	termCode: string;
	termName: string;
	course: string;
	courseTitle: string;
	courseSection: string;
	courseStartEnd: string;
	courseAttribute: string;
	credits: string;
	schedule: string;
	instructor: string;
	classType: string;
	deliveryMethod: string;
	seats: string;
	startDate: string;
	endDate: string;
	dateRange: string;
	buildingRoom: string;
	building: string;
	room: string;
	buildingAbbrev: string;
	buildingRoomAbbrev: string;
	detailLocation: string;
	detailError: string;
}

export type CourseAPIResponse = Array<Course>;
