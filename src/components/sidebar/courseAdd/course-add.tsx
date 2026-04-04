import { getAllCoursesWithMeetings } from "@/data/courses";
import { getTerms } from "@/data/terms";
import CourseAddModalClient from "./course-add-client";

export default async function CourseAddModal() {
	const terms = await getTerms();
	const meetings = await getAllCoursesWithMeetings();

	return <CourseAddModalClient termsRes={terms} />;
}
