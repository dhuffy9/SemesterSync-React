export interface Instructor {
	id: number;
	first_name: string;
	last_name: string;
}

export interface Room {
	id?: number;
	name?: string;
}

export interface Building {
	id: number;
	long: string;
	short: string | null;
}

export interface Meeting {
	id: number;
	day: string;
	start_time: string;
	end_time: string;
	campus: string;
	building: Building;
	room: Room;
	instructors: Array<Instructor>;
}

export interface Section {
	section_id: number;
	section_code: string;
	start_date: Date;
	end_date: Date;
	delivery_method: string;
	course_attribute: string;
	class_comments: string | null;
	seats_available: number;
	seats_total: number;
	meetings: Array<Meeting>;
}

export type AssembledCourse = {
	course_id: number;
	course_code: string;
	course_title: string;
	credits: string;
	term_code: string;
	term_name: string;
	sections: Array<Section>;
};

type CourseError = number;

export type CourseResponse =
	| Record<string, Array<AssembledCourse>>
	| CourseError;
