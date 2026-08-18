import { getAllCoursesWithMeetings } from "@/data/courses";
import { getTerms } from "@/data/terms";
import EventListClient from "./event-list-client";

export default async function EventList() {
	const terms = await getTerms();
	const courses = await getAllCoursesWithMeetings();

	return <EventListClient courses={courses} terms={terms} />;
}
