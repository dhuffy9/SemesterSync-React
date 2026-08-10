import { getAllCoursesWithMeetings } from "@/data/courses";
import { getTerms } from "@/data/terms";
import EventAddModalClient from "./event-add-client";

export default async function CourseAddModal() {
	const terms = await getTerms();
	const meetings = await getAllCoursesWithMeetings();

	console.log(meetings);

	return <EventAddModalClient termsRes={terms} courses={meetings} />;
	// return <CourseAddModalClient termsRes={terms} courses={meetings} />;
}
